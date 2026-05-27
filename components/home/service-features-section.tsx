import { Banknote, Headset, RefreshCcw, ShieldCheck, Truck } from "lucide-react";
import { SectionContainer } from "./ui/section-container";

const SERVICE_FEATURES = [
  {
    title: "Free Shipping",
    description: "On orders above ₹999 across India",
    Icon: Truck,
    color: "bg-blue-50 text-primary",
  },
  {
    title: "24/7 Support",
    description: "Expert help whenever you need it",
    Icon: Headset,
    color: "bg-amber-50 text-accent",
  },
  {
    title: "Easy Returns",
    description: "30-day hassle-free return policy",
    Icon: RefreshCcw,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Secure Payment",
    description: "256-bit encryption & trusted gateways",
    Icon: ShieldCheck,
    color: "bg-violet-50 text-violet-600",
  },
];

export function ServiceFeaturesSection() {
  return (
    <SectionContainer>
      <div className="mx-auto w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICE_FEATURES.map((feature) => (
            <article
              key={feature.title}
              className="group flex flex-col items-center rounded-2xl border border-border bg-white p-6 text-center shadow-premium transition duration-300 hover:-translate-y-1 hover:shadow-premium-hover"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-105 ${feature.color}`}
              >
                <feature.Icon className="h-7 w-7" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900 sm:text-lg">
                {feature.title}
              </h3>
              <p className="mt-2 max-w-[220px] text-sm leading-relaxed text-slate-500">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
        <p className="mt-6 flex items-center justify-center gap-2 text-center text-sm text-slate-500">
          <Banknote className="h-4 w-4 text-primary" aria-hidden />
          All prices in INR • GST included where applicable
        </p>
      </div>
    </SectionContainer>
  );
}
