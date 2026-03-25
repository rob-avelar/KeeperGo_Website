import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Goal, MapPin, Users, Star, Shield, Clock, ArrowRight, CheckCircle, Euro } from 'lucide-react'
import { notFound } from 'next/navigation'

const CITIES: Record<string, {
  name: string
  nameFull: string
  description: string
  metaDescription: string
  heroTitle: string
  heroSubtitle: string
  venues: string[]
  stats: { keepers: string; matches: string; rating: string }
  highlights: string[]
  neighborhoods: string[]
}> = {
  amsterdam: {
    name: 'Amsterdam',
    nameFull: 'Amsterdam',
    description: 'The capital city and football heart of the Netherlands. With hundreds of amateur clubs and recreational fields, Amsterdam is the perfect market for goalkeeper rentals.',
    metaDescription: 'Hire professional goalkeepers for your football matches in Amsterdam. KeeperGo connects you with skilled goalkeepers in Amsterdam-Noord, Zuid, Oost, West and more.',
    heroTitle: 'Goalkeeper Rental in Amsterdam',
    heroSubtitle: 'Find skilled goalkeepers for your amateur matches across all Amsterdam neighborhoods. From Vondelpark fields to Johan Cruyff Arena pitches.',
    venues: ['Olympic Stadium Fields', 'Sportpark Sloten', 'Sportpark De Toekomst', 'Sportcentrum Voorland', 'De Boelelaan Sportcentre'],
    stats: { keepers: '50+', matches: '200+', rating: '4.8' },
    highlights: ['Largest goalkeeper network in Amsterdam', 'Coverage across all districts', 'Average response time under 2 hours', 'Available for indoor (zaalvoetbal) and outdoor'],
    neighborhoods: ['Amsterdam-Noord', 'Amsterdam-Zuid', 'Amsterdam-Oost', 'Amsterdam-West', 'De Pijp', 'Jordaan', 'Amstelveen']
  },
  rotterdam: {
    name: 'Rotterdam',
    nameFull: 'Rotterdam',
    description: 'The port city with a vibrant football culture. Rotterdam\'s competitive amateur scene makes it a hotspot for goalkeeper demand.',
    metaDescription: 'Hire professional goalkeepers for your football matches in Rotterdam. KeeperGo connects you with skilled goalkeepers across Rotterdam-Zuid, Kralingen, Delfshaven and more.',
    heroTitle: 'Goalkeeper Rental in Rotterdam',
    heroSubtitle: 'Connect with experienced goalkeepers for your matches in Rotterdam. From Kralingen to Feijenoord, we\'ve got you covered.',
    venues: ['Sportcomplex Varkenoord', 'Sportpark Neptunus', 'Sportpark Woudestein', 'Goals Soccer Centre Rotterdam'],
    stats: { keepers: '35+', matches: '120+', rating: '4.7' },
    highlights: ['Growing goalkeeper community', 'Strong futsal (zaalvoetbal) presence', 'Corporate football specialist goalkeepers', 'Quick bookings for last-minute matches'],
    neighborhoods: ['Rotterdam-Zuid', 'Kralingen', 'Delfshaven', 'Hillegersberg', 'Blijdorp', 'Feijenoord']
  },
  utrecht: {
    name: 'Utrecht',
    nameFull: 'Utrecht',
    description: 'The central hub of the Netherlands with a growing recreational football scene. Utrecht\'s compact size means goalkeepers can reach any venue quickly.',
    metaDescription: 'Hire professional goalkeepers for your football matches in Utrecht. KeeperGo connects you with skilled goalkeepers in Utrecht-stad, De Meern, Leidsche Rijn and more.',
    heroTitle: 'Goalkeeper Rental in Utrecht',
    heroSubtitle: 'Find goalkeepers for your amateur matches in Utrecht. Central location means fast availability across the entire city.',
    venues: ['Sportpark Zoudenbalch', 'Sportpark Olympos', 'Sportcentrum Nieuw Welgelegen', 'De Galgenwaard area fields'],
    stats: { keepers: '25+', matches: '80+', rating: '4.9' },
    highlights: ['Highest-rated goalkeepers in the Netherlands', 'University leagues specialist', 'Central location \u2014 quick travel times', 'Indoor and outdoor availability'],
    neighborhoods: ['Utrecht Centrum', 'Leidsche Rijn', 'De Meern', 'Overvecht', 'Lunetten', 'Zuilen']
  },
  'den-haag': {
    name: 'Den Haag',
    nameFull: 'The Hague (Den Haag)',
    description: 'The political capital with a thriving amateur football community. Den Haag offers diverse football cultures from beach football to traditional 11v11.',
    metaDescription: 'Hire professional goalkeepers for your football matches in The Hague (Den Haag). KeeperGo connects you with skilled goalkeepers in Scheveningen, Loosduinen, and more.',
    heroTitle: 'Goalkeeper Rental in The Hague',
    heroSubtitle: 'Book goalkeepers for your matches in Den Haag. From beach football in Scheveningen to indoor arenas in Ypenburg.',
    venues: ['Sportcampus Zuiderpark', 'Sportpark Berestein', 'Sportpark Ockenburgh', 'Kick Den Haag'],
    stats: { keepers: '20+', matches: '60+', rating: '4.8' },
    highlights: ['Beach football goalkeepers available', 'Expat-friendly community', 'Diplomatic & corporate match specialists', 'Weekend warrior packages'],
    neighborhoods: ['Scheveningen', 'Loosduinen', 'Ypenburg', 'Leidschenveen', 'Centrum', 'Laak']
  }
}

