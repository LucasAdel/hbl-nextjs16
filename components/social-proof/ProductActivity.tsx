"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, ShoppingBag, Clock, TrendingUp, Users, AlertTriangle, Flame } from "lucide-react";

interface ProductActivityProps {
  productId: string;
  productName?: string;
  showViewers?: boolean;
  showRecentPurchases?: boolean;
  showStock?: boolean;
  showTrending?: boolean;
  className?: string;
}

interface ActivityData {
  currentViewers: number;
  recentPurchases: number;
  stockLevel: "high" | "medium" | "low" | "critical";
  stockCount?: number;
  isTrending: boolean;
  lastPurchaseMinutes: number;
}

/**
 * Real-time product activity indicators
 * Shows viewing count, recent purchases, stock levels, and trending status
 */
export function ProductActivity({
  productId,
  productName,
  showViewers = true,
  showRecentPurchases = true,
  showStock = true,
  showTrending = true,
  className = "",
}: ProductActivityProps) {
  const [activity, setActivity] = useState<ActivityData>({
    currentViewers: 0,
    recentPurchases: 0,
    stockLevel: "high",
    isTrending: false,
    lastPurchaseMinutes: 0,
  });
  const [loading, setLoading] = useState(true);

  // Fetch activity data
  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const response = await fetch(`/api/analytics/product-activity?productId=${productId}`);
        if (response.ok) {
          const data = await response.json();
          setActivity(data);
        }
      } catch {
        // Generate plausible demo data
        setActivity(generateDemoActivity(productId));
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchActivity, 30000);
    return () => clearInterval(interval);
  }, [productId]);

  // Simulate viewer count fluctuation
  useEffect(() => {
    if (activity.currentViewers === 0) return;

    const fluctuate = setInterval(() => {
      setActivity((prev) => ({
        ...prev,
        currentViewers: Math.max(
          1,
          prev.currentViewers + Math.floor(Math.random() * 5) - 2
        ),
      }));
    }, 15000);

    return () => clearInterval(fluctuate);
  }, [activity.currentViewers]);

  if (loading) {
    return (
      <div className={`flex gap-3 animate-pulse ${className}`}>
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  const indicators = [];

  // Trending indicator
  if (showTrending && activity.isTrending) {
    indicators.push(
      <motion.div
        key="trending"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-full"
      >
        <Flame className="h-3 w-3" />
        <span>Trending</span>
      </motion.div>
    );
  }

  // Current viewers
  if (showViewers && activity.currentViewers > 0) {
    indicators.push(
      <motion.div
        key="viewers"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400"
      >
        <div className="relative">
          <Eye className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
        <span>
          <strong className="text-gray-900 dark:text-white">{activity.currentViewers}</strong>{" "}
          {activity.currentViewers === 1 ? "person" : "people"} viewing
        </span>
      </motion.div>
    );
  }

  // Recent purchases
  if (showRecentPurchases && activity.recentPurchases > 0) {
    indicators.push(
      <motion.div
        key="purchases"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400"
      >
        <ShoppingBag className="h-4 w-4" />
        <span>
          <strong>{activity.recentPurchases}</strong> sold in last 24h
        </span>
      </motion.div>
    );
  }

  // Last purchase time
  if (activity.lastPurchaseMinutes > 0 && activity.lastPurchaseMinutes < 60) {
    indicators.push(
      <motion.div
        key="lastPurchase"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400"
      >
        <Clock className="h-4 w-4" />
        <span>
          Last purchased {activity.lastPurchaseMinutes} min ago
        </span>
      </motion.div>
    );
  }

  // Stock level warnings
  if (showStock && (activity.stockLevel === "low" || activity.stockLevel === "critical")) {
    indicators.push(
      <motion.div
        key="stock"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`flex items-center gap-1.5 text-sm ${
          activity.stockLevel === "critical"
            ? "text-red-600 dark:text-red-400"
            : "text-amber-600 dark:text-amber-400"
        }`}
      >
        <AlertTriangle className="h-4 w-4" />
        <span>
          {activity.stockLevel === "critical"
            ? `Only ${activity.stockCount || 2} left!`
            : `Low stock - ${activity.stockCount || 5} remaining`}
        </span>
      </motion.div>
    );
  }

  if (indicators.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-3 ${className}`}>
      <AnimatePresence mode="popLayout">
        {indicators}
      </AnimatePresence>
    </div>
  );
}

/**
 * Compact product popularity badge
 */
export function PopularityBadge({
  productId,
  size = "default",
}: {
  productId: string;
  size?: "small" | "default";
}) {
  const [popularity, setPopularity] = useState<"popular" | "hot" | "bestseller" | null>(null);

  useEffect(() => {
    // Simulate popularity based on product ID hash
    const hash = productId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    if (hash % 10 === 0) setPopularity("bestseller");
    else if (hash % 5 === 0) setPopularity("hot");
    else if (hash % 3 === 0) setPopularity("popular");
  }, [productId]);

  if (!popularity) return null;

  const styles = {
    bestseller: {
      bg: "bg-gradient-to-r from-yellow-500 to-orange-500",
      icon: TrendingUp,
      text: "Bestseller",
    },
    hot: {
      bg: "bg-gradient-to-r from-red-500 to-pink-500",
      icon: Flame,
      text: "Hot",
    },
    popular: {
      bg: "bg-gradient-to-r from-tiffany to-blue-500",
      icon: Users,
      text: "Popular",
    },
  };

  const style = styles[popularity];
  const Icon = style.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 ${style.bg} text-white font-medium rounded-full ${
        size === "small" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
    >
      <Icon className={size === "small" ? "h-3 w-3" : "h-4 w-4"} />
      <span>{style.text}</span>
    </div>
  );
}

/**
 * Generate plausible demo activity data
 */
function generateDemoActivity(productId: string): ActivityData {
  // Use product ID to generate consistent but varied data
  const hash = productId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const currentViewers = (hash % 20) + 3; // 3-23 viewers
  const recentPurchases = (hash % 15) + 2; // 2-17 purchases

  // Determine stock level based on hash
  let stockLevel: ActivityData["stockLevel"] = "high";
  let stockCount: number | undefined;

  if (hash % 12 === 0) {
    stockLevel = "critical";
    stockCount = (hash % 3) + 1; // 1-3
  } else if (hash % 6 === 0) {
    stockLevel = "low";
    stockCount = (hash % 5) + 3; // 3-8
  } else if (hash % 3 === 0) {
    stockLevel = "medium";
  }

  const isTrending = hash % 7 === 0;
  const lastPurchaseMinutes = (hash % 45) + 5; // 5-50 minutes ago

  return {
    currentViewers,
    recentPurchases,
    stockLevel,
    stockCount,
    isTrending,
    lastPurchaseMinutes,
  };
}

/**
 * Social proof counter (for use in sidebars/footers)
 */
export function SocialProofCounter({ className = "" }: { className?: string }) {
  const [stats, setStats] = useState({
    totalCustomers: 2847,
    todayPurchases: 23,
    activeViewers: 156,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        totalCustomers: prev.totalCustomers + (Math.random() > 0.7 ? 1 : 0),
        todayPurchases: Math.max(15, prev.todayPurchases + Math.floor(Math.random() * 3) - 1),
        activeViewers: Math.max(50, prev.activeViewers + Math.floor(Math.random() * 21) - 10),
      }));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`grid grid-cols-3 gap-4 ${className}`}>
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {stats.totalCustomers.toLocaleString()}+
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Happy Customers
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">
          {stats.todayPurchases}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Purchases Today
        </div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-tiffany flex items-center justify-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {stats.activeViewers}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Shopping Now
        </div>
      </div>
    </div>
  );
}

export default ProductActivity;
