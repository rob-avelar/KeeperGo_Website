'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setSent(true)
      } else {
        toast({
          title: 'Error',
          description: 'Something went wrong. Please try again.',
          variant: 'destructive',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800 shadow-lg shadow-black/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-lime-400/10 flex items-center justify-center">
            <Mail className="h-6 w-6 text-lime-400" />
          </div>
          <CardTitle className="text-2xl text-white">Forgot Password</CardTitle>
          <CardDescription className="text-gray-400">
            {sent
              ? 'Check your inbox for a reset link'
              : 'Enter your email and we\'ll send you a link to reset your password'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-6">
              <div className="mx-auto h-16 w-16 rounded-full bg-lime-400/10 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-lime-400" />
              </div>
              <p className="text-gray-300">
                If an account exists for <strong className="text-white">{email}</strong>, you will receive a password reset email shortly.
              </p>
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <div className="flex flex-col gap-3">
                <Button
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-800"
                  onClick={() => { setSent(false); setEmail('') }}
                >
                  Try another email
                </Button>
                <Link href="/auth/signin" className="text-sm text-lime-400 hover:text-lime-300 text-center">
                  Back to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-300">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-lime-400 hover:bg-lime-300 text-gray-950 font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>
              <div className="text-center">
                <Link
                  href="/auth/signin"
                  className="text-sm text-gray-400 hover:text-lime-400 inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
