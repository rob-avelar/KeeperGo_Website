
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import OrganizerDashboard from '@/components/organizer-dashboard'

export default async function OrganizerDashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  // Check if user has ORGANIZER role
  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { roles: true, role: true }
  })

  if (!dbUser || !dbUser.roles.includes('ORGANIZER')) {
    // User doesn't have organizer role — redirect to signup
    redirect('/auth/organizer/signup')
  }

  // Set active role to ORGANIZER if not already
  if (dbUser.role !== 'ORGANIZER') {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { role: 'ORGANIZER' }
    })
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
