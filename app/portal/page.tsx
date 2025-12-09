"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SecureMessaging } from "@/components/portal/secure-messaging";
import { CaseTimeline } from "@/components/portal/case-timeline";
import { InvoiceHistory } from "@/components/portal/invoice-history";
import { DocumentRecommendations } from "@/components/document-recommendations";
import { getCurrentUser, signOut, type AuthUser } from "@/lib/auth";
import { Loader2, LogOut, User, MessageSquare, Clock, Receipt, FileText, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Matter {
  id: string;
  name: string;
  status: string;
  created_at: string;
}

export default function ClientPortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "messages" | "timeline" | "invoices" | "documents">("overview");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  // Fetch authenticated user on mount
  useEffect(() => {
    async function loadUser() {
      try {
        const currentUser = await getCurrentUser();

        if (!currentUser) {
          // Not authenticated - redirect to login
          router.push("/login?redirect=/portal");
          return;
        }

        setUser(currentUser);

        // Generate session ID for recommendations
        const sid = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        setSessionId(sid);
      } catch (error) {
        console.error("Failed to load user:", error);
        router.push("/login?redirect=/portal");
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, [router]);

  // Fetch client matters when user is loaded
  useEffect(() => {
    async function fetchMatters() {
      if (!user?.email) return;

      try {
        const response = await fetch(`/api/portal/matters?email=${encodeURIComponent(user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setMatters(data.matters || []);
          if (data.matters?.length > 0) {
            setSelectedMatter(data.matters[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch matters:", error);
      }
    }

    fetchMatters();
  }, [user?.email]);

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 text-teal-600 animate-spin mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: <User className="h-4 w-4" /> },
    { id: "messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" /> },
    { id: "timeline", label: "Timeline", icon: <Clock className="h-4 w-4" /> },
    { id: "invoices", label: "Invoices", icon: <Receipt className="h-4 w-4" /> },
    { id: "documents", label: "Documents", icon: <FileText className="h-4 w-4" /> },
  ];

  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={displayName}
                  className="w-12 h-12 rounded-full border-2 border-white/20"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center text-xl font-bold">
                  {(user.firstName?.[0] || user.email[0]).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold">Welcome, {user.firstName || "Client"}</h1>
                <p className="text-slate-300 mt-1">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors text-sm bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>

          {/* Matter Selector */}
          {matters.length > 0 && (
            <div className="mt-6">
              <label className="text-sm text-slate-400">Current Matter:</label>
              <select
                value={selectedMatter?.id || ""}
                onChange={(e) => {
                  const matter = matters.find(m => m.id === e.target.value);
                  setSelectedMatter(matter || null);
                }}
                className="ml-2 bg-slate-700 border-slate-600 text-white rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {matters.map((matter) => (
                  <option key={matter.id} value={matter.id}>
                    {matter.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-teal-500 text-teal-600 dark:text-teal-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                {tab.icon}
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Active Matters</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">{matters.length}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Unread Messages</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Documents</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">0</div>
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Receipt className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">Outstanding</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">$0</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Messages Preview */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Recent Messages</h2>
                  <button
                    onClick={() => setActiveTab("messages")}
                    className="text-teal-600 dark:text-teal-400 text-sm hover:underline flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">No recent messages</div>
              </div>

              {/* Invoice Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900 dark:text-white">Invoice Summary</h2>
                  <button
                    onClick={() => setActiveTab("invoices")}
                    className="text-teal-600 dark:text-teal-400 text-sm hover:underline flex items-center gap-1"
                  >
                    View All
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-gray-500 dark:text-gray-400 text-sm">No outstanding invoices</div>
              </div>
            </div>

            {/* Document Recommendations */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <DocumentRecommendations
                email={user.email}
                sessionId={sessionId}
                title="Recommended Documents For You"
                limit={4}
                variant="grid"
              />
            </div>
          </div>
        )}

        {activeTab === "messages" && (
          <SecureMessaging
            clientEmail={user.email}
            matterId={selectedMatter?.id}
            matterName={selectedMatter?.name}
          />
        )}

        {activeTab === "timeline" && selectedMatter && (
          <CaseTimeline
            matterId={selectedMatter.id}
            matterName={selectedMatter.name}
            clientEmail={user.email}
          />
        )}

        {activeTab === "timeline" && !selectedMatter && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No active matters to display timeline</p>
          </div>
        )}

        {activeTab === "invoices" && (
          <InvoiceHistory clientEmail={user.email} />
        )}

        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Your Documents</h2>
              <div className="text-gray-500 dark:text-gray-400 text-sm">No documents available</div>
            </div>

            <DocumentRecommendations
              email={user.email}
              sessionId={sessionId}
              title="Documents You May Need"
              limit={6}
              variant="grid"
            />
          </div>
        )}
      </div>
    </div>
  );
}
