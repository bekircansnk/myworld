import withSerwistInit from "@serwist/next";
import type { NextConfig } from "next";
import path from "path";

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
  outputFileTracingRoot: path.join(__dirname, "../../../../"),
  turbopack: {
    root: path.join(__dirname, "../../../../"),
  },
};

export default withSerwist(nextConfig);
