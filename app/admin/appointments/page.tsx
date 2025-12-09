"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  Phone,
  Video,
  FileText,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  X,
  Check,
  AlertCircle,
  DollarSign,
  Download,
} from "lucide-react";
import {
  sampleAppointments,
  statusLabels,
  statusColors,
  typeLabels,
  getAppointmentStats,
  type Appointment,
  type AppointmentStatus,
  type AppointmentType,
} from "@/lib/appointments-data";

const typeIcons: Record<AppointmentType, React.ReactNode> = {
  consultation: <Users className="h-4 w-4" />,
  "follow-up": <RefreshCw className="h-4 w-4" />,
  "document-review": <FileText className="h-4 w-4" />,
  "phone-call": <Phone className="h-4 w-4" />,
  "video-call": <Video className="h-4 w-4" />,
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState(sampleAppointments);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"week" | "month" | "list">("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "all">(
    "all"
  );
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const stats = getAppointmentStats();

  // Get current week dates
  const weekDates = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      return date;
    });
  }, [currentDate]);

  // Get current month dates for month view
  const monthDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);

    // Start from the Sunday before or on the first day
    const startDate = new Date(firstDay);
    startDate.setDate(firstDay.getDate() - firstDay.getDay());

    // End on the Saturday after or on the last day
    const endDate = new Date(lastDay);
    const daysToAdd = 6 - lastDay.getDay();
    endDate.setDate(lastDay.getDate() + daysToAdd);

    const dates: Date[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  }, [currentDate]);

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return filteredAppointments.filter((apt) => apt.date === dateStr);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleStatusChange = (
    appointmentId: string,
    newStatus: AppointmentStatus
  ) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === appointmentId
          ? { ...apt, status: newStatus, updatedAt: new Date().toISOString() }
          : apt
      )
    );
  };

  const navigatePeriod = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (view === "month") {
        // Navigate by month
        newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
      } else {
        // Navigate by week
        newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  // CSV Export function
  const exportToCSV = () => {
    const headers = ["Client Name", "Email", "Phone", "Service", "Type", "Date", "Time", "Duration (min)", "Status", "Assigned To", "Amount", "Notes"];
    const csvRows = [
      headers.join(","),
      ...filteredAppointments.map((apt) => [
        `"${apt.clientName.replace(/"/g, '""')}"`,
        `"${apt.clientEmail}"`,
        `"${apt.clientPhone || ""}"`,
        `"${apt.service.replace(/"/g, '""')}"`,
        `"${typeLabels[apt.type]}"`,
        `"${formatDate(apt.date)}"`,
        `"${formatTime(apt.time)}"`,
        apt.duration,
        `"${statusLabels[apt.status]}"`,
        `"${apt.assignedTo}"`,
        apt.amount || "",
        `"${(apt.notes || "").replace(/"/g, '""')}"`,
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `appointments-export-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const timeSlots = [
    "09:00",
    "09:30",
    "10:00",
    "10:30",
    "11:00",
    "11:30",
    "12:00",
    "12:30",
    "13:00",
    "13:30",
    "14:00",
    "14:30",
    "15:00",
    "15:30",
    "16:00",
    "16:30",
    "17:00",
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Appointment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Schedule and manage client appointments
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
            New Appointment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Today&apos;s Appointments
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.todayCount}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Upcoming
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.upcoming}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Completed
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.completed}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Check className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Revenue
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {formatCurrency(stats.totalRevenue)}
              </p>
            </div>
            <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-teal-600 dark:text-teal-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search appointments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as AppointmentStatus | "all")
              }
              className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Status</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
            <button
              onClick={() => setView("week")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "week"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setView("month")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "month"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {view === "week" ? (
        /* Week View */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Calendar Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigatePeriod("prev")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigatePeriod("next")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {weekDates[0].toLocaleDateString("en-AU", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>

          {/* Week Header */}
          <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
            <div className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
              Time
            </div>
            {weekDates.map((date, idx) => (
              <div
                key={idx}
                className={`p-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                  isToday(date) ? "bg-teal-50 dark:bg-teal-900/20" : ""
                }`}
              >
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {date.toLocaleDateString("en-AU", { weekday: "short" })}
                </p>
                <p
                  className={`text-lg font-semibold ${
                    isToday(date)
                      ? "text-teal-600 dark:text-teal-400"
                      : "text-gray-900 dark:text-white"
                  }`}
                >
                  {date.getDate()}
                </p>
              </div>
            ))}
          </div>

          {/* Time Grid */}
          <div className="max-h-[600px] overflow-y-auto">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700 min-h-[60px]"
              >
                <div className="p-2 text-xs text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 text-right pr-3">
                  {formatTime(time)}
                </div>
                {weekDates.map((date, idx) => {
                  const dateStr = date.toISOString().split("T")[0];
                  const dayAppointments = filteredAppointments.filter(
                    (apt) => apt.date === dateStr && apt.time === time
                  );

                  return (
                    <div
                      key={idx}
                      className={`p-1 border-r border-gray-200 dark:border-gray-700 last:border-r-0 ${
                        isToday(date) ? "bg-teal-50/50 dark:bg-teal-900/10" : ""
                      }`}
                    >
                      {dayAppointments.map((apt) => (
                        <button
                          key={apt.id}
                          onClick={() => setSelectedAppointment(apt)}
                          className={`w-full p-2 rounded-lg text-left text-xs ${statusColors[apt.status].bg} ${statusColors[apt.status].text} hover:opacity-80 transition-opacity`}
                        >
                          <div className="flex items-center gap-1 mb-1">
                            {typeIcons[apt.type]}
                            <span className="font-medium truncate">
                              {apt.clientName}
                            </span>
                          </div>
                          <p className="truncate text-[10px] opacity-75">
                            {apt.service}
                          </p>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : view === "month" ? (
        /* Month View */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Month Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigatePeriod("prev")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigatePeriod("next")}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {currentDate.toLocaleDateString("en-AU", {
                  month: "long",
                  year: "numeric",
                })}
              </h2>
            </div>
            <button
              onClick={goToToday}
              className="px-4 py-2 text-sm font-medium text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
            >
              Today
            </button>
          </div>

          {/* Month Days Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="p-3 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 last:border-r-0"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Month Grid */}
          <div className="grid grid-cols-7">
            {monthDates.map((date, index) => {
              const dateStr = date.toISOString().split("T")[0];
              const dayAppointments = filteredAppointments.filter(
                (apt) => apt.date === dateStr
              );

              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border-r border-b border-gray-200 dark:border-gray-700 last:border-r-0 ${
                    !isCurrentMonth(date)
                      ? "bg-gray-50 dark:bg-gray-900/50"
                      : isToday(date)
                        ? "bg-teal-50/50 dark:bg-teal-900/20"
                        : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-sm font-medium ${
                        isToday(date)
                          ? "w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center"
                          : !isCurrentMonth(date)
                            ? "text-gray-400"
                            : "text-gray-900 dark:text-white"
                      }`}
                    >
                      {date.getDate()}
                    </span>
                    {dayAppointments.length > 0 && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {dayAppointments.length}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    {dayAppointments.slice(0, 3).map((apt) => (
                      <button
                        key={apt.id}
                        onClick={() => setSelectedAppointment(apt)}
                        className={`w-full p-1 rounded text-left text-xs truncate ${statusColors[apt.status].bg} ${statusColors[apt.status].text} hover:opacity-80 transition-opacity`}
                      >
                        <span className="font-medium">{formatTime(apt.time)}</span>{" "}
                        {apt.clientName.split(" ")[0]}
                      </button>
                    ))}
                    {dayAppointments.length > 3 && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 pl-1">
                        +{dayAppointments.length - 3} more
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Client
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Service
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Assigned
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredAppointments.map((apt) => (
                  <tr
                    key={apt.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {apt.clientName}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {apt.clientEmail}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {apt.service}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        {typeIcons[apt.type]}
                        <span>{typeLabels[apt.type]}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(apt.date)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatTime(apt.time)} ({apt.duration} min)
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={apt.status}
                        onChange={(e) =>
                          handleStatusChange(
                            apt.id,
                            e.target.value as AppointmentStatus
                          )
                        }
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-teal-500 ${statusColors[apt.status].bg} ${statusColors[apt.status].text}`}
                      >
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {apt.assignedTo}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedAppointment(apt)}
                          className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/30 rounded-lg transition-colors"
                          title="View details"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Send email"
                        >
                          <Mail className="h-4 w-4" />
                        </button>
                        {apt.clientPhone && (
                          <button
                            className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                            title="Call"
                          >
                            <Phone className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                No appointments found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {selectedAppointment.clientName}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedAppointment.clientEmail}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatDate(selectedAppointment.date)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatTime(selectedAppointment.time)} (
                      {selectedAppointment.duration} min)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  {typeIcons[selectedAppointment.type]}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {typeLabels[selectedAppointment.type]}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedAppointment.service}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Users className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      Assigned to
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {selectedAppointment.assignedTo}
                    </p>
                  </div>
                </div>

                {selectedAppointment.amount && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(selectedAppointment.amount)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Consultation fee
                      </p>
                    </div>
                  </div>
                )}

                {selectedAppointment.notes && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      {selectedAppointment.notes}
                    </p>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button className="flex-1 px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors">
                    Edit Appointment
                  </button>
                  <button className="px-4 py-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Send Reminder
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredAppointments.length} of {appointments.length}{" "}
          appointments
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
    </div>
  );
}
