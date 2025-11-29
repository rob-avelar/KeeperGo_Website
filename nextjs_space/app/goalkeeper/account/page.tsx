import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import AccountSettingsForm from '@/components/account-settings-form'
import { Button } from '@/components/ui/button'
import { Goal, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function GoalkeeperAccountPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'GOALKEEPER') {
    redirect('/organizer/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-purple-600" />
              <h1 className="text-2xl font-bold text-purple-800">KeeperGo</h1>
            </div>
            <Link href="/goalkeeper/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Account Settings
          </h2>
          <p className="text-gray-600">
            Manage your personal information and security settings
          </p>
        </div>

        <AccountSettingsForm userRole="GOALKEEPER" />
      </div>
    </div>
  )
}
