import type { Metadata } from "next";

import { DashboardView } from "@/components/auth/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "View profile and order history."
};

export default function DashboardPage() {
  return <DashboardView />;
}
