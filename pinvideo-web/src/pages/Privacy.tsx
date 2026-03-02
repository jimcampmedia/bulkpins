import { Link } from "react-router-dom";
import { Video, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
              BulkPins
            </span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-8">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-slate max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">1. Introduction</h2>
            <p className="text-slate-600 leading-relaxed">
              BulkPins ("we," "our," or "us") operates the BulkPins web application (the "Service").
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our Service. We are committed to protecting your privacy and handling your
              data in an open and transparent manner. Please read this Privacy Policy carefully. By
              using the Service, you agree to the collection and use of information in accordance
              with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">2. Information We Collect</h2>

            <h3 className="text-lg font-medium text-slate-800 mb-2">2.1 Account Information</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              When you create an account, we collect your name, email address, and password. Your
              password is securely hashed and is never stored in plain text.
            </p>

            <h3 className="text-lg font-medium text-slate-800 mb-2">2.2 Content You Provide</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              We collect the images you upload for video generation, any descriptions or URLs you
              provide, and the AI-generated content (titles, descriptions, tags) associated with
              your videos. Uploaded images and generated videos are stored securely and are only
              accessible to your account.
            </p>

            <h3 className="text-lg font-medium text-slate-800 mb-2">2.3 Pinterest Account Data</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              When you connect your Pinterest account via OAuth, we receive and store an access token
              that allows us to interact with the Pinterest API on your behalf. We may also access
              your Pinterest username, account ID, and a list of your Pinterest boards. We do not
              access your Pinterest password. We only access Pinterest data that is necessary to
              provide the Service's functionality, such as listing your boards and publishing video
              pins that you have explicitly chosen to schedule.
            </p>

            <h3 className="text-lg font-medium text-slate-800 mb-2">2.4 Usage and Billing Data</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              We track your monthly video generation usage to enforce plan limits. If you subscribe
              to a paid plan, payment processing is handled by Stripe. We do not store your full
              credit card number or payment details on our servers. Stripe may collect and process
              your payment information in accordance with their own privacy policy.
            </p>

            <h3 className="text-lg font-medium text-slate-800 mb-2">2.5 Automatically Collected Data</h3>
            <p className="text-slate-600 leading-relaxed">
              We may collect standard log information such as your IP address, browser type, and
              access times when you use the Service. This information is used to maintain the
              security and performance of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">3. How We Use Your Information</h2>
            <p className="text-slate-600 leading-relaxed mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li>Provide, operate, and maintain the Service</li>
              <li>Create and manage your user account</li>
              <li>Generate AI-powered video content and optimized metadata from your uploaded images</li>
              <li>Publish video pins to your Pinterest account at your direction</li>
              <li>Schedule posts to your connected Pinterest boards at times you approve</li>
              <li>Process subscription payments and manage billing</li>
              <li>Track usage to enforce plan limits</li>
              <li>Communicate with you about your account, updates, or support requests</li>
              <li>Improve and optimize the Service</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">4. Pinterest API Usage</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              Our use of the Pinterest API is governed by the{" "}
              <a
                href="https://policy.pinterest.com/en/developer-guidelines"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 underline hover:text-violet-700"
              >
                Pinterest Developer Guidelines
              </a>{" "}
              and the{" "}
              <a
                href="https://developers.pinterest.com/terms/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 underline hover:text-violet-700"
              >
                Pinterest Developer and API Terms of Service
              </a>.
            </p>
            <p className="text-slate-600 leading-relaxed mb-4">
              When you connect your Pinterest account to BulkPins:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600 mb-4">
              <li>We request only the permissions necessary to list your boards and create pins on your behalf.</li>
              <li>We will never post content to your Pinterest account without your explicit approval. Each pin you schedule is individually chosen and reviewed by you before publishing.</li>
              <li>Your Pinterest access token is stored securely and encrypted. It is only used to perform actions you have explicitly requested.</li>
              <li>You can disconnect your Pinterest account at any time from the Settings page, which revokes our access.</li>
              <li>We do not sell, share, or distribute your Pinterest data to any third parties.</li>
              <li>We do not use your Pinterest data for advertising, analytics, or any purpose other than providing the Service to you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">5. Data Storage and Security</h2>
            <p className="text-slate-600 leading-relaxed mb-4">
              We take reasonable measures to protect your personal information from unauthorized
              access, use, or disclosure. Your data is stored on secure servers with encryption
              in transit (HTTPS/TLS). Uploaded images and generated videos are stored using
              industry-standard cloud storage with access controls.
            </p>
            <p className="text-slate-600 leading-relaxed">
              While we strive to use commercially acceptable means to protect your personal
              information, no method of transmission over the Internet or method of electronic
              storage is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">6. Third-Party Services</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We use the following third-party services to operate the Service:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Pinterest API</strong> &mdash; To connect your Pinterest account, list boards, and publish video pins at your direction.</li>
              <li><strong>xAI (Grok)</strong> &mdash; To generate video animations and AI-powered content (titles, descriptions, tags) from your uploaded images.</li>
              <li><strong>Stripe</strong> &mdash; To process subscription payments securely. Stripe's privacy policy governs their handling of your payment information.</li>
              <li><strong>Cloudflare</strong> &mdash; For content delivery and secure storage of uploaded media files.</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              Each of these services has their own privacy policies governing their use of your data.
              We encourage you to review their policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">7. Data Sharing and Disclosure</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              We do not sell, trade, or rent your personal information to third parties. We may
              share your information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>With your consent</strong> &mdash; When you explicitly authorize us to share information, such as when you connect your Pinterest account.</li>
              <li><strong>Service providers</strong> &mdash; With third-party service providers who assist us in operating the Service (as described in Section 6), subject to confidentiality obligations.</li>
              <li><strong>Legal requirements</strong> &mdash; If required by law, regulation, legal process, or governmental request.</li>
              <li><strong>Protection of rights</strong> &mdash; To protect and defend our rights, property, or safety, or that of our users or the public.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">8. Data Retention</h2>
            <p className="text-slate-600 leading-relaxed">
              We retain your account information and content for as long as your account is active
              or as needed to provide the Service. If you delete your account, we will delete or
              anonymize your personal information within a reasonable timeframe, unless we are
              required to retain it for legal or legitimate business purposes. Uploaded images
              and generated videos associated with deleted accounts will be removed from our storage.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">9. Your Rights</h2>
            <p className="text-slate-600 leading-relaxed mb-3">
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-600">
              <li><strong>Access</strong> &mdash; You can request a copy of the personal data we hold about you.</li>
              <li><strong>Correction</strong> &mdash; You can request that we correct inaccurate or incomplete data.</li>
              <li><strong>Deletion</strong> &mdash; You can request that we delete your personal data.</li>
              <li><strong>Portability</strong> &mdash; You can request a copy of your data in a portable format.</li>
              <li><strong>Withdrawal of consent</strong> &mdash; You can disconnect your Pinterest account or delete your account at any time.</li>
              <li><strong>Opt-out</strong> &mdash; You may opt out of non-essential communications.</li>
            </ul>
            <p className="text-slate-600 leading-relaxed mt-4">
              To exercise any of these rights, please contact us using the information provided below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">10. Children's Privacy</h2>
            <p className="text-slate-600 leading-relaxed">
              The Service is not intended for use by children under the age of 13. We do not
              knowingly collect personal information from children under 13. If we become aware
              that we have collected personal information from a child under 13, we will take
              steps to delete that information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">11. Changes to This Policy</h2>
            <p className="text-slate-600 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any
              material changes by posting the new Privacy Policy on this page and updating the
              "Last updated" date. Your continued use of the Service after any changes indicates
              your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-3">12. Contact Us</h2>
            <p className="text-slate-600 leading-relaxed">
              If you have any questions about this Privacy Policy or our data practices, please
              contact us at:
            </p>
            <p className="text-slate-600 mt-2">
              <strong>Email:</strong> privacy@bulkpins.app
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-pink-500 to-violet-500 flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                BulkPins
              </span>
            </div>
            <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} BulkPins. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
