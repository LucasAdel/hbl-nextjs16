"use client";

import { useMemo } from "react";

interface ArticleContentProps {
  content: string;
}

export function ArticleContent({ content }: ArticleContentProps) {
  // Simple markdown-like rendering for the content
  // In production, you'd use a proper markdown library like react-markdown or MDX
  const renderedContent = useMemo(() => {
    // Split content into paragraphs and sections
    const sections = content.split("\n\n").filter(Boolean);

    // Track if we've seen the first H1 (skip it as it duplicates the page title)
    let skippedFirstH1 = false;

    return sections.map((section, index) => {
      // Trim the section for consistent matching
      const trimmedSection = section.trim();

      // Handle checklist headings FIRST (### Title - item1 - item2 format)
      // Must check before regular ### heading to catch these patterns
      if (trimmedSection.startsWith("### ") && trimmedSection.includes(" - ")) {
        const parts = trimmedSection.split(" - ");
        const title = parts[0].replace("### ", "").trim();
        const items = parts.slice(1);

        if (items.length > 0) {
          return (
            <div key={index} className="my-8">
              <h3
                id={slugify(title)}
                className="text-lg font-bold text-slate-900 mb-4 scroll-mt-28"
              >
                {title}
              </h3>
              <ul className="space-y-2">
                {items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700">
                    <span className="w-5 h-5 rounded bg-tiffany-50 border border-tiffany-200 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-tiffany-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-sm">{renderInlineFormatting(item.trim())}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
      }

      // Handle headings
      if (trimmedSection.startsWith("### ")) {
        return (
          <h3
            key={index}
            id={slugify(trimmedSection.replace("### ", ""))}
            className="text-xl font-bold text-slate-900 mt-10 mb-4 scroll-mt-28 border-b border-slate-100 pb-2"
          >
            {trimmedSection.replace("### ", "")}
          </h3>
        );
      }
      if (trimmedSection.startsWith("## ")) {
        return (
          <h2
            key={index}
            id={slugify(trimmedSection.replace("## ", ""))}
            className="text-2xl font-bold text-slate-900 mt-12 mb-5 scroll-mt-28 border-b border-slate-200 pb-3"
          >
            {trimmedSection.replace("## ", "")}
          </h2>
        );
      }
      if (trimmedSection.startsWith("# ")) {
        // Skip the first H1 as it duplicates the page title
        if (!skippedFirstH1) {
          skippedFirstH1 = true;
          return null;
        }
        return (
          <h1
            key={index}
            id={slugify(trimmedSection.replace("# ", ""))}
            className="text-3xl font-bold text-slate-900 mt-14 mb-6 scroll-mt-28"
          >
            {trimmedSection.replace("# ", "")}
          </h1>
        );
      }

      // Handle markdown tables (multi-line format)
      if (trimmedSection.includes("|") && trimmedSection.split("\n").length > 1) {
        const lines = trimmedSection.split("\n").filter(line => line.trim());
        // Check if this looks like a table (has header row and separator row with dashes)
        if (lines.length >= 2 && lines[0].includes("|") && lines[1].match(/^\|?[\s-|]+\|?$/)) {
          return renderTable(lines, index);
        }
      }

      // Handle single-line markdown tables (all on one line)
      // Pattern: | Header1 | Header2 | |---|---| | Cell1 | Cell2 |
      if (trimmedSection.includes("|") && trimmedSection.includes("---") && !trimmedSection.includes("\n")) {
        // Try to parse as single-line table
        const tableMatch = trimmedSection.match(/\|([^|]+\|)+\s*\|[\s-|]+\|\s*(\|[^|]+)+\|?/);
        if (tableMatch) {
          return renderSingleLineTable(trimmedSection, index);
        }
      }

      // Handle bullet lists
      if (trimmedSection.includes("\n- ") || trimmedSection.startsWith("- ")) {
        const items = trimmedSection.split("\n").filter(line => line.startsWith("- "));
        return (
          <ul key={index} className="list-none space-y-3 my-6 pl-0">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-tiffany-500 mt-2.5 shrink-0" />
                <span>{renderInlineFormatting(item.replace("- ", ""))}</span>
              </li>
            ))}
          </ul>
        );
      }

      // Handle numbered lists
      if (trimmedSection.match(/^\d+\./m)) {
        const items = trimmedSection.split("\n").filter(line => line.match(/^\d+\./));
        return (
          <ol key={index} className="list-none space-y-3 my-6 pl-0 counter-reset-list">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-slate-700 leading-relaxed">
                <span className="w-6 h-6 rounded-full bg-tiffany-50 border border-tiffany-200 text-tiffany-700 text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{renderInlineFormatting(item.replace(/^\d+\.\s*/, ""))}</span>
              </li>
            ))}
          </ol>
        );
      }

      // Handle blockquotes
      if (trimmedSection.startsWith("> ")) {
        return (
          <blockquote
            key={index}
            className="border-l-4 border-tiffany-400 pl-5 py-4 my-8 text-slate-600 bg-gradient-to-r from-tiffany-50/50 to-transparent rounded-r-lg"
          >
            <p className="italic leading-relaxed">
              {renderInlineFormatting(trimmedSection.replace(/^>\s*/gm, ""))}
            </p>
          </blockquote>
        );
      }

      // Handle code blocks
      if (trimmedSection.startsWith("```")) {
        const code = trimmedSection.replace(/```\w*\n?/g, "").trim();
        return (
          <pre
            key={index}
            className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl p-5 my-8 overflow-x-auto text-sm font-mono border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <code>{code}</code>
          </pre>
        );
      }

      // Handle horizontal rules
      if (trimmedSection === "---" || trimmedSection === "***") {
        return <hr key={index} className="my-10 border-slate-200" />;
      }

      // Default paragraph
      return (
        <p key={index} className="text-slate-700 leading-[1.8] my-5 text-[17px]">
          {renderInlineFormatting(trimmedSection)}
        </p>
      );
    });
  }, [content]);

  return <div className="article-content">{renderedContent}</div>;
}

function renderInlineFormatting(text: string): React.ReactNode {
  // Handle bold text
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    // Handle inline code
    if (part.includes("`")) {
      const codeParts = part.split(/(`[^`]+`)/g);
      return codeParts.map((codePart, j) => {
        if (codePart.startsWith("`") && codePart.endsWith("`")) {
          return (
            <code
              key={`${i}-${j}`}
              className="px-2 py-1 bg-slate-100 text-tiffany-700 rounded-md text-sm font-mono border border-slate-200"
            >
              {codePart.slice(1, -1)}
            </code>
          );
        }
        return codePart;
      });
    }

    // Handle links
    if (part.includes("[") && part.includes("](")) {
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      const elements: React.ReactNode[] = [];
      let lastIndex = 0;

      while ((match = linkRegex.exec(part)) !== null) {
        if (match.index > lastIndex) {
          elements.push(part.slice(lastIndex, match.index));
        }
        elements.push(
          <a
            key={`link-${i}-${match.index}`}
            href={match[2]}
            className="text-tiffany-600 hover:text-tiffany-700 underline underline-offset-2 decoration-tiffany-300 hover:decoration-tiffany-500 transition-colors"
            target={match[2].startsWith("http") ? "_blank" : undefined}
            rel={match[2].startsWith("http") ? "noopener noreferrer" : undefined}
          >
            {match[1]}
          </a>
        );
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < part.length) {
        elements.push(part.slice(lastIndex));
      }

      return elements.length > 0 ? elements : part;
    }

    return part;
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function renderSingleLineTable(content: string, key: number): React.ReactNode {
  // Parse single-line table format: | H1 | H2 | |---|---| | C1 | C2 | | C3 | C4 |
  // Split by | and group into rows

  // Remove leading/trailing text and extract just the table part
  const tableContent = content.trim();

  // Split by separator pattern |---|---|
  const separatorMatch = tableContent.match(/\|[\s-]+\|[\s-|]+\|/);
  if (!separatorMatch) {
    // Not a valid table format, return as paragraph
    return (
      <p key={key} className="text-slate-700 leading-[1.8] my-5 text-[17px]">
        {content}
      </p>
    );
  }

  const separatorIndex = tableContent.indexOf(separatorMatch[0]);
  const headerPart = tableContent.substring(0, separatorIndex);
  const bodyPart = tableContent.substring(separatorIndex + separatorMatch[0].length);

  // Parse header cells
  const headerCells = headerPart
    .split("|")
    .map(cell => cell.trim())
    .filter(cell => cell);

  // Parse body cells - group into rows based on header column count
  const allBodyCells = bodyPart
    .split("|")
    .map(cell => cell.trim())
    .filter(cell => cell);

  const columnCount = headerCells.length;
  const bodyRows: string[][] = [];

  for (let i = 0; i < allBodyCells.length; i += columnCount) {
    const row = allBodyCells.slice(i, i + columnCount);
    if (row.length === columnCount) {
      bodyRows.push(row);
    }
  }

  if (headerCells.length === 0 || bodyRows.length === 0) {
    return (
      <p key={key} className="text-slate-700 leading-[1.8] my-5 text-[17px]">
        {content}
      </p>
    );
  }

  return (
    <div key={key} className="my-6 overflow-x-auto rounded-lg border border-slate-200">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-slate-50">
            {headerCells.map((cell, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-sm font-semibold text-slate-800 border-b border-slate-200"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`${rowIndex % 2 === 1 ? "bg-slate-50/50" : ""} ${rowIndex < bodyRows.length - 1 ? "border-b border-slate-100" : ""}`}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 text-sm text-slate-700"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function renderTable(lines: string[], key: number): React.ReactNode {
  // Parse table header
  const headerCells = lines[0]
    .split("|")
    .map(cell => cell.trim())
    .filter(cell => cell);

  // Parse table body (skip header and separator rows)
  const bodyRows = lines.slice(2).map(row =>
    row
      .split("|")
      .map(cell => cell.trim())
      .filter(cell => cell)
  );

  return (
    <div key={key} className="my-6 overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headerCells.map((cell, i) => (
              <th
                key={i}
                className="px-4 py-3 text-left text-sm font-semibold text-slate-800 border-r border-slate-200 last:border-r-0"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={`border-b border-slate-100 ${rowIndex % 2 === 1 ? "bg-slate-50/50" : ""}`}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-4 py-3 text-sm text-slate-700 border-r border-slate-100 last:border-r-0"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
