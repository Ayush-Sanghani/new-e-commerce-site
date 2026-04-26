"use client";

import { useEffect, useState } from "react";
import { HomeButton } from "./ui/button";
import { Card } from "./ui/card";

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
    setMessage("Subscribed successfully. You will receive weekly offers.");
    setEmail("");
  };

  return (
    <Card as="section" className="rounded-3xl p-7 sm:p-9">
      <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Newsletter
          </p>
          <h2 className="mt-2 text-2xl font-bold">Get weekly best deals</h2>
          <p className="mt-2 text-sm text-slate-600">
            Static for now. Later you can connect this form to your API.
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="h-11 flex-1 rounded-xl border border-neutral-300 px-3 text-sm outline-none ring-blue-500 focus:ring-2"
          />
          <HomeButton type="submit" className="h-11 w-full sm:w-auto">
            Subscribe
          </HomeButton>
        </form>
        {message ? (
          <p
            className={`text-sm ${messageType === "success" ? "text-emerald-600" : "text-red-600"}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </p>
        ) : null}
      </div>
    </Card>
  );
}
