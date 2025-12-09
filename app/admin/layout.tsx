"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Mail,
  Settings,
  FileText,
  Calendar,
  Users,
  LogOut,
  Menu,
  X,
  FolderOpen,
  Bot,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Leads", icon: Users },
  { href: "/admin/appointments", label: "Appointments", icon: Calendar },
  { href: "/admin/bailey-ai", label: "Bailey AI", icon: Bot },
  { href: "/admin/cms", label: "Content", icon: FolderOpen },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/email-analytics", label: "Email Analytics", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 shadow-lg transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between px-6 border-b dark:border-gray-700">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">HB</span>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">
              Admin Portal
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t dark:border-gray-700">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white dark:bg-gray-800 dark:border-gray-700 px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-semibold text-gray-900 dark:text-white">
            Admin Portal
          </span>
        </header>

        {/* Page content */}
        <main>{children}</main>
      </div>
    </div>
  );
}
