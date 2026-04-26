import { Factory, FlaskConical, Leaf, RotateCcw, ShieldCheck, Truck } from "lucide-react";

const trustItems = [
  { label: "100% vegan ranges", icon: Leaf },
  { label: "Swiss fizz tech", icon: FlaskConical },
  { label: "Clinically informed", icon: ShieldCheck },
  { label: "Made in India", icon: Factory },
  { label: "Free shipping INR 599+", icon: Truck },
  { label: "Easy returns", icon: RotateCcw }
];

export function TrustBar() {
  return (
    <section className="border-y border-neutral-200 bg-white" aria-label="Shopping benefits">
      <div className="container-page grid gap-3 py-4 sm:grid-cols-2 lg:grid-cols-6">
        {trustItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex min-h-12 items-center justify-center gap-2 rounded-md bg-neutral-50 px-3 py-2 text-sm font-bold text-brand-black ring-1 ring-neutral-100"
            >
              <Icon size={18} aria-hidden className="text-brand-orange" />
              {item.label}
            </div>
          );
        })}
      </div>
    </section>
  );
}
