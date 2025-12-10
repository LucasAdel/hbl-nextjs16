"use client";

import { useEffect, useState } from "react";
import { getSubdomain, CODEX_SUBDOMAIN, DOMAINS, DEV_DOMAINS } from "@/lib/subdomain";

export function useSubdomain() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isCodex, setIsCodex] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const detected = getSubdomain(hostname);
      setSubdomain(detected);
      setIsCodex(detected === CODEX_SUBDOMAIN);
      setIsLoading(false);
    }
  }, []);

  /**
   * Get URL for main site
   */
  const getMainSiteUrl = (path: string = "/") => {
    if (typeof window === "undefined") return path;

    const isDev = window.location.hostname.includes("localhost");
    const baseUrl = isDev ? `http://${DEV_DOMAINS.main}` : DOMAINS.main;
    return `${baseUrl}${path}`;
  };

  /**
   * Get URL for codex subdomain
   */
  const getCodexUrl = (path: string = "/") => {
    if (typeof window === "undefined") return `/codex${path === "/" ? "" : path}`;

    const isDev = window.location.hostname.includes("localhost");
    const baseUrl = isDev ? `http://${DEV_DOMAINS.codex}` : DOMAINS.codex;
    return `${baseUrl}${path}`;
  };

  return {
    subdomain,
    isCodex,
    // Backward compatibility aliases
    isLibrary: isCodex,
    isLoading,
    getMainSiteUrl,
    getCodexUrl,
    // Backward compatibility alias
    getLibraryUrl: getCodexUrl,
  };
}
