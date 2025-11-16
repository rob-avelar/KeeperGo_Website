
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import BookGoalkeeperForm from '@/components/book-goalkeeper-form'

export default async function BookGoalkeeperPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'ORGANIZER') {
    redirect('/goalkeeper/dashboard')
  }

  return <BookGoalkeeperForm />
}
