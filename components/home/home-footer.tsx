import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";

type HomeFooterProps = {
  isAuthenticated?: boolean;
};

const FOOTER_LINKS = {
  about: [
    { label: "About Us", href: "/contact" },
    { label: "Our Story", href: "/contact" },
    { label: "Careers", href: "/contact" },
    { label: "Blog", href: "/contact" },
  ],
  support: [
    { label: "Help Center", href: "/contact" },
    { label: "Track Order", href: "/orders" },
    { label: "Shipping Info", href: "/contact" },
    { label: "Contact Us", href: "/contact" },
  ],
  policies: [
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms & Conditions", href: "/terms-and-conditions" },
    { label: "Return & Refund", href: "/return-refund-policy" },
  ],
  shop: [
    { label: "All Products", href: "/shop" },
    { label: "New Arrivals", href: "/shop?sort=latest" },
    { label: "Best Sellers", href: "/shop?sort=rating" },
    { label: "Flash Sale", href: "/shop" },
  ],
};

const SOCIAL = [
  { label: "Facebook", icon: Facebook, href: "#" },
  { label: "Instagram", icon: Instagram, href: "#" },
  { label: "Twitter", icon: Twitter, href: "#" },
  { label: "YouTube", icon: Youtube, href: "#" },
];

const PAYMENTS = ["Visa", "Mastercard", "UPI", "Razorpay"];

export function HomeFooter({ isAuthenticated = false }: HomeFooterProps) {
  return (
    <footer className="mt-4 border-t border-border bg-slate-900 text-slate-300">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link href="/home" className="inline-flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white">
                DM
              </div>
              <span className="text-xl font-bold text-white">VrajPharma</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
              Premium ecommerce for electronics, fashion, and home. Fast delivery,
              secure checkout, and customer-first support.
            </p>
            <div className="mt-6 flex gap-3">
              {SOCIAL.map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-slate-300 transition hover:bg-primary hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">About</h4>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.about.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">Support</h4>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.support.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {isAuthenticated ? (
                <li>
                  <Link href="/orders" className="text-sm transition hover:text-white">
                    My Orders
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Policies
            </h4>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.policies.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="mt-8 text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="mt-4 space-y-2.5">
              {FOOTER_LINKS.shop.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h4 className="text-sm font-bold text-white">Contact</h4>
          <ul className="mt-3 space-y-1.5 text-sm text-slate-400">
            <li>2147 Main Street, New York, NY 10001</li>
            <li>
              <a href="mailto:support@vrajpharma.com" className="hover:text-white">
                support@vrajpharma.com
              </a>
            </li>
            <li>+1 (800) 123-4567</li>
            <li>Mon – Sat: 9:00 AM – 8:00 PM IST</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            {PAYMENTS.map((name) => (
              <span
                key={name}
                className="rounded-lg bg-white/10 px-3 py-1 text-xs font-semibold text-slate-300"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© {new Date().getFullYear()} VrajPharma. All rights reserved.</p>
          <p className="flex flex-wrap gap-x-3 gap-y-1">
            <Link href="/privacy-policy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-white">
              Terms
            </Link>
            <Link href="/return-refund-policy" className="hover:text-white">
              Returns
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
