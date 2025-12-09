"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  QAEntry,
  QACategory,
  getQAEntries,
  getQAEntry,
  markQAHelpful,
  submitQuestion,
  getQACategories,
  searchQA,
  getUserQAStats,
} from "@/lib/community/curated-qa";

interface CuratedQAProps {
  userId?: string;
  userEmail?: string;
}

export function CuratedQA({ userId, userEmail }: CuratedQAProps) {
  const [entries, setEntries] = useState<QAEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<QAEntry | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<QACategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [submitQuestion_, setSubmitQuestion] = useState("");
  const [submitContext, setSubmitContext] = useState("");
  const [submitCategory, setSubmitCategory] = useState<QACategory>("general");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [xpNotification, setXpNotification] = useState<{
    amount: number;
    message: string;
  } | null>(null);

  const categories = getQACategories();
  const stats = userId ? getUserQAStats(userId) : null;

  useEffect(() => {
    loadEntries();
  }, [selectedCategory]);

  function loadEntries() {
    const result = getQAEntries({
      category: selectedCategory || undefined,
      limit: 50,
    });
    setEntries(result.entries);
  }

  function handleSearch() {
    if (!searchQuery.trim()) {
      loadEntries();
      return;
    }
    const results = searchQA(searchQuery);
    setEntries(results);
  }

  function handleSelectEntry(entryId: string) {
    const entry = getQAEntry(entryId, userId);
    if (entry) {
      setSelectedEntry(entry);
    }
  }

  function handleMarkHelpful(entryId: string) {
    if (!userId) return;

    const result = markQAHelpful(entryId, userId);
    if (result.success) {
      showXpNotification(result.xpAwarded, "Thanks for your feedback!");
      // Refresh the entry
      const updated = getQAEntry(entryId, userId);
      if (updated) setSelectedEntry(updated);
    } else if (result.alreadyVoted) {
      showXpNotification(0, "You've already marked this as helpful");
    }
  }

  function handleSubmitQuestion() {
    if (!userId || !userEmail || !submitQuestion_.trim()) return;

    const result = submitQuestion(
      userId,
      userEmail,
      submitQuestion_,
      submitCategory,
      submitContext
    );

    if (result) {
      setSubmissionSuccess(true);
      showXpNotification(result.xpAwarded, "Question submitted!");
      setSubmitQuestion("");
      setSubmitContext("");

      setTimeout(() => {
        setShowSubmitForm(false);
        setSubmissionSuccess(false);
      }, 2000);
    }
  }

  function showXpNotification(amount: number, message: string) {
    setXpNotification({ amount, message });
    setTimeout(() => setXpNotification(null), 3000);
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* XP Notification */}
      <AnimatePresence>
        {xpNotification && xpNotification.amount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          >
            <span className="font-bold">+{xpNotification.amount} XP</span>
            <span className="ml-2 text-sm">{xpNotification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
        <p className="text-gray-600 mt-2">
          Expert answers to common questions about healthcare compliance and practice management
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search questions and answers..."
            className="flex-1 p-3 border rounded-lg"
          />
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
          {userId && (
            <button
              onClick={() => setShowSubmitForm(true)}
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
            >
              Ask a Question
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6">
        {/* Sidebar - Categories */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-lg border p-4">
            <h3 className="font-semibold mb-3">Categories</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setSelectedEntry(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    !selectedCategory
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  All Questions
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.category}>
                  <button
                    onClick={() => {
                      setSelectedCategory(cat.category);
                      setSelectedEntry(null);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm flex justify-between ${
                      selectedCategory === cat.category
                        ? "bg-blue-50 text-blue-700"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-gray-400">{cat.count}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Featured Q&A */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-4 mt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Featured Topics</h3>
            <ul className="space-y-2 text-sm">
              {entries
                .filter((e) => e.isFeatured)
                .slice(0, 3)
                .map((e) => (
                  <li key={e.id}>
                    <button
                      onClick={() => handleSelectEntry(e.id)}
                      className="text-blue-700 hover:underline text-left"
                    >
                      {e.question.length > 50
                        ? e.question.substring(0, 50) + "..."
                        : e.question}
                    </button>
                  </li>
                ))}
            </ul>
          </div>

          {/* User Stats */}
          {stats && (
            <div className="bg-white rounded-lg border p-4 mt-4">
              <h3 className="font-semibold mb-3">Your Engagement</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions viewed</span>
                  <span className="font-medium">{stats.totalViews}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions submitted</span>
                  <span className="font-medium">{stats.userSubmissions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Approved</span>
                  <span className="font-medium text-green-600">
                    {stats.approvedSubmissions}
                  </span>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">XP earned</span>
                    <span className="font-medium text-green-600">
                      {stats.xpEarnedFromQA}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Q&A List / Detail */}
        <div className="flex-1">
          {selectedEntry ? (
            /* Q&A Detail View */
            <div className="bg-white rounded-lg border">
              <div className="p-6 border-b">
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-blue-600 hover:underline text-sm mb-4"
                >
                  &larr; Back to questions
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedEntry.question}
                </h2>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  {selectedEntry.isFeatured && (
                    <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                      Featured
                    </span>
                  )}
                  <span>
                    {categories.find((c) => c.category === selectedEntry.category)?.label}
                  </span>
                  <span>{selectedEntry.viewCount} views</span>
                </div>
              </div>

              <div className="p-6">
                <div className="prose prose-blue max-w-none">
                  {selectedEntry.answer.split("\n\n").map((paragraph, i) => (
                    <p key={i} className="mb-4 whitespace-pre-wrap">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t">
                  {selectedEntry.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Related Products */}
                {selectedEntry.relatedProducts && selectedEntry.relatedProducts.length > 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">
                      Related Resources
                    </h4>
                    <p className="text-sm text-blue-700">
                      We have templates and documents that can help with this topic.
                    </p>
                    <a
                      href="/products"
                      className="inline-block mt-2 text-sm text-blue-600 hover:underline"
                    >
                      View our products &rarr;
                    </a>
                  </div>
                )}

                {/* Helpful */}
                <div className="mt-6 pt-6 border-t flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Was this answer helpful?
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleMarkHelpful(selectedEntry.id)}
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <span>👍</span>
                      <span>Yes ({selectedEntry.helpfulCount})</span>
                    </button>
                  </div>
                </div>

                {/* Answered by */}
                <div className="mt-6 text-sm text-gray-500">
                  <span>Answered by </span>
                  <span className="font-medium text-gray-700">
                    {selectedEntry.answeredBy}
                  </span>
                  {selectedEntry.publishedAt && (
                    <span>
                      {" "}
                      on {new Date(selectedEntry.publishedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Q&A List View */
            <div className="space-y-4">
              {entries.length === 0 ? (
                <div className="bg-white rounded-lg border p-8 text-center text-gray-500">
                  <p>No questions found. Try a different search or category.</p>
                </div>
              ) : (
                entries.map((entry) => (
                  <motion.div
                    key={entry.id}
                    whileHover={{ scale: 1.01 }}
                    className="bg-white rounded-lg border p-5 cursor-pointer hover:border-blue-300 transition-colors"
                    onClick={() => handleSelectEntry(entry.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {entry.isFeatured && (
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                              Featured
                            </span>
                          )}
                          <span className="text-xs text-gray-400">
                            {categories.find((c) => c.category === entry.category)?.label}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 hover:text-blue-600">
                          {entry.question}
                        </h3>
                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                          {entry.answer.substring(0, 150)}...
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-400 flex-shrink-0">
                        <div>{entry.viewCount} views</div>
                        <div>{entry.helpfulCount} helpful</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Submit Question Modal */}
      <AnimatePresence>
        {showSubmitForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSubmitForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {submissionSuccess ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <h2 className="text-xl font-semibold mb-2">Question Submitted!</h2>
                  <p className="text-gray-600">
                    Our team will review your question and may add it to our knowledge base.
                  </p>
                  <div className="mt-4 text-green-600 font-medium">+20 XP earned</div>
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold mb-4">Submit a Question</h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Can't find what you're looking for? Submit your question and our team
                    will review it. If approved, it will be added to our knowledge base.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Category</label>
                      <select
                        value={submitCategory}
                        onChange={(e) => setSubmitCategory(e.target.value as QACategory)}
                        className="w-full p-2 border rounded-lg"
                      >
                        {categories.map((cat) => (
                          <option key={cat.category} value={cat.category}>
                            {cat.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Your Question
                      </label>
                      <input
                        type="text"
                        value={submitQuestion_}
                        onChange={(e) => setSubmitQuestion(e.target.value)}
                        placeholder="What would you like to know?"
                        className="w-full p-2 border rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Additional Context (optional)
                      </label>
                      <textarea
                        value={submitContext}
                        onChange={(e) => setSubmitContext(e.target.value)}
                        placeholder="Any additional details that might help..."
                        className="w-full p-2 border rounded-lg resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="bg-green-50 p-3 rounded-lg text-sm">
                      <span className="font-medium text-green-700">Earn +20 XP</span>{" "}
                      for submitting a question. If approved:{" "}
                      <span className="font-medium text-green-700">+100 XP bonus!</span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={() => setShowSubmitForm(false)}
                      className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitQuestion}
                      disabled={!submitQuestion_.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Submit Question
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
