"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Discussion,
  DiscussionReply,
  DiscussionCategory,
  getDiscussions,
  getDiscussion,
  createDiscussion,
  postReply,
  markReplyHelpful,
  getCategories,
  getUserDiscussionStats,
} from "@/lib/community/client-discussions";

interface ClientDiscussionsProps {
  userId: string;
  userName: string;
  isStaff?: boolean;
}

export function ClientDiscussions({
  userId,
  userName,
  isStaff = false,
}: ClientDiscussionsProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState<{
    discussion: Discussion;
    replies: DiscussionReply[];
  } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DiscussionCategory | null>(null);
  const [showNewDiscussion, setShowNewDiscussion] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<DiscussionCategory>("general");
  const [replyContent, setReplyContent] = useState("");
  const [xpNotification, setXpNotification] = useState<{
    amount: number;
    message: string;
  } | null>(null);

  const categories = getCategories();
  const stats = getUserDiscussionStats(userId);

  useEffect(() => {
    loadDiscussions();
  }, [selectedCategory]);

  function loadDiscussions() {
    const result = getDiscussions({
      category: selectedCategory || undefined,
      limit: 50,
    });
    setDiscussions(result.discussions);
  }

  function handleCreateDiscussion() {
    if (!newTitle.trim() || !newContent.trim()) return;

    const { discussion, xpResult } = createDiscussion(
      userId,
      userName,
      newTitle,
      newContent,
      newCategory
    );

    setDiscussions((prev) => [discussion, ...prev]);
    setShowNewDiscussion(false);
    setNewTitle("");
    setNewContent("");
    setNewCategory("general");

    showXpNotification(xpResult.xpEarned, xpResult.message || "Discussion created!");
  }

  function handlePostReply() {
    if (!selectedDiscussion || !replyContent.trim()) return;

    const result = postReply(
      selectedDiscussion.discussion.id,
      userId,
      userName,
      replyContent,
      isStaff
    );

    if (result) {
      setSelectedDiscussion({
        ...selectedDiscussion,
        replies: [...selectedDiscussion.replies, result.reply],
      });
      setReplyContent("");
      showXpNotification(result.xpResult.xpEarned, result.xpResult.message || "Reply posted!");
    }
  }

  function handleMarkHelpful(replyId: string) {
    const result = markReplyHelpful(replyId, userId);
    if (result.success) {
      showXpNotification(result.xpAwarded, "Thanks for your feedback!");
      // Refresh the discussion
      if (selectedDiscussion) {
        const updated = getDiscussion(selectedDiscussion.discussion.id);
        if (updated) setSelectedDiscussion(updated);
      }
    }
  }

  function showXpNotification(amount: number, message: string) {
    setXpNotification({ amount, message });
    setTimeout(() => setXpNotification(null), 3000);
  }

  function openDiscussion(discussionId: string) {
    const result = getDiscussion(discussionId);
    if (result) {
      setSelectedDiscussion(result);
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* XP Notification */}
      <AnimatePresence>
        {xpNotification && (
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client Discussions</h1>
          <p className="text-gray-600">
            Connect with other practitioners and get answers from our team
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-500">
            <span className="font-medium text-green-600">{stats.xpEarnedFromDiscussions} XP</span>
            {" "}earned from discussions
          </div>
          <button
            onClick={() => setShowNewDiscussion(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Discussion
          </button>
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
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                    !selectedCategory
                      ? "bg-blue-50 text-blue-700"
                      : "hover:bg-gray-50"
                  }`}
                >
                  All Discussions
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.category}>
                  <button
                    onClick={() => setSelectedCategory(cat.category)}
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

          {/* User Stats */}
          <div className="bg-white rounded-lg border p-4 mt-4">
            <h3 className="font-semibold mb-3">Your Activity</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Discussions</span>
                <span className="font-medium">{stats.userDiscussions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Replies</span>
                <span className="font-medium">{stats.userReplies}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Helpful marks</span>
                <span className="font-medium">{stats.helpfulMarks}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Discussion List / Detail */}
        <div className="flex-1">
          {selectedDiscussion ? (
            /* Discussion Detail View */
            <div className="bg-white rounded-lg border">
              <div className="p-4 border-b">
                <button
                  onClick={() => setSelectedDiscussion(null)}
                  className="text-blue-600 hover:underline text-sm mb-2"
                >
                  &larr; Back to discussions
                </button>
                <h2 className="text-xl font-semibold">
                  {selectedDiscussion.discussion.title}
                </h2>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>By {selectedDiscussion.discussion.authorName}</span>
                  <span>
                    {new Date(selectedDiscussion.discussion.createdAt).toLocaleDateString()}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      selectedDiscussion.discussion.status === "answered"
                        ? "bg-green-100 text-green-700"
                        : selectedDiscussion.discussion.status === "open"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {selectedDiscussion.discussion.status}
                  </span>
                </div>
              </div>

              <div className="p-4 border-b bg-gray-50">
                <p className="whitespace-pre-wrap">
                  {selectedDiscussion.discussion.content}
                </p>
              </div>

              {/* Replies */}
              <div className="divide-y">
                {selectedDiscussion.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-4 ${reply.isStaffReply ? "bg-blue-50" : ""}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium">{reply.authorName}</span>
                      {reply.isStaffReply && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                          Staff
                        </span>
                      )}
                      {reply.isHelpful && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">
                          Helpful
                        </span>
                      )}
                      <span className="text-gray-400 text-sm">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-gray-700">
                      {reply.content}
                    </p>
                    <div className="mt-2">
                      <button
                        onClick={() => handleMarkHelpful(reply.id)}
                        className="text-sm text-gray-500 hover:text-green-600"
                      >
                        Mark as helpful ({reply.helpfulCount})
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              {!selectedDiscussion.discussion.isLocked && (
                <div className="p-4 border-t">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="w-full p-3 border rounded-lg resize-none"
                    rows={4}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      Earn <span className="font-medium text-green-600">+15 XP</span> for posting
                    </span>
                    <button
                      onClick={handlePostReply}
                      disabled={!replyContent.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Post Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Discussion List View */
            <div className="bg-white rounded-lg border divide-y">
              {discussions.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>No discussions yet. Be the first to start one!</p>
                </div>
              ) : (
                discussions.map((discussion) => (
                  <motion.div
                    key={discussion.id}
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                    className="p-4 cursor-pointer"
                    onClick={() => openDiscussion(discussion.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {discussion.isPinned && (
                            <span className="text-yellow-500">📌</span>
                          )}
                          <h3 className="font-medium hover:text-blue-600">
                            {discussion.title}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded text-xs ${
                              discussion.status === "answered"
                                ? "bg-green-100 text-green-700"
                                : discussion.status === "open"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {discussion.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          By {discussion.authorName} &bull;{" "}
                          {new Date(discussion.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        <div>{discussion.replyCount} replies</div>
                        <div>{discussion.viewCount} views</div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Discussion Modal */}
      <AnimatePresence>
        {showNewDiscussion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowNewDiscussion(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg w-full max-w-lg p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-semibold mb-4">Start a Discussion</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DiscussionCategory)}
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
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What's your question or topic?"
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Details</label>
                  <textarea
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    placeholder="Provide more context..."
                    className="w-full p-2 border rounded-lg resize-none"
                    rows={5}
                  />
                </div>

                <div className="bg-green-50 p-3 rounded-lg text-sm">
                  <span className="font-medium text-green-700">
                    Earn +25 XP
                  </span>{" "}
                  for starting a discussion (first discussion: +100 XP bonus!)
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowNewDiscussion(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateDiscussion}
                  disabled={!newTitle.trim() || !newContent.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Post Discussion
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
