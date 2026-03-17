import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <header className="bg-gray-900 shadow-sm shadow-black/10 border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-white">KeeperGo</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-lg shadow-sm border p-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400 mb-8">Last updated: February 2026</p>

          <div className="prose prose-gray max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">1. Introduction</h2>
              <p className="text-gray-300 leading-relaxed">
                KeeperGo is committed to protecting your privacy. This policy describes how 
                we collect, use and protect your personal data in accordance with the 
                General Data Protection Regulation (GDPR).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">2. Data Controller</h2>
              <p className="text-gray-300 leading-relaxed">
                KeeperGo, based in the Netherlands, is responsible for the processing of your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">3. Data Collected</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">We collect the following data:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Identification data:</strong> Name, email address, phone number</li>
                  <li><strong>Profile data:</strong> Photo, location, experience (for goalkeepers)</li>
                  <li><strong>Payment data:</strong> Processed securely through Stripe</li>
                  <li><strong>Usage data:</strong> Booking history, ratings, preferences</li>
                  <li><strong>Technical data:</strong> IP address, browser type, device</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">4. Purposes of Processing</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">We use your data to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide and manage the platform services</li>
                  <li>Process payments and transfers</li>
                  <li>Send notifications about bookings and matches</li>
                  <li>Improve the user experience</li>
                  <li>Comply with legal obligations</li>
                  <li>Prevent fraud and ensure security</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">5. Legal Basis</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">Data processing is based on:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Contract performance:</strong> Necessary to provide the services</li>
                  <li><strong>Consent:</strong> For marketing communications</li>
                  <li><strong>Legitimate interest:</strong> Service improvement and fraud prevention</li>
                  <li><strong>Legal obligation:</strong> Compliance with tax and regulatory requirements</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">6. Data Sharing</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">We may share data with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Other users:</strong> Name and ratings are visible on the platform</li>
                  <li><strong>Payment processors:</strong> Stripe to process transactions</li>
                  <li><strong>Service providers:</strong> Hosting, analytics, communications</li>
                  <li><strong>Authorities:</strong> When required by law</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">7. International Transfers</h2>
              <p className="text-gray-300 leading-relaxed">
                Some of our service providers may be located outside the European Economic 
                Area (EEA). In such cases, we ensure that adequate safeguards are in place, such 
                as standard contractual clauses approved by the European Commission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">8. Data Retention</h2>
              <p className="text-gray-300 leading-relaxed">
                We retain your data for as long as your account is active or as necessary to 
                provide you with services. Transaction data is kept for 7 years for tax purposes. 
                You may request the deletion of your account at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">9. Your Rights (GDPR)</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">You have the following rights:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Obtain a copy of your personal data</li>
                  <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
                  <li><strong>Erasure:</strong> Request the deletion of your data</li>
                  <li><strong>Portability:</strong> Receive your data in a structured format</li>
                  <li><strong>Objection:</strong> Object to processing in certain circumstances</li>
                  <li><strong>Restriction:</strong> Restrict the processing of your data</li>
                  <li><strong>Withdraw consent:</strong> At any time, without affecting the lawfulness of prior processing</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">10. Security</h2>
              <p className="text-gray-300 leading-relaxed">
                We implement appropriate technical and organisational measures to protect your data, 
                including encryption, access controls and continuous monitoring. Payments are 
                processed securely through Stripe, which is PCI DSS certified.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">11. Cookies</h2>
              <p className="text-gray-300 leading-relaxed">
                We use essential cookies for the operation of the platform and analytics cookies 
                to improve our services. You can manage your cookie preferences in your 
                browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">12. Changes to this Policy</h2>
              <p className="text-gray-300 leading-relaxed">
                We may update this policy periodically. We will notify you of significant changes 
                through the platform or by email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-100 mb-3">13. Contact and Complaints</h2>
              <div className="text-gray-300 leading-relaxed">
                <p className="mb-3">
                  To exercise your rights or for privacy-related questions, contact us:
                </p>
                <p className="mb-3">Email: privacy@keepergo.nl</p>
                <p>
                  If you are not satisfied with our response, you may file a complaint with the 
                  Dutch Data Protection Authority (Autoriteit Persoonsgegevens).
                </p>
              </div>
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
