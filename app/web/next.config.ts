import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  // Development modda devre dışı bırak (cache sorunlarını önle)
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Serwist webpack plugin kullanıyor, Turbopack uyumluluğu için boş config
  turbopack: {},
};

export default withSerwist(nextConfig);
