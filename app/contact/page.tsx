"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ContactPage() {
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
            <p className="mt-3 text-sm text-slate-600">Email: support@dummymart.com</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-neutral-200 bg-white p-6 sm:p-7"
          >
            <h2 className="text-lg font-semibold text-slate-900">Send Us Your Question</h2>

            <div className="mt-4 space-y-4">
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
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-neutral-300"
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
          <div className="mt-3 flex flex-wrap gap-3 text-sm">
            <Link href="/privacy-policy" className="rounded-lg border border-neutral-300 px-3 py-1.5 text-slate-700 hover:bg-neutral-50">
              Privacy Policy
            </Link>
            <Link href="/terms-and-conditions" className="rounded-lg border border-neutral-300 px-3 py-1.5 text-slate-700 hover:bg-neutral-50">
              Terms &amp; Conditions
            </Link>
            <Link href="/return-refund-policy" className="rounded-lg border border-neutral-300 px-3 py-1.5 text-slate-700 hover:bg-neutral-50">
              Return &amp; Refund Policy
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
