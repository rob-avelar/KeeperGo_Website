
import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ORGANIZER') {
      return NextResponse.json({ error: 'Only organizers can view analytics' }, { status: 403 })
    }

    const organizerId = session.user.id

    // Get all completed bookings
    const completedBookings = await prisma.booking.findMany({
      where: {
        organizerId,
        status: { in: ['COMPLETED', 'CONFIRMED'] },
        isCompleted: true,
      },
      include: {
        goalkeeper: {
          include: {
            goalkeeperProfile: true
          }
        },
        ratings: {
          where: {
            raterId: organizerId
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    // Calculate monthly spending
    const monthlySpending: { [key: string]: number } = {}
    const monthlyMatches: { [key: string]: number } = {}
    const goalkeeperFrequency: { [key: string]: { name: string, count: number, totalSpent: number } } = {}
    const hourFrequency: { [key: number]: number } = {}
    const fieldTypeFrequency: { [key: string]: number } = {}

    completedBookings.forEach(booking => {
      const date = new Date(booking.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      // Monthly spending
      monthlySpending[monthKey] = (monthlySpending[monthKey] || 0) + (booking.totalAmount / 100)
      
      // Monthly matches
      monthlyMatches[monthKey] = (monthlyMatches[monthKey] || 0) + 1

      // Goalkeeper frequency
      if (booking.goalkeeperId) {
        const gkName = booking.goalkeeper?.name || booking.goalkeeper?.email?.split('@')[0] || 'Unknown'
        if (!goalkeeperFrequency[booking.goalkeeperId]) {
          goalkeeperFrequency[booking.goalkeeperId] = {
            name: gkName,
            count: 0,
            totalSpent: 0
          }
        }
        goalkeeperFrequency[booking.goalkeeperId].count++
        goalkeeperFrequency[booking.goalkeeperId].totalSpent += (booking.totalAmount / 100)
      }

      // Hour frequency (when matches are scheduled)
      const hour = date.getHours()
      hourFrequency[hour] = (hourFrequency[hour] || 0) + 1

      // Field type frequency
      if (booking.fieldType) {
        fieldTypeFrequency[booking.fieldType] = (fieldTypeFrequency[booking.fieldType] || 0) + 1
      }
    })

    // Format monthly data for charts
    const monthlyData = Object.entries(monthlySpending)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12) // Last 12 months
      .map(([month, spending]) => ({
        month,
        spending: Math.round(spending),
        matches: monthlyMatches[month] || 0
      }))

    // Top goalkeepers
    const topGoalkeepers = Object.entries(goalkeeperFrequency)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 5)
      .map(([id, data]) => ({
        id,
        name: data.name,
        matches: data.count,
        totalSpent: Math.round(data.totalSpent)
      }))

    // Peak hours
    const peakHours = Object.entries(hourFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hour, count]) => ({
        hour: parseInt(hour),
        matches: count
      }))

    // Field types
    const fieldTypes = Object.entries(fieldTypeFrequency)
      .map(([type, count]) => ({
        type,
        count
      }))

    // Calculate totals and averages
    const totalSpent = completedBookings.reduce((sum, b) => sum + (b.totalAmount / 100), 0)
    const totalMatches = completedBookings.length
    const avgMatchCost = totalMatches > 0 ? totalSpent / totalMatches : 0
    
    const ratingsGiven = completedBookings.flatMap(b => b.ratings)
    const avgRatingGiven = ratingsGiven.length > 0
      ? ratingsGiven.reduce((sum, r) => sum + r.overallRating, 0) / ratingsGiven.length
      : 0

    // Get current month spending
    const now = new Date()
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const currentMonthSpending = monthlySpending[currentMonthKey] || 0

    // Get last month for comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthKey = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`
    const lastMonthSpending = monthlySpending[lastMonthKey] || 0

    const spendingTrend = lastMonthSpending > 0
      ? ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100
      : 0

    return NextResponse.json({
      summary: {
        totalSpent: Math.round(totalSpent),
        totalMatches,
        avgMatchCost: Math.round(avgMatchCost),
        avgRatingGiven: Math.round(avgRatingGiven * 10) / 10,
        currentMonthSpending: Math.round(currentMonthSpending),
        spendingTrend: Math.round(spendingTrend)
      },
      charts: {
        monthlyData,
        topGoalkeepers,
        peakHours,
        fieldTypes
      }
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
