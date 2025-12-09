"use client";

import { WifiOff, RefreshCw, Home, Phone } from "lucide-react";
import Link from "next/link";

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-8 bg-gray-100 rounded-full flex items-center justify-center">
          <WifiOff className="h-12 w-12 text-gray-400" />
        </div>

        {/* Title */}
        <h1 className="font-blair text-3xl font-bold text-gray-900 mb-4">
          You&apos;re Offline
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          It looks like you&apos;ve lost your internet connection. Please check your connection
          and try again.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          <button
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-tiffany text-white rounded-xl font-semibold hover:bg-tiffany-dark transition-colors"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            <Home className="h-5 w-5" />
            Go Home (Cached)
          </Link>
        </div>

        {/* Contact Info */}
        <div className="mt-12 p-6 bg-white rounded-xl border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Need Immediate Assistance?</h2>
          <p className="text-sm text-gray-600 mb-4">
            Call us directly if you need urgent legal assistance.
          </p>
          <a
            href="tel:0882128585"
            className="inline-flex items-center gap-2 text-tiffany font-medium hover:underline"
          >
            <Phone className="h-4 w-4" />
            (08) 8212 8585
          </a>
        </div>

        {/* Tips */}
        <div className="mt-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Connection Tips:</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-tiffany">•</span>
              Check if your Wi-Fi or mobile data is enabled
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tiffany">•</span>
              Try moving closer to your router
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tiffany">•</span>
              Restart your router or device
            </li>
            <li className="flex items-start gap-2">
              <span className="text-tiffany">•</span>
              Contact your internet provider if issues persist
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
