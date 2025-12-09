"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Search,
  Filter,
  Tag,
  User,
  ChevronRight,
} from "lucide-react";
import { blogPosts, categories, getFeaturedPosts, getPostsByCategory } from "@/lib/blog-data";

export default function ResourcesPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const featuredPosts = getFeaturedPosts();
  const filteredPosts = getPostsByCategory(selectedCategory).filter(
    (post) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 md:py-28">
        <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-tiffany/20 mb-6">
              <BookOpen className="h-4 w-4 text-tiffany" />
              <span className="text-sm font-semibold text-tiffany uppercase tracking-wider">
                Resources & Insights
              </span>
            </div>
            <h1 className="font-blair text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
              Legal Insights for
              <span className="text-tiffany"> Medical Practitioners</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
              Stay informed with expert legal guidance, industry updates, and practical advice
              tailored for healthcare professionals.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search articles, topics, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-tiffany focus:border-transparent"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && !searchQuery && selectedCategory === "All" && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="font-blair text-2xl md:text-3xl font-bold text-gray-900">
                  Featured Articles
                </h2>
                <p className="text-gray-600 mt-2">Our most popular and impactful content</p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {featuredPosts.slice(0, 2).map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-tiffany text-white text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  </div>
                  <div className="p-8 pt-14">
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-md">{post.category}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {post.readTime} min read
                      </span>
                    </div>
                    <h3 className="font-blair text-xl md:text-2xl font-bold text-gray-900 mb-3 group-hover:text-tiffany transition-colors">
                      <Link href={`/resources/${post.slug}`}>{post.title}</Link>
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-tiffany/10 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-tiffany" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{post.author.name}</p>
                          <p className="text-xs text-gray-500">{post.author.role}</p>
                        </div>
                      </div>
                      <Link
                        href={`/resources/${post.slug}`}
                        className="inline-flex items-center gap-2 text-tiffany font-medium hover:gap-3 transition-all"
                      >
                        Read More
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Category Filter & All Posts */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Tabs */}
          <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2">
            <Filter className="h-5 w-5 text-gray-400 flex-shrink-0" />
            <div className="flex gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? "bg-tiffany text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-gray-600">
              Showing <span className="font-semibold text-gray-900">{filteredPosts.length}</span>{" "}
              article{filteredPosts.length !== 1 ? "s" : ""}
              {searchQuery && (
                <>
                  {" "}
                  for &ldquo;<span className="text-tiffany">{searchQuery}</span>&rdquo;
                </>
              )}
            </p>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.article
                  key={post.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <span className="px-2 py-1 bg-gray-100 rounded-md font-medium">
                        {post.category}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(post.publishedAt).toLocaleDateString("en-AU", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <h3 className="font-blair text-lg font-bold text-gray-900 mb-3 group-hover:text-tiffany transition-colors line-clamp-2">
                      <Link href={`/resources/${post.slug}`}>{post.title}</Link>
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-tiffany/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-tiffany">
                            {post.author.name.charAt(0)}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">{post.author.name}</span>
                      </div>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {post.readTime} min
                      </span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles found</h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter to find what you&apos;re looking for.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="text-tiffany font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-br from-tiffany to-tiffany-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-blair text-3xl md:text-4xl font-bold text-white mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Subscribe to our newsletter for the latest legal insights and updates.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-tiffany-dark rounded-xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Subscribe Now
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
