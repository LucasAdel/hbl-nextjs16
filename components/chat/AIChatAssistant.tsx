"use client";

import { useState, useRef, useEffect } from "react";
import {
  KNOWLEDGE_BASE,
  findRelevantKnowledge,
  detectIntent,
  handleObjection,
  CHAT_XP_REWARDS,
  KnowledgeItem,
} from "@/lib/chat/chat-knowledge-base";

interface Message {
  id: number;
  text: string;
  sender: "user" | "assistant";
  timestamp: Date;
  actions?: ActionButton[];
  showDisclaimer?: boolean;
  confidence?: number;
  xpAwarded?: number;
}

interface ActionButton {
  label: string;
  action: string;
  productId?: string;
}

interface AIChatAssistantProps {
  userId?: string;
  onAddToCart?: (productId: string) => void;
  onBookConsultation?: () => void;
  onXPEarned?: (amount: number, reason: string) => void;
}

const INITIAL_MESSAGE: Message = {
  id: 1,
  text: `Good day! I'm your AI legal assistant from Hamilton Bailey Law.\n\nI can help you with information about:\n\n• AHPRA compliance & advertising\n• Telehealth documentation\n• Employment contracts\n• Patient consent forms\n• Privacy policies\n• Practice setup\n\n**Please note:** I provide general information only, not specific legal advice. For personalised guidance, I'd be happy to arrange a consultation.\n\nHow can I assist you today?`,
  sender: "assistant",
  timestamp: new Date(),
  actions: [
    { label: "AHPRA Compliance", action: "topic", productId: "ahpra-compliance-bundle" },
    { label: "Telehealth Setup", action: "topic", productId: "telehealth-complete" },
    { label: "View Pricing", action: "pricing" },
    { label: "Contact Us", action: "contact" },
  ],
};

