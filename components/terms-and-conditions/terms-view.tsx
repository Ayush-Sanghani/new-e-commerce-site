"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";

const SECTIONS = [
  { id: "section-1",  label: "1. Introduction" },
  { id: "section-2",  label: "2. Use of Website" },
  { id: "section-3",  label: "3. User Accounts" },
  { id: "section-4",  label: "4. Products & Pricing" },
  { id: "section-5",  label: "5. Orders & Payments" },
  { id: "section-6",  label: "6. Shipping & Delivery" },
  { id: "section-7",  label: "7. Returns & Refunds" },
  { id: "section-8",  label: "8. Intellectual Property" },
  { id: "section-9",  label: "9. Limitation of Liability" },
  { id: "section-10", label: "10. Termination" },
  { id: "section-11", label: "11. Changes to Terms" },
  { id: "section-12", label: "12. Contact Us" },
];

function TermsList({ items }: { items: string[] }) {
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

export function TermsView() {
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
            {/* Title */}
            <h1 className="text-3xl font-bold text-slate-900">Terms and Conditions</h1>
            <div className="mt-2">
              <span className="inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-slate-500">
                Last updated: April 29, 2026
              </span>
            </div>

            <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">

              <section id="section-1">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  1. Introduction
                </h2>
                <p className="mt-3">
                  Welcome to VrajPharma. By accessing or using our website, you agree to be bound by these Terms and Conditions.
                </p>
                <p className="mt-1">If you do not agree, please do not use our platform.</p>
              </section>

              <section id="section-2">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  2. Use of Website
                </h2>
                <p className="mt-3">You agree to use this website only for lawful purposes. You must not:</p>
                <TermsList items={[
                  "Engage in fraudulent transactions",
                  "Attempt to harm or disrupt the platform",
                  "Misuse or hack user accounts or data",
                ]} />
              </section>

              <section id="section-3">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  3. User Accounts
                </h2>
                <p className="mt-3">When creating an account:</p>
                <TermsList items={[
                  "You must provide accurate information",
                  "You are responsible for maintaining account confidentiality",
                  "All activities under your account are your responsibility",
                ]} />
              </section>

              <section id="section-4">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  4. Products &amp; Pricing
                </h2>
                <TermsList items={[
                  "We strive to display accurate product descriptions and prices",
                  "Prices may change without prior notice",
                  "We reserve the right to cancel orders due to pricing errors or stock issues",
                ]} />
              </section>

              <section id="section-5">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  5. Orders &amp; Payments
                </h2>
                <TermsList items={[
                  "Orders are confirmed only after successful payment",
                  "We use secure third-party payment gateways",
                  "We do not store your sensitive payment details",
                ]} />
              </section>

              <section id="section-6">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  6. Shipping &amp; Delivery
                </h2>
                <TermsList items={[
                  "Delivery timelines are estimates and may vary",
                  "Delays may occur due to external factors",
                  "Risk of loss passes to you upon delivery",
                ]} />
              </section>

              <section id="section-7">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  7. Returns &amp; Refunds
                </h2>
                <p className="mt-3">
                  Returns and refunds are governed by our{" "}
                  <Link href="/return-refund-policy" className="font-medium text-blue-600 hover:underline">
                    Return &amp; Refund Policy
                  </Link>
                  .
                </p>
              </section>

              <section id="section-8">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  8. Intellectual Property
                </h2>
                <p className="mt-3">
                  All website content (logos, images, text, design) is owned by VrajPharma. You may not copy,
                  reproduce, or use content without permission.
                </p>
              </section>

              <section id="section-9">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  9. Limitation of Liability
                </h2>
                <p className="mt-3">We are not liable for:</p>
                <TermsList items={[
                  "Indirect or incidental damages",
                  "Losses due to delays or service interruptions",
                ]} />
              </section>

              <section id="section-10">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  10. Termination
                </h2>
                <p className="mt-3">We may suspend or terminate your account if you violate these terms.</p>
              </section>

              <section id="section-11">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  11. Changes to Terms
                </h2>
                <p className="mt-3">
                  We may update these terms at any time. Continued use of the site means acceptance of updates.
                </p>
              </section>

              <section id="section-12">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  12. Contact Us
                </h2>
                <p className="mt-3">
                  Email:{" "}
                  <a href="mailto:support@vrajpharma.com" className="font-medium text-blue-600 hover:underline">
                    support@vrajpharma.com
                  </a>
                </p>
              </section>

            </div>

            {/* Bottom CTA */}
            <div className="mt-10 border-t border-neutral-200 pt-8 text-center">
              <p className="text-sm text-slate-600">Ready to browse our products?</p>
              <Link
                href="/shop"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <ShoppingBag className="h-4 w-4" />
                Back to Shopping
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
