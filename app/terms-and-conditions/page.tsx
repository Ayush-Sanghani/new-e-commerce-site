export default function TermsAndConditionsPage() {
  return (
    <main className="bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 text-slate-900 sm:p-8">
        <h1 className="text-3xl font-bold">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: April 29, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">1. Introduction</h2>
          <p className="mt-2">
            Welcome to [Your Store Name]. By accessing or using our website, you agree to be bound by these Terms and Conditions.
          </p>
          <p>If you do not agree, please do not use our platform.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">2. Use of Website</h2>
          <p className="mt-2">You agree to use this website only for lawful purposes. You must not:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Engage in fraudulent transactions</li>
            <li>Attempt to harm or disrupt the platform</li>
            <li>Misuse or hack user accounts or data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">3. User Accounts</h2>
          <p className="mt-2">When creating an account:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You must provide accurate information</li>
            <li>You are responsible for maintaining account confidentiality</li>
            <li>All activities under your account are your responsibility</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">4. Products &amp; Pricing</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>We strive to display accurate product descriptions and prices</li>
            <li>Prices may change without prior notice</li>
            <li>We reserve the right to cancel orders due to pricing errors or stock issues</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">5. Orders &amp; Payments</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Orders are confirmed only after successful payment</li>
            <li>We use secure third-party payment gateways</li>
            <li>We do not store your sensitive payment details</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">6. Shipping &amp; Delivery</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Delivery timelines are estimates and may vary</li>
            <li>Delays may occur due to external factors</li>
            <li>Risk of loss passes to you upon delivery</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">7. Returns &amp; Refunds</h2>
          <p className="mt-2">Returns and refunds are governed by our Return &amp; Refund Policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">8. Intellectual Property</h2>
          <p className="mt-2">
            All website content (logos, images, text, design) is owned by [Your Store Name]. You may not copy,
            reproduce, or use content without permission.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">9. Limitation of Liability</h2>
          <p className="mt-2">We are not liable for:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Indirect or incidental damages</li>
            <li>Losses due to delays or service interruptions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">10. Termination</h2>
          <p className="mt-2">We may suspend or terminate your account if you violate these terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">11. Changes to Terms</h2>
          <p className="mt-2">
            We may update these terms at any time. Continued use of the site means acceptance of updates.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">12. Contact Us</h2>
          <p className="mt-2">Email: [your email]</p>
        </section>
        </div>
      </div>
    </main>
  );
}
