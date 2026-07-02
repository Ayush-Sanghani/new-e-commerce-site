"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Lock, ScrollText, RotateCcw, ChevronRight } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setIsSubmitted(false);

    // Placeholder submit flow; this can be replaced with DB/API integration later.
    await new Promise((resolve) => setTimeout(resolve, 500));

    setIsSubmitting(false);
    setIsSubmitted(true);
    setName("");
    setEmail("");
    setQuestion("");
  };

  return (
    <main className="bg-neutral-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <section className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-slate-900">Contact Us</h1>
          <p className="mt-2 text-sm text-slate-600">
            Share your question and our team will get back to you.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7">
            <h2 className="text-lg font-semibold text-slate-900">Support Details</h2>
            <p className="mt-3 text-sm text-slate-600">Email: support@vrajpharma.com</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7"
          >
            <h2 className="text-lg font-semibold text-slate-900">Send Us Your Question</h2>

            <div className="mt-4 space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="contact-name" className="text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-email" className="text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="contact-question" className="text-sm font-medium text-slate-700">
                  Question
                </label>
                <textarea
                  id="contact-question"
                  required
                  value={question}
                  onChange={(event) => setQuestion(event.target.value)}
                  rows={5}
                  placeholder="Write your question here..."
                  className="w-full resize-y rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>

              {isSubmitted ? (
                <p className="text-sm text-emerald-600">Your question was submitted successfully.</p>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-slate-900">Helpful Policies</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Link
              href="/privacy-policy"
              className="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-neutral-200 group-hover:ring-blue-200">
                <Lock className="h-4 w-4 text-blue-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">Privacy Policy</p>
                <p className="mt-0.5 text-xs text-slate-500">How we handle your personal data</p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-neutral-400 group-hover:text-blue-500" />
            </Link>

            <Link
              href="/terms-and-conditions"
              className="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-neutral-200 group-hover:ring-blue-200">
                <ScrollText className="h-4 w-4 text-blue-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">Terms &amp; Conditions</p>
                <p className="mt-0.5 text-xs text-slate-500">Rules governing use of our platform</p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-neutral-400 group-hover:text-blue-500" />
            </Link>

            <Link
              href="/return-refund-policy"
              className="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all hover:border-blue-200 hover:bg-blue-50 hover:shadow-sm"
            >
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-neutral-200 group-hover:ring-blue-200">
                <RotateCcw className="h-4 w-4 text-blue-600" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-800 group-hover:text-blue-700">Return &amp; Refund Policy</p>
                <p className="mt-0.5 text-xs text-slate-500">Our policy on returns and refunds</p>
              </div>
              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-neutral-400 group-hover:text-blue-500" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
