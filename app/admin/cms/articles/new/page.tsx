"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Eye,
  Clock,
  Tag,
  Image as ImageIcon,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link as LinkIcon,
  Quote,
  Code,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { categoryLabels, type ArticleCategory } from "@/lib/articles-data";

export default function NewArticlePage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<ArticleCategory>("compliance");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [featuredImage, setFeaturedImage] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [publishDate, setPublishDate] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Auto-generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput.toLowerCase())) {
      setTags([...tags, tagInput.toLowerCase()]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async (saveStatus: "draft" | "published") => {
    setIsSaving(true);
    setStatus(saveStatus);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSaving(false);
    router.push("/admin/cms/articles");
  };

  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  const toolbarButtons = [
    { icon: Bold, label: "Bold", action: () => {} },
    { icon: Italic, label: "Italic", action: () => {} },
    { icon: Underline, label: "Underline", action: () => {} },
    { type: "divider" },
    { icon: Heading1, label: "Heading 1", action: () => {} },
    { icon: Heading2, label: "Heading 2", action: () => {} },
    { icon: Heading3, label: "Heading 3", action: () => {} },
    { type: "divider" },
    { icon: List, label: "Bullet List", action: () => {} },
    { icon: ListOrdered, label: "Numbered List", action: () => {} },
    { icon: Quote, label: "Quote", action: () => {} },
    { icon: Code, label: "Code", action: () => {} },
    { type: "divider" },
    { icon: AlignLeft, label: "Align Left", action: () => {} },
    { icon: AlignCenter, label: "Align Centre", action: () => {} },
    { icon: AlignRight, label: "Align Right", action: () => {} },
    { type: "divider" },
    { icon: LinkIcon, label: "Insert Link", action: () => {} },
    { icon: ImageIcon, label: "Insert Image", action: () => {} },
    { type: "divider" },
    { icon: Undo, label: "Undo", action: () => {} },
    { icon: Redo, label: "Redo", action: () => {} },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/cms/articles"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                New Article
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a new blog post or legal article
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSave("draft")}
              disabled={isSaving || !title}
              className="inline-flex items-center px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </button>
            <button
              onClick={() => handleSave("published")}
              disabled={isSaving || !title || !content}
              className="inline-flex items-center px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
            >
              <Eye className="h-4 w-4 mr-2" />
              Publish
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title & Slug */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Enter article title..."
                    className="w-full px-4 py-3 text-lg font-medium bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    URL Slug
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      /resources/
                    </span>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="article-url-slug"
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Excerpt */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Excerpt / Summary
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Write a brief summary of the article..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {excerpt.length}/300 characters recommended
              </p>
            </div>

            {/* Content Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Toolbar */}
              <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                {toolbarButtons.map((button, idx) =>
                  button.type === "divider" ? (
                    <div
                      key={idx}
                      className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"
                    />
                  ) : (
                    <button
                      key={idx}
                      onClick={button.action}
                      className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                      title={button.label}
                    >
                      {button.icon && (
                        <button.icon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  )
                )}
              </div>

              {/* Editor Area */}
              <div className="p-6">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Start writing your article content here...

You can use markdown formatting:
- **bold text**
- *italic text*
- ## Headings
- [links](url)
- > quotes
- - bullet lists
- 1. numbered lists"
                  rows={20}
                  className="w-full bg-transparent border-none focus:outline-none resize-none text-gray-900 dark:text-white placeholder-gray-400"
                />
              </div>

              {/* Word Count */}
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>{wordCount} words</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {readTime} min read
                  </span>
                </div>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                SEO Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={seoTitle || title}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder="SEO title (defaults to article title)"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {(seoTitle || title).length}/60 characters
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={seoDescription || excerpt}
                    onChange={(e) => setSeoDescription(e.target.value)}
                    placeholder="SEO description (defaults to excerpt)"
                    rows={2}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {(seoDescription || excerpt).length}/160 characters
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-900">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                    Draft
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Schedule publish
                  </label>
                  <input
                    type="datetime-local"
                    value={publishDate}
                    onChange={(e) => setPublishDate(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Category
              </h3>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ArticleCategory)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                Tags
              </h3>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTag()}
                  placeholder="Add tag..."
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button
                  onClick={handleAddTag}
                  className="px-3 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500"
                    >
                      ×
                    </button>
                  </span>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-gray-400">No tags added</p>
                )}
              </div>
            </div>

            {/* Featured Image */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Featured Image
              </h3>
              {featuredImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => setFeaturedImage("")}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Drop image or click to upload
                  </p>
                  <button className="text-sm text-teal-600 hover:text-teal-700 font-medium">
                    Choose from media library
                  </button>
                </div>
              )}
            </div>

            {/* Author */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Author
              </h3>
              <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="sarah-mitchell">Sarah Mitchell</option>
                <option value="james-wong">James Wong</option>
                <option value="michelle-chen">Michelle Chen</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
