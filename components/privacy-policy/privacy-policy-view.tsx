"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Mail } from "lucide-react";

const SECTIONS = [
  { id: "section-1",  label: "1. Introduction" },
  { id: "section-2",  label: "2. Information We Collect" },
  { id: "section-3",  label: "3. How We Use Your Information" },
  { id: "section-4",  label: "4. Cookies" },
  { id: "section-5",  label: "5. Data Sharing" },
  { id: "section-6",  label: "6. Data Security" },
  { id: "section-7",  label: "7. Your Rights" },
  { id: "section-8",  label: "8. Third-Party Services" },
  { id: "section-9",  label: "9. Changes to Policy" },
  { id: "section-10", label: "10. Contact" },
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

export function PrivacyPolicyView() {
  const [activeId, setActiveId] = useState("section-1");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
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
            {/* Title area */}
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
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
                  At [Your Store Name], we value your privacy and are committed to protecting your personal information.
                </p>
              </section>

              <section id="section-2">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  2. Information We Collect
                </h2>
                <p className="mt-3">We may collect:</p>
                <PolicyList items={[
                  "Name, email, phone number",
                  "Shipping and billing address",
                  "Order history",
                  "Device and browsing information",
                ]} />
              </section>

              <section id="section-3">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  3. How We Use Your Information
                </h2>
                <p className="mt-3">We use your data to:</p>
                <PolicyList items={[
                  "Process and deliver orders",
                  "Provide customer support",
                  "Improve our services",
                  "Send order updates and important notifications",
                ]} />
              </section>

              <section id="section-4">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  4. Cookies
                </h2>
                <p className="mt-3">We use cookies to:</p>
                <PolicyList items={[
                  "Enhance your browsing experience",
                  "Analyze website traffic",
                ]} />
                <p className="mt-3">You can disable cookies via browser settings.</p>
              </section>

              <section id="section-5">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  5. Data Sharing
                </h2>
                <p className="mt-3">We do NOT sell your data. We may share data with:</p>
                <PolicyList items={[
                  "Payment providers",
                  "Delivery partners",
                  "Legal authorities if required",
                ]} />
              </section>

              <section id="section-6">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  6. Data Security
                </h2>
                <p className="mt-3">We implement reasonable security measures to protect your data.</p>
                <p className="mt-1">However, no system is completely secure.</p>
              </section>

              <section id="section-7">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  7. Your Rights
                </h2>
                <p className="mt-3">You can:</p>
                <PolicyList items={[
                  "Access your personal data",
                  "Request correction or deletion",
                  "Contact us for any privacy concerns",
                ]} />
              </section>

              <section id="section-8">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  8. Third-Party Services
                </h2>
                <p className="mt-3">We may use third-party services (payments, analytics).</p>
                <p className="mt-1">We are not responsible for their policies.</p>
              </section>

              <section id="section-9">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  9. Changes to Policy
                </h2>
                <p className="mt-3">We may update this Privacy Policy from time to time.</p>
              </section>

              <section id="section-10">
                <h2 className="border-l-4 border-blue-500 pl-3 text-xl font-semibold text-slate-900">
                  10. Contact
                </h2>
                <p className="mt-3">Email: [your email]</p>
              </section>

            </div>

            {/* Bottom CTA */}
            <div className="mt-10 border-t border-neutral-200 pt-8 text-center">
              <p className="text-sm text-slate-600">Have questions about our privacy practices?</p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
