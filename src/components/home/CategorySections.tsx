import { BatteryCharging, Dumbbell, Flower2, Gift, Leaf, Sparkles, Sun, Zap } from "lucide-react";
import Link from "next/link";

const categories = [
  {
    name: "Sports Nutrition",
    sub: "Pre, during, post",
    icon: Dumbbell
  },
  {
    name: "Daily Nutrition",
    sub: "Vitamins & minerals",
    icon: Sun
  },
  {
    name: "Women's Nutrition",
    sub: "Beauty & wellness",
    icon: Flower2
  },
  {
    name: "Kidz Nutrition",
    sub: "Grow active",
    icon: Sparkles
  },
  {
    name: "Plant Power",
    sub: "100% plant based",
    icon: Leaf
  },
  {
    name: "Pre-Workout",
    sub: "Activate energy",
    icon: Zap
  },
  {
    name: "Energy Drinks",
    sub: "During workout",
    icon: BatteryCharging
  },
  {
    name: "Bundles",
    sub: "Save more",
    icon: Gift
  }
];

export function CategorySections() {
  return (
    <section className="section-shell bg-white" aria-labelledby="category-heading">
      <div className="container-page">
        <div className="section-intro">
          <p className="eyebrow">Shop by need</p>
          <h2 id="category-heading" className="section-heading mt-4">
            Find your <span>Fuel</span>
          </h2>
          <p className="section-kicker">
            Clear paths for training, recovery, daily wellness and family nutrition.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                href={`/products?category=${encodeURIComponent(category.name)}`}
                aria-label={`Shop ${category.name}`}
                className="group min-h-40 rounded-lg border border-neutral-200 bg-white p-4 text-center shadow-sm transition duration-200 hover:-translate-y-1 hover:border-brand-orange hover:shadow-lift"
              >
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-md bg-brand-grey text-brand-orange transition group-hover:bg-brand-orange group-hover:text-white">
                  <Icon size={26} aria-hidden />
                </span>
                <span className="mt-4 block font-display text-lg font-extrabold uppercase leading-none text-brand-black">
                  {category.name}
                </span>
                <span className="mt-2 block text-xs font-semibold leading-5 text-neutral-500">
                  {category.sub}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
