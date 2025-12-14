"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Search,
  Upload,
  Grid,
  List,
  MoreHorizontal,
  Download,
  Trash2,
  Copy,
  Eye,
  FileText,
  Video,
  File,
  FolderOpen,
  Plus,
  X,
  Check,
  Filter,
} from "lucide-react";

type MediaItem = {
  id: string;
  name: string;
  type: "image" | "document" | "video" | "other";
  mimeType: string;
  size: number;
  dimensions?: { width: number; height: number };
  url: string;
  thumbnail?: string;
  alt?: string;
  uploadedAt: string;
  uploadedBy: string;
  folder?: string;
};

const mediaItems: MediaItem[] = [
  {
    id: "1",
    name: "hero-medical-practice.jpg",
    type: "image",
    mimeType: "image/jpeg",
    size: 245000,
    dimensions: { width: 1920, height: 1080 },
    url: "/images/hero-medical.jpg",
    uploadedAt: "2025-01-20",
    uploadedBy: "Sarah Mitchell",
    folder: "Website",
  },
  {
    id: "2",
    name: "team-photo.jpg",
    type: "image",
    mimeType: "image/jpeg",
    size: 180000,
    dimensions: { width: 1200, height: 800 },
    url: "/images/team.jpg",
    uploadedAt: "2025-01-18",
    uploadedBy: "James Wong",
    folder: "Team",
  },
  {
    id: "3",
    name: "employment-contract-template.pdf",
    type: "document",
    mimeType: "application/pdf",
    size: 450000,
    url: "/documents/employment-template.pdf",
    uploadedAt: "2025-01-15",
    uploadedBy: "Michelle Chen",
    folder: "Templates",
  },
  {
    id: "4",
    name: "compliance-checklist.pdf",
    type: "document",
    mimeType: "application/pdf",
    size: 320000,
    url: "/documents/compliance-checklist.pdf",
    uploadedAt: "2025-01-12",
    uploadedBy: "Sarah Mitchell",
    folder: "Templates",
  },
  {
    id: "5",
    name: "office-interior.jpg",
    type: "image",
    mimeType: "image/jpeg",
    size: 380000,
    dimensions: { width: 1600, height: 900 },
    url: "/images/office.jpg",
    uploadedAt: "2025-01-10",
    uploadedBy: "James Wong",
    folder: "Website",
  },
  {
    id: "6",
    name: "client-testimonial.mp4",
    type: "video",
    mimeType: "video/mp4",
    size: 15000000,
    url: "/videos/testimonial.mp4",
    uploadedAt: "2025-01-08",
    uploadedBy: "Michelle Chen",
    folder: "Marketing",
  },
  {
    id: "7",
    name: "logo-dark.svg",
    type: "image",
    mimeType: "image/svg+xml",
    size: 12000,
    url: "/images/logo-dark.svg",
    uploadedAt: "2025-01-05",
    uploadedBy: "Sarah Mitchell",
    folder: "Branding",
  },
  {
    id: "8",
    name: "logo-light.svg",
    type: "image",
    mimeType: "image/svg+xml",
    size: 11500,
    url: "/images/logo-light.svg",
    uploadedAt: "2025-01-05",
    uploadedBy: "Sarah Mitchell",
    folder: "Branding",
  },
];

const folders = ["All Files", "Website", "Team", "Templates", "Marketing", "Branding"];

const typeIcons = {
  image: ImageIcon,
  document: FileText,
  video: Video,
  other: File,
};

