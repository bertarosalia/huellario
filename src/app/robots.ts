import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/pets", "/bookings", "/reports", "/admin"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
