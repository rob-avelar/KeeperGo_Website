
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Calendar,
  MapPin,
  Clock,
  Euro,
  Star,
  Users,
  Activity,
  TrendingUp,
  Goal,
  Settings,
  Award,
  Bell,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface GoalkeeperDashboardProps {
  user: any
}

export default function GoalkeeperDashboard({ user }: GoalkeeperDashboardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const profile = user?.goalkeeperProfile
  const bookings = user?.goalkeeperBookings || []

  const [availableBookings, setAvailableBookings] = useState<any[]>([])
  const [loadingBookingId, setLoadingBookingId] = useState<string | null>(null)
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false)

  const upcomingBookings = bookings?.filter((booking: any) => 
    new Date(booking.date) >= new Date() && (booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED')
  ) || []

  const completedBookings = bookings?.filter((booking: any) => 
    booking.isCompleted
  ) || []

  const totalEarnings = completedBookings?.reduce((sum: number, booking: any) => {
    const goalkeeperEarning = booking.totalAmount * 0.85 // 85% after platform fee
    return sum + goalkeeperEarning
  }, 0) || 0

  const pendingBookings = bookings?.filter((booking: any) => 
    booking.status === 'PENDING'
  ) || []

  // Fetch available bookings
  useEffect(() => {
    fetchAvailableBookings()
  }, [])

  const fetchAvailableBookings = async () => {
    try {
      setIsLoadingAvailable(true)
      const response = await fetch('/api/bookings/available')
      if (response.ok) {
        const data = await response.json()
        setAvailableBookings(data)
      }
    } catch (error) {
      console.error('Error fetching available bookings:', error)
    } finally {
      setIsLoadingAvailable(false)
    }
  }

  const handleAcceptBooking = async (bookingId: string) => {
    try {
      setLoadingBookingId(bookingId)
      const response = await fetch(`/api/bookings/${bookingId}/accept`, {
        method: 'POST'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to accept booking')
      }

      toast({
        title: 'Success!',
        description: 'You have successfully accepted this match. The organizer has been notified.',
      })

      // Refresh the page to show updated data
      router.refresh()
      
      // Also refresh available bookings
      fetchAvailableBookings()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to accept booking. It may have been taken by another goalkeeper.',
        variant: 'destructive'
      })
      
      // Refresh available bookings to remove the taken one
      fetchAvailableBookings()
    } finally {
      setLoadingBookingId(null)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut({ redirect: true, callbackUrl: '/' })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive'
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-blue-800">NetMinder Hire</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-gray-600">
            Manage your bookings and build your goalkeeper reputation.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/goalkeeper/profile">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </Link>
            <Link href="/goalkeeper/bookings">
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                View All Bookings
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">{profile?.totalMatches || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold">{profile?.averageRating?.toFixed(1) || '0.0'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Euro className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">€{(totalEarnings / 100).toFixed(0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-orange-600 mr-2" />
                <span className="text-2xl font-bold">{pendingBookings?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Status */}
        {(!profile?.profilePhotoPath || !profile?.bio) && (
          <Card className="mb-8 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800 flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Complete Your Profile
              </CardTitle>
              <CardDescription className="text-orange-700">
                Complete your profile to receive more booking requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/goalkeeper/profile">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Complete Profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Available Matches - First Come First Served */}
        {availableBookings?.length > 0 && (
          <Card className="mb-8 border-blue-300 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-blue-800 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Available Matches
              </CardTitle>
              <CardDescription className="text-blue-700">
                New match announcements from organizers. Be the first to accept!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableBookings?.map((booking: any) => (
                <div key={booking.id} className="border-l-4 border-blue-600 pl-4 py-3 bg-white rounded-r-lg shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {booking?.organizer?.name}
                      </h4>
                      <Badge variant="outline" className="text-blue-600 mt-1">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        First to accept gets it!
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {booking.duration} hours
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.location}
                    </div>
                    <div className="flex items-center">
                      <Euro className="h-3 w-3 mr-1" />
                      €{((booking.totalAmount * 0.85) / 100).toFixed(0)} earnings
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 mb-3">
                    <strong>Field Type:</strong> {booking.fieldType}
                  </div>
                  {booking.specialRequests && (
                    <div className="text-sm text-gray-600 mb-3 p-2 bg-gray-50 rounded">
                      <strong>Notes:</strong> {booking.specialRequests}
                    </div>
                  )}
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700 w-full"
                    onClick={() => handleAcceptBooking(booking.id)}
                    disabled={loadingBookingId === booking.id}
                  >
                    {loadingBookingId === booking.id ? (
                      'Accepting...'
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Accept This Match
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pending Requests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 text-orange-600 mr-2" />
                Pending Requests
              </CardTitle>
              <CardDescription>
                New booking requests awaiting your response
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingBookings?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No pending requests at the moment.
                </p>
              ) : (
                pendingBookings?.slice(0, 3)?.map((booking: any) => (
                  <div key={booking.id} className="border-l-4 border-orange-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">
                        {booking?.organizer?.name}
                      </h4>
                      <Badge variant="outline" className="text-orange-600">
                        PENDING
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {booking.location}
                      </div>
                      <div className="flex items-center">
                        <Euro className="h-3 w-3 mr-1" />
                        €{(booking.totalAmount / 100).toFixed(0)} ({booking.duration}h)
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                        Accept
                      </Button>
                      <Button size="sm" variant="outline">
                        Decline
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Upcoming Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                Upcoming Matches
              </CardTitle>
              <CardDescription>
                Your confirmed matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingBookings?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No upcoming matches scheduled.
                </p>
              ) : (
                upcomingBookings?.slice(0, 3)?.map((booking: any) => (
                  <div key={booking.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">
                        Match with {booking?.organizer?.name}
                      </h4>
                      <Badge className="bg-blue-600">
                        CONFIRMED
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(booking.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {booking.location}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {booking.duration} hours
                      </div>
                      <div className="flex items-center">
                        <Euro className="h-3 w-3 mr-1" />
                        €{((booking.totalAmount * 0.85) / 100).toFixed(0)} earnings
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
