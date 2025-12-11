/**
 * PDF Generation Script for Legal Resources
 *
 * This script converts the HTML legal resource templates to PDFs using Puppeteer.
 *
 * Usage:
 *   npx ts-node scripts/generate-legal-resource-pdfs.ts
 *
 * Or with tsx:
 *   npx tsx scripts/generate-legal-resource-pdfs.ts
 *
 * Prerequisites:
 *   npm install puppeteer
 */

import puppeteer from "puppeteer";
import path from "path";
import fs from "fs";

const DOCUMENTS_DIR = path.join(process.cwd(), "public/documents/legal-resources");

const DOCUMENTS = [
  {
    html: "practice-compliance-checklist.html",
    pdf: "practice-compliance-checklist.pdf",
    title: "Practice Compliance Checklist",
  },
  {
    html: "employment-contract-essentials.html",
    pdf: "employment-contract-essentials.pdf",
    title: "Employment Contract Essentials Guide",
  },
  {
    html: "medical-practice-structure-overview.html",
    pdf: "medical-practice-structure-overview.pdf",
    title: "Medical Practice Structure Overview",
  },
];

async function generatePDFs() {
  console.log("🚀 Starting PDF generation...\n");

  // Launch browser
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    for (const doc of DOCUMENTS) {
      const htmlPath = path.join(DOCUMENTS_DIR, doc.html);
      const pdfPath = path.join(DOCUMENTS_DIR, doc.pdf);

      // Check if HTML file exists
      if (!fs.existsSync(htmlPath)) {
        console.log(`❌ HTML file not found: ${doc.html}`);
        continue;
      }

      console.log(`📄 Generating: ${doc.title}`);
      console.log(`   Source: ${doc.html}`);
      console.log(`   Output: ${doc.pdf}`);

      const page = await browser.newPage();

      // Load the HTML file
      const htmlContent = fs.readFileSync(htmlPath, "utf-8");
      await page.setContent(htmlContent, {
        waitUntil: "networkidle0",
      });

      // Generate PDF with professional settings
      await page.pdf({
        path: pdfPath,
        format: "A4",
        printBackground: true,
        margin: {
          top: "20mm",
          right: "15mm",
          bottom: "25mm",
          left: "15mm",
        },
        displayHeaderFooter: true,
        headerTemplate: `
          <div style="font-size: 8px; color: #999; width: 100%; text-align: center; padding: 5px 0;">
            Hamilton Bailey Law — Medical Practice Law Specialists
          </div>
        `,
        footerTemplate: `
          <div style="font-size: 8px; color: #999; width: 100%; display: flex; justify-content: space-between; padding: 5px 15mm;">
            <span>© ${new Date().getFullYear()} Hamilton Bailey. All rights reserved.</span>
            <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
          </div>
        `,
      });

      await page.close();

      // Get file size
      const stats = fs.statSync(pdfPath);
      const fileSizeKB = Math.round(stats.size / 1024);

      console.log(`   ✅ Generated successfully (${fileSizeKB} KB)\n`);
    }

    console.log("🎉 All PDFs generated successfully!\n");
    console.log("Files are located at:");
    console.log(`   ${DOCUMENTS_DIR}/\n`);
  } catch (error) {
    console.error("❌ Error generating PDFs:", error);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

// Run the script
generatePDFs();
