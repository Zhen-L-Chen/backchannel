import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export so the site can be hosted on GitHub Pages.
  output: "export",
  images: { unoptimized: true },
  // Folder-style URLs (/e/<slug>/) so GitHub Pages serves them directly.
  trailingSlash: true,
  // Set by the deploy workflow ("/backchannel" on GitHub Pages); empty locally.
  basePath: process.env.PAGES_BASE_PATH ?? "",
};

export default nextConfig;
