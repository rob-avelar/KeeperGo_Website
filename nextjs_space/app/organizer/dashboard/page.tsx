
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import OrganizerDashboard from '@/components/organizer-dashboard'

export default async function OrganizerDashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ORGANIZER') {
    redirect('/goalkeeper/dashboard')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      organizerBookings: {
        include: {
          goalkeeper: true,
          goalkeeperProfile: true,
          ratings: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return <OrganizerDashboard user={user} />
}
