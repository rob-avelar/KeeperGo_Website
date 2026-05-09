
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Calendar, MapPin, Clock, Euro, ArrowRight, Goal, Star, Heart, Repeat, Plus, Building2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

interface Venue {
  id: string
  name: string
  address: string | null
  city: string
  type: string
  isCustom: boolean
}

export default function BookGoalkeeperForm() {
  const searchParams = useSearchParams()
  const inviteGoalkeeperId = searchParams?.get('invite')
  
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '',
    location: '',
    fieldType: '',
    pricePerHour: '',
    specialRequests: '',
    bookingType: inviteGoalkeeperId ? 'direct' : 'open',
    selectedGoalkeeperId: inviteGoalkeeperId || '',
    isRecurring: false,
    recurrenceFrequency: 'weekly',
    numberOfOccurrences: '4'
  })
  const [goalkeepers, setGoalkeepers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingGoalkeepers, setIsLoadingGoalkeepers] = useState(false)
  
  // Venue state
  const [venues, setVenues] = useState<Venue[]>([])
  const [venueCities, setVenueCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedVenueId, setSelectedVenueId] = useState('')
  const [isLoadingVenues, setIsLoadingVenues] = useState(false)
  const [showAddVenueDialog, setShowAddVenueDialog] = useState(false)
  const [newVenue, setNewVenue] = useState({ name: '', address: '', city: '' })
  const [isCreatingVenue, setIsCreatingVenue] = useState(false)
  
  const router = useRouter()
  const { toast } = useToast()

  // Load goalkeepers when booking type is 'direct'
  useEffect(() => {
    if (formData.bookingType === 'direct') {
      fetchGoalkeepers()
    }
  }, [formData.bookingType])

  // Load venues on mount
  useEffect(() => {
    fetchVenues()
  }, [])

  // Fetch venues filtered by city
  const fetchVenues = async (city?: string) => {
    setIsLoadingVenues(true)
    try {
      const url = city ? `/api/venues?city=${encodeURIComponent(city)}` : '/api/venues'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setVenues(data.venues || [])
        if (!city) setVenueCities(data.cities || [])
      }
    } catch (error) {
      console.error('Failed to fetch venues:', error)
    } finally {
      setIsLoadingVenues(false)
    }
  }

  // When city changes, re-fetch venues
  useEffect(() => {
    if (selectedCity && selectedCity !== 'all') {
      fetchVenues(selectedCity)
    } else {
      fetchVenues()
    }
    setSelectedVenueId('')
    setFormData(prev => ({ ...prev, location: '' }))
  }, [selectedCity])

  // When venue selection changes, update location
  useEffect(() => {
    if (selectedVenueId && selectedVenueId !== 'custom') {
      const venue = venues.find(v => v.id === selectedVenueId)
      if (venue) {
        const locationStr = venue.address ? `${venue.name} — ${venue.address}` : venue.name
        setFormData(prev => ({ ...prev, location: locationStr }))
      }
    }
  }, [selectedVenueId, venues])

  const handleCreateVenue = async () => {
    if (!newVenue.name || !newVenue.city) {
      toast({ title: 'Error', description: 'Name and city are required.', variant: 'destructive' })
      return
    }
    setIsCreatingVenue(true)
    try {
      const response = await fetch('/api/venues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newVenue),
      })
      if (response.ok) {
        const data = await response.json()
        const created = data.venue as Venue
        // Refresh venues list
        await fetchVenues(selectedCity || undefined)
        setSelectedVenueId(created.id)
        const locationStr = created.address ? `${created.name} — ${created.address}` : created.name
        setFormData(prev => ({ ...prev, location: locationStr }))
        setShowAddVenueDialog(false)
        setNewVenue({ name: '', address: '', city: '' })
        toast({ title: 'Venue added!', description: `${created.name} has been added to the list.` })
      } else {
        toast({ title: 'Error', description: 'Failed to add venue.', variant: 'destructive' })
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add venue.', variant: 'destructive' })
    } finally {
      setIsCreatingVenue(false)
    }
  }

  const fetchGoalkeepers = async () => {
    setIsLoadingGoalkeepers(true)
    try {
      const response = await fetch('/api/goalkeepers')
      if (response.ok) {
        const data = await response.json()
        setGoalkeepers(data.goalkeepers || [])
      }
    } catch (error) {
      console.error('Failed to fetch goalkeepers:', error)
    } finally {
      setIsLoadingGoalkeepers(false)
    }
  }

  const calculateTotalPrice = () => {
    const basePrice = parseInt(formData.pricePerHour) || 20
    const duration = parseInt(formData.duration) || 1
    const isPremium = formData.bookingType === 'direct'
    const premiumMultiplier = isPremium ? 1.25 : 1
    return Math.round(basePrice * duration * premiumMultiplier)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate venue selection
    if (!formData.location) {
      toast({
        title: 'Error',
        description: 'Please select a venue for your match.',
        variant: 'destructive'
      })
      return
    }

    // Validate direct booking
    if (formData.bookingType === 'direct' && !formData.selectedGoalkeeperId) {
      toast({
        title: 'Error',
        description: 'Please select a goalkeeper for direct booking.',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)

    try {
      // Calculate dates for recurring bookings
      const bookingDateTime = new Date(`${formData.date}T${formData.time}:00`)
      const datesToCreate = [bookingDateTime]
      
      if (formData.isRecurring) {
        const numberOfMatches = parseInt(formData.numberOfOccurrences)
        const daysInterval = formData.recurrenceFrequency === 'weekly' ? 7 : 14
        
        for (let i = 1; i < numberOfMatches; i++) {
          const nextDate = new Date(bookingDateTime)
          nextDate.setDate(nextDate.getDate() + (i * daysInterval))
          datesToCreate.push(nextDate)
        }
      }

      // Create all bookings
      const bookingPromises = datesToCreate.map(date =>
        fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: date.toISOString(),
            duration: parseInt(formData.duration),
            location: formData.location,
            fieldType: formData.fieldType,
            pricePerHour: parseInt(formData.pricePerHour) * 100, // Convert to cents
            specialRequests: formData.specialRequests,
            bookingType: formData.bookingType,
            goalkeeperId: formData.bookingType === 'direct' ? formData.selectedGoalkeeperId : undefined
          }),
        })
      )

      const responses = await Promise.all(bookingPromises)
      
      // Check if all requests succeeded
      const allSucceeded = responses.every(response => response.ok)
      
      if (!allSucceeded) {
        throw new Error('Failed to create some bookings')
      }

      const successMessage = formData.isRecurring
        ? `Successfully created ${datesToCreate.length} recurring ${formData.bookingType === 'direct' ? 'bookings' : 'match announcements'}!`
        : formData.bookingType === 'direct'
        ? 'Direct booking created! The goalkeeper has been notified.'
        : 'Your match announcement has been posted. Goalkeepers can now view and accept it.'

      toast({
        title: 'Success!',
        description: successMessage,
      })

      router.push('/organizer/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking(s). Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="bg-gray-900 shadow-sm shadow-black/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/organizer/dashboard" className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-lime-400" />
              <h1 className="text-2xl font-bold text-white">KeeperGo</h1>
            </Link>
            <Link href="/organizer/dashboard">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Book a Goalkeeper</h2>
          <p className="text-gray-400">
            Choose between posting an open announcement or booking a specific goalkeeper directly.
          </p>
        </div>

        <Card className="shadow-lg shadow-black/20">
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
            <CardDescription>
              Provide information about your upcoming match
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Booking Type Selection */}
              <div className="space-y-2">
                <Label>Booking Type</Label>
                <Select value={formData.bookingType} onValueChange={(value) => handleChange('bookingType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select booking type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open Announcement (Standard Rate)</SelectItem>
                    <SelectItem value="direct">Direct Booking (+25% Premium)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-gray-400">
                  {formData.bookingType === 'open' 
                    ? 'Post an announcement visible to all goalkeepers. First to accept gets the match.'
                    : 'Choose a specific goalkeeper you prefer. 25% premium fee applies for direct booking convenience.'}
                </p>
              </div>

              {/* Goalkeeper Selection (only for direct booking) */}
              {formData.bookingType === 'direct' && (
                <div className="space-y-2">
                  <Label>Select Goalkeeper</Label>
                  {isLoadingGoalkeepers ? (
                    <div className="text-center py-4 text-gray-400">
                      Loading goalkeepers...
                    </div>
                  ) : goalkeepers.length === 0 ? (
                    <div className="text-center py-4 text-gray-400">
                      No goalkeepers available at the moment.
                    </div>
                  ) : (
                    <Select value={formData.selectedGoalkeeperId} onValueChange={(value) => handleChange('selectedGoalkeeperId', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a goalkeeper" />
                      </SelectTrigger>
                      <SelectContent>
                        {goalkeepers.map((gk) => (
                          <SelectItem key={gk.id} value={gk.id}>
                            <div className="flex items-center gap-2">
                              <span>{gk.name}</span>
                              <Badge variant="outline" className="ml-2">
                                {gk.profile?.experienceLevel || 'No level'}
                              </Badge>
                              {gk.profile?.averageRating > 0 && (
                                <span className="flex items-center text-xs text-yellow-600">
                                  <Star className="h-3 w-3 fill-current mr-1" />
                                  {gk.profile.averageRating.toFixed(1)}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  {formData.selectedGoalkeeperId && goalkeepers.find(gk => gk.id === formData.selectedGoalkeeperId) && (
                    <div className="mt-2 p-3 bg-lime-400/5 rounded-lg border border-gray-700">
                      <p className="text-sm text-white">
                        <strong>Selected:</strong> {goalkeepers.find(gk => gk.id === formData.selectedGoalkeeperId)?.name}
                      </p>
                      {goalkeepers.find(gk => gk.id === formData.selectedGoalkeeperId)?.profile?.bio && (
                        <p className="text-xs text-lime-400 mt-1">
                          {goalkeepers.find(gk => gk.id === formData.selectedGoalkeeperId)?.profile?.bio}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Match Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleChange('date', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Start Time</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleChange('time', e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Recurring Matches */}
              <div className="space-y-4 p-4 bg-lime-400/5 rounded-lg border border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Repeat className="h-5 w-5 text-lime-400" />
                    <Label htmlFor="recurring" className="cursor-pointer">
                      Create Recurring Matches
                    </Label>
                  </div>
                  <Switch
                    id="recurring"
                    checked={formData.isRecurring}
                    onCheckedChange={(checked) => setFormData({ ...formData, isRecurring: checked })}
                  />
                </div>
                
                {formData.isRecurring && (
                  <div className="space-y-4 pt-2">
                    <p className="text-sm text-gray-400">
                      Schedule multiple matches automatically at the same time and location
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select 
                          value={formData.recurrenceFrequency} 
                          onValueChange={(value) => handleChange('recurrenceFrequency', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="weekly">Weekly (every 7 days)</SelectItem>
                            <SelectItem value="biweekly">Bi-weekly (every 14 days)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Number of Matches</Label>
                        <Select 
                          value={formData.numberOfOccurrences} 
                          onValueChange={(value) => handleChange('numberOfOccurrences', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="2">2 matches</SelectItem>
                            <SelectItem value="3">3 matches</SelectItem>
                            <SelectItem value="4">4 matches</SelectItem>
                            <SelectItem value="6">6 matches</SelectItem>
                            <SelectItem value="8">8 matches</SelectItem>
                            <SelectItem value="12">12 matches</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                      <p className="text-sm font-medium text-white mb-1">Preview:</p>
                      <p className="text-sm text-gray-400">
                        {formData.numberOfOccurrences} matches will be created {formData.recurrenceFrequency === 'weekly' ? 'every week' : 'every 2 weeks'}
                        {formData.bookingType === 'direct' && formData.selectedGoalkeeperId && ' with the same goalkeeper'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Duration and Field Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Duration (hours)</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleChange('duration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="3">3 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Field Type</Label>
                  <Select value={formData.fieldType} onValueChange={(value) => handleChange('fieldType', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select field type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5-a-side">5-a-side</SelectItem>
                      <SelectItem value="7-a-side">7-a-side</SelectItem>
                      <SelectItem value="11-a-side">11-a-side</SelectItem>
                      <SelectItem value="Indoor">Indoor</SelectItem>
                      <SelectItem value="Outdoor">Outdoor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Venue Selection */}
              <div className="space-y-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-5 w-5 text-lime-400" />
                  <Label className="text-base font-semibold">Match Venue</Label>
                </div>

                {/* City Filter */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">City</Label>
                  <Select value={selectedCity} onValueChange={setSelectedCity}>
                    <SelectTrigger>
                      <SelectValue placeholder="All cities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All cities</SelectItem>
                      {venueCities.map(city => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Venue Select */}
                <div className="space-y-2">
                  <Label className="text-sm text-gray-400">Venue</Label>
                  {isLoadingVenues ? (
                    <div className="text-center py-3 text-gray-400 text-sm">Loading venues...</div>
                  ) : (
                    <Select value={selectedVenueId} onValueChange={(val) => {
                      if (val === 'custom') {
                        setShowAddVenueDialog(true)
                        setNewVenue({ name: '', address: '', city: (selectedCity && selectedCity !== 'all') ? selectedCity : '' })
                      } else {
                        setSelectedVenueId(val)
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a venue" />
                      </SelectTrigger>
                      <SelectContent>
                        {venues.map(v => (
                          <SelectItem key={v.id} value={v.id}>
                            <div className="flex items-center gap-2">
                              <span>{v.name}</span>
                              <span className="text-xs text-gray-500">— {v.city}</span>
                              {v.type !== 'Custom' && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">{v.type}</Badge>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">
                          <div className="flex items-center gap-2 text-lime-400">
                            <Plus className="h-3 w-3" />
                            <span>Add new venue manually...</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {/* Selected venue info */}
                {selectedVenueId && selectedVenueId !== 'custom' && venues.find(v => v.id === selectedVenueId) && (
                  <div className="p-3 bg-lime-400/5 rounded-lg border border-lime-400/20">
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-lime-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-white">{venues.find(v => v.id === selectedVenueId)?.name}</p>
                        {venues.find(v => v.id === selectedVenueId)?.address && (
                          <p className="text-xs text-gray-400 mt-0.5">{venues.find(v => v.id === selectedVenueId)?.address}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Hidden required input for form validation */}
                <input type="hidden" value={formData.location} required />
                {!formData.location && selectedVenueId === '' && (
                  <p className="text-xs text-gray-500">Please select a venue or add a new one.</p>
                )}
              </div>

              {/* Add Venue Dialog */}
              <Dialog open={showAddVenueDialog} onOpenChange={setShowAddVenueDialog}>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Venue</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {"Can't find your venue? Add it manually and it will be available for future bookings."}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Venue Name *</Label>
                      <Input
                        placeholder="e.g., Sportpark De Toekomst"
                        value={newVenue.name}
                        onChange={(e) => setNewVenue(prev => ({ ...prev, name: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Address</Label>
                      <Input
                        placeholder="e.g., Borchlandweg 16, Amsterdam"
                        value={newVenue.address}
                        onChange={(e) => setNewVenue(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>City *</Label>
                      <Input
                        placeholder="e.g., Amsterdam"
                        value={newVenue.city}
                        onChange={(e) => setNewVenue(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowAddVenueDialog(false)}>
                      Cancel
                    </Button>
                    <Button
                      className="bg-lime-400 hover:bg-lime-300 text-gray-950"
                      onClick={handleCreateVenue}
                      disabled={isCreatingVenue}
                    >
                      {isCreatingVenue ? 'Adding...' : 'Add Venue'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Price Per Hour */}
              <div className="space-y-2">
                <Label htmlFor="pricePerHour">Price Per Hour (€)</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="pricePerHour"
                    type="number"
                    placeholder="e.g., 20"
                    min="20"
                    step="1"
                    max="100"
                    value={formData.pricePerHour}
                    onChange={(e) => handleChange('pricePerHour', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-sm text-gray-400">
                  Minimum rate: €20 per hour
                </p>
                {formData.pricePerHour && formData.duration && (
                  <div className="mt-2 p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-400">Base cost:</span>
                      <span className="font-medium">€{parseInt(formData.pricePerHour) * parseInt(formData.duration)}</span>
                    </div>
                    {formData.bookingType === 'direct' && (
                      <>
                        <div className="flex justify-between items-center text-sm text-orange-600 mt-1">
                          <span>Direct booking premium (+25%):</span>
                          <span className="font-medium">€{Math.round(parseInt(formData.pricePerHour) * parseInt(formData.duration) * 0.25)}</span>
                        </div>
                        <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between items-center">
                          <span className="font-semibold text-gray-100">Total:</span>
                          <span className="font-bold text-lime-400 text-lg">€{calculateTotalPrice()}</span>
                        </div>
                      </>
                    )}
                    {formData.bookingType === 'open' && (
                      <div className="border-t border-gray-300 mt-2 pt-2 flex justify-between items-center">
                        <span className="font-semibold text-gray-100">Total:</span>
                        <span className="font-bold text-lime-400 text-lg">€{calculateTotalPrice()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label htmlFor="specialRequests">Special Requests (Optional)</Label>
                <Textarea
                  id="specialRequests"
                  placeholder="Any special requirements or notes for the goalkeeper..."
                  value={formData.specialRequests}
                  onChange={(e) => handleChange('specialRequests', e.target.value)}
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/organizer/dashboard">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  className="bg-lime-400 hover:bg-lime-300 text-gray-950"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    formData.bookingType === 'direct' ? 'Creating Direct Booking...' : 'Posting Announcement...'
                  ) : (
                    <>
                      {formData.bookingType === 'direct' ? 'Confirm Direct Booking' : 'Post Match Announcement'}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  )
}
