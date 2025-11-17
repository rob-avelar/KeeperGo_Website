
'use client'

import { useState } from 'react'
import { signIn, getSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, Mail, Lock, ArrowRight, Goal as GoalIcon } from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

export default function GoalkeeperSignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials')
        toast({
          title: 'Error',
          description: 'Invalid email or password',
          variant: 'destructive',
        })
      } else {
        const session = await getSession()
        
        // Check if user is actually a goalkeeper
        if (session?.user?.role !== 'GOALKEEPER') {
          toast({
            title: 'Error',
            description: 'This account is not registered as a goalkeeper. Please use the organizer login.',
            variant: 'destructive',
          })
          await signIn('logout', { redirect: false })
          setError('Invalid account type')
        } else {
          toast({
            title: 'Success',
            description: 'Successfully signed in!',
          })
          router.replace('/goalkeeper/dashboard')
        }
      }
    } catch (error) {
      setError('Something went wrong')
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-white p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-4">
            <GoalIcon className="h-8 w-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-purple-800">NetMinder Hire</h1>
          </Link>
          <p className="text-gray-600">Goalkeeper Sign In</p>
        </div>

        <Card className="shadow-lg border-purple-200">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 bg-purple-100 rounded-full flex items-center justify-center">
                <GoalIcon className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Welcome Back, Goalkeeper</CardTitle>
            <CardDescription className="text-center">
              Sign in to view available matches and manage your bookings
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                disabled={isLoading}
              >
                {isLoading ? (
                  'Signing in...'
                ) : (
                  <>
                    Sign In as Goalkeeper
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>

              <div className="text-center text-sm space-y-2">
                <div>
                  <span className="text-gray-600">Don't have an account? </span>
                  <Link 
                    href="/auth/goalkeeper/signup" 
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Sign up
                  </Link>
                </div>
                <div>
                  <span className="text-gray-600">Are you an organizer? </span>
                  <Link 
                    href="/auth/organizer/signin" 
                    className="text-purple-600 hover:text-purple-700 font-medium"
                  >
                    Sign in here
                  </Link>
                </div>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
