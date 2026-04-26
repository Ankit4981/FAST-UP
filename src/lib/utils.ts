import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(value);
}

export function getDiscount(price: number, mrp: number) {
  if (!mrp || mrp <= price) {
    return 0;
  }

  return Math.round(((mrp - price) / mrp) * 100);
}

export function getInitials(name?: string | null) {
  if (!name) {
    return "FU";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}
