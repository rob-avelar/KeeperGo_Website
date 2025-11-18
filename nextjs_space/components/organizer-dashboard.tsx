
'use client'

import { useState } from 'react'
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
  Plus,
  Star,
  Users,
  Activity,
  TrendingUp,
  Goal,
  X,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

interface OrganizerDashboardProps {
  user: any
}

export default function OrganizerDashboard({ user }: OrganizerDashboardProps) {
  const { toast } = useToast()
  const router = useRouter()
  const bookings = user?.organizerBookings || []
  
  // Cancellation state
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<any>(null)
  const [cancelReason, setCancelReason] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelFeeInfo, setCancelFeeInfo] = useState<any>(null)

  const upcomingBookings = bookings?.filter((booking: any) => 
    new Date(booking.date) >= new Date() && (booking.status === 'CONFIRMED' || booking.status === 'ACCEPTED')
  ) || []

  const openBookings = bookings?.filter((booking: any) => 
    new Date(booking.date) >= new Date() && booking.status === 'PENDING' && !booking.goalkeeperId
  ) || []

  const completedBookings = bookings?.filter((booking: any) => 
    booking.isCompleted
  ) || []

  const totalSpent = completedBookings?.reduce((sum: number, booking: any) => 
    sum + (booking.totalAmount || 0), 0
  ) || 0

  const averageRating = completedBookings?.length > 0 
    ? completedBookings?.reduce((sum: number, booking: any) => {
        const bookingRatings = booking.ratings?.filter((r: any) => r.raterId === user.id) || []
        return sum + (bookingRatings[0]?.overallRating || 0)
      }, 0) / completedBookings.length
    : 0

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

  const calculateCancellationPreview = (booking: any) => {
    const now = new Date()
    const matchDate = new Date(booking.date)
    const hoursUntilMatch = (matchDate.getTime() - now.getTime()) / (1000 * 60 * 60)

    let refundPercentage = 0
    let message = ''

    if (hoursUntilMatch > 48) {
      refundPercentage = 100
      message = 'Free cancellation - Full refund'
    } else if (hoursUntilMatch > 24) {
      refundPercentage = 50
      message = '50% refund (24-48h before match)'
    } else if (hoursUntilMatch > 12) {
      refundPercentage = 25
      message = '25% refund (12-24h before match)'
    } else {
      refundPercentage = 0
      message = 'No refund (<12h before match)'
    }

    const refundAmount = Math.round((booking.totalAmount * refundPercentage) / 100)
    const cancellationFee = booking.totalAmount - refundAmount

    return {
      refundAmount,
      cancellationFee,
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
          reason: cancelReason || 'Cancelled by organizer'
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
            Manage your matches and find the perfect goalkeepers for your games.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/organizer/book-goalkeeper">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Post Match Announcement
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
                <span className="text-2xl font-bold">{bookings?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Upcoming Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">{upcomingBookings?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Spent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Euro className="h-4 w-4 text-blue-600 mr-2" />
                <span className="text-2xl font-bold">€{(totalSpent / 100).toFixed(0)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Avg. Rating Given
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Open Announcements */}
        {openBookings?.length > 0 && (
          <Card className="mb-8 border-yellow-300 bg-yellow-50/50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <Activity className="h-5 w-5 mr-2" />
                Open Match Announcements
              </CardTitle>
              <CardDescription className="text-yellow-700">
                Waiting for goalkeepers to accept
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {openBookings?.map((booking: any) => (
                <div key={booking.id} className="border-l-4 border-yellow-500 pl-4 py-2 bg-white rounded-r-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold">
                      Waiting for Goalkeeper
                    </h4>
                    <Badge variant="outline" className="text-yellow-600">
                      OPEN
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(booking.date).toLocaleDateString()} at {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booking.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {booking.duration} hours • {booking.fieldType}
                    </div>
                    <div className="flex items-center">
                      <Euro className="h-3 w-3 mr-1" />
                      €{(booking.totalAmount / 100).toFixed(0)} total
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Recent Bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  No upcoming matches. Book a goalkeeper to get started!
                </p>
              ) : (
                upcomingBookings?.slice(0, 3)?.map((booking: any) => (
                  <div key={booking.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">
                        {booking?.goalkeeper?.name || 'Goalkeeper TBD'}
                      </h4>
                      <Badge variant="outline">
                        {booking.status}
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

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
                Recent Activity
              </CardTitle>
              <CardDescription>
                Your latest bookings and matches
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {bookings?.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No activity yet. Start by booking your first goalkeeper!
                </p>
              ) : (
                bookings?.slice(0, 5)?.map((booking: any) => (
                  <div key={booking.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">
                        Match {booking.isCompleted ? 'Completed' : 'Scheduled'}
                      </h4>
                      <Badge 
                        variant={booking.status === 'COMPLETED' ? 'default' : 'outline'}
                      >
                        {booking.status}
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
                      {booking.isCompleted && (
                        <div className="flex items-center">
                          <Euro className="h-3 w-3 mr-1" />
                          €{(booking.totalAmount / 100).toFixed(0)}
                        </div>
                      )}
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
              Are you sure you want to cancel this match?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {bookingToCancel && cancelFeeInfo && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-sm mb-2">Match Details:</h4>
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
                cancelFeeInfo.cancellationFee === 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-orange-50 border-orange-200'
              }`}>
                <h4 className="font-semibold text-sm mb-2">
                  {cancelFeeInfo.message}
                </h4>
                <div className="space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span>Original amount:</span>
                    <span className="font-medium">€{(bookingToCancel.totalAmount / 100).toFixed(2)}</span>
                  </p>
                  {cancelFeeInfo.cancellationFee > 0 && (
                    <p className="flex justify-between text-orange-600">
                      <span>Cancellation fee:</span>
                      <span className="font-medium">-€{(cancelFeeInfo.cancellationFee / 100).toFixed(2)}</span>
                    </p>
                  )}
                  <p className="flex justify-between border-t pt-1 font-semibold">
                    <span>You will receive:</span>
                    <span className="text-green-600">€{(cancelFeeInfo.refundAmount / 100).toFixed(2)}</span>
                  </p>
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
