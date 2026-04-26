export const brandProfile = {
  name: "Fast&Up",
  legalName: "Aeronutrix Sports Products Private Limited",
  website: "https://in.fastandup.com/",
  customerCareEmail: "customercare@fastandup.in",
  customerCarePhone: "1800-120-9656",
  supportHours: "Mon-Fri 9:30 AM-6:30 PM, Sat 10 AM-2 PM, Sunday closed",
  address:
    "1901 & 1902, 19th Floor, Lotus Grandeur, Veera Desai Road Ext, Andheri West, Mumbai 400 053",
  categories: [
    "Proteins",
    "Energy & Hydration",
    "Weight Management",
    "Sports Nutrition",
    "Daily Wellness",
    "Detox"
  ]
};

const whatsappText = encodeURIComponent(
  "Hi Fast&Up, I need help with products or an order."
);

export const brandSocialLinks = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/fastandup_india/"
  },
  {
    label: "Facebook",
    href: "https://www.facebook.com/FastandUpIndia/"
  },
  {
    label: "LinkedIn",
    href: "https://in.linkedin.com/company/fast%26up"
  },
  {
    label: "WhatsApp",
    href: process.env.NEXT_PUBLIC_FASTANDUP_WHATSAPP_URL ?? `https://wa.me/?text=${whatsappText}`
  }
];

export function formatBrandContext() {
  return [
    `Brand: ${brandProfile.name}`,
    `Legal entity: ${brandProfile.legalName}`,
    `Official website: ${brandProfile.website}`,
    `Customer care email: ${brandProfile.customerCareEmail}`,
    `Customer care phone: ${brandProfile.customerCarePhone}`,
    `Support hours: ${brandProfile.supportHours}`,
    `Corporate office: ${brandProfile.address}`,
    `Official categories: ${brandProfile.categories.join(", ")}`,
    `Social channels: ${brandSocialLinks.map((link) => `${link.label}: ${link.href}`).join(" | ")}`
  ].join("\n");
}
