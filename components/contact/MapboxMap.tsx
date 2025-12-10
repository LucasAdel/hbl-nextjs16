"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "@/lib/theme-context";
import "mapbox-gl/dist/mapbox-gl.css";

// Hamilton Bailey Law Firm location - 147 Pirie Street, Adelaide SA 5000
// Verified coordinates: https://latitude.to/articles-by-country/au/australia/289120/pirie-street-adelaide
const OFFICE_LOCATION = {
  lng: 138.60501,
  lat: -34.92565,
  address: "147 Pirie Street, Adelaide, South Australia 5000, Australia",
  name: "Hamilton Bailey Law",
};

/**
 * Open directions to the office in the user's preferred maps app
 * Uses Apple Maps on Apple devices, Google Maps otherwise
 * NO Mapbox routing is used - all routing done by external maps apps
 * Uses coordinates for reliable pinpointing (address encoding can be inaccurate)
 */
function openDirectionsToOffice(): void {
  const { lat, lng, name } = OFFICE_LOCATION;
  const isAppleDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Mac") && "ontouchend" in document);
  const isMac = /Macintosh/.test(navigator.userAgent) && !("ontouchend" in document);

  // Use coordinates for accurate destination (address encoding was causing wrong location)
  const destinationLabel = encodeURIComponent(name);

  if (isAppleDevice) {
    // iOS - use maps:// protocol for native Apple Maps with coordinates
    // Format: maps://?daddr=LAT,LNG&q=LABEL
    const mapsUrl = `maps://?daddr=${lat},${lng}&q=${destinationLabel}`;
    window.location.href = mapsUrl;
  } else if (isMac) {
    // macOS - use web Apple Maps with coordinates
    const webUrl = `https://maps.apple.com/?daddr=${lat},${lng}&q=${destinationLabel}&dirflg=d`;
    window.open(webUrl, "_blank");
  } else {
    // Android/Windows/Other - use Google Maps with coordinates
    const googleUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
    window.open(googleUrl, "_blank");
  }
}

// Cache keys for localStorage
const CACHE_KEYS = {
  STATIC_MAP_LIGHT: "hbl-map-static-light",
  STATIC_MAP_DARK: "hbl-map-static-dark",
  MAP_LOADED_SESSION: "hbl-map-loaded",
  CACHE_TIMESTAMP: "hbl-map-cache-ts",
};

// Cache duration: 365 days (static maps don't change, maximizes token savings)
const CACHE_DURATION = 365 * 24 * 60 * 60 * 1000;

interface MapboxMapProps {
  className?: string;
}

// Generate static map URL (uses 1 API call, much cheaper than interactive)
function getStaticMapUrl(theme: "light" | "dark"): string {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";
  const style = theme === "dark" ? "dark-v11" : "light-v11";
  const { lng, lat } = OFFICE_LOCATION;

  // Custom marker pin
  const pin = `pin-l+2AAFA2(${lng},${lat})`;

  return `https://api.mapbox.com/styles/v1/mapbox/${style}/static/${pin}/${lng},${lat},15,45,-17.6/600x400@2x?access_token=${token}`;
}

// Check if cache is valid
function isCacheValid(): boolean {
  if (typeof window === "undefined") return false;
  const timestamp = localStorage.getItem(CACHE_KEYS.CACHE_TIMESTAMP);
  if (!timestamp) return false;
  return Date.now() - parseInt(timestamp, 10) < CACHE_DURATION;
}

// Get cached static map image
function getCachedStaticMap(theme: "light" | "dark"): string | null {
  if (typeof window === "undefined") return null;
  if (!isCacheValid()) return null;
  const key = theme === "dark" ? CACHE_KEYS.STATIC_MAP_DARK : CACHE_KEYS.STATIC_MAP_LIGHT;
  return localStorage.getItem(key);
}

// Cache static map image as base64
async function cacheStaticMap(theme: "light" | "dark"): Promise<string | null> {
  if (typeof window === "undefined") return null;

  const url = getStaticMapUrl(theme);
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const key = theme === "dark" ? CACHE_KEYS.STATIC_MAP_DARK : CACHE_KEYS.STATIC_MAP_LIGHT;
        localStorage.setItem(key, base64);
        localStorage.setItem(CACHE_KEYS.CACHE_TIMESTAMP, Date.now().toString());
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Failed to cache static map:", error);
    return null;
  }
}

