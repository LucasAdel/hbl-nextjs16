/**
 * Knowledge Base Export Script
 *
 * Run with: npx tsx scripts/export-knowledge-base.ts
 *
 * Exports all knowledge base items to a Markdown file for easy review.
 */

import { KNOWLEDGE_BASE } from '../features/bailey-ai/lib/knowledge-base';
import * as fs from 'fs';
import * as path from 'path';

// Group items by category
const categories = new Map<string, typeof KNOWLEDGE_BASE>();

KNOWLEDGE_BASE.forEach(item => {
  const cat = item.category;
  if (!categories.has(cat)) {
    categories.set(cat, []);
  }
  categories.get(cat)!.push(item);
});

// Build markdown content
let markdown = `# Bailey AI Knowledge Base Review

**Generated:** ${new Date().toISOString()}
**Total Items:** ${KNOWLEDGE_BASE.length}
**Categories:** ${categories.size}

---

## How to Use This Document

1. Review each knowledge item below
2. Check the checkbox when you've reviewed and approved the content
3. Add any notes or corrections needed in the "Notes" section
4. Save the file to track your progress

### Approval Status Legend
- \`[ ]\` - Not yet reviewed
- \`[x]\` - Reviewed and approved
- \`[!]\` - Needs correction (add note below)

---

## Approval Summary

| Category | Count | Approved |
|----------|-------|----------|
`;

categories.forEach((items, category) => {
  markdown += `| ${category} | ${items.length} | ☐ 0/${items.length} |\n`;
});

markdown += `
**Overall Progress:** ☐ 0/${KNOWLEDGE_BASE.length} items approved

---

## Quick Review Checklist

`;

// Quick checklist by category
categories.forEach((items, category) => {
  markdown += `### ${category.charAt(0).toUpperCase() + category.slice(1)}\n\n`;
  items.forEach(item => {
    markdown += `- [ ] **${item.id}**: ${item.title}\n`;
  });
  markdown += `\n`;
});

markdown += `---\n\n`;

// Table of Contents
markdown += `## Table of Contents\n\n`;
categories.forEach((items, category) => {
  markdown += `- [${category.charAt(0).toUpperCase() + category.slice(1)}](#${category.toLowerCase().replace(/\s+/g, '-')}-details)\n`;
  items.forEach(item => {
    markdown += `  - [${item.title}](#${item.id})\n`;
  });
});

markdown += `\n---\n\n`;

// Each category with detailed content
categories.forEach((items, category) => {
  markdown += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Details\n\n`;

  items.forEach((item, index) => {
    markdown += `### ${item.title} {#${item.id}}\n\n`;

    // Approval checkbox
    markdown += `#### ☐ Approval Status\n\n`;
    markdown += `- [ ] **Content Accurate** - Information is correct\n`;
    markdown += `- [ ] **Tone Appropriate** - Matches brand voice\n`;
    markdown += `- [ ] **Legally Sound** - No problematic statements\n`;
    markdown += `- [ ] **Complete** - All necessary info included\n\n`;

    markdown += `**Reviewer Notes:**\n`;
    markdown += `> _Add any corrections or comments here_\n\n`;

    // Item details table
    markdown += `#### Details\n\n`;
    markdown += `| Property | Value |\n`;
    markdown += `|----------|-------|\n`;
    markdown += `| **ID** | \`${item.id}\` |\n`;
    markdown += `| **Subcategory** | ${item.subcategory} |\n`;
    markdown += `| **Topic** | ${item.topic} |\n`;
    markdown += `| **Confidence** | ${item.confidenceLevel}/10 |\n`;
    markdown += `| **XP Reward** | ${item.xpReward} |\n`;
    markdown += `| **Requires Disclaimer** | ${item.requiresDisclaimer ? '⚠️ Yes' : 'No'} |\n`;
    markdown += `| **Keywords** | ${item.keywords.join(', ')} |\n`;

    markdown += `\n**Summary:** ${item.summary}\n\n`;

    if (item.legalDisclaimer) {
      markdown += `> ⚠️ **Legal Disclaimer:** ${item.legalDisclaimer}\n\n`;
    }

    if (item.metadata && Object.keys(item.metadata).length > 0) {
      markdown += `**Metadata:**\n\`\`\`json\n${JSON.stringify(item.metadata, null, 2)}\n\`\`\`\n\n`;
    }

    markdown += `#### Response Template\n\n`;
    markdown += `\`\`\`\n${item.responseTemplate}\n\`\`\`\n\n`;

    markdown += `---\n\n`;
  });
});

// Final section
markdown += `## Review Complete

Once you've reviewed all items:

1. Update the "Approval Summary" table at the top with final counts
2. Note any items that need correction
3. Save this file for records

**Reviewed By:** _________________
**Date:** _________________
**Signature:** _________________

---

*This document was auto-generated. Re-run \`npx tsx scripts/export-knowledge-base.ts\` to regenerate (will overwrite changes).*
`;

// Write to file
const outputPath = path.join(process.cwd(), 'KNOWLEDGE_BASE_REVIEW.md');
fs.writeFileSync(outputPath, markdown);

console.log(`✅ Knowledge base exported to: ${outputPath}`);
console.log(`   Total items: ${KNOWLEDGE_BASE.length}`);
console.log(`   Categories: ${categories.size}`);
console.log(`\n📋 Open this file in your editor to review and check off items.`);
