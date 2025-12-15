"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Check,
  X,
  Settings,
} from "lucide-react";

// Types
interface HeatmapPage {
  id?: string;
  page_pattern: string;
  enabled: boolean;
  description: string | null;
  click_count?: number;
  last_click_at?: string;
  created_at?: string;
}

export function HeatmapConfig() {
  const [pages, setPages] = useState<HeatmapPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New page form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPagePattern, setNewPagePattern] = useState("");
  const [newPageDescription, setNewPageDescription] = useState("");
  const [adding, setAdding] = useState(false);

  // Fetch pages
  const fetchPages = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/analytics/heatmap/config");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch heatmap config");
      }

      setPages(data.data.pages || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  // Add new page
  const handleAddPage = async () => {
    if (!newPagePattern.trim()) return;

    setAdding(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/analytics/heatmap/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_pattern: newPagePattern.trim(),
          enabled: true,
          description: newPageDescription.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to add page");
      }

      // Refresh list
      await fetchPages();

      // Reset form
      setNewPagePattern("");
      setNewPageDescription("");
      setShowAddForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setAdding(false);
    }
  };

  // Toggle page enabled/disabled
  const handleToggle = async (page: HeatmapPage) => {
    try {
      const response = await fetch("/api/admin/analytics/heatmap/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page_pattern: page.page_pattern,
          enabled: !page.enabled,
          description: page.description,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update page");
      }

      // Update local state
      setPages((prev) =>
        prev.map((p) =>
          p.page_pattern === page.page_pattern ? { ...p, enabled: !p.enabled } : p
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  // Delete page
  const handleDelete = async (pagePattern: string) => {
    if (!confirm(`Remove "${pagePattern}" from heatmap tracking?`)) return;

    try {
      const response = await fetch(
        `/api/admin/analytics/heatmap/config?page_pattern=${encodeURIComponent(pagePattern)}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete page");
      }

      // Update local state
      setPages((prev) => prev.filter((p) => p.page_pattern !== pagePattern));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">Heatmap Configuration</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchPages}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-tiffany text-white rounded-md hover:bg-tiffany-dark"
          >
            <Plus className="h-4 w-4" />
            Add Page
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600">
        Configure which pages should track click positions for heatmap visualisation.
        Only enabled pages will collect click data.
      </p>

      {/* Error State */}
      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg border border-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium mb-3">Add New Page</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Page Pattern *
              </label>
              <input
                type="text"
                value={newPagePattern}
                onChange={(e) => setNewPagePattern(e.target.value)}
                placeholder="e.g., /services or /blog/*"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use * as a wildcard (e.g., /blog/* matches all blog posts)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={newPageDescription}
                onChange={(e) => setNewPageDescription(e.target.value)}
                placeholder="e.g., Services page"
                className="w-full px-3 py-2 border rounded-md text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleAddPage}
                disabled={!newPagePattern.trim() || adding}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-tiffany text-white rounded-md hover:bg-tiffany-dark disabled:opacity-50"
              >
                {adding ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewPagePattern("");
                  setNewPageDescription("");
                }}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-100"
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages List */}
      <div className="border rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-gray-50 text-xs font-medium text-gray-600 uppercase tracking-wider">
          <div className="col-span-4">Page Pattern</div>
          <div className="col-span-3">Description</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Clicks</div>
          <div className="col-span-1">Actions</div>
        </div>

        {/* Loading State */}
        {loading && pages.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
            Loading configuration...
          </div>
        )}

        {/* Empty State */}
        {!loading && pages.length === 0 && (
          <div className="px-4 py-8 text-center text-gray-500">
            No pages configured. Click &quot;Add Page&quot; to start tracking.
          </div>
        )}

        {/* Page Rows */}
        {pages.map((page) => (
          <div
            key={page.page_pattern}
            className="grid grid-cols-12 gap-2 px-4 py-3 text-sm border-t hover:bg-gray-50"
          >
            <div className="col-span-4 font-mono text-gray-800">
              {page.page_pattern}
            </div>

            <div className="col-span-3 text-gray-600">
              {page.description || "-"}
            </div>

            <div className="col-span-2">
              <button
                onClick={() => handleToggle(page)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                  page.enabled
                    ? "bg-green-100 text-green-800 hover:bg-green-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {page.enabled ? (
                  <>
                    <ToggleRight className="h-3.5 w-3.5" />
                    Enabled
                  </>
                ) : (
                  <>
                    <ToggleLeft className="h-3.5 w-3.5" />
                    Disabled
                  </>
                )}
              </button>
            </div>

            <div className="col-span-2 text-gray-600">
              {page.click_count !== undefined ? (
                <span>{page.click_count.toLocaleString()}</span>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </div>

            <div className="col-span-1">
              <button
                onClick={() => handleDelete(page.page_pattern)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                title="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>
            Start with high-traffic pages like homepage, services, and contact.
          </li>
          <li>Use wildcards (*) to track multiple similar pages (e.g., /blog/*).</li>
          <li>
            Disable tracking on pages with sensitive forms to reduce data
            collection.
          </li>
          <li>Heatmap data takes a few days to accumulate meaningful insights.</li>
        </ul>
      </div>
    </div>
  );
}