// Check if interactive map was already loaded this session
function wasMapLoadedThisSession(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(CACHE_KEYS.MAP_LOADED_SESSION) === "true";
}

// Mark map as loaded for this session
function markMapLoadedThisSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CACHE_KEYS.MAP_LOADED_SESSION, "true");
}

export function MapboxMap({ className = "" }: MapboxMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [staticMapSrc, setStaticMapSrc] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [interactiveRequested, setInteractiveRequested] = useState(false);
  const { resolvedTheme } = useTheme();

  // Determine map style based on theme
  const mapStyle = resolvedTheme === "dark"
    ? "mapbox://styles/mapbox/dark-v11"
    : "mapbox://styles/mapbox/light-v11";

  // Load static map on mount (instant, cached)
  useEffect(() => {
    const loadStaticMap = async () => {
      // Try cache first
      const cached = getCachedStaticMap(resolvedTheme);
      if (cached) {
        setStaticMapSrc(cached);
        return;
      }

      // Fetch and cache if not cached
      const freshImage = await cacheStaticMap(resolvedTheme);
      if (freshImage) {
        setStaticMapSrc(freshImage);
      }
    };

    loadStaticMap();
  }, [resolvedTheme]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!mapContainer.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "200px", // Start loading 200px before visible
        threshold: 0.1,
      }
    );

    observer.observe(mapContainer.current);
    return () => observer.disconnect();
  }, []);

  // Initialize interactive map when visible and requested
  const initializeInteractiveMap = useCallback(async () => {
    if (!mapContainer.current || map.current) return;
    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN) return;

    // Dynamically import mapbox-gl only when needed
    const mapboxgl = (await import("mapbox-gl")).default;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [OFFICE_LOCATION.lng, OFFICE_LOCATION.lat],
      zoom: 15,
      pitch: 45,
      bearing: -17.6,
      antialias: true,
      // Performance optimizations
      fadeDuration: 0,
      preserveDrawingBuffer: false,
      trackResize: true,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      markMapLoadedThisSession();

      // Add 3D buildings layer
      if (map.current) {
        const layers = map.current.getStyle().layers;
        const labelLayerId = layers?.find(
          (layer) => layer.type === "symbol" && layer.layout?.["text-field"]
        )?.id;

        map.current.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "height"],
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "min_height"],
              ],
              "fill-extrusion-opacity": 0.6,
            },
          },
          labelLayerId
        );
      }
    });

    // Create custom marker element
    const markerElement = document.createElement("div");
    markerElement.innerHTML = `
      <div class="relative cursor-pointer group" id="map-pin-clickable">
        <div class="absolute -inset-4 rounded-full bg-tiffany/20 animate-ping-slow pointer-events-none"></div>
        <div class="absolute -inset-2 rounded-full bg-tiffany/30 animate-pulse-slow pointer-events-none"></div>
        <div class="relative">
          <div class="w-12 h-12 bg-gradient-to-br from-tiffany to-tiffany-dark rounded-full shadow-lg shadow-tiffany/40 flex items-center justify-center transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-tiffany/50 group-active:scale-95">
            <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
            </svg>
          </div>
          <div class="absolute left-1/2 -translate-x-1/2 -bottom-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-tiffany-dark pointer-events-none"></div>
          <div class="absolute left-1/2 -translate-x-1/2 -bottom-4 w-6 h-2 bg-black/20 rounded-full blur-sm pointer-events-none"></div>
        </div>
        <div class="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div class="bg-white px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
            <p class="font-semibold text-gray-900 text-sm">Hamilton Bailey Law</p>
            <p class="text-gray-500 text-xs">Tap for directions</p>
          </div>
          <div class="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-white rotate-45"></div>
        </div>
      </div>
    `;

    // Add click handler for directions (uses external maps, not Mapbox routing)
    markerElement.addEventListener("click", openDirectionsToOffice);

    // Add marker
    markerRef.current = new mapboxgl.Marker({
      element: markerElement,
      anchor: "bottom",
    })
      .setLngLat([OFFICE_LOCATION.lng, OFFICE_LOCATION.lat])
      .addTo(map.current);

    // Add navigation controls
    map.current.addControl(
      new mapboxgl.NavigationControl({ visualizePitch: true }),
      "top-right"
    );
  }, [mapStyle]);

  // Load interactive map when visible and user hovers/clicks
  useEffect(() => {
    if (isVisible && interactiveRequested && !map.current) {
      initializeInteractiveMap();
    }
  }, [isVisible, interactiveRequested, initializeInteractiveMap]);

  // Auto-load interactive map after delay if visible (background load)
  useEffect(() => {
    if (!isVisible || map.current) return;

    // If map was loaded this session, load interactive immediately
    if (wasMapLoadedThisSession()) {
      setInteractiveRequested(true);
      return;
    }

    // Otherwise, delay background loading
    const timer = setTimeout(() => {
      setInteractiveRequested(true);
    }, 2000); // 2 second delay for background load

    return () => clearTimeout(timer);
  }, [isVisible]);

  // Update map style when theme changes
  useEffect(() => {
    if (map.current && mapLoaded) {
      map.current.setStyle(mapStyle);
    }
  }, [resolvedTheme, mapStyle, mapLoaded]);

  // Cleanup
  useEffect(() => {
    return () => {
      markerRef.current?.remove();
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Handle user interaction to trigger interactive map
  const handleInteraction = () => {
    if (!interactiveRequested) {
      setInteractiveRequested(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Preconnect hints for faster loading */}
      <link rel="preconnect" href="https://api.mapbox.com" />
      <link rel="preconnect" href="https://tiles.mapbox.com" />
      <link rel="preconnect" href="https://events.mapbox.com" />

      {/* Map container */}
      <div
        ref={mapContainer}
        className="w-full h-full rounded-xl overflow-hidden"
        onMouseEnter={handleInteraction}
        onTouchStart={handleInteraction}
        onClick={handleInteraction}
      />

      {/* Static map placeholder (shows instantly from cache) */}
      {!mapLoaded && staticMapSrc && (
        <div
          className="absolute inset-0 rounded-xl overflow-hidden cursor-pointer"
          onClick={handleInteraction}
        >
          <img
            src={staticMapSrc}
            alt="Hamilton Bailey Law Office Location"
            className="w-full h-full object-cover"
          />
          {/* Overlay with "Loading interactive map..." */}
          {interactiveRequested && (
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="bg-white/90 dark:bg-slate-800/90 px-4 py-2 rounded-lg shadow-lg">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-tiffany/30 border-t-tiffany rounded-full animate-spin"></div>
                  <span className="text-sm text-gray-700 dark:text-gray-300">Loading interactive map...</span>
                </div>
              </div>
            </div>
          )}
          {/* Static pin overlay */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full pointer-events-none">
            <div className="w-10 h-10 bg-gradient-to-br from-tiffany to-tiffany-dark rounded-full shadow-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
          {/* Click to interact hint */}
          {!interactiveRequested && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="bg-white/90 dark:bg-slate-800/90 px-3 py-1.5 rounded-full shadow-lg text-xs text-gray-600 dark:text-gray-300">
                Click to interact
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading overlay (no static map available) */}
      {!mapLoaded && !staticMapSrc && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-tiffany/30 border-t-tiffany rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Fallback if no token */}
      {!process.env.NEXT_PUBLIC_MAPBOX_TOKEN && (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-tiffany/10 dark:bg-tiffany/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-tiffany dark:text-tiffany-light"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {OFFICE_LOCATION.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">147 Pirie Street</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Adelaide, South Australia 5000</p>
            <button
              onClick={openDirectionsToOffice}
              className="inline-flex items-center mt-4 text-tiffany hover:text-tiffany-dark dark:text-tiffany-light dark:hover:text-tiffany transition-colors text-sm font-medium"
            >
              Get Directions
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Decorative gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/50 dark:from-slate-900/50 to-transparent rounded-b-xl pointer-events-none"></div>

      {/* Inject animation styles once */}
      <style jsx global>{`
        @keyframes ping-slow {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-ping-slow {
          animation: ping-slow 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
