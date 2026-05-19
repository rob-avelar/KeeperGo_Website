'use client'

import { useState, useEffect, useCallback } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import {
  Calendar,
  MapPin,
  Clock,
  Euro,
  CreditCard,
  CheckCircle,
  Loader2,
  Shield,
  Star,
  AlertCircle,
} from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '')

interface PaymentCheckoutProps {
  bookingId: string
  bookingDate: string
  bookingLocation: string
  bookingDuration: number
  bookingFieldType: string
  totalAmount: number
  goalkeeperEarning: number
  platformFee: number
  goalkeeperName: string
  goalkeeperRating: number
  goalkeeperMatches: number
  bookingStatus: string
  redirectStatus: string | null
}

function PaymentForm({ bookingId, totalAmount, chargeAmount }: { bookingId: string; totalAmount: number; chargeAmount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setIsProcessing(true)
    setErrorMessage(null)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/organizer/pay/${bookingId}`,
      },
    })

    if (error) {
      setErrorMessage(error.message || 'Payment failed. Please try again.')
      setIsProcessing(false)
    }
    // If successful, Stripe redirects to return_url
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-800">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-lime-400 hover:bg-lime-300 text-gray-950 font-bold text-lg py-6"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Pay €{(chargeAmount / 100).toFixed(2)}
          </>
        )}
      </Button>

      <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
        <Shield className="h-4 w-4" />
        Secure payment powered by Stripe
      </div>
    </form>
  )
}

export default function PaymentCheckout({
  bookingId,
  bookingDate,
  bookingLocation,
  bookingDuration,
  bookingFieldType,
  totalAmount,
  goalkeeperEarning,
  platformFee,
  goalkeeperName,
  goalkeeperRating,
  goalkeeperMatches,
  bookingStatus,
  redirectStatus,
}: PaymentCheckoutProps) {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [creditApplied, setCreditApplied] = useState(0)
  const [chargeAmount, setChargeAmount] = useState(totalAmount)
  const [fullyCoveredByCredit, setFullyCoveredByCredit] = useState(false)

  // Handle return from Stripe redirect
  const handleRedirectReturn = useCallback(async () => {
    if (redirectStatus === 'succeeded') {
      setConfirming(true)
      try {
        const res = await fetch(`/api/bookings/${bookingId}/confirm-payment`, {
          method: 'POST',
        })
        if (res.ok) {
          setPaymentSuccess(true)
        } else {
          const data = await res.json()
          // If already confirmed, still show success
          if (data.message?.includes('already confirmed')) {
            setPaymentSuccess(true)
          } else {
            setError(data.error || 'Failed to confirm payment')
          }
        }
      } catch {
        setError('Failed to confirm payment')
      } finally {
        setConfirming(false)
        setLoading(false)
      }
    }
  }, [redirectStatus, bookingId])

  useEffect(() => {
    if (redirectStatus) {
      handleRedirectReturn()
      return
    }

    // If booking is already confirmed/completed, show success
    if (bookingStatus === 'CONFIRMED' || bookingStatus === 'COMPLETED') {
      setPaymentSuccess(true)
      setLoading(false)
      return
    }

    // Allow payment for PENDING (open booking, upfront) and ACCEPTED (direct booking)
    if (bookingStatus !== 'PENDING' && bookingStatus !== 'ACCEPTED') {
      setError(`This booking cannot be paid for (status: ${bookingStatus})`)
      setLoading(false)
      return
    }

    // Create payment intent
    const createPayment = async () => {
      try {
        const res = await fetch(`/api/bookings/${bookingId}/create-payment`, {
          method: 'POST',
        })
        const data = await res.json()
        if (res.ok) {
          if (data.creditApplied > 0) {
            setCreditApplied(data.creditApplied)
            setChargeAmount(data.chargeAmount)
          }
          if (data.fullyCoveredByCredit) {
            setFullyCoveredByCredit(true)
            setPaymentSuccess(true)
          } else if (data.clientSecret) {
            setClientSecret(data.clientSecret)
          } else {
            setError(data.error || 'Failed to initialize payment')
          }
        } else {
          setError(data.error || 'Failed to initialize payment')
        }
      } catch {
        setError('Failed to initialize payment')
      } finally {
        setLoading(false)
      }
    }

    createPayment()
  }, [bookingId, bookingStatus, redirectStatus, handleRedirectReturn])

  // Success state
  if (paymentSuccess) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-8 pb-8 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-lime-400/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-lime-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-lime-400 mb-2">Payment Successful!</h2>
            <p className="text-gray-400">
              {goalkeeperName && goalkeeperName !== 'TBD' && goalkeeperName !== 'Goalkeeper'
                ? `Your match with ${goalkeeperName} is now confirmed.`
                : 'Your match announcement is now live! Goalkeepers can view and accept it.'}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
            {creditApplied > 0 && (
              <div className="flex justify-between text-lime-400">
                <span>Referral credit applied</span>
                <span className="font-bold">-€{(creditApplied / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-300">
              <span>Amount paid</span>
              <span className="font-bold text-white">
                {fullyCoveredByCredit
                  ? '€0.00 (covered by credit)'
                  : `€${((totalAmount - creditApplied) / 100).toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Date</span>
              <span>{new Date(bookingDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Location</span>
              <span>{bookingLocation}</span>
            </div>
          </div>
          <Button
            className="bg-lime-400 hover:bg-lime-300 text-gray-950 font-bold"
            onClick={() => router.push('/organizer/dashboard')}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Loading state
  if (loading || confirming) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-lime-400 mx-auto" />
          <p className="text-gray-400">
            {confirming ? 'Confirming payment...' : 'Initializing payment...'}
          </p>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <p className="text-red-400">{error}</p>
          <Button
            variant="outline"
            onClick={() => router.push('/organizer/dashboard')}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Payment form
  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-100 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-lime-400" />
            Payment
          </CardTitle>
          <CardDescription className="text-gray-400">
            Confirm and pay to secure your goalkeeper
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Goalkeeper info */}
          {goalkeeperName && goalkeeperName !== 'TBD' ? (
            <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 border border-gray-700">
              <div>
                <p className="font-semibold text-gray-100">{goalkeeperName}</p>
                <div className="flex items-center gap-3 text-sm text-gray-400 mt-1">
                  {goalkeeperRating > 0 && (
                    <span className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      {goalkeeperRating.toFixed(1)}
                    </span>
                  )}
                  <span>{goalkeeperMatches} matches</span>
                </div>
              </div>
              <Badge className="bg-lime-400/10 text-lime-400 border-lime-400/30">
                Goalkeeper
              </Badge>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-gray-800 rounded-lg p-4 border border-yellow-600/30">
              <div>
                <p className="font-semibold text-yellow-400">Open Match — Goalkeeper TBD</p>
                <p className="text-sm text-gray-400 mt-1">After payment, goalkeepers can view and accept this match.</p>
              </div>
              <Badge className="bg-yellow-400/10 text-yellow-400 border-yellow-400/30">
                Open
              </Badge>
            </div>
          )}

          {/* Match details */}
          <div className="space-y-2 text-sm">
            <div className="flex items-center text-gray-300">
              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
              {new Date(bookingDate).toLocaleDateString('en-GB', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}{' '}
              at{' '}
              {new Date(bookingDate).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className="flex items-center text-gray-300">
              <MapPin className="h-4 w-4 mr-2 text-gray-500" />
              {bookingLocation}
            </div>
            <div className="flex items-center text-gray-300">
              <Clock className="h-4 w-4 mr-2 text-gray-500" />
              {bookingDuration} hour{bookingDuration > 1 ? 's' : ''} \u2022 {bookingFieldType}
            </div>
          </div>

          {/* Price breakdown */}
          <div className="border-t border-gray-700 pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-400">
              <span>Goalkeeper fee (65%)</span>
              <span>€{(goalkeeperEarning / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400">
              <span>Platform fee (35%)</span>
              <span>€{(platformFee / 100).toFixed(2)}</span>
            </div>
            {creditApplied > 0 && (
              <div className="flex justify-between text-sm text-lime-400 font-medium">
                <span>🎁 Referral credit</span>
                <span>-€{(creditApplied / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-lg border-t border-gray-700 pt-2 mt-2">
              <span className="text-gray-100">Total to pay</span>
              <span className="text-lime-400 flex items-center">
                <Euro className="h-4 w-4 mr-1" />
                {(chargeAmount / 100).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Payment Form */}
      {clientSecret && (
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-100 text-lg">Payment Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: 'night',
                  variables: {
                    colorPrimary: '#a3e635',
                    colorBackground: '#1f2937',
                    colorText: '#f3f4f6',
                    colorDanger: '#ef4444',
                    borderRadius: '8px',
                    fontFamily: 'system-ui, sans-serif',
                  },
                  rules: {
                    '.Input': {
                      border: '1px solid #374151',
                      backgroundColor: '#111827',
                    },
                    '.Input:focus': {
                      border: '1px solid #a3e635',
                      boxShadow: '0 0 0 1px #a3e635',
                    },
                    '.Label': {
                      color: '#9ca3af',
                    },
                  },
                },
              }}
            >
              <PaymentForm bookingId={bookingId} totalAmount={totalAmount} chargeAmount={chargeAmount} />
            </Elements>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
