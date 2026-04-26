import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#F26522",
          orangeDark: "#D4541A",
          black: "#111111",
          ink: "#1A1A1A",
          cream: "#FFF7ED",
          grey: "#F4F4F4",
          green: "#27AE60"
        }
      },
      fontFamily: {
        sans: ["var(--font-barlow)", "Arial", "sans-serif"],
        display: ["var(--font-barlow-condensed)", "Arial", "sans-serif"]
      },
      boxShadow: {
        lift: "0 18px 45px rgba(0, 0, 0, 0.14)",
        nav: "0 2px 18px rgba(0, 0, 0, 0.08)"
      }
    }
  },
  plugins: []
};

export default config;
