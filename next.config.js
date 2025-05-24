/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    turbo: {}, // Change boolean true to an empty object
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // ???
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

module.exports = nextConfig;
