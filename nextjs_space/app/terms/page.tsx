import { ArrowLeft, Goal } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-transparent">
      <header className="bg-gray-900 shadow-sm shadow-black/10 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-lime-400" />
              <h1 className="text-2xl font-bold text-white">KeeperGo</h1>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-gray-900 rounded-lg shadow-sm border border-gray-800 p-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: February 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">1. Acceptance of Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                By accessing and using the KeeperGo platform, you agree to comply with and be bound by these 
                Terms of Service. If you do not agree with any part of these terms, you should not use 
                our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">2. Service Description</h2>
              <p className="text-gray-300 leading-relaxed">
                KeeperGo is a platform that connects football match organisers with goalkeepers 
                available for hire. We facilitate the booking, payment and management of goalkeeper services 
                for amateur and recreational matches in the Netherlands.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">3. User Types</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-2"><strong>Organisers:</strong> Users who create matches and hire goalkeepers.</p>
                <p><strong>Goalkeepers:</strong> Users who offer their services as goalkeepers.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">4. Registration and Account</h2>
              <p className="text-gray-300 leading-relaxed">
                To use the platform, you must create an account by providing accurate and complete information. 
                You are responsible for maintaining the confidentiality of your account and password. You must be at least 
                18 years old to register.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">5. Payments and Commissions</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-2">The minimum hourly rate is €20.</p>
                <p className="mb-2">A service fee is included in each transaction to cover platform costs.</p>
                <p>Direct bookings may include an additional premium on the base price.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">6. Cancellation Policy</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-2"><strong>Organisers:</strong> Free cancellation up to 6 hours before the match. After this period, penalties may apply.</p>
                <p><strong>Goalkeepers:</strong> Frequent cancellations may result in warnings and eventual account suspension.</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">7. No-Show</h2>
              <p className="text-gray-300 leading-relaxed">
                If a goalkeeper fails to attend a confirmed match, the organiser may report it 
                within 48 hours for a full refund. The goalkeeper will be blocked from the platform.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">8. Ratings</h2>
              <p className="text-gray-300 leading-relaxed">
                Organisers must rate goalkeepers after each match. Ratings should be 
                honest and based on the actual experience. False or manipulated ratings may result 
                in account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">9. Responsibilities</h2>
              <p className="text-gray-300 leading-relaxed">
                KeeperGo acts solely as an intermediary. We are not responsible for injuries, accidents 
                or disputes that occur during matches. We recommend that all participants 
                have adequate insurance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">10. Intellectual Property</h2>
              <p className="text-gray-300 leading-relaxed">
                All content on the platform, including logos, design and software, is the property 
                of KeeperGo and is protected by intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">11. Modifications to Terms</h2>
              <p className="text-gray-300 leading-relaxed">
                We reserve the right to modify these terms at any time. Changes 
                take effect upon publication on the platform. Continued use after modifications 
                constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">12. Applicable Law</h2>
              <p className="text-gray-300 leading-relaxed">
                These terms are governed by the laws of the Netherlands. Any dispute shall be resolved 
                in the competent courts of Amsterdam.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">13. Contact</h2>
              <p className="text-gray-300 leading-relaxed">
                For questions about these terms, contact us at: <br />
                Email: contact@keepergo.nl
              </p>
            </section>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
        <p>© 2026 KeeperGo. All rights reserved.</p>
      </footer>
    </div>
  )
}