"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useEffect, useState } from "react";
import { HomeButton } from "./ui/button";
import { SectionContainer } from "./ui/section-container";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (!message) return;
    const timeout = window.setTimeout(() => setMessage(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [message]);

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = email.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);

    if (!isValid) {
      setMessageType("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setMessageType("success");
    setMessage("You're in! Check your inbox for exclusive weekly deals.");
    setEmail("");
  };

  return (
    <SectionContainer>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-blue-800 p-8 text-white shadow-premium-hover sm:p-12"
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
                <Mail className="h-6 w-6" />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wider text-blue-200">
                Newsletter
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Get 10% off your first order</h2>
              <p className="mt-2 max-w-md text-sm text-blue-100 sm:text-base">
                Join 50,000+ subscribers for exclusive deals, early access, and style tips.
              </p>
            </div>
            <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 flex-1 rounded-xl border-0 px-4 text-sm text-slate-900 outline-none ring-2 ring-transparent focus:ring-white/50"
              />
              <HomeButton
                type="submit"
                className="h-12 shrink-0 bg-accent px-6 hover:bg-accent-hover"
              >
                Subscribe
              </HomeButton>
            </form>
          </div>
          {message ? (
            <p
              className={`mt-4 text-sm ${messageType === "success" ? "text-emerald-200" : "text-red-200"}`}
              role="status"
              aria-live="polite"
            >
              {message}
            </p>
          ) : null}
        </motion.div>
      </div>
    </SectionContainer>
  );
}
