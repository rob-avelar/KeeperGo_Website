
'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Goal
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

interface OrganizerDashboardProps {
  user: any
}

export default function OrganizerDashboard({ user }: OrganizerDashboardProps) {
  const { toast } = useToast()
  const bookings = user?.organizerBookings || []

  const upcomingBookings = bookings?.filter((booking: any) => 
    new Date(booking.date) >= new Date() && booking.status === 'CONFIRMED'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-green-600" />
              <h1 className="text-2xl font-bold text-green-800">NetMinder Hire</h1>
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
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Book Goalkeeper
              </Button>
            </Link>
            <Link href="/organizer/search-goalkeepers">
              <Button variant="outline">
                <Users className="w-4 h-4 mr-2" />
                Browse Goalkeepers
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
                <Activity className="h-4 w-4 text-green-600 mr-2" />
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
                <Euro className="h-4 w-4 text-green-600 mr-2" />
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
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
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
                  <div key={booking.id} className="border-l-4 border-green-500 pl-4 py-2">
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
    </div>
  )
}
