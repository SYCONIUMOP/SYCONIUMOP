"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    try {
      let visitorId = localStorage.getItem("sp_analytics_id");
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem("sp_analytics_id", visitorId);
      }
      void fetch("/api/analytics/track", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          visitorId,
          path: pathname,
          referrer: document.referrer,
        }),
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      // Analytics are optional when browser storage is unavailable.
    }
  }, [pathname]);

  return null;
}
