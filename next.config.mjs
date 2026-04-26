/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Security + performance headers
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          // Prevent API responses from being cached by browsers / CDNs
          { key: "Cache-Control", value: "no-store, max-age=0" },
          // Disallow browsers from sniffing MIME types
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options",        value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
