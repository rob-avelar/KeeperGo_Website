
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, MapPin, Clock, Euro, ArrowRight, Goal } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import Link from 'next/link'

export default function BookGoalkeeperForm() {
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    duration: '',
    location: '',
    fieldType: '',
    pricePerHour: '',
    specialRequests: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const bookingDateTime = new Date(`${formData.date}T${formData.time}:00`)
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: bookingDateTime.toISOString(),
          duration: parseInt(formData.duration),
          location: formData.location,
          fieldType: formData.fieldType,
          pricePerHour: parseInt(formData.pricePerHour) * 100, // Convert to cents
          specialRequests: formData.specialRequests
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create booking')
      }

      toast({
        title: 'Success!',
        description: 'Your booking request has been created. You will be notified when goalkeepers respond.',
      })

      router.push('/organizer/dashboard')
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/organizer/dashboard" className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-800">NetMinder Hire</h1>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Book a Goalkeeper</h2>
          <p className="text-gray-600">
            Fill in your match details and we'll help you find the perfect goalkeeper.
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
            <CardDescription>
              Provide information about your upcoming match
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
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

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Match Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="location"
                    type="text"
                    placeholder="Enter the match location (e.g., Sports Center Amsterdam)"
                    value={formData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {/* Price Per Hour */}
              <div className="space-y-2">
                <Label htmlFor="pricePerHour">Price Per Hour (€)</Label>
                <div className="relative">
                  <Euro className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="pricePerHour"
                    type="number"
                    placeholder="e.g., 20"
                    min="15"
                    max="100"
                    value={formData.pricePerHour}
                    onChange={(e) => handleChange('pricePerHour', e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Standard rate: €20 per hour
                </p>
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
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    'Creating Booking...'
                  ) : (
                    <>
                      Create Booking
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
