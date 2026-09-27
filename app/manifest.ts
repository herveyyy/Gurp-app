import type { MetadataRoute } from "next";
import pkg from "../package.json";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: pkg.name,
    short_name: pkg.name,
    description: `${pkg.name} — ModernBERT Incident Command Console`,
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}
