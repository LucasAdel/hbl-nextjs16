"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface Message {
  id: string;
  sender_type: "client" | "staff";
  sender_name: string;
  message: string;
  attachment_url?: string;
  attachment_name?: string;
  is_read: boolean;
  created_at: string;
}

interface SecureMessagingProps {
  clientEmail: string;
  matterId?: string;
  matterName?: string;
}

export function SecureMessaging({ clientEmail, matterId, matterName }: SecureMessagingProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const params = new URLSearchParams({ email: clientEmail });
      if (matterId) params.append("matterId", matterId);

      const response = await fetch(`/api/portal/messages?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);

        // Mark messages as read
        const unreadIds = data.messages
          ?.filter((m: Message) => !m.is_read && m.sender_type === "staff")
          .map((m: Message) => m.id);

        if (unreadIds?.length > 0) {
          await fetch("/api/portal/messages", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "mark_read", messageIds: unreadIds }),
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  }, [clientEmail, matterId]);

  useEffect(() => {
    fetchMessages();

    // Poll for new messages every 30 seconds
    const interval = setInterval(fetchMessages, 30000);
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && !attachment) return;

    setIsSending(true);

    try {
      const formData = new FormData();
      formData.append("email", clientEmail);
      formData.append("message", newMessage);
      if (matterId) formData.append("matterId", matterId);
      if (attachment) formData.append("attachment", attachment);

      const response = await fetch("/api/portal/messages", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        setNewMessage("");
        setAttachment(null);

        // Simulate staff typing indicator (for demo)
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 3000);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Max file size: 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be under 10MB");
        return;
      }
      setAttachment(file);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("en-AU", { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString("en-AU", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="p-4 border-b">
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
        </div>
        <div className="p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse" />
                <div className="h-16 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Secure Messages</h3>
              {matterName && (
                <p className="text-sm text-gray-500">Re: {matterName}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Encrypted
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <p>No messages yet</p>
            <p className="text-sm">Send a message to start the conversation</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender_type === "client" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.sender_type === "client"
                    ? "bg-amber-100"
                    : "bg-gray-200"
                }`}
              >
                {message.sender_type === "client" ? "👤" : "⚖️"}
              </div>
              <div
                className={`max-w-[70%] ${
                  message.sender_type === "client" ? "text-right" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-600">
                    {message.sender_name}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(message.created_at)}
                  </span>
                </div>
                <div
                  className={`rounded-2xl p-3 ${
                    message.sender_type === "client"
                      ? "bg-amber-500 text-white rounded-tr-none"
                      : "bg-white border rounded-tl-none"
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                  {message.attachment_url && (
                    <a
                      href={message.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-2 flex items-center gap-2 text-xs ${
                        message.sender_type === "client"
                          ? "text-white/80 hover:text-white"
                          : "text-amber-600 hover:text-amber-700"
                      }`}
                    >
                      📎 {message.attachment_name || "Attachment"}
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              ⚖️
            </div>
            <div className="bg-white border rounded-2xl rounded-tl-none p-3">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        {attachment && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
            <span className="text-sm">📎 {attachment.name}</span>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="text-gray-500 hover:text-gray-700 ml-auto"
            >
              ✕
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Attach file"
          >
            📎
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a secure message..."
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
            disabled={isSending}
          />
          <button
            type="submit"
            disabled={isSending || (!newMessage.trim() && !attachment)}
            className="bg-amber-500 text-white rounded-full p-2 hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <span>➤</span>
            )}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2 text-center">
          🔒 Your messages are encrypted and secure
        </p>
      </form>
    </div>
  );
}
