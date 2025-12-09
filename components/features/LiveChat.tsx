"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  X,
  Send,
  Minimize2,
  Paperclip,
  Phone,
  Mail,
  Clock,
  User,
  Bot,
  ChevronDown,
} from "lucide-react";

interface Message {
  id: string;
  type: "user" | "bot" | "system";
  content: string;
  timestamp: Date;
}

interface LiveChatProps {
  businessName?: string;
  welcomeMessage?: string;
  agentName?: string;
  agentRole?: string;
  onlineHours?: string;
  phone?: string;
  email?: string;
  className?: string;
}

const CHAT_STORAGE_KEY = "hbl-chat-messages";

// Quick reply suggestions
const quickReplies = [
  "I need help with a legal matter",
  "Book a consultation",
  "Pricing information",
  "Office hours",
];

// Bot responses based on keywords
const botResponses: Record<string, string> = {
  default:
    "Thank you for your message. Our team will respond shortly. For urgent matters, please call us directly at (08) 8212 8585.",
  legal:
    "We handle various legal matters for medical practitioners including practice compliance, contracts, and regulatory issues. Would you like to book a consultation?",
  consultation:
    "You can book a consultation through our website. Visit /book-appointment to schedule a time that works for you, or call us at (08) 8212 8585.",
  price:
    "Our fees vary based on the complexity of the matter. We offer fixed-fee arrangements for many services. Would you like to discuss your specific needs?",
  hours:
    "Our office hours are Monday to Friday, 9:00 AM to 5:00 PM ACST. For after-hours inquiries, please leave a message and we'll respond the next business day.",
  hello:
    "Hello! Welcome to Hamilton Bailey Law. How can I assist you today?",
  hi: "Hi there! Welcome to Hamilton Bailey Law. How can I help you today?",
  thanks:
    "You're welcome! Is there anything else I can help you with?",
  bye: "Thank you for contacting us. Have a great day!",
};

function getBotResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes("legal") || lowerMessage.includes("matter") || lowerMessage.includes("help")) {
    return botResponses.legal;
  }
  if (lowerMessage.includes("book") || lowerMessage.includes("consult") || lowerMessage.includes("appointment")) {
    return botResponses.consultation;
  }
  if (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("fee")) {
    return botResponses.price;
  }
  if (lowerMessage.includes("hour") || lowerMessage.includes("open") || lowerMessage.includes("time")) {
    return botResponses.hours;
  }
  if (lowerMessage.includes("hello") || lowerMessage.includes("hey")) {
    return botResponses.hello;
  }
  if (lowerMessage.includes("hi") || lowerMessage.includes("good morning") || lowerMessage.includes("good afternoon")) {
    return botResponses.hi;
  }
  if (lowerMessage.includes("thank") || lowerMessage.includes("thanks")) {
    return botResponses.thanks;
  }
  if (lowerMessage.includes("bye") || lowerMessage.includes("goodbye")) {
    return botResponses.bye;
  }

  return botResponses.default;
}

export function LiveChat({
  businessName = "Hamilton Bailey Law",
  welcomeMessage = "Hello! How can we help you today?",
  agentName = "Legal Support",
  agentRole = "Support Team",
  onlineHours = "Mon-Fri 9AM-5PM ACST",
  phone = "(08) 8212 8585",
  email = "enquiries@hamiltonbailey.com",
  className = "",
}: LiveChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(CHAT_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      setMessages(parsed.map((m: Message) => ({ ...m, timestamp: new Date(m.timestamp) })));
    }
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMsg: Message = {
        id: "welcome",
        type: "bot",
        content: welcomeMessage,
        timestamp: new Date(),
      };
      setMessages([welcomeMsg]);
    }
  }, [isOpen, messages.length, welcomeMessage]);

  // Clear unread when opening
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
    }
  }, [isOpen]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate bot response with typing delay
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot",
        content: getBotResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
      setIsTyping(false);

      if (!isOpen || isMinimized) {
        setUnreadCount((prev) => prev + 1);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply: string) => {
    setInputValue(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem(CHAT_STORAGE_KEY);
    const welcomeMsg: Message = {
      id: "welcome",
      type: "bot",
      content: welcomeMessage,
      timestamp: new Date(),
    };
    setMessages([welcomeMsg]);
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Chat Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`mb-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden ${
              isMinimized ? "w-80" : "w-96"
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-tiffany to-tiffany-dark p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{agentName}</h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-xs text-white/80">{agentRole}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {isMinimized ? (
                      <ChevronDown className="h-4 w-4 text-white" />
                    ) : (
                      <Minimize2 className="h-4 w-4 text-white" />
                    )}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Body */}
            <AnimatePresence>
              {!isMinimized && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Messages */}
                  <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            message.type === "user"
                              ? "bg-tiffany text-white rounded-br-md"
                              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-bl-md"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.type === "user" ? "text-white/70" : "text-gray-400"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.1s" }}
                            />
                            <span
                              className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                              style={{ animationDelay: "0.2s" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Replies */}
                  {messages.length <= 1 && (
                    <div className="px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-500 mb-2">Quick replies:</p>
                      <div className="flex flex-wrap gap-2">
                        {quickReplies.map((reply) => (
                          <button
                            key={reply}
                            onClick={() => handleQuickReply(reply)}
                            className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-tiffany/10 hover:text-tiffany transition-colors"
                          >
                            {reply}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Input */}
                  <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-2">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-tiffany dark:text-white"
                      />
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim()}
                        className="p-2.5 bg-tiffany text-white rounded-full hover:bg-tiffany-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-4">
                        <a
                          href={`tel:${phone}`}
                          className="flex items-center gap-1 hover:text-tiffany transition-colors"
                        >
                          <Phone className="h-3 w-3" />
                          Call us
                        </a>
                        <a
                          href={`mailto:${email}`}
                          className="flex items-center gap-1 hover:text-tiffany transition-colors"
                        >
                          <Mail className="h-3 w-3" />
                          Email
                        </a>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {onlineHours}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-14 h-14 bg-gradient-to-r from-tiffany to-tiffany-dark text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="h-6 w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="h-6 w-6" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Unread Badge */}
        {unreadCount > 0 && !isOpen && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>
    </div>
  );
}

// Crisp integration component (for production use)
export function CrispChat({ websiteId }: { websiteId: string }) {
  useEffect(() => {
    // Load Crisp chat script
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = websiteId;

    const script = document.createElement("script");
    script.src = "https://client.crisp.chat/l.js";
    script.async = true;
    document.head.appendChild(script);

    return () => {
      // Cleanup
      const existingScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [websiteId]);

  return null;
}

// Tawk.to integration component (for production use)
export function TawkToChat({ propertyId, widgetId }: { propertyId: string; widgetId: string }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.setAttribute("crossorigin", "*");
    document.body.appendChild(script);

    return () => {
      script.remove();
    };
  }, [propertyId, widgetId]);

  return null;
}

// Declare global types for external chat services
declare global {
  interface Window {
    $crisp: unknown[];
    CRISP_WEBSITE_ID: string;
    Tawk_API?: unknown;
    Tawk_LoadStart?: Date;
  }
}
