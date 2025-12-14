/**
 * Knowledge Base Review Script
 *
 * Run with: npx ts-node scripts/review-knowledge-base.ts
 * Or: npx tsx scripts/review-knowledge-base.ts
 *
 * Outputs all knowledge base items in a readable format for review.
 */

import { KNOWLEDGE_BASE } from '../features/bailey-ai/lib/knowledge-base';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
};

function printDivider(char = '=', length = 80) {
  console.log(colors.dim + char.repeat(length) + colors.reset);
}

function printHeader(text: string) {
  console.log('\n');
  printDivider('=');
  console.log(colors.bgBlue + colors.white + colors.bright + ` ${text} `.padEnd(79) + colors.reset);
  printDivider('=');
}

function printSubHeader(text: string) {
  console.log('\n' + colors.cyan + colors.bright + text + colors.reset);
  printDivider('-', 60);
}

// Group items by category
const categories = new Map<string, typeof KNOWLEDGE_BASE>();

KNOWLEDGE_BASE.forEach(item => {
  const cat = item.category;
  if (!categories.has(cat)) {
    categories.set(cat, []);
  }
  categories.get(cat)!.push(item);
});

// Print summary
printHeader('BAILEY AI KNOWLEDGE BASE REVIEW');
console.log(`\n${colors.bright}Total Items:${colors.reset} ${KNOWLEDGE_BASE.length}`);
console.log(`${colors.bright}Categories:${colors.reset} ${categories.size}`);
console.log('\n' + colors.bright + 'Category Breakdown:' + colors.reset);

categories.forEach((items, category) => {
  console.log(`  • ${category}: ${items.length} items`);
});

// Print each category
categories.forEach((items, category) => {
  printHeader(`CATEGORY: ${category.toUpperCase()}`);

  items.forEach((item, index) => {
    printSubHeader(`[${item.id}] ${item.title}`);

    console.log(`${colors.yellow}Subcategory:${colors.reset} ${item.subcategory}`);
    console.log(`${colors.yellow}Topic:${colors.reset} ${item.topic}`);
    console.log(`${colors.yellow}Summary:${colors.reset} ${item.summary}`);
    console.log(`${colors.yellow}Keywords:${colors.reset} ${item.keywords.join(', ')}`);
    console.log(`${colors.yellow}Confidence:${colors.reset} ${item.confidenceLevel}/10`);
    console.log(`${colors.yellow}XP Reward:${colors.reset} ${item.xpReward}`);
    console.log(`${colors.yellow}Requires Disclaimer:${colors.reset} ${item.requiresDisclaimer ? 'Yes' : 'No'}`);

    if (item.legalDisclaimer) {
      console.log(`${colors.red}Disclaimer:${colors.reset} ${item.legalDisclaimer}`);
    }

    if (item.metadata && Object.keys(item.metadata).length > 0) {
      console.log(`${colors.yellow}Metadata:${colors.reset}`, JSON.stringify(item.metadata, null, 2));
    }

    console.log(`\n${colors.green}Response Template:${colors.reset}`);
    console.log(colors.dim + '─'.repeat(60) + colors.reset);
    // Indent the response template for readability
    const templateLines = item.responseTemplate.split('\n');
    templateLines.forEach(line => {
      console.log('  ' + line);
    });
    console.log(colors.dim + '─'.repeat(60) + colors.reset);
  });
});

printHeader('END OF KNOWLEDGE BASE REVIEW');
console.log(`\nTotal: ${KNOWLEDGE_BASE.length} items reviewed\n`);
