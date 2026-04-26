import { Banknote, Headset, RefreshCcw, Truck } from "lucide-react";
import { SectionContainer } from "./ui/section-container";

const SERVICE_FEATURES = [
  {
    title: "Free Shipping",
    description: "Free shipping on all US order or order above $200",
    Icon: Truck,
  },
  {
    title: "24X7 Support",
    description: "Contact us 24 hours a day, 7 days a week",
    Icon: Headset,
  },
  {
    title: "30 Days Return",
    description: "Simply return it within 30 days for an exchange",
    Icon: RefreshCcw,
  },
  {
    title: "Payment Secure",
    description: "Contact us 24 hours a day, 7 days a week",
    Icon: Banknote,
  },
];

export function ServiceFeaturesSection() {
  return (
    <SectionContainer>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICE_FEATURES.map((feature) => (
          <article
            key={feature.title}
            className="flex min-h-[160px] flex-col items-center justify-center rounded-xl border border-neutral-200 bg-white p-6 text-center transition hover:shadow-sm"
          >
            <feature.Icon className="h-8 w-8 text-slate-500" strokeWidth={1.6} />
            <h3 className="mt-4 text-lg font-semibold text-slate-800">{feature.title}</h3>
            <p className="mt-2 max-w-[220px] text-sm leading-6 text-slate-500">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </SectionContainer>
  );
}
