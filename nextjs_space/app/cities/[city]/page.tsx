import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Goal, MapPin, Users, Star, Shield, ArrowRight, CheckCircle, Euro } from 'lucide-react'
import { notFound } from 'next/navigation'

const CITIES: Record<string, {
  name: string
  nameFull: string
  description: string
  metaDescription: string
  heroTitle: string
  heroSubtitle: string
  venues: { name: string; type: string }[]
  whyHere: string[]
  neighborhoods: string[]
}> = {
  amsterdam: {
    name: 'Amsterdam',
    nameFull: 'Amsterdam',
    description: 'Amsterdam has a thriving amateur football scene with dozens of sports parks across the city. Whether you play outdoors at a sportpark or indoors at a sporthal, finding a complete team — especially a goalkeeper — can be a challenge. KeeperGo helps bridge that gap.',
    metaDescription: 'Hire a goalkeeper for your football match in Amsterdam. KeeperGo connects organizers with available goalkeepers across Amsterdam neighborhoods.',
    heroTitle: 'Find a Goalkeeper in Amsterdam',
    heroSubtitle: 'Connecting match organizers with available goalkeepers across Amsterdam — indoors and outdoors.',
    venues: [
      { name: 'Het Marnix (Sporthal & Oostenburg)', type: 'Indoor' },
      { name: 'Footy Park Amsterdam', type: '5-a-side' },
      { name: 'Indoor Soccer Events (Rhoneweg)', type: 'Indoor' },
      { name: 'Sportcentrum VU (Amstelveen)', type: 'Indoor' },
      { name: 'Municipal Sports Parks (24+ locations)', type: 'Outdoor' },
    ],
    whyHere: [
      'Dozens of sports parks and indoor halls available for rent via amsterdam.nl',
      'Large expat community — many international teams looking for goalkeepers',
      'Active amateur and recreational football scene year-round',
      'Strong indoor (zaalvoetbal) culture during winter months',
    ],
    neighborhoods: ['Amsterdam-Noord', 'Amsterdam-Zuid', 'Amsterdam-Oost', 'Amsterdam-West', 'Amstelveen', 'Nieuw-West']
  },
  rotterdam: {
    name: 'Rotterdam',
    nameFull: 'Rotterdam',
    description: 'Rotterdam is a city with deep football roots and a competitive amateur scene. Sportbedrijf Rotterdam manages over 200 sports locations across the city, offering both outdoor fields and indoor sports halls for rent. KeeperGo helps teams in Rotterdam find the goalkeeper they need.',
    metaDescription: 'Hire a goalkeeper for your football match in Rotterdam. KeeperGo connects organizers with available goalkeepers across Rotterdam.',
    heroTitle: 'Find a Goalkeeper in Rotterdam',
    heroSubtitle: 'Connecting match organizers with available goalkeepers across Rotterdam\u2019s many sports parks and indoor halls.',
    venues: [
      { name: 'Sportbedrijf Rotterdam (200+ locations)', type: 'Outdoor & Indoor' },
      { name: 'Topsportcentrum Rotterdam', type: 'Indoor' },
      { name: 'WION Complex (artificial & natural grass)', type: 'Outdoor' },
    ],
    whyHere: [
      'Over 200 sports locations managed by Sportbedrijf Rotterdam',
      'Affordable field rental \u2014 from \u20ac29/hr for half a field via sportbedrijfrotterdam.nl',
      'Active amateur football and futsal community',
      'Multiple artificial grass fields available across the city',
    ],
    neighborhoods: ['Rotterdam-Zuid', 'Kralingen', 'Delfshaven', 'Hillegersberg', 'Feijenoord', 'Overschie']
  },
  utrecht: {
    name: 'Utrecht',
    nameFull: 'Utrecht',
    description: 'Utrecht offers 24 municipal sports parks with football fields available for rent via the city. Its central location in the Netherlands means goalkeepers can reach venues quickly. KeeperGo connects teams across Utrecht with available goalkeepers.',
    metaDescription: 'Hire a goalkeeper for your football match in Utrecht. KeeperGo connects organizers with available goalkeepers across Utrecht and surrounding areas.',
    heroTitle: 'Find a Goalkeeper in Utrecht',
    heroSubtitle: 'Connecting match organizers with available goalkeepers across Utrecht\u2019s sports parks and indoor halls.',
    venues: [
      { name: 'Sportpark Zoudenbalch', type: 'Outdoor' },
      { name: 'Sportpark Maarschalkerweerd', type: 'Outdoor' },
      { name: 'Footy Park Utrecht', type: '5-a-side' },
      { name: 'Sportpark Papendorp (Leidsche Rijn)', type: 'Outdoor' },
      { name: 'Municipal Sports Parks (24 locations)', type: 'Outdoor' },
    ],
    whyHere: [
      '24 municipal sports parks with football fields available for rent',
      'Central location \u2014 easy to reach from across the Netherlands',
      'Active student football community from Utrecht University and HU',
      'Field rental starts at \u20ac12.31/hr for associations via utrecht.nl',
    ],
    neighborhoods: ['Utrecht Centrum', 'Leidsche Rijn', 'De Meern', 'Overvecht', 'Zuilen', 'Vleuten']
  },
  'den-haag': {
    name: 'Den Haag',
    nameFull: 'The Hague (Den Haag)',
    description: 'The Hague has 16 sports halls and over 160 sports fields available for rent. From Sportcampus Zuiderpark to neighborhood sports halls, there\u2019s no shortage of places to play. KeeperGo helps teams in Den Haag find a goalkeeper when they need one.',
    metaDescription: 'Hire a goalkeeper for your football match in The Hague (Den Haag). KeeperGo connects organizers with available goalkeepers across Den Haag.',
    heroTitle: 'Find a Goalkeeper in The Hague',
    heroSubtitle: 'Connecting match organizers with available goalkeepers across Den Haag\u2019s sports halls and outdoor fields.',
    venues: [
      { name: 'Sportcampus Zuiderpark', type: 'Multi-sport' },
      { name: 'Ons Eibernest (Morgenstond)', type: 'Indoor & Outdoor' },
      { name: '16 municipal sports halls across the city', type: 'Indoor' },
      { name: '160+ municipal sports fields', type: 'Outdoor' },
    ],
    whyHere: [
      '16 sports halls and 160+ outdoor fields managed by the municipality',
      'Sportcampus Zuiderpark \u2014 open 7 days a week for events and matches',
      'Large international community with many expat football teams',
      'Active recreational football scene across all neighborhoods',
    ],
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
      <header className="sticky top-0 z-50 w-full border-b border-gray-800 bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-gray-950/60">
        <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <Goal className="h-6 w-6 text-lime-400" />
            <span className="font-bold text-xl text-white">KeeperGo</span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link href="/auth/organizer/signin">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-lime-400 hover:bg-gray-800">
                <Users className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Organizer</span> Login
              </Button>
            </Link>
            <Link href="/auth/goalkeeper/signin">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-lime-400 hover:bg-gray-800">
                <Goal className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Goalkeeper</span> Login
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero with Goalkeeper Image */}
      <section className="relative py-16 px-4 text-center">
        <div className="max-w-4xl mx-auto mb-10">
          <Badge className="mb-4 bg-lime-400/10 text-lime-400 border-lime-400/30 hover:bg-lime-400/20">
            <MapPin className="w-3 h-3 mr-1" /> {city.nameFull}
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
            {city.heroTitle.replace('Find a Goalkeeper in ', 'Find the Perfect ')}
            <span className="text-lime-400"> Goalkeeper</span>
            <br />
            <span className="text-3xl md:text-4xl">in {city.name}</span>
          </h1>
          <p className="text-lg text-gray-400 mb-0 max-w-2xl mx-auto">
            {city.heroSubtitle}
          </p>
        </div>

        {/* Hero Image */}
        <div className="max-w-5xl mx-auto relative">
          <div className="relative">
            <div className="relative aspect-video">
              <Image
                src="/city-hero.jpg"
                alt={`Goalkeeper making a save - KeeperGo ${city.name}`}
                fill
                className="object-cover"
                priority
              />
              {/* Fade edges into background */}
              <div className="absolute inset-0 pointer-events-none" style={{
                boxShadow: 'inset 0 0 60px 30px rgb(3 7 18)',
              }} />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-950/80 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
              <div className="absolute top-0 bottom-0 left-0 w-20 bg-gradient-to-r from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
              <div className="absolute top-0 bottom-0 right-0 w-20 bg-gradient-to-l from-gray-950 via-gray-950/40 to-transparent pointer-events-none" />
            </div>

            {/* Buttons overlaid on image */}
            <div className="absolute bottom-12 sm:bottom-16 left-0 right-0 flex justify-between px-4 sm:px-10">
              <Link href="/auth/organizer/signin" className="w-[48%] sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-[220px] bg-lime-400 text-gray-950 hover:bg-lime-300 font-extrabold text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4 shadow-lg shadow-lime-400/30 uppercase tracking-wide"
                >
                  Find My Keeper
                  <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
                </Button>
              </Link>
              <Link href="/auth/goalkeeper/signin" className="w-[48%] sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-[220px] bg-lime-400 text-gray-950 hover:bg-lime-300 font-extrabold text-sm sm:text-base px-4 sm:px-6 py-3 sm:py-4 shadow-lg shadow-lime-400/30 uppercase tracking-wide"
                >
                  {"I'm Goalkeeper"}
                  <ArrowRight className="w-5 h-5 ml-2 flex-shrink-0" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* About this city */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Football in {city.name}</h2>
          <p className="text-gray-400 mb-8">{city.description}</p>
          
          <div className="grid md:grid-cols-2 gap-4">
            {city.whyHere.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-gray-900 border border-gray-800 rounded-lg p-4">
                <CheckCircle className="h-5 w-5 text-lime-400 mt-0.5 shrink-0" />
                <span className="text-gray-300">{item}</span>
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
              <p className="text-sm text-gray-400">Describe your match: date, time, location, and budget. It takes less than a minute.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
                <Goal className="h-6 w-6 text-lime-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">2. A Goalkeeper Accepts</h3>
              <p className="text-sm text-gray-400">Goalkeepers in {city.name} see your match and the first one to accept gets it.</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-lime-400/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-lime-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">3. Play & Pay Securely</h3>
              <p className="text-sm text-gray-400">Payment via Stripe. Full refund if the goalkeeper doesn\u2019t show up.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Venues */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-2">Where to Play in {city.name}</h2>
          <p className="text-gray-400 mb-6">You choose the venue — we help you find the goalkeeper. Here are some options for renting fields in {city.name}:</p>
          <div className="grid md:grid-cols-2 gap-4">
            {city.venues.map((venue, i) => (
              <Card key={i} className="bg-gray-900 border-gray-800">
                <CardContent className="py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-lime-400 shrink-0" />
                    <span className="text-gray-200">{venue.name}</span>
                  </div>
                  <Badge className="bg-gray-800 text-gray-400 border-gray-700 text-xs">{venue.type}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Areas Covered */}
      <section className="py-16 px-4 bg-gray-900/50 border-t border-b border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6">Areas in {city.name}</h2>
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
          <p className="text-gray-400 mb-8">Starting from \u20ac20/hour. No hidden fees. 25% platform commission included.</p>
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
                <p className="text-xs text-gray-400">Invite a specific goalkeeper of your choice</p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6 text-center">
                <Shield className="h-8 w-8 text-lime-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-1">No-Show Protection</h3>
                <p className="text-2xl font-bold text-lime-400 mb-2">100%</p>
                <p className="text-xs text-gray-400">Full refund if the goalkeeper doesn\u2019t show up</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 border-t border-gray-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to find a goalkeeper in {city.name}?
          </h2>
          <p className="text-gray-400 mb-8">Sign up for free and post your first match in under a minute.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/auth/organizer/signup">
              <Button size="lg" className="bg-lime-400 text-gray-950 hover:bg-lime-300 font-bold shadow-lg shadow-lime-400/20">
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
          </div>
          <p className="text-sm text-gray-500">\u00a9 2026 KeeperGo. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