export async function generateStaticParams() {
  return Object.keys(CITIES).map(city => ({ city }))
}

export async function generateMetadata({ params }: { params: { city: string } }): Promise<Metadata> {
  const resolvedParams = await params
  const city = CITIES[resolvedParams.city]
  if (!city) return { title: 'City Not Found' }

  return {
    title: `${city.heroTitle} | KeeperGo`,
    description: city.metaDescription,
    keywords: `goalkeeper, rental, ${city.name}, football, soccer, Netherlands, keeper huren ${city.name}, doelman ${city.name}`,
    openGraph: {
      title: `${city.heroTitle} | KeeperGo`,
      description: city.metaDescription,
      type: 'website',
    }
  }
}

export default async function CityPage({ params }: { params: { city: string } }) {
  const resolvedParams = await params
  const city = CITIES[resolvedParams.city]
  if (!city) notFound()

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Goal className="h-6 w-6 text-lime-400" />
            <span className="font-bold text-xl text-white">KeeperGo</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Link href="/auth/organizer/signin">
              <Button size="sm" className="bg-lime-400 text-gray-950 hover:bg-lime-300">
                Find a Keeper
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 px-4 text-center border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-4 bg-lime-400/10 text-lime-400 border-lime-400/30">
            <MapPin className="w-3 h-3 mr-1" /> {city.nameFull}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {city.heroTitle}
          </h1>
          <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
            {city.heroSubtitle}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/organizer/signin">
              <Button size="lg" className="bg-lime-400 text-gray-950 hover:bg-lime-300">
                Find My Keeper <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/goalkeeper/signin">
              <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:border-lime-400 hover:text-lime-400">
                I\u2019m a Goalkeeper
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4 border-b border-gray-800">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-lime-400">{city.stats.keepers}</div>
            <p className="text-sm text-gray-400 mt-1">Active Goalkeepers</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-lime-400">{city.stats.matches}</div>
            <p className="text-sm text-gray-400 mt-1">Matches Played</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1">
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
              <span className="text-3xl font-bold text-white">{city.stats.rating}</span>
            </div>
            <p className="text-sm text-gray-400 mt-1">Average Rating</p>
          </div>
        </div>
      </section>

      {/* Why KeeperGo in this city */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Why KeeperGo in {city.name}?</h2>
          <p className="text-gray-400 mb-8">{city.description}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {city.highlights.map((highlight, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-lime-400 mt-0.5 shrink-0" />
                <span className="text-gray-300">{highlight}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4 bg-gray-900/50 border-t border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-lime-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">1. Post Your Match</h3>
              <p className="text-sm text-gray-400">Describe your match details, location, date, and budget.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
                <Goal className="h-6 w-6 text-lime-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">2. Goalkeeper Accepts</h3>
              <p className="text-sm text-gray-400">A qualified goalkeeper from {city.name} accepts your match.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-lime-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">3. Play & Pay</h3>
              <p className="text-sm text-gray-400">Secure payment via Stripe. No-show protection included.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Popular Venues in {city.name}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {city.venues.map((venue, i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="py-4 flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-lime-400 shrink-0" />
                  <span className="text-gray-200">{venue}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Neighborhoods */}
      <section className="py-16 px-4 bg-gray-900/50 border-t border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">We Cover All {city.name} Areas</h2>
          <div className="flex flex-wrap gap-3">
            {city.neighborhoods.map((n, i) => (
              <Badge key={i} className="bg-gray-800 text-gray-300 border-gray-700 text-sm py-1.5 px-3">
                <MapPin className="w-3 h-3 mr-1" /> {n}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-400 mb-8">Starting from \u20ac20/hour. No hidden fees.</p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6 text-center">
                <Euro className="h-8 w-8 text-lime-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-1">Open Announcement</h3>
                <p className="text-2xl font-bold text-lime-400 mb-2">From \u20ac20/hr</p>
                <p className="text-xs text-gray-400">First goalkeeper to accept gets the match</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-lime-400/30">
              <CardContent className="pt-6 text-center">
                <Star className="h-8 w-8 text-lime-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-1">Direct Booking</h3>
                <p className="text-2xl font-bold text-lime-400 mb-2">From \u20ac25/hr</p>
                <p className="text-xs text-gray-400">Choose your preferred goalkeeper directly</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6 text-center">
                <Shield className="h-8 w-8 text-lime-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-1">No-Show Protection</h3>
                <p className="text-2xl font-bold text-lime-400 mb-2">100%</p>
                <p className="text-xs text-gray-400">Full refund if goalkeeper doesn\u2019t show up</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to play in {city.name}?
          </h2>
          <p className="text-gray-400 mb-8">Join hundreds of organizers and goalkeepers already using KeeperGo.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/organizer/signup">
              <Button size="lg" className="bg-lime-400 text-gray-950 hover:bg-lime-300">
                Sign Up as Organizer <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/goalkeeper/signup">
              <Button size="lg" variant="outline" className="border-gray-700 text-gray-300 hover:border-lime-400 hover:text-lime-400">
                Register as Goalkeeper
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Other Cities */}
      <section className="py-12 px-4 bg-gray-900/50 border-t border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-lg font-semibold text-white mb-4 text-center">Also Available In</h3>
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(CITIES)
              .filter(([slug]) => slug !== resolvedParams.city)
              .map(([slug, c]) => (
                <Link key={slug} href={`/cities/${slug}`}>
                  <Badge className="bg-gray-800 text-gray-300 border-gray-700 hover:border-lime-400 hover:text-lime-400 cursor-pointer text-sm py-1.5 px-4">
                    <MapPin className="w-3 h-3 mr-1" /> {c.name}
                  </Badge>
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Goal className="h-5 w-5 text-lime-400" />
            <span className="font-semibold text-white">KeeperGo</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-400">
            <Link href="/contact" className="hover:text-lime-400">Contact</Link>
            <Link href="/partnerships" className="hover:text-lime-400">Partnerships</Link>
            <Link href="/privacy" className="hover:text-lime-400">Privacy</Link>
            <Link href="/terms" className="hover:text-lime-400">Terms</Link>
          </div>
          <p className="text-sm text-gray-500">\u00a9 {new Date().getFullYear()} KeeperGo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
