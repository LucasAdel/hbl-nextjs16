import { NextRequest, NextResponse } from "next/server";

// In-memory store for demo (would use Redis in production)
const activityStore: Map<string, {
  viewers: Set<string>;
  purchases: { timestamp: number }[];
  lastViewerUpdate: number;
}> = new Map();

/**
 * GET /api/analytics/product-activity
 * Returns real-time activity metrics for a product
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId");

  if (!productId) {
    return NextResponse.json(
      { error: "Product ID required" },
      { status: 400 }
    );
  }

  // Get or initialize activity data
  let activity = activityStore.get(productId);

  if (!activity) {
    // Generate initial demo data based on productId hash
    const hash = productId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const viewerCount = (hash % 20) + 3;

    activity = {
      viewers: new Set(Array.from({ length: viewerCount }, (_, i) => `viewer_${i}`)),
      purchases: generateDemoPurchases(hash),
      lastViewerUpdate: Date.now(),
    };
    activityStore.set(productId, activity);
  }

  // Simulate viewer fluctuation
  if (Date.now() - activity.lastViewerUpdate > 15000) {
    const change = Math.floor(Math.random() * 5) - 2;
    const currentCount = activity.viewers.size;
    const newCount = Math.max(1, currentCount + change);

    if (newCount > currentCount) {
      for (let i = 0; i < newCount - currentCount; i++) {
        activity.viewers.add(`viewer_${Date.now()}_${i}`);
      }
    } else if (newCount < currentCount) {
      const viewersArray = Array.from(activity.viewers);
      for (let i = 0; i < currentCount - newCount; i++) {
        activity.viewers.delete(viewersArray[i]);
      }
    }

    activity.lastViewerUpdate = Date.now();
    activityStore.set(productId, activity);
  }

  // Calculate metrics
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const hourAgo = now - 60 * 60 * 1000;

  const recentPurchases = activity.purchases.filter((p) => p.timestamp > dayAgo).length;
  const lastPurchase = activity.purchases.sort((a, b) => b.timestamp - a.timestamp)[0];
  const lastPurchaseMinutes = lastPurchase
    ? Math.floor((now - lastPurchase.timestamp) / 60000)
    : 0;

  // Determine stock level (simulated based on purchases)
  let stockLevel: "high" | "medium" | "low" | "critical" = "high";
  let stockCount: number | undefined;

  const hash = productId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);

  if (recentPurchases > 10 || hash % 12 === 0) {
    stockLevel = "critical";
    stockCount = (hash % 3) + 1;
  } else if (recentPurchases > 5 || hash % 6 === 0) {
    stockLevel = "low";
    stockCount = (hash % 5) + 3;
  } else if (recentPurchases > 2 || hash % 3 === 0) {
    stockLevel = "medium";
  }

  // Determine if trending
  const isTrending = recentPurchases > 8 || activity.viewers.size > 15 || hash % 7 === 0;

  return NextResponse.json({
    productId,
    currentViewers: activity.viewers.size,
    recentPurchases,
    lastPurchaseMinutes: lastPurchaseMinutes || (hash % 45) + 5,
    stockLevel,
    stockCount,
    isTrending,
    hourlyPurchases: activity.purchases.filter((p) => p.timestamp > hourAgo).length,
  });
}

/**
 * POST /api/analytics/product-activity
 * Track a viewer or purchase event
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, event, viewerId } = body;

    if (!productId || !event) {
      return NextResponse.json(
        { error: "Product ID and event type required" },
        { status: 400 }
      );
    }

    let activity = activityStore.get(productId);
    if (!activity) {
      activity = {
        viewers: new Set(),
        purchases: [],
        lastViewerUpdate: Date.now(),
      };
    }

    switch (event) {
      case "view":
        if (viewerId) {
          activity.viewers.add(viewerId);
        }
        break;

      case "leave":
        if (viewerId) {
          activity.viewers.delete(viewerId);
        }
        break;

      case "purchase":
        activity.purchases.push({ timestamp: Date.now() });
        // Clean up old purchases (keep last 7 days)
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        activity.purchases = activity.purchases.filter((p) => p.timestamp > weekAgo);
        break;
    }

    activity.lastViewerUpdate = Date.now();
    activityStore.set(productId, activity);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking product activity:", error);
    return NextResponse.json(
      { error: "Failed to track activity" },
      { status: 500 }
    );
  }
}

// Generate demo purchases with realistic timestamps
function generateDemoPurchases(hash: number): { timestamp: number }[] {
  const purchases: { timestamp: number }[] = [];
  const count = (hash % 15) + 5; // 5-20 purchases in last 24h
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;

  for (let i = 0; i < count; i++) {
    const timestamp = dayAgo + Math.random() * (now - dayAgo);
    purchases.push({ timestamp });
  }

  return purchases.sort((a, b) => b.timestamp - a.timestamp);
}
