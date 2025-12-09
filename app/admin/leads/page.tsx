"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Download,
} from "lucide-react";
import {
  sampleLeads,
  statusLabels,
  statusColors,
  sourceLabels,
  getLeadStats,
  type Lead,
  type LeadStatus,
} from "@/lib/leads-data";

export default function LeadsPage() {
  const [leads, setLeads] = useState(sampleLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "all">("all");
  const [sourceFilter, setSourceFilter] = useState<Lead["source"] | "all">("all");
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const stats = getLeadStats();

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;
    const matchesSource =
      sourceFilter === "all" || lead.source === sourceFilter;

    // Date filtering
    let matchesDate = true;
    if (dateFilter !== "all") {
      const leadDate = new Date(lead.createdAt);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      if (dateFilter === "today") {
        matchesDate = leadDate >= today;
      } else if (dateFilter === "week") {
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        matchesDate = leadDate >= weekAgo;
      } else if (dateFilter === "month") {
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        matchesDate = leadDate >= monthAgo;
      }
    }

    return matchesSearch && matchesStatus && matchesSource && matchesDate;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    setLeads((prev) =>
      prev.map((lead) =>
        lead.id === leadId
          ? { ...lead, status: newStatus, updatedAt: new Date().toISOString() }
          : lead
      )
    );
  };

  // CSV Export function
  const exportToCSV = () => {
    const headers = ["Name", "Email", "Phone", "Company", "Service", "Source", "Status", "Value", "Created", "Notes"];
    const csvRows = [
      headers.join(","),
      ...filteredLeads.map((lead) => [
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.email}"`,
        `"${lead.phone || ""}"`,
        `"${(lead.company || "").replace(/"/g, '""')}"`,
        `"${(lead.service || "").replace(/"/g, '""')}"`,
        `"${sourceLabels[lead.source]}"`,
        `"${statusLabels[lead.status]}"`,
        lead.value || "",
        `"${formatDate(lead.createdAt)}"`,
        `"${(lead.notes || "").replace(/"/g, '""')}"`,
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads-export-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Lead Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track and manage potential clients
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="h-5 w-5 mr-2" />
            Export CSV
          </button>
          <button className="inline-flex items-center justify-center px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors">
            <Plus className="h-5 w-5 mr-2" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Leads
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                New Leads
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.new}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Conversion Rate
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.total > 0
                  ? Math.round((stats.converted / stats.total) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Pipeline Value
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(stats.totalValue)}
              </p>
            </div>
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as LeadStatus | "all")
                }
                className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              >
                <option value="all">All Status</option>
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={sourceFilter}
                onChange={(e) =>
                  setSourceFilter(e.target.value as Lead["source"] | "all")
                }
                className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              >
                <option value="all">All Sources</option>
                {Object.entries(sourceLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={dateFilter}
                onChange={(e) =>
                  setDateFilter(e.target.value as "all" | "today" | "week" | "month")
                }
                className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "table"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Filter className="h-4 w-4 inline-block mr-2" />
              Table
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              <Users className="h-4 w-4 inline-block mr-2" />
              Kanban
            </button>
          </div>
        </div>
      </div>

      {viewMode === "table" ? (
        /* Table View */
        <>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Lead
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Service
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Source
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Value
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Created
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredLeads.map((lead) => (
                    <tr
                      key={lead.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {lead.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {lead.email}
                          </p>
                          {lead.company && (
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {lead.company}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {lead.service || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {sourceLabels[lead.source]}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) =>
                            handleStatusChange(lead.id, e.target.value as LeadStatus)
                          }
                          className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-teal-500 ${statusColors[lead.status].bg} ${statusColors[lead.status].text}`}
                        >
                          {Object.entries(statusLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {lead.value ? formatCurrency(lead.value) : "-"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(lead.createdAt)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="Send email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          {lead.phone && (
                            <button
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                              title="Call"
                            >
                              <Phone className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded-lg transition-colors"
                            title="Add note"
                          >
                            <MessageSquare className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredLeads.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No leads found</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {filteredLeads.length} of {leads.length} leads
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                Previous
              </button>
              <button className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {(["new", "contacted", "qualified", "converted", "lost"] as LeadStatus[]).map((status) => {
            const statusLeads = filteredLeads.filter((l) => l.status === status);
            const totalValue = statusLeads.reduce((sum, l) => sum + (l.value || 0), 0);

            return (
              <div key={status} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status].bg} ${statusColors[status].text}`}
                    >
                      {statusLabels[status]}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ({statusLeads.length})
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {formatCurrency(totalValue)}
                  </span>
                </div>

                <div className="space-y-3">
                  {statusLeads.map((lead) => (
                    <div
                      key={lead.id}
                      className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {lead.name}
                          </p>
                          {lead.company && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {lead.company}
                            </p>
                          )}
                        </div>
                        {lead.value && (
                          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 ml-2">
                            {formatCurrency(lead.value)}
                          </span>
                        )}
                      </div>
                      {lead.service && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                          {lead.service}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-400">{sourceLabels[lead.source]}</span>
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Send email"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </button>
                          {lead.phone && (
                            <button
                              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
                              title="Call"
                            >
                              <Phone className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {statusLeads.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <p className="text-sm">No leads</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
