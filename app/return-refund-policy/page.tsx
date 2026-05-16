export default function ReturnRefundPolicyPage() {
  return (
    <main className="bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 text-slate-900 sm:p-8">
        <h1 className="text-3xl font-bold">Return &amp; Refund Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Last updated: April 29, 2026</p>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
        <section>
          <h2 className="text-xl font-semibold text-slate-900">1. Return Window</h2>
          <p className="mt-2">We offer a 10-day return policy.</p>
          <p>You can request a return within 10 days of receiving your order.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">2. Eligible Returns</h2>
          <p className="mt-2">Returns are accepted only if:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The product is damaged, defective, or incorrect</li>
            <li>The product received is different from what was ordered</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">3. Return Conditions</h2>
          <p className="mt-2">To be eligible for a return:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The product must be unused</li>
            <li>It must be in original packaging</li>
            <li>Proof of purchase is required</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">4. Non-Eligible Returns</h2>
          <p className="mt-2">We do NOT accept returns if:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The product is used or damaged by the customer</li>
            <li>The return request is made after 10 days</li>
            <li>The product is returned in a different condition than received</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">5. Refund Policy</h2>
          <p className="mt-2">Refunds are:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Fully issued if the product is defective, damaged, or incorrect</li>
            <li>NOT issued if the returned product does not meet eligibility conditions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">6. Inspection Process</h2>
          <p className="mt-2">Once we receive your return:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>The product will be inspected</li>
            <li>If approved, a full refund will be processed</li>
            <li>If rejected, no refund will be issued</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">7. Refund Time</h2>
          <p className="mt-2">
            Approved refunds are processed within 5-10 business days to the original payment method.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">8. Shipping Costs</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Return shipping may be covered by us if the issue is from our side</li>
            <li>Otherwise, shipping costs are non-refundable</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-slate-900">9. Contact Us</h2>
          <p className="mt-2">For return requests:</p>
          <p>Email: [your email]</p>
        </section>
        </div>
      </div>
    </main>
  );
}
