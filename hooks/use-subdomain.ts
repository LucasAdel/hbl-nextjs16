"use client";

import { useEffect, useState } from "react";
import { getSubdomain, LIBRARY_SUBDOMAIN, DOMAINS, DEV_DOMAINS } from "@/lib/subdomain";

export function useSubdomain() {
  const [subdomain, setSubdomain] = useState<string | null>(null);
  const [isLibrary, setIsLibrary] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      const detected = getSubdomain(hostname);
      setSubdomain(detected);
      setIsLibrary(detected === LIBRARY_SUBDOMAIN);
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
   * Get URL for library subdomain
   */
  const getLibraryUrl = (path: string = "/") => {
    if (typeof window === "undefined") return `/library${path === "/" ? "" : path}`;

    const isDev = window.location.hostname.includes("localhost");
    const baseUrl = isDev ? `http://${DEV_DOMAINS.library}` : DOMAINS.library;
    return `${baseUrl}${path}`;
  };

  return {
    subdomain,
    isLibrary,
    isLoading,
    getMainSiteUrl,
    getLibraryUrl,
  };
}
