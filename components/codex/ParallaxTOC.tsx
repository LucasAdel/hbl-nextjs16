"use client";

import { TableOfContents } from "./TableOfContents";
import { Lightbulb, Clock, TrendingUp, AlertCircle } from "lucide-react";

interface ParallaxTOCProps {
  content: string;
}

export function ParallaxTOC({ content }: ParallaxTOCProps) {
  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Sticky TOC Container - follows user to bottom */}
      <div className="sticky top-24 space-y-6 max-h-[calc(100vh-96px)] overflow-y-auto pr-2">
        {/* Table of Contents */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <TableOfContents content={content} />
        </div>

        {/* Quick Actions Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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

        {/* Key Takeaways Card */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl border border-blue-200 p-4">
          <div className="flex items-start gap-3 mb-3">
            <Lightbulb className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
            <h4 className="font-semibold text-slate-900 text-sm">Key Takeaway</h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            Understand your payroll tax obligations and exemptions to ensure compliance across all Australian states.
          </p>
        </div>

        {/* Time Estimate Card */}
        <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-xl border border-amber-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <h4 className="font-semibold text-slate-900 text-sm">Reading Time</h4>
            </div>
            <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded">9 min</span>
          </div>
          <p className="text-xs text-slate-600">Average reading time based on article length</p>
        </div>

        {/* Difficulty & Progress Card */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-50/50 rounded-xl border border-purple-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <h4 className="font-semibold text-slate-900 text-sm">Difficulty Level</h4>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 h-2 bg-purple-100 rounded-full overflow-hidden">
              <div className="h-full w-2/3 bg-gradient-to-r from-green-400 to-blue-500"></div>
            </div>
            <span className="text-xs font-semibold text-purple-700">Intermediate</span>
          </div>
          <p className="text-xs text-slate-600">Requires prior knowledge of tax concepts</p>
        </div>

        {/* Need Personal Advice Card */}
        <div className="bg-gradient-to-br from-tiffany-600 to-tiffany-700 rounded-xl p-6 text-white">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Need Personal Advice?</h4>
              <p className="text-sm text-tiffany-100">
                Our experts can help with your specific situation.
              </p>
            </div>
          </div>
          <button className="w-full bg-white text-tiffany-600 hover:bg-tiffany-50 font-medium py-2.5 rounded-lg transition-colors text-sm">
            Book Consultation
          </button>
        </div>
      </div>
    </div>
  );
}
