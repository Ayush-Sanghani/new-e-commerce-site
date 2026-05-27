"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Clock, RotateCcw } from "lucide-react";

const SECTIONS = [
  { id: "section-1", label: "1. Return Window" },
  { id: "section-2", label: "2. Eligible Returns" },
  { id: "section-3", label: "3. Return Conditions" },
  { id: "section-4", label: "4. Non-Eligible Returns" },
  { id: "section-5", label: "5. Refund Policy" },
  { id: "section-6", label: "6. Inspection Process" },
  { id: "section-7", label: "7. Refund Time" },
  { id: "section-8", label: "8. Shipping Costs" },
  { id: "section-9", label: "9. Contact Us" },
];

function PolicyList({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5">
          <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-blue-500" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReturnRefundView() {
  const [activeId, setActiveId] = useState("section-1");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px" }
    );

    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex gap-8">

          {/* Sticky TOC sidebar */}
          <aside className="hidden lg:block w-52 shrink-0">
            <div className="sticky top-20">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Contents
              </p>
              <nav className="space-y-0.5">
                {SECTIONS.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className={`block rounded-lg px-2.5 py-1.5 text-sm transition-colors ${
                      activeId === section.id
                        ? "bg-blue-50 font-semibold text-blue-700"
                        : "text-slate-500 hover:bg-neutral-100 hover:text-slate-800"
                    }`}
                  >
                    {section.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-slate-900">Return &amp; Refund Policy</h1>
            <div className="mt-2">
              <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-slate-500">
                Last updated: April 29, 2026
              </span>
            </div>

            <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">

              <section id="section-1">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  1. Return Window
                </h2>
                <p className="mt-3">We offer a 10-day return policy.</p>
                <p className="mt-1">You can request a return within 10 days of receiving your order.</p>
              </section>

              <section id="section-2">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  2. Eligible Returns
                </h2>
                <p className="mt-3">Returns are accepted only if:</p>
                <PolicyList items={[
                  "The product is damaged, defective, or incorrect",
                  "The product received is different from what was ordered",
                ]} />
              </section>

              <section id="section-3">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  3. Return Conditions
                </h2>
                <p className="mt-3">To be eligible for a return:</p>
                <PolicyList items={[
                  "The product must be unused",
                  "It must be in original packaging",
                  "Proof of purchase is required",
                ]} />
              </section>

              {/* Section 4 — Non-Eligible: warning box */}
              <section id="section-4">
                <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                  <h2 className="flex items-center gap-2 border-l-4 border-orange-400 pl-3 text-xl font-semibold text-orange-900">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-orange-500" />
                    4. Non-Eligible Returns
                  </h2>
                  <p className="mt-3 text-orange-800">We do NOT accept returns if:</p>
                  <ul className="mt-2 space-y-1.5 text-orange-800">
                    {[
                      "The product is used or damaged by the customer",
                      "The return request is made after 10 days",
                      "The product is returned in a different condition than received",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span className="mt-[5px] h-2 w-2 shrink-0 rounded-full bg-orange-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Section 5 — Refund Policy: ✅ / ❌ icons */}
              <section id="section-5">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  5. Refund Policy
                </h2>
                <p className="mt-3">Refunds are:</p>
                <ul className="mt-2 space-y-2">
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-base leading-none">✅</span>
                    <span>
                      <span className="font-semibold text-emerald-700">Fully issued</span> if the product is
                      defective, damaged, or incorrect
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="mt-0.5 text-base leading-none">❌</span>
                    <span>
                      <span className="font-semibold text-red-600">NOT issued</span> if the returned product does
                      not meet eligibility conditions
                    </span>
                  </li>
                </ul>
              </section>

              <section id="section-6">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  6. Inspection Process
                </h2>
                <p className="mt-3">Once we receive your return:</p>
                <PolicyList items={[
                  "The product will be inspected",
                  "If approved, a full refund will be processed",
                  "If rejected, no refund will be issued",
                ]} />
              </section>

              {/* Section 7 — Refund Time: highlighted info box */}
              <section id="section-7">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  7. Refund Time
                </h2>
                <p className="mt-3">Approved refunds are processed to the original payment method.</p>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <Clock className="h-5 w-5 shrink-0 text-blue-500" />
                  <p className="text-sm font-semibold text-blue-800">
                    Processing time: <span className="text-blue-600">5–10 business days</span>
                  </p>
                </div>
              </section>

              <section id="section-8">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  8. Shipping Costs
                </h2>
                <PolicyList items={[
                  "Return shipping may be covered by us if the issue is from our side",
                  "Otherwise, shipping costs are non-refundable",
                ]} />
              </section>

              <section id="section-9">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  9. Contact Us
                </h2>
                <p className="mt-3">For return requests:</p>
                <p className="mt-1">
                  Email:{" "}
                  <a href="mailto:support@dummymart.com" className="font-medium text-blue-600 hover:underline">
                    support@dummymart.com
                  </a>
                </p>
              </section>

            </div>

            {/* Bottom CTA */}
            <div className="mt-10 border-t border-neutral-200 pt-8 text-center">
              <p className="text-sm text-slate-600">Need to initiate a return or have questions?</p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <RotateCcw className="h-4 w-4" />
                Request a Return
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
