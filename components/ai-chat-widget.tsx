"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  ChevronDown,
  Sparkles,
  ExternalLink,
  History,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Phone,
  Mail,
  Bot,
  User,
  Scale,
  BookOpen,
  Minimize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  chatPersistenceService,
  type ChatMessage as PersistentMessage,
  type ChatConversation,
} from "@/lib/chat/chat-persistence-service";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: Date;
  confidence?: number;
  knowledgeUsed?: string[];
  actions?: ActionButton[];
  disclaimer?: boolean;
}

interface ActionButton {
  label: string;
  action: string;
  url?: string;
}

interface SuggestedAction {
  type: "book_consultation" | "view_document" | "contact" | "learn_more";
  label: string;
  url?: string;
}

interface RelatedDocument {
  id: string;
  name: string;
  price: number;
  relevance: string;
}

interface ChatResponse {
  message: string;
  suggestedActions?: SuggestedAction[];
  relatedDocuments?: RelatedDocument[];
  confidence?: number;
  knowledgeUsed?: string[];
}

const quickQuestions = [
  "What is a Tenant Doctor Agreement?",
  "Do I need AHPRA registration?",
  "How much does a consultation cost?",
  "What documents do I need for a new practice?",
];

// Floating Chat Button with welcome bubble
const ChatButton: React.FC<{ onClick: () => void; hasNewMessage: boolean }> = ({
  onClick,
  hasNewMessage,
}) => {
  const [showBubble, setShowBubble] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowBubble(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <motion.div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {showBubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="absolute -top-20 right-0 w-64 rounded-lg bg-white p-3 shadow-lg"
          >
            <p className="text-sm font-medium text-gray-700">
              Need help with medical practice law?
            </p>
            <p className="mt-1 text-xs text-gray-500">
              I&apos;m here to answer your questions
            </p>
            <div className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 bg-white" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-teal-primary to-teal-hover text-white shadow-lg transition-all"
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
        {hasNewMessage && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500"
          >
            <Sparkles className="h-3 w-3" />
          </motion.span>
        )}
      </motion.button>
    </motion.div>
  );
};

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [relatedDocuments, setRelatedDocuments] = useState<RelatedDocument[]>([]);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [previousConversations, setPreviousConversations] = useState<ChatConversation[]>([]);
  const [leadScore, setLeadScore] = useState(0);
  const [leadCategory, setLeadCategory] = useState<"hot" | "warm" | "cold">("cold");
  const [showBookingPrompt, setShowBookingPrompt] = useState(false);
  const [proactiveMessageSent, setProactiveMessageSent] = useState(false);
  const [personalizedGreeting, setPersonalizedGreeting] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Initialize chat with personalized greeting
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const context = chatPersistenceService.getContext();
      if (context.personalizedGreeting) {
        setPersonalizedGreeting(context.personalizedGreeting);
      }
      loadPreviousConversations();
    }
  }, [isOpen, messages.length]);

  // Proactive message after 15 seconds
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (messages.length === 0 && !proactiveMessageSent) {
        const proactiveMsg: ChatMessage = {
          role: "assistant",
          content:
            "I noticed you're exploring our website. Many of our clients find it helpful to have a quick chat about their specific legal needs.\n\nWould you like me to help you find the right information or perhaps arrange a consultation with one of our expert solicitors?",
          timestamp: new Date(),
          actions: [
            { label: "Schedule a Call", action: "book_consultation", url: "/book" },
            { label: "View Services", action: "services", url: "/services" },
            { label: "Ask a Question", action: "ask_question" },
          ],
        };
        setMessages([proactiveMsg]);
        setProactiveMessageSent(true);
      }
    }, 15000);

    return () => clearTimeout(timer);
  }, [isOpen, messages.length, proactiveMessageSent]);

  // Update lead score from persistence service
  useEffect(() => {
    const conversation = chatPersistenceService.getCurrentConversation();
    if (conversation) {
      setLeadScore(conversation.leadScore);
      setLeadCategory(conversation.leadCategory);
    }
  }, [messages]);

  const loadPreviousConversations = async () => {
    try {
      const userData = chatPersistenceService.getComprehensiveUserData();
      if (userData.context.userProfile?.email) {
        // Would load from database if user is logged in
        // For now, use local history
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    }
  };

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen && messages.length > 0 && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized, scrollToBottom]);

  const handleScroll = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      setShowScrollDown(scrollHeight - scrollTop - clientHeight > 100);
    }
  }, []);

  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setIsStreaming(false);
    setStreamingContent("");
    setSuggestedActions([]);
    setRelatedDocuments([]);

    // Detect intent and save to persistence
    const intent = chatPersistenceService.detectIntent(messageText);
    await chatPersistenceService.saveMessage("user", messageText, { intent });

    // Check for objections first
    const objection = chatPersistenceService.detectObjection(messageText);
    if (objection) {
      const objectionResponse: ChatMessage = {
        role: "assistant",
        content: objection.response,
        timestamp: new Date(),
        actions: [
          { label: "Book Consultation", action: "book_consultation", url: "/book" },
          { label: "Learn More", action: "services", url: "/services" },
        ],
      };
      setMessages([...newMessages, objectionResponse]);
      setIsLoading(false);

      await chatPersistenceService.saveMessage("assistant", objection.response, {
        objectionHandled: objection.type,
      });
      return;
    }

    try {
      const startTime = Date.now();

      // Get user preferences and conversation history for context
      const userPreferences = chatPersistenceService.getUserPreferences();
      const conversationHistory = chatPersistenceService
        .getComprehensiveUserData()
        .conversationHistory.slice(-10);
      const currentConversation = chatPersistenceService.getCurrentConversation();

      // Use streaming API
      const response = await fetch("/api/chat/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText,
          sessionId: currentConversation?.id,
          conversationHistory: conversationHistory,
          userPreferences: userPreferences,
          leadScore: currentConversation?.leadScore || 0,
        }),
      });

      if (!response.ok) {
        // Fall back to non-streaming API
        const fallbackResponse = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: messageText,
            sessionId: currentConversation?.id,
          }),
        });

        if (!fallbackResponse.ok) {
          throw new Error("Failed to get response");
        }

        const data = await fallbackResponse.json();
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.response,
          timestamp: new Date(),
          confidence: data.confidence,
          knowledgeUsed: data.knowledgeUsed,
          disclaimer: data.showDisclaimer,
          actions: data.actions,
        };
        setMessages([...newMessages, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Check if response is streaming or JSON
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        // Non-streaming response (e.g., objection handled)
        const data = await response.json();
        const assistantMessage: ChatMessage = {
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
          confidence: data.confidence,
          actions: data.actions,
        };
        setMessages([...newMessages, assistantMessage]);
        setIsLoading(false);
        return;
      }

      // Handle streaming response
      setIsStreaming(true);
      setIsLoading(false);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";
      let metadata: {
        intent?: string;
        confidence?: number;
        knowledgeUsed?: string[];
        xpAwarded?: number;
        totalXpEarned?: number;
        actions?: ActionButton[];
        showDisclaimer?: boolean;
        relatedProducts?: string[];
      } = {};

      if (!reader) {
        throw new Error("No reader available");
      }

      // Add placeholder message for streaming
      const streamingMessage: ChatMessage = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setMessages([...newMessages, streamingMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);

              switch (parsed.type) {
                case "start":
                  metadata = {
                    intent: parsed.intent,
                    confidence: parsed.confidence,
                    knowledgeUsed: parsed.knowledgeUsed,
                  };
                  break;

                case "delta":
                  fullContent += parsed.content;
                  setStreamingContent(fullContent);
                  // Update message in place
                  setMessages((prev) => {
                    const updated = [...prev];
                    const lastIndex = updated.length - 1;
                    if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
                      updated[lastIndex] = {
                        ...updated[lastIndex],
                        content: fullContent,
                      };
                    }
                    return updated;
                  });
                  break;

                case "complete":
                  metadata = {
                    ...metadata,
                    xpAwarded: parsed.xpAwarded,
                    totalXpEarned: parsed.totalXpEarned,
                    actions: parsed.actions,
                    showDisclaimer: parsed.showDisclaimer,
                    relatedProducts: parsed.relatedProducts,
                  };
                  break;

                case "error":
                  throw new Error(parsed.message);
              }
            } catch (parseError) {
              // Ignore parse errors for malformed chunks
            }
          }
        }
      }

      // Finalize the message with metadata
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0 && updated[lastIndex].role === "assistant") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            content: fullContent,
            confidence: metadata.confidence,
            knowledgeUsed: metadata.knowledgeUsed,
            disclaimer: metadata.showDisclaimer,
            actions: metadata.actions,
          };
        }
        return updated;
      });

      const responseTime = Date.now() - startTime;

      // Save to persistence
      await chatPersistenceService.saveMessage("assistant", fullContent, {
        confidence: metadata.confidence,
        knowledgeUsed: metadata.knowledgeUsed,
      });

      // Log analytics
      await chatPersistenceService.logAnalytics({
        userMessage: messageText,
        baileyResponse: fullContent,
        knowledgeItemsUsed: metadata.knowledgeUsed,
        confidenceScore: metadata.confidence,
        responseTimeMs: responseTime,
        intentCategory: metadata.intent || intent,
      });

      // Check if we should show booking prompt
      const conversation = chatPersistenceService.getCurrentConversation();
      if (conversation && conversation.leadScore >= 70) {
        setShowBookingPrompt(true);
      }

      setIsStreaming(false);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "I apologize, but I'm having trouble responding right now. Please try again or contact us directly at (08) 8121 5167.",
        timestamp: new Date(),
      };
      setMessages([...newMessages, errorMessage]);
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
      setStreamingContent("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleAction = (action: string, url?: string) => {
    switch (action) {
      case "book_consultation":
        window.location.href = url || "/book";
        break;
      case "services":
        window.location.href = url || "/services";
        break;
      case "contact":
        window.location.href = url || "/contact";
        break;
      case "ask_question":
        // Focus input
        const inputEl = document.querySelector('input[placeholder*="question"]') as HTMLInputElement;
        inputEl?.focus();
        break;
      case "call":
        window.location.href = "tel:0882128585";
        break;
      case "email":
        window.location.href = "mailto:info@hblegal.com.au";
        break;
      default:
        if (url) window.location.href = url;
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(amount);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  if (!isOpen) {
    return <ChatButton onClick={() => setIsOpen(true)} hasNewMessage={!proactiveMessageSent} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden rounded-2xl bg-white shadow-2xl",
        "max-sm:bottom-0 max-sm:right-0 max-sm:h-full max-sm:w-full max-sm:rounded-none",
        isMinimized ? "h-16 w-80" : "h-[650px] w-[420px]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-teal-primary to-teal-hover px-4 py-3 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-semibold">Legal AI Assistant</h3>
            <div className="flex items-center gap-2 text-xs text-white/80">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-green-400" />
              <span>Online • Hamilton Bailey Legal</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {previousConversations.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="rounded-lg p-2 transition-colors hover:bg-white/20"
              title="Conversation history"
            >
              <History className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded-lg p-2 transition-colors hover:bg-white/20"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-lg p-2 transition-colors hover:bg-white/20"
            aria-label="Close chat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Conversation History Dropdown */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-b border-gray-200 bg-gray-50 overflow-hidden"
              >
                <div className="p-4 max-h-48 overflow-y-auto">
                  <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                    <History className="h-4 w-4" />
                    Previous Conversations
                  </h4>
                  {previousConversations.length === 0 ? (
                    <p className="text-xs text-gray-500">No previous conversations found.</p>
                  ) : (
                    <div className="space-y-2">
                      {previousConversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => {
                            chatPersistenceService.resumeConversation(conv.id);
                            setShowHistory(false);
                          }}
                          className="w-full rounded-lg border border-gray-200 bg-white p-3 text-left transition-colors hover:border-teal-primary"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">
                              {new Date(conv.startedAt).toLocaleDateString()}
                            </span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-xs",
                                conv.status === "completed"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              )}
                            >
                              {conv.status}
                            </span>
                          </div>
                          {conv.summary && (
                            <p className="mt-1 text-xs text-gray-500">{conv.summary}</p>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Messages Container */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4"
          >
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="space-y-4">
                <div className="rounded-xl bg-teal-50 p-4">
                  <p className="text-sm text-teal-700">
                    {personalizedGreeting ||
                      "Hello! I'm your AI legal assistant. I can help you with questions about medical practice law, document recommendations, and compliance requirements."}
                  </p>
                  <p className="mt-2 text-xs text-gray-500">
                    Note: I provide general information, not legal advice. For specific matters,
                    please consult with our lawyers.
                  </p>
                </div>

                {/* Quick Questions */}
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Quick Questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {quickQuestions.map((question) => (
                      <button
                        key={question}
                        onClick={() => sendMessage(question)}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm text-gray-700 transition-colors hover:border-teal-primary hover:text-teal-primary"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index}>
                  <div
                    className={cn("flex gap-3", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.role === "assistant" && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                        <Bot className="h-4 w-4 text-teal-600" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        message.role === "user"
                          ? "bg-gradient-to-r from-teal-primary to-teal-hover text-white"
                          : "bg-gray-100 text-gray-800"
                      )}
                    >
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>

                      {/* Confidence indicator */}
                      {message.role === "assistant" && message.confidence && (
                        <div className="mt-2 flex items-center gap-2 text-xs opacity-70">
                          <BookOpen className="h-3 w-3" />
                          <span>Confidence: {Math.round(message.confidence * 100)}%</span>
                        </div>
                      )}

                      {/* Timestamp */}
                      {message.timestamp && (
                        <p className="mt-1 text-xs opacity-60">{formatTime(message.timestamp)}</p>
                      )}
                    </div>
                    {message.role === "user" && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                        <User className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Legal Disclaimer */}
                  {message.role === "assistant" && message.disclaimer && (
                    <div className="ml-11 mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
                        <p className="text-xs text-amber-800">
                          This is general information only. For advice specific to your situation,
                          please consult with our qualified solicitors.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="ml-11 mt-2 flex flex-wrap gap-2">
                      {message.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAction(action.action, action.url)}
                          className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-1.5 text-xs font-medium text-teal-700 transition-colors hover:bg-teal-100"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Loading Indicator */}
              {isLoading && !isStreaming && (
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-teal-100">
                    <Bot className="h-4 w-4 text-teal-600" />
                  </div>
                  <div className="rounded-2xl bg-gray-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="flex gap-1">
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                          style={{ animationDelay: "300ms" }}
                        />
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Streaming Indicator */}
              {isStreaming && (
                <div className="flex items-center gap-2 text-xs text-teal-600 ml-11 mt-1">
                  <Sparkles className="h-3 w-3 animate-pulse" />
                  <span>Bailey is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Actions */}
            {suggestedActions.length > 0 && !isLoading && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Suggested Actions
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedActions.map((action, index) => (
                    <a
                      key={index}
                      href={action.url || "#"}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-sm font-medium text-teal-600 transition-colors hover:bg-teal-100"
                    >
                      {action.label}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Related Documents */}
            {relatedDocuments.length > 0 && !isLoading && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Related Documents
                </p>
                <div className="space-y-2">
                  {relatedDocuments.map((doc) => (
                    <a
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      className="block rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:border-teal-primary"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900">{doc.name}</span>
                        <span className="text-sm font-semibold text-teal-primary">
                          {formatCurrency(doc.price)}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-gray-500">{doc.relevance}</p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking Prompt */}
          <AnimatePresence>
            {showBookingPrompt && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-teal-200 bg-teal-50 p-4"
              >
                <p className="mb-3 text-sm font-medium text-gray-700">
                  Based on our conversation, I think you&apos;d benefit from speaking with one of our
                  expert solicitors.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAction("book_consultation")}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-teal-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-teal-hover"
                  >
                    <Calendar className="h-4 w-4" />
                    Book Consultation
                  </button>
                  <button
                    onClick={() => setShowBookingPrompt(false)}
                    className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
                  >
                    Maybe Later
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Lead Score Display (only for engaged users) */}
          {leadScore >= 50 && (
            <div className="border-t border-gray-100 bg-gradient-to-r from-teal-50 to-white px-4 py-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">Your engagement level:</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 overflow-hidden rounded-full bg-gray-200">
                    <div
                      className="h-full bg-gradient-to-r from-teal-primary to-teal-hover transition-all duration-500"
                      style={{ width: `${leadScore}%` }}
                    />
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      leadCategory === "hot"
                        ? "bg-red-100 text-red-700"
                        : leadCategory === "warm"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                    )}
                  >
                    {leadCategory}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Scroll Down Button */}
          {showScrollDown && (
            <button
              onClick={scrollToBottom}
              className="absolute bottom-32 left-1/2 -translate-x-1/2 rounded-full bg-white p-2 shadow-lg transition-transform hover:scale-105"
            >
              <ChevronDown className="h-4 w-4 text-gray-600" />
            </button>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about legal services, documents..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-primary focus:outline-none focus:ring-1 focus:ring-teal-primary disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-teal-primary to-teal-hover text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </button>
            </div>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-gray-400">
              <Scale className="h-3 w-3" />
              <span>AI Assistant • General information only</span>
            </div>
          </form>
        </>
      )}
    </motion.div>
  );
}

export default AIChatWidget;
