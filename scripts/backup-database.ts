/**
 * Supabase Database Backup Script
 *
 * Exports all tables from Supabase to JSON files for backup purposes.
 * Run with: npx tsx scripts/backup-database.ts
 */

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Create backup directory
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
const backupDir = path.join(process.cwd(), "backups", `supabase-${timestamp}`);
fs.mkdirSync(backupDir, { recursive: true });

console.log(`📦 Creating database backup in: ${backupDir}\n`);

// List of all tables to backup (only tables that exist in database)
const TABLES_TO_BACKUP = [
  // Booking tables
  "advanced_bookings",
  "event_types",
  "availability_slots",

  // User & Auth related
  "user_roles",
  "contact_submissions",
  "email_sequence_enrollments",

  // Chat & AI
  "chat_conversations",
  "chat_messages",
  "bailey_conversations",

  // Analytics
  "analytics_events",
  "analytics_session_summaries",
  "analytics_heatmap_config",

  // Content
  "documents",

  // System
  "webhook_events",
];

interface BackupMetadata {
  timestamp: string;
  supabase_url: string;
  tables: {
    name: string;
    row_count: number;
    file: string;
    status: "success" | "error";
    error?: string;
  }[];
  total_rows: number;
  duration_ms: number;
}

async function backupTable(tableName: string): Promise<{ count: number; error?: string }> {
  try {
    console.log(`  📊 Backing up table: ${tableName}...`);

    const { data, error, count } = await supabase
      .from(tableName)
      .select("*", { count: "exact" });

    if (error) {
      console.error(`  ❌ Error backing up ${tableName}:`, error.message);
      return { count: 0, error: error.message };
    }

    const filePath = path.join(backupDir, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`  ✅ ${tableName}: ${count || data?.length || 0} rows → ${tableName}.json`);
    return { count: count || data?.length || 0 };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ Error backing up ${tableName}:`, errorMsg);
    return { count: 0, error: errorMsg };
  }
}

async function backupAuthUsers() {
  try {
    console.log(`  👥 Backing up auth users...`);

    // Note: This requires service role key
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error(`  ❌ Error backing up auth users:`, error.message);
      return { count: 0, error: error.message };
    }

    const filePath = path.join(backupDir, `auth_users.json`);
    fs.writeFileSync(filePath, JSON.stringify(data.users, null, 2));

    console.log(`  ✅ auth_users: ${data.users.length} users → auth_users.json`);
    return { count: data.users.length };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`  ❌ Error backing up auth users:`, errorMsg);
    return { count: 0, error: errorMsg };
  }
}

async function main() {
  const startTime = Date.now();
  const metadata: BackupMetadata = {
    timestamp: new Date().toISOString(),
    supabase_url: SUPABASE_URL,
    tables: [],
    total_rows: 0,
    duration_ms: 0,
  };

  console.log("🚀 Starting Supabase database backup...\n");

  // Backup all tables
  for (const tableName of TABLES_TO_BACKUP) {
    const result = await backupTable(tableName);
    metadata.tables.push({
      name: tableName,
      row_count: result.count,
      file: `${tableName}.json`,
      status: result.error ? "error" : "success",
      error: result.error,
    });
    metadata.total_rows += result.count;
  }

  // Backup auth users
  const authResult = await backupAuthUsers();
  metadata.tables.push({
    name: "auth_users",
    row_count: authResult.count,
    file: "auth_users.json",
    status: authResult.error ? "error" : "success",
    error: authResult.error,
  });
  metadata.total_rows += authResult.count;

  // Save metadata
  const endTime = Date.now();
  metadata.duration_ms = endTime - startTime;

  const metadataPath = path.join(backupDir, "_backup_metadata.json");
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

  // Create README
  const readmePath = path.join(backupDir, "README.md");
  const readme = `# Supabase Database Backup

**Created:** ${metadata.timestamp}
**Duration:** ${(metadata.duration_ms / 1000).toFixed(2)}s
**Total Rows:** ${metadata.total_rows.toLocaleString()}

## Tables Backed Up

${metadata.tables
  .map(
    (t) =>
      `- ${t.status === "success" ? "✅" : "❌"} **${t.name}**: ${t.row_count.toLocaleString()} rows${t.error ? ` (Error: ${t.error})` : ""}`
  )
  .join("\n")}

## Files

${metadata.tables.map((t) => `- ${t.file}`).join("\n")}
- _backup_metadata.json
- README.md

## Restore Instructions

To restore data, you can use the Supabase dashboard or write a restore script that:
1. Reads each JSON file
2. Inserts the data back into the corresponding table using \`.insert()\`

**Note:** Some tables may have foreign key constraints, so restore order matters.
`;
  fs.writeFileSync(readmePath, readme);

  console.log("\n" + "=".repeat(60));
  console.log("✅ Backup completed successfully!");
  console.log("=".repeat(60));
  console.log(`📁 Location: ${backupDir}`);
  console.log(`📊 Total tables: ${metadata.tables.length}`);
  console.log(`📈 Total rows: ${metadata.total_rows.toLocaleString()}`);
  console.log(`⏱️  Duration: ${(metadata.duration_ms / 1000).toFixed(2)}s`);
  console.log("=".repeat(60));

  const failedTables = metadata.tables.filter((t) => t.status === "error");
  if (failedTables.length > 0) {
    console.log("\n⚠️  Warning: Some tables failed to backup:");
    failedTables.forEach((t) => {
      console.log(`   - ${t.name}: ${t.error}`);
    });
  }
}

main().catch((err) => {
  console.error("❌ Backup failed:", err);
  process.exit(1);
});
