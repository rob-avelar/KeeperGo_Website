
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  MapPin, 
  Star, 
  Shield, 
  Clock, 
  Euro,
  ArrowRight,
  Goal,
  Trophy,
  CheckCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Goal className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-xl text-blue-800">KeeperGo</span>
          </div>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth/organizer/signin">
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                <Users className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Organizer</span> Login
              </Button>
            </Link>
            <Link href="/auth/goalkeeper/signin">
              <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                <Goal className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Goalkeeper</span> Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 border-blue-200">
            #1 Goalkeeper Platform in Netherlands
          </Badge>
          
          <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Find the Perfect <span className="text-blue-600">Goalkeeper</span> for Your Match
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with skilled goalkeepers in your area. Book instantly, play with confidence. 
            Professional goalkeepers ready for your amateur football matches across the Netherlands.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/organizer/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3">
                <Users className="w-5 h-5 mr-2" />
                I Need a Goalkeeper
              </Button>
            </Link>
            <Link href="/auth/goalkeeper/signup">
              <Button size="lg" variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3">
                <Goal className="w-5 h-5 mr-2" />
                I Am a Goalkeeper
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-16 max-w-4xl mx-auto">
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden shadow-2xl">
            <Image
              src="/og-image.png"
              alt="KeeperGo Platform"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose KeeperGo?
            </h2>
            <p className="text-xl text-gray-600">
              The most trusted platform for goalkeeper bookings in the Netherlands
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <MapPin className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Location-Based Matching</CardTitle>
                <CardDescription>
                  Find goalkeepers near your match location with intelligent geolocation matching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Real-time proximity search</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Interactive map interface</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Star className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Verified Ratings</CardTitle>
                <CardDescription>
                  Comprehensive rating system for punctuality, attitude, and technical skills
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Multi-criteria ratings</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Detailed match history</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Secure Payments</CardTitle>
                <CardDescription>
                  Safe and secure payment processing with transparent pricing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Stripe payment integration</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Transparent fee structure</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple steps to get your goalkeeper</p>
          </div>

          <div className="grid md:grid-cols-2 gap-16">
            {/* For Organizers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Users className="h-6 w-6 text-blue-600 mr-2" />
                For Match Organizers
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Post Your Match</h4>
                    <p className="text-gray-600">Add match details: date, time, location, and field type</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Book & Pay</h4>
                    <p className="text-gray-600">Secure payment and instant confirmation</p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Goalkeepers */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                <Goal className="h-6 w-6 text-blue-600 mr-2" />
                For Goalkeepers
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Create Profile</h4>
                    <p className="text-gray-600">Set your availability, rates, and service area</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Accept Bookings</h4>
                    <p className="text-gray-600">Review match requests and accept ones that fit</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Play & Earn</h4>
                    <p className="text-gray-600">Show up, play great, and earn money</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <Trophy className="h-16 w-16 text-blue-600 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Find Your Perfect Goalkeeper?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of satisfied players and goalkeepers on KeeperGo
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/auth/organizer/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-8 py-3">
                <Users className="w-5 h-5 mr-2" />
                Sign Up as Organizer
              </Button>
            </Link>
            <Link href="/auth/goalkeeper/signup">
              <Button size="lg" variant="outline" className="border-2 border-purple-600 text-purple-600 hover:bg-purple-50 px-8 py-3">
                <Goal className="w-5 h-5 mr-2" />
                Sign Up as Goalkeeper
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <Goal className="h-6 w-6 text-purple-400" />
              <span className="font-bold text-xl">KeeperGo</span>
            </div>
            <div className="flex items-center gap-6 text-gray-400">
              <Link href="/terms" className="hover:text-white transition-colors">
                Termos de Serviço
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Política de Privacidade
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 KeeperGo. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
