
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import GoalkeeperDashboard from '@/components/goalkeeper-dashboard'

export default async function GoalkeeperDashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'GOALKEEPER') {
    redirect('/organizer/dashboard')
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      goalkeeperProfile: true,
      goalkeeperBookings: {
        include: {
          organizer: true,
          ratings: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!user) {
    redirect('/auth/signin')
  }

  return <GoalkeeperDashboard user={user} />
}
