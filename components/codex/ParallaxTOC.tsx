"use client";

import { useEffect, useRef, useState } from "react";
import { TableOfContents } from "./TableOfContents";

interface ParallaxTOCProps {
  content: string;
}

export function ParallaxTOC({ content }: ParallaxTOCProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Parallax effect: TOC moves at 40% of scroll speed
    const handleScroll = () => {
      setOffset(window.scrollY * 0.4);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="lg:col-span-1 space-y-6"
      style={{
        position: "relative",
      }}
    >
      {/* Parallax-enabled TOC container */}
      <div
        style={{
          transform: `translateY(${offset}px)`,
          transition: "transform 0.1s ease-out",
          willChange: "transform",
        }}
      >
        <div className="sticky top-24">
          <TableOfContents content={content} />

          {/* Quick Actions Card */}
          <div className="mt-6 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
              <h4 className="font-semibold text-slate-800 text-sm">Quick Actions</h4>
            </div>
            <div className="p-4 space-y-2">
              <button className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-tiffany-50 text-slate-700 hover:text-tiffany-700 rounded-lg text-sm transition-all border border-transparent hover:border-tiffany-200">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V5z" />
                </svg>
                Save to Bookmarks
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-tiffany-50 text-slate-700 hover:text-tiffany-700 rounded-lg text-sm transition-all border border-transparent hover:border-tiffany-200">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C9.589 12.498 10 11.358 10 10c0-3.314-2.686-6-6-6s-6 2.686-6 6 2.686 6 6 6c1.358 0 2.498-.411 3.342-1.316m0 0l5.974 5.974m0 0A9.969 9.969 0 0121 10a9.969 9.969 0 01-18.316 4.342m0 0H5.25M21 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Share Article
              </button>
              <button className="w-full flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-tiffany-50 text-slate-700 hover:text-tiffany-700 rounded-lg text-sm transition-all border border-transparent hover:border-tiffany-200">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4H9m4 0h4m-2-2v2m0 0v2m0-6V9m0 4h.01" />
                </svg>
                Print Article
              </button>
            </div>
          </div>

          {/* Need Personal Advice Card */}
          <div className="bg-gradient-to-br from-tiffany-600 to-tiffany-700 rounded-xl p-6 text-white">
            <h4 className="font-semibold mb-2">Need Personal Advice?</h4>
            <p className="text-sm text-tiffany-100 mb-4">
              Our experts can help with your specific situation.
            </p>
            <button className="w-full bg-white text-tiffany-600 hover:bg-tiffany-50 font-medium py-2 rounded-lg transition-colors">
              Book Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
