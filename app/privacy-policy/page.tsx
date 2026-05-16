export default function PrivacyPolicyPage() {
  return (
    <main className="bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 text-slate-900 sm:p-8">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: April 29, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">1. Introduction</h2>
          <p className="mt-2">
            At [Your Store Name], we value your privacy and are committed to protecting your personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">2. Information We Collect</h2>
          <p className="mt-2">We may collect:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Name, email, phone number</li>
            <li>Shipping and billing address</li>
            <li>Order history</li>
            <li>Device and browsing information</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">3. How We Use Your Information</h2>
          <p className="mt-2">We use your data to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Process and deliver orders</li>
            <li>Provide customer support</li>
            <li>Improve our services</li>
            <li>Send order updates and important notifications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">4. Cookies</h2>
          <p className="mt-2">We use cookies to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Enhance your browsing experience</li>
            <li>Analyze website traffic</li>
          </ul>
          <p className="mt-2">You can disable cookies via browser settings.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">5. Data Sharing</h2>
          <p className="mt-2">We do NOT sell your data. We may share data with:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Payment providers</li>
            <li>Delivery partners</li>
            <li>Legal authorities if required</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">6. Data Security</h2>
          <p className="mt-2">We implement reasonable security measures to protect your data.</p>
          <p>However, no system is completely secure.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">7. Your Rights</h2>
          <p className="mt-2">You can:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Access your personal data</li>
            <li>Request correction or deletion</li>
            <li>Contact us for any privacy concerns</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">8. Third-Party Services</h2>
          <p className="mt-2">We may use third-party services (payments, analytics).</p>
          <p>We are not responsible for their policies.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">9. Changes to Policy</h2>
          <p className="mt-2">We may update this Privacy Policy from time to time.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">10. Contact</h2>
          <p className="mt-2">Email: [your email]</p>
        </section>
        </div>
      </div>
    </main>
  );
}
