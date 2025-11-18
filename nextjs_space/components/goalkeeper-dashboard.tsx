
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
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
  CheckCircle,
  X,
  AlertCircle
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
  
  // Cancellation state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelFeeInfo, setCancelFeeInfo] = useState<any>(null)

  const now = new Date()

  const upcomingBookings = bookings?.filter((booking: any) => 
    new Date(booking.date) >= now && (booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED')
  ) || []

  // Bookings awaiting confirmation from organizer
  const awaitingConfirmation = bookings?.filter((booking: any) => {
    const matchDate = new Date(booking.date)
    const matchEndTime = new Date(matchDate)
    matchEndTime.setHours(matchEndTime.getHours() + (booking.duration || 0))
    
    return (
      matchEndTime < now && // Match has ended
      booking.status === 'CONFIRMED' &&
      !booking.confirmedAt &&
      !booking.noShow &&
      booking.confirmationDeadline &&
      new Date(booking.confirmationDeadline) > now // Still within deadline
    )
  }) || []

  const completedBookings = bookings?.filter((booking: any) => 
    booking.isCompleted || booking.status === 'COMPLETED'
  ) || []

  // Warning and blocking info
  const warningCount = profile?.warningCount || 0
  const blockedUntil = profile?.blockedUntil ? new Date(profile.blockedUntil) : null
  const isBlocked = blockedUntil && blockedUntil > now

  const totalEarnings = completedBookings?.reduce((sum: number, booking: any) => {
    const goalkeeperEarning = booking.totalAmount * 0.75 // 75% - goalkeeper share
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

  const calculateCancellationPreview = (booking: any) => {
    const now = new Date()
    const matchDate = new Date(booking.date)
    const hoursUntilMatch = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    const goalkeeperEarnings = Math.round(booking.totalAmount * 0.75) // 75% of total
    let warningLevel = ''
    let message = ''

    if (hoursUntilMatch > 24) {
      warningLevel = 'NONE'
      message = 'Free cancellation - No penalty or warning'
    } else if (hoursUntilMatch > 6) {
      warningLevel = 'LIGHT'
      message = '⚠️ Light warning will be issued (6-24h before match)'
    } else if (hoursUntilMatch > 3) {
      warningLevel = 'MODERATE'
      message = '⚠️⚠️ Moderate warning will be issued (3-6h before match)'
    } else if (hoursUntilMatch > 1) {
      warningLevel = 'SEVERE'
      message = '⚠️⚠️⚠️ SEVERE warning will be issued (1-3h before match)'
    } else {
      warningLevel = 'CRITICAL'
      message = '🚫 CRITICAL: Severe warning + 7-day block (<1h before match)'
    }

    return {
      warningLevel,
      goalkeeperEarnings,
      message,
      hoursUntilMatch: Math.round(hoursUntilMatch * 10) / 10
    }
  }

  const handleOpenCancelDialog = (booking: any) => {
    setBookingToCancel(booking)
    const feeInfo = calculateCancellationPreview(booking)
    setCancelFeeInfo(feeInfo)
    setCancelDialogOpen(true)
  }

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return

    setCancelling(true)
    try {
      const response = await fetch(`/api/bookings/${bookingToCancel.id}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reason: cancelReason || 'Cancelled by goalkeeper'
        })
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: 'Booking Cancelled',
          description: data.fees.penaltyReason,
        })
        
        setCancelDialogOpen(false)
        setBookingToCancel(null)
        setCancelReason('')
        setCancelFeeInfo(null)
        
        // Refresh page to show updated data
        router.refresh()
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to cancel booking',
          variant: 'destructive'
        })
      }
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel booking',
        variant: 'destructive'
      })
    } finally {
      setCancelling(false)
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


  const getTimeUntilDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline)
    const hoursLeft = Math.floor((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60))
    
    if (hoursLeft < 0) return 'Deadline passed'
    if (hoursLeft < 1) return 'Less than 1 hour left'
    if (hoursLeft < 24) return `${hoursLeft}h left`
    return `${Math.floor(hoursLeft / 24)}d ${hoursLeft % 24}h left`
  }

  const getWarningBadge = () => {
    if (warningCount === 0) return null
    
    let variant: 'default' | 'destructive' = 'default'
    let text = ''
    
    if (warningCount >= 5) {
      variant = 'destructive'
      text = `${warningCount} Warnings - At Risk`
    } else if (warningCount >= 3) {
      variant = 'destructive'
      text = `${warningCount} Warnings`
    } else {
      text = `${warningCount} Warning${warningCount > 1 ? 's' : ''}`
    }
    
    return (
      <Badge variant={variant} className="flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {text}
      </Badge>
    )
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

        {/* Blocked Warning */}
        {isBlocked && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold text-red-900 text-lg">Account Temporarily Blocked</h3>
                <p className="text-red-800 mt-1">
                  Your account is blocked until{' '}
                  <strong>{blockedUntil?.toLocaleDateString()}</strong> due to recent cancellations or no-shows.
                </p>
                <p className="text-red-700 text-sm mt-2">
                  You cannot accept new bookings during this period. Please ensure better attendance to avoid permanent blocking.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Warning Banner */}
        {!isBlocked && warningCount > 0 && (
          <div className={`mb-6 p-4 rounded-lg border-2 ${
            warningCount >= 5
              ? 'bg-red-50 border-red-400'
              : warningCount >= 3
              ? 'bg-orange-50 border-orange-400'
              : 'bg-yellow-50 border-yellow-400'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                warningCount >= 5
                  ? 'text-red-600'
                  : warningCount >= 3
                  ? 'text-orange-600'
                  : 'text-yellow-600'
              }`} />
              <div>
                <h3 className={`font-semibold ${
                  warningCount >= 5
                    ? 'text-red-900'
                    : warningCount >= 3
                    ? 'text-orange-900'
                    : 'text-yellow-900'
                }`}>
                  {warningCount >= 5 ? 'Critical Warning Level' : warningCount >= 3 ? 'Warning Alert' : 'Attention Required'}
                </h3>
                <p className={`text-sm mt-1 ${
                  warningCount >= 5
                    ? 'text-red-800'
                    : warningCount >= 3
                    ? 'text-orange-800'
                    : 'text-yellow-800'
                }`}>
                  You have <strong>{warningCount} warning{warningCount > 1 ? 's' : ''}</strong> on your account.
                  {warningCount >= 5 && ' One more warning may result in permanent blocking.'}
                  {warningCount >= 3 && warningCount < 5 && ' Please avoid late cancellations to prevent blocking.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Awaiting Confirmation Banner */}
        {awaitingConfirmation?.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-400 rounded-lg">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  Reminder: Ask Organizer to Confirm Your Attendance
                </h3>
                <p className="text-blue-800 text-sm mt-1">
                  You have <strong>{awaitingConfirmation.length} match{awaitingConfirmation.length > 1 ? 'es' : ''}</strong> awaiting confirmation.
                  Please remind the organizer to confirm your attendance in the app to release your payment.
                </p>
              </div>
            </div>
          </div>
        )}

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
                      €{((booking.totalAmount * 0.75) / 100).toFixed(0)} earnings
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


          {/* Awaiting Confirmation */}
          {awaitingConfirmation?.length > 0 && (
            <Card className="border-blue-300">
              <CardHeader className="bg-blue-50">
                <CardTitle className="flex items-center">
                  <Bell className="h-5 w-5 text-blue-600 mr-2" />
                  Awaiting Organizer Confirmation
                </CardTitle>
                <CardDescription>
                  Remind organizers to confirm your attendance to receive payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 mt-4">
                {awaitingConfirmation.map((booking: any) => (
                  <div key={booking.id} className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">
                          {booking?.organizer?.name || 'Organizer'}
                        </h4>
                        <p className="text-xs text-blue-700 font-medium mt-1">
                          ⏰ Payment auto-releases in: {getTimeUntilDeadline(booking.confirmationDeadline)}
                        </p>
                      </div>
                      <Badge variant="outline" className="bg-blue-100">
                        Awaiting
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-700">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {booking.location}
                      </div>
                      <div className="flex items-center text-green-700 font-medium">
                        <Euro className="h-3 w-3 mr-1" />
                        You earn: €{((booking.totalAmount * 0.75) / 100).toFixed(2)}
                      </div>
                    </div>
                    <div className="mt-2 p-2 bg-white rounded border border-blue-200">
                      <p className="text-xs text-gray-600">
                        💡 <strong>Tip:</strong> Contact the organizer via phone/email to remind them to confirm your attendance in the app.
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
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
                        €{((booking.totalAmount * 0.75) / 100).toFixed(0)} earnings
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleOpenCancelDialog(booking)}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Cancel Match
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cancellation Dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-orange-600" />
              Cancel Match
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this match? Please note the cancellation policy below.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {bookingToCancel && cancelFeeInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm mb-2">Match Details:</h4>
                <p className="text-sm text-gray-700">
                  <strong>Organizer:</strong> {bookingToCancel.organizer?.name}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Date:</strong> {new Date(bookingToCancel.date).toLocaleDateString()} at {new Date(bookingToCancel.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Location:</strong> {bookingToCancel.location}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Time until match:</strong> {cancelFeeInfo.hoursUntilMatch} hours
                </p>
              </div>

              <div className={`p-4 rounded-lg border ${
                cancelFeeInfo.warningLevel === 'NONE' 
                  ? 'bg-green-50 border-green-200' 
                  : cancelFeeInfo.warningLevel === 'LIGHT'
                  ? 'bg-yellow-50 border-yellow-200'
                  : cancelFeeInfo.warningLevel === 'MODERATE'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <h4 className="font-semibold text-sm mb-2">
                  {cancelFeeInfo.message}
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between text-gray-600">
                    <span>You would have earned:</span>
                    <span className="font-medium">€{(cancelFeeInfo.goalkeeperEarnings / 100).toFixed(2)}</span>
                  </p>
                  <p className="flex justify-between border-t pt-1 text-xs text-gray-600">
                    <span>Organizer receives full refund:</span>
                    <span>€{(bookingToCancel.totalAmount / 100).toFixed(2)}</span>
                  </p>
                  {cancelFeeInfo.warningLevel === 'NONE' && (
                    <p className="text-green-600 text-xs mt-2">
                      ✓ No warning or penalty
                    </p>
                  )}
                  {cancelFeeInfo.warningLevel !== 'NONE' && (
                    <div className={`mt-2 p-2 rounded text-xs ${
                      cancelFeeInfo.warningLevel === 'LIGHT' ? 'bg-yellow-100 border border-yellow-300 text-yellow-800' :
                      cancelFeeInfo.warningLevel === 'MODERATE' ? 'bg-orange-100 border border-orange-300 text-orange-800' :
                      'bg-red-100 border border-red-300 text-red-800'
                    }`}>
                      <strong>Warning System:</strong> 
                      {cancelFeeInfo.warningLevel === 'LIGHT' && ' You will receive 1 warning point.'}
                      {cancelFeeInfo.warningLevel === 'MODERATE' && ' You will receive 2 warning points.'}
                      {cancelFeeInfo.warningLevel === 'SEVERE' && ' You will receive 3 warning points.'}
                      {cancelFeeInfo.warningLevel === 'CRITICAL' && ' You will receive 3 warning points + 7-day account block!'}
                      <br/>
                      <span className="text-xs">Current warnings: {warningCount} | 9 warnings = permanent block</span>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="cancelReason">Reason (Optional)</Label>
                <Textarea
                  id="cancelReason"
                  placeholder="Please provide a reason for cancellation..."
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  rows={3}
                  className="mt-1"
                />
              </div>
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={cancelling}>
              Keep Match
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelBooking}
              disabled={cancelling}
              className="bg-red-600 hover:bg-red-700"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Match'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}