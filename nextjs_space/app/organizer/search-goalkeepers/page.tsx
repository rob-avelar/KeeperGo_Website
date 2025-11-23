
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import SearchGoalkeepersClient from '@/components/search-goalkeepers-client'

export default async function SearchGoalkeepersPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ORGANIZER') {
    redirect('/goalkeeper/dashboard')
  }

  return <SearchGoalkeepersClient />
}
