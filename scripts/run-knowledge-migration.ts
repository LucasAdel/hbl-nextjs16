/**
 * Run Knowledge Base Migration
 *
 * Execute with: npx tsx scripts/run-knowledge-migration.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://elpyoqjdjifxvpcvvvey.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required');
  console.log('Run with: SUPABASE_SERVICE_ROLE_KEY=your_key npx tsx scripts/run-knowledge-migration.ts');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runMigration() {
  console.log('🚀 Running Knowledge Base Migration...\n');

  // Read the migration file
  const migrationPath = path.join(__dirname, '../supabase/migrations/20241210_knowledge_base.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Split into individual statements (basic split - may need adjustment for complex SQL)
  const statements = migrationSQL
    .split(/;\s*$/m)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📄 Found ${statements.length} SQL statements to execute\n`);

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];
    const preview = statement.substring(0, 60).replace(/\n/g, ' ');

    try {
      // Use the SQL query capability
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });

      if (error) {
        // Try direct query if RPC doesn't exist
        throw error;
      }

      console.log(`✅ [${i + 1}/${statements.length}] ${preview}...`);
      successCount++;
    } catch (error: any) {
      // For tables that already exist, that's okay
      if (error.message?.includes('already exists') || error.code === '42P07') {
        console.log(`⏭️  [${i + 1}/${statements.length}] Already exists: ${preview}...`);
        successCount++;
      } else {
        console.error(`❌ [${i + 1}/${statements.length}] Failed: ${preview}...`);
        console.error(`   Error: ${error.message || error}`);
        errorCount++;
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Failed: ${errorCount}`);
  console.log('='.repeat(50));

  if (errorCount > 0) {
    console.log('\n⚠️  Some statements failed. You may need to run the migration manually in Supabase SQL Editor.');
    console.log('   Dashboard: https://supabase.com/dashboard/project/elpyoqjdjifxvpcvvvey/sql');
  } else {
    console.log('\n🎉 Migration completed successfully!');
  }
}

runMigration().catch(console.error);
