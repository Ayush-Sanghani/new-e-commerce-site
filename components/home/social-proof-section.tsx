import { Award, Package, Star, Users } from "lucide-react";
import { SOCIAL_PROOF_STATS } from "./data";
import { SectionContainer } from "./ui/section-container";

const STATS = [
  { label: "Happy Customers", value: SOCIAL_PROOF_STATS.customers, icon: Users },
  { label: "Satisfaction Rate", value: SOCIAL_PROOF_STATS.satisfaction, icon: Award },
  { label: "Products Listed", value: SOCIAL_PROOF_STATS.products, icon: Package },
  { label: "Average Rating", value: SOCIAL_PROOF_STATS.rating, icon: Star },
];

const PAYMENT_LOGOS = ["Visa", "Mastercard", "UPI", "Razorpay", "Paytm"];

export function SocialProofSection() {
  return (
    <SectionContainer>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-white p-6 shadow-premium sm:p-10">
          <p className="text-center text-sm font-semibold uppercase tracking-wider text-primary">
            Trusted by shoppers nationwide
          </p>
          <div className="mt-8 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <p className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">{value}</p>
                <p className="mt-1 text-sm text-slate-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 border-t border-border pt-8">
            <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
              Secure payment methods
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {PAYMENT_LOGOS.map((name) => (
                <span
                  key={name}
                  className="rounded-lg border border-border bg-slate-50 px-4 py-2 text-xs font-bold text-slate-600"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