const typeColors = {
  image: "text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400",
  document: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
  video: "text-purple-600 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400",
  other: "text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function MediaLibraryPage() {
  const [items, setItems] = useState(mediaItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("All Files");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState<MediaItem["type"] | "all">("all");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFolder = selectedFolder === "All Files" || item.folder === selectedFolder;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    return matchesSearch && matchesFolder && matchesType;
  });

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredItems.map((i) => i.id));
    }
  };

  const handleDelete = (ids: string[]) => {
    if (confirm(`Delete ${ids.length} item(s)?`)) {
      setItems((prev) => prev.filter((i) => !ids.includes(i.id)));
      setSelectedItems([]);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop - would integrate with Supabase storage
    const files = Array.from(e.dataTransfer.files);
  }, []);

  const stats = {
    total: items.length,
    images: items.filter((i) => i.type === "image").length,
    documents: items.filter((i) => i.type === "document").length,
    totalSize: items.reduce((sum, i) => sum + i.size, 0),
  };

  const TypeIcon = (type: MediaItem["type"]) => typeIcons[type];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <Link
              href="/admin/cms"
              className="hover:text-teal-600 dark:hover:text-teal-400"
            >
              CMS
            </Link>
            <span>/</span>
            <span>Media Library</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Media Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage images, documents, and media files
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Files
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Files</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.total}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Images</p>
          <p className="text-2xl font-bold text-blue-600">{stats.images}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
          <p className="text-2xl font-bold text-red-600">{stats.documents}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Size</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {formatSize(stats.totalSize)}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Folders */}
        <div className="lg:w-56 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Folders
              </h3>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-1">
              {folders.map((folder) => (
                <button
                  key={folder}
                  onClick={() => setSelectedFolder(folder)}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedFolder === folder
                      ? "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                >
                  <FolderOpen className="h-4 w-4" />
                  <span className="text-sm">{folder}</span>
                  <span className="ml-auto text-xs text-gray-400">
                    {folder === "All Files"
                      ? items.length
                      : items.filter((i) => i.folder === folder).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {/* Toolbar */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as MediaItem["type"] | "all")
                  }
                  className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Types</option>
                  <option value="image">Images</option>
                  <option value="document">Documents</option>
                  <option value="video">Videos</option>
                </select>

                <div className="flex items-center bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "grid"
                        ? "bg-white dark:bg-gray-800 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded transition-colors ${
                      viewMode === "list"
                        ? "bg-white dark:bg-gray-800 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <div className="px-4 py-3 bg-teal-50 dark:bg-teal-900/20 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4">
                <span className="text-sm text-teal-700 dark:text-teal-400">
                  {selectedItems.length} selected
                </span>
                <button className="text-sm text-teal-600 hover:text-teal-700">
                  Download All
                </button>
                <button className="text-sm text-teal-600 hover:text-teal-700">
                  Move to Folder
                </button>
                <button
                  onClick={() => handleDelete(selectedItems)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Delete All
                </button>
              </div>
            )}
          </div>

          {/* Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative transition-colors ${
              isDragging
                ? "bg-teal-50 dark:bg-teal-900/20 border-2 border-dashed border-teal-500 rounded-xl"
                : ""
            }`}
          >
            {isDragging && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="text-center">
                  <Upload className="h-12 w-12 text-teal-500 mx-auto mb-2" />
                  <p className="text-lg font-medium text-teal-600">
                    Drop files to upload
                  </p>
                </div>
              </div>
            )}

            {viewMode === "grid" ? (
              /* Grid View */
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredItems.map((item) => {
                  const Icon = typeIcons[item.type];
                  return (
                    <div
                      key={item.id}
                      className={`bg-white dark:bg-gray-800 rounded-xl border transition-all cursor-pointer group ${
                        selectedItems.includes(item.id)
                          ? "border-teal-500 ring-2 ring-teal-500/20"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                      }`}
                      onClick={() => handleSelectItem(item.id)}
                    >
                      {/* Preview */}
                      <div className="aspect-square relative overflow-hidden rounded-t-xl bg-gray-100 dark:bg-gray-900">
                        {item.type === "image" ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="h-16 w-16 text-gray-300" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <div
                              className={`w-16 h-16 rounded-xl flex items-center justify-center ${typeColors[item.type]}`}
                            >
                              <Icon className="h-8 w-8" />
                            </div>
                          </div>
                        )}

                        {/* Selection Indicator */}
                        <div
                          className={`absolute top-2 left-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            selectedItems.includes(item.id)
                              ? "bg-teal-500 border-teal-500"
                              : "bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100"
                          }`}
                        >
                          {selectedItems.includes(item.id) && (
                            <Check className="h-4 w-4 text-white" />
                          )}
                        </div>

                        {/* Actions */}
                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewItem(item);
                            }}
                            className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow hover:bg-gray-50"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-3">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {formatSize(item.size)}
                          {item.dimensions &&
                            ` • ${item.dimensions.width}×${item.dimensions.height}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                      <th className="w-12 py-3 px-4">
                        <input
                          type="checkbox"
                          checked={
                            selectedItems.length === filteredItems.length &&
                            filteredItems.length > 0
                          }
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                        />
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Name
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Type
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Size
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Uploaded
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredItems.map((item) => {
                      const Icon = typeIcons[item.type];
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        >
                          <td className="py-3 px-4">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(item.id)}
                              onChange={() => handleSelectItem(item.id)}
                              className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                            />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeColors[item.type]}`}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.folder}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 dark:text-gray-300 capitalize">
                              {item.type}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-600 dark:text-gray-300">
                              {formatSize(item.size)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="text-sm text-gray-500">
                              {formatDate(item.uploadedAt)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setPreviewItem(item)}
                                className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                                <Download className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                                <Copy className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete([item.id])}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {filteredItems.length === 0 && (
                  <div className="text-center py-12">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No files found
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Upload Files
                </h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  Supports: JPG, PNG, PDF, DOC, MP4 (max 50MB)
                </p>
                <button className="px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
                  Browse Files
                </button>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Upload to folder
                </label>
                <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {folders.slice(1).map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                {previewItem.name}
              </h3>
              <button
                onClick={() => setPreviewItem(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              {previewItem.type === "image" ? (
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-24 w-24 text-gray-300" />
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg flex items-center justify-center">
                  <div
                    className={`w-24 h-24 rounded-xl flex items-center justify-center ${typeColors[previewItem.type]}`}
                  >
                    {(() => {
                      const Icon = typeIcons[previewItem.type];
                      return <Icon className="h-12 w-12" />;
                    })()}
                  </div>
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">File type</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {previewItem.mimeType}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Size</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatSize(previewItem.size)}
                  </p>
                </div>
                {previewItem.dimensions && (
                  <div>
                    <p className="text-gray-500 dark:text-gray-400">Dimensions</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {previewItem.dimensions.width} × {previewItem.dimensions.height}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Uploaded by</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {previewItem.uploadedBy}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Folder</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {previewItem.folder}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Uploaded</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {formatDate(previewItem.uploadedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button className="flex-1 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
                  Download
                </button>
                <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