export function AIChatAssistant({
  userId,
  onAddToCart,
  onBookConsultation,
  onXPEarned,
}: AIChatAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [hasNewMessage, setHasNewMessage] = useState(true);
  const [proactiveShown, setProactiveShown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hide welcome bubble after 5 seconds
    const timer = setTimeout(() => setHasNewMessage(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Proactive message after 20 seconds if chat not started
    const proactiveTimer = setTimeout(() => {
      if (!proactiveShown && messages.length === 1 && isOpen) {
        sendProactiveMessage();
      }
    }, 20000);
    return () => clearTimeout(proactiveTimer);
  }, [isOpen, messages.length, proactiveShown]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const awardXP = (amount: number, reason: string) => {
    setTotalXPEarned(prev => prev + amount);
    if (onXPEarned) {
      onXPEarned(amount, reason);
    }
  };

  const sendProactiveMessage = () => {
    const proactive: Message = {
      id: Date.now(),
      text: "I notice you're exploring our chat. Many practitioners find it helpful to ask about specific compliance requirements or document needs.\n\nIs there a particular area I can help you with today?",
      sender: "assistant",
      timestamp: new Date(),
      actions: [
        { label: "New Practice Setup", action: "topic" },
        { label: "Compliance Check", action: "topic" },
        { label: "View Bundles", action: "bundles" },
      ],
    };
    setMessages(prev => [...prev, proactive]);
    setProactiveShown(true);
  };

  const processMessage = async (userMessage: string): Promise<Message> => {
    // Check for objections first
    const objection = handleObjection(userMessage);
    if (objection.handled) {
      return {
        id: Date.now() + 1,
        text: objection.response,
        sender: "assistant",
        timestamp: new Date(),
        actions: [
          { label: "View Bundles", action: "bundles" },
          { label: "Book Consultation", action: "book" },
        ],
        confidence: 0.9,
      };
    }

    // Find relevant knowledge
    const relevant = findRelevantKnowledge(userMessage);
    const intent = detectIntent(userMessage);

    if (relevant.length === 0) {
      return {
        id: Date.now() + 1,
        text: "Thank you for your question. While I don't have specific information on that topic in my knowledge base, our team would be happy to help.\n\nYou can:\n• Call us: (08) 8121 5167\n• Email: admin@hamiltonbailey.com.au\n• Book a consultation online\n\nIs there another topic I can help you with?",
        sender: "assistant",
        timestamp: new Date(),
        actions: [
          { label: "Book Consultation", action: "book" },
          { label: "View All Products", action: "products" },
        ],
        showDisclaimer: true,
        confidence: 0.3,
      };
    }

    const primary = relevant[0];
    const xpEarned = Math.round(primary.xpReward * (primary.confidenceLevel / 10));

    // Build actions based on related products
    const actions: ActionButton[] = [];
    if (primary.relatedProducts && primary.relatedProducts.length > 0) {
      actions.push({
        label: "View Product",
        action: "product",
        productId: primary.relatedProducts[0],
      });
      if (onAddToCart) {
        actions.push({
          label: "Add to Cart",
          action: "add_to_cart",
          productId: primary.relatedProducts[0],
        });
      }
    }
    actions.push({ label: "Learn More", action: "learn_more" });

    // Award XP for asking good questions
    awardXP(CHAT_XP_REWARDS.askQuestion, "asking a question");

    return {
      id: Date.now() + 1,
      text: primary.responseTemplate || primary.summary,
      sender: "assistant",
      timestamp: new Date(),
      actions,
      showDisclaimer: primary.requiresDisclaimer,
      confidence: primary.confidenceLevel / 10,
      xpAwarded: xpEarned,
    };
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const newUserMsg: Message = {
      id: Date.now(),
      text: userMessage,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(async () => {
      const response = await processMessage(userMessage);
      setMessages(prev => [...prev, response]);
      setIsTyping(false);
    }, 800 + Math.random() * 800);
  };

  const handleAction = (action: string, productId?: string) => {
    switch (action) {
      case "book":
        if (onBookConsultation) {
          onBookConsultation();
          awardXP(CHAT_XP_REWARDS.bookConsultation, "booking consultation");
        } else {
          window.location.href = "/contact";
        }
        break;
      case "contact":
        window.location.href = "/contact";
        break;
      case "pricing":
      case "products":
        window.location.href = "/documents";
        break;
      case "bundles":
        window.location.href = "/bundles";
        break;
      case "product":
        if (productId) {
          awardXP(CHAT_XP_REWARDS.viewProduct, "viewing product");
          window.location.href = `/documents/${productId}`;
        }
        break;
      case "add_to_cart":
        if (productId && onAddToCart) {
          onAddToCart(productId);
        }
        break;
      case "topic":
        // Add a follow-up message about the topic
        const topicResponses: Record<string, string> = {
          "ahpra-compliance-bundle": "AHPRA compliance is crucial for healthcare practitioners. What specific aspect would you like to know about - advertising guidelines, registration requirements, or general compliance?",
          "telehealth-complete": "Telehealth has specific documentation requirements. Are you looking to set up telehealth for the first time, or do you need to update existing processes?",
        };
        if (productId && topicResponses[productId]) {
          const followUp: Message = {
            id: Date.now(),
            text: topicResponses[productId],
            sender: "assistant",
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, followUp]);
        }
        break;
      case "learn_more":
        const learnMore: Message = {
          id: Date.now(),
          text: "I'd be happy to provide more details. What specific aspect would you like to know more about?\n\nYou can also:\n• Browse our document library\n• Check out our bundle savings\n• Schedule a consultation with our team",
          sender: "assistant",
          timestamp: new Date(),
          actions: [
            { label: "View Documents", action: "products" },
            { label: "View Bundles", action: "bundles" },
          ],
        };
        setMessages(prev => [...prev, learnMore]);
        break;
    }
  };

  // Floating button when chat is closed
  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        {/* Welcome bubble */}
        {hasNewMessage && (
          <div className="absolute -top-16 right-0 bg-white rounded-lg shadow-lg p-3 w-64 animate-fade-in">
            <p className="text-sm text-gray-700 font-medium">
              Need help with legal documents?
            </p>
            <p className="text-xs text-gray-500 mt-1">
              I&apos;m here to answer your questions
            </p>
          </div>
        )}
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900 hover:bg-slate-800 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 relative group"
          aria-label="Open chat assistant"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          {hasNewMessage && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
          )}
          <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Chat with Legal AI Assistant
          </span>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 right-6 w-[380px] bg-white shadow-2xl rounded-xl z-50 transition-all duration-300 overflow-hidden ${
        isMinimized ? "h-14" : "h-[550px]"
      }`}
    >
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
            </svg>
          </div>
          <div>
            <p className="font-medium text-sm">Legal AI Assistant</p>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Online</span>
              {totalXPEarned > 0 && (
                <span className="px-1.5 py-0.5 bg-amber-500/30 rounded text-amber-200">
                  +{totalXPEarned} XP
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
            </svg>
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-white/10 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ height: "calc(100% - 140px)" }}>
            {messages.map((msg) => (
              <div key={msg.id}>
                <div className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.sender === "assistant" && (
                    <div className="w-7 h-7 bg-slate-100 rounded-full flex-shrink-0 flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                      </svg>
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === "user"
                        ? "bg-slate-900 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.xpAwarded && msg.xpAwarded > 0 && (
                      <p className="text-xs mt-1 text-amber-500">+{msg.xpAwarded} XP</p>
                    )}
                    <p className="text-xs opacity-60 mt-1">
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {msg.sender === "user" && (
                    <div className="w-7 h-7 bg-slate-900 rounded-full flex-shrink-0 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Disclaimer */}
                {msg.showDisclaimer && msg.sender === "assistant" && (
                  <div className="ml-9 mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <p className="text-xs text-amber-800">
                        This is general information only, not legal advice. For personalised guidance, please consult with our solicitors.
                      </p>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                {msg.actions && msg.actions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 ml-9">
                    {msg.actions.map((action, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAction(action.action, action.productId)}
                        className="px-3 py-1.5 text-xs font-medium border border-slate-200 rounded-full hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-7 h-7 bg-slate-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z" />
                  </svg>
                </div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm p-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about legal documents..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
                disabled={isTyping}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-2 text-center">
              General information only • Not legal advice
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default AIChatAssistant;
