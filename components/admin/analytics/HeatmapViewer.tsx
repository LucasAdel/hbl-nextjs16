"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { RefreshCw, MousePointer, Users, Calendar, ExternalLink } from "lucide-react";

// Types
interface HeatmapClick {
  x: number;
  y: number;
  count: number;
  element_selector?: string;
}

interface HeatmapData {
  page_url: string;
  viewport_width: number;
  clicks: HeatmapClick[];
  total_clicks: number;
  unique_sessions: number;
  days: number;
}

interface HeatmapConfig {
  page_pattern: string;
  enabled: boolean;
  description?: string;
}

interface HeatmapViewerProps {
  initialPage?: string;
}

export function HeatmapViewer({ initialPage = "/" }: HeatmapViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pages, setPages] = useState<HeatmapConfig[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>(initialPage);
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [heatmapData, setHeatmapData] = useState<HeatmapData | null>(null);

  // Heatmap rendering settings
  const [opacity, setOpacity] = useState(0.7);
  const [blur, setBlur] = useState(20);

  // Fetch available pages
  useEffect(() => {
    async function fetchPages() {
      try {
        const response = await fetch("/api/admin/analytics/heatmap/config");
        const data = await response.json();
        if (data.success && data.data.pages) {
          setPages(data.data.pages.filter((p: HeatmapConfig) => p.enabled));
        }
      } catch (err) {
        console.error("Failed to fetch heatmap pages:", err);
      }
    }
    fetchPages();
  }, []);

  // Fetch heatmap data
  const fetchHeatmapData = useCallback(async () => {
    if (!selectedPage) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: selectedPage,
        days: days.toString(),
      });

      const response = await fetch(`/api/admin/analytics/heatmap?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch heatmap data");
      }

      setHeatmapData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setHeatmapData(null);
    } finally {
      setLoading(false);
    }
  }, [selectedPage, days]);

  useEffect(() => {
    fetchHeatmapData();
  }, [fetchHeatmapData]);

  // Render heatmap on canvas
  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !heatmapData) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const containerWidth = container.clientWidth;
    const aspectRatio = 16 / 9; // Assume typical page aspect ratio
    const containerHeight = Math.min(containerWidth / aspectRatio, 800);

    canvas.width = containerWidth;
    canvas.height = containerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw page background
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid for reference
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 100) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 100) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    if (heatmapData.clicks.length === 0) {
      // No data message
      ctx.fillStyle = "#9ca3af";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No click data available for this page", canvas.width / 2, canvas.height / 2);
      return;
    }

    // Find max count for normalization
    const maxCount = Math.max(...heatmapData.clicks.map((c) => c.count));

    // Scale factor for coordinates
    const scaleX = canvas.width / (heatmapData.viewport_width || 1920);
    const scaleY = canvas.height / (Math.max(...heatmapData.clicks.map((c) => c.y)) + 100);

    // Create temporary canvas for blur effect
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Draw heat points on temp canvas
    heatmapData.clicks.forEach((click) => {
      const x = click.x * scaleX;
      const y = Math.min(click.y * scaleY, canvas.height - 10);
      const intensity = click.count / maxCount;
      const radius = Math.max(10, Math.min(50, intensity * 40 + 10));

      // Create radial gradient
      const gradient = tempCtx.createRadialGradient(x, y, 0, x, y, radius);

      // Color based on intensity (blue -> green -> yellow -> red)
      if (intensity < 0.25) {
        gradient.addColorStop(0, `rgba(0, 0, 255, ${opacity})`);
        gradient.addColorStop(1, "rgba(0, 0, 255, 0)");
      } else if (intensity < 0.5) {
        gradient.addColorStop(0, `rgba(0, 255, 0, ${opacity})`);
        gradient.addColorStop(1, "rgba(0, 255, 0, 0)");
      } else if (intensity < 0.75) {
        gradient.addColorStop(0, `rgba(255, 255, 0, ${opacity})`);
        gradient.addColorStop(1, "rgba(255, 255, 0, 0)");
      } else {
        gradient.addColorStop(0, `rgba(255, 0, 0, ${opacity})`);
        gradient.addColorStop(1, "rgba(255, 0, 0, 0)");
      }

      tempCtx.fillStyle = gradient;
      tempCtx.beginPath();
      tempCtx.arc(x, y, radius, 0, Math.PI * 2);
      tempCtx.fill();
    });

    // Apply blur and draw to main canvas
    ctx.filter = `blur(${blur}px)`;
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.filter = "none";

    // Draw click counts as labels for top clicks
    const topClicks = [...heatmapData.clicks]
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    ctx.fillStyle = "#1f2937";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";

    topClicks.forEach((click) => {
      const x = click.x * scaleX;
      const y = Math.min(click.y * scaleY, canvas.height - 10);
      ctx.fillText(click.count.toString(), x, y - 5);
    });
  }, [heatmapData, opacity, blur]);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Heatmap Viewer</h3>
          <button
            onClick={fetchHeatmapData}
            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Page selector */}
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="px-3 py-1.5 text-sm border rounded-md min-w-[200px]"
          >
            {pages.length === 0 ? (
              <option value="/">Homepage</option>
            ) : (
              pages.map((page) => (
                <option key={page.page_pattern} value={page.page_pattern}>
                  {page.description || page.page_pattern}
                </option>
              ))
            )}
          </select>

          {/* Days selector */}
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-1.5 text-sm border rounded-md"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>

          {/* View actual page */}
          <a
            href={selectedPage}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View Page
          </a>
        </div>
      </div>

      {/* Stats Bar */}
      {heatmapData && (
        <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-2 text-sm">
            <MousePointer className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{heatmapData.total_clicks.toLocaleString()}</span>
            <span className="text-gray-500">clicks</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{heatmapData.unique_sessions.toLocaleString()}</span>
            <span className="text-gray-500">sessions</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-gray-500">Last {heatmapData.days} days</span>
          </div>
        </div>
      )}

      {/* Rendering Controls */}
      <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Opacity:</label>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-500">{Math.round(opacity * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Blur:</label>
          <input
            type="range"
            min="5"
            max="40"
            step="5"
            value={blur}
            onChange={(e) => setBlur(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-sm text-gray-500">{blur}px</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span>Click intensity:</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-green-500" />
          <span>Medium-low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-yellow-500" />
          <span>Medium-high</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 rounded bg-red-500" />
          <span>High</span>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {/* Canvas Container */}
      <div
        ref={containerRef}
        className="relative border rounded-lg overflow-hidden bg-white"
        style={{ minHeight: 400 }}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-10">
            <div className="flex items-center gap-2 text-gray-500">
              <RefreshCw className="h-5 w-5 animate-spin" />
              Loading heatmap...
            </div>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="w-full"
          style={{ maxHeight: 800 }}
        />

        {/* Page URL label */}
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
          {selectedPage}
        </div>
      </div>

      {/* Click Details Table */}
      {heatmapData && heatmapData.clicks.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b">
            <h4 className="font-medium text-sm">Top Click Areas</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Position</th>
                  <th className="px-4 py-2 text-left">Element</th>
                  <th className="px-4 py-2 text-right">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[...heatmapData.clicks]
                  .sort((a, b) => b.count - a.count)
                  .slice(0, 15)
                  .map((click, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-gray-500">{index + 1}</td>
                      <td className="px-4 py-2 font-mono text-xs">
                        ({click.x}, {click.y})
                      </td>
                      <td className="px-4 py-2 text-gray-600 font-mono text-xs truncate max-w-xs">
                        {click.element_selector || "-"}
                      </td>
                      <td className="px-4 py-2 text-right font-medium">{click.count}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
