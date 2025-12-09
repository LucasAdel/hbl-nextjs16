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

    return sections.map((section, index) => {
      // Handle headings
      if (section.startsWith("### ")) {
        return (
          <h3
            key={index}
            id={slugify(section.replace("### ", ""))}
            className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-4 scroll-mt-24"
          >
            {section.replace("### ", "")}
          </h3>
        );
      }
      if (section.startsWith("## ")) {
        return (
          <h2
            key={index}
            id={slugify(section.replace("## ", ""))}
            className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4 scroll-mt-24"
          >
            {section.replace("## ", "")}
          </h2>
        );
      }
      if (section.startsWith("# ")) {
        return (
          <h1
            key={index}
            id={slugify(section.replace("# ", ""))}
            className="text-3xl font-bold text-slate-900 dark:text-white mt-12 mb-6 scroll-mt-24"
          >
            {section.replace("# ", "")}
          </h1>
        );
      }

      // Handle bullet lists
      if (section.includes("\n- ") || section.startsWith("- ")) {
        const items = section.split("\n").filter(line => line.startsWith("- "));
        return (
          <ul key={index} className="list-disc list-inside space-y-2 my-4 text-slate-700 dark:text-slate-300">
            {items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {renderInlineFormatting(item.replace("- ", ""))}
              </li>
            ))}
          </ul>
        );
      }

      // Handle numbered lists
      if (section.match(/^\d+\./m)) {
        const items = section.split("\n").filter(line => line.match(/^\d+\./));
        return (
          <ol key={index} className="list-decimal list-inside space-y-2 my-4 text-slate-700 dark:text-slate-300">
            {items.map((item, i) => (
              <li key={i} className="leading-relaxed">
                {renderInlineFormatting(item.replace(/^\d+\.\s*/, ""))}
              </li>
            ))}
          </ol>
        );
      }

      // Handle blockquotes
      if (section.startsWith("> ")) {
        return (
          <blockquote
            key={index}
            className="border-l-4 border-tiffany-500 pl-4 py-2 my-6 italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-r-lg"
          >
            {renderInlineFormatting(section.replace(/^>\s*/gm, ""))}
          </blockquote>
        );
      }

      // Handle code blocks
      if (section.startsWith("```")) {
        const code = section.replace(/```\w*\n?/g, "").trim();
        return (
          <pre
            key={index}
            className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-lg p-4 my-6 overflow-x-auto text-sm"
          >
            <code>{code}</code>
          </pre>
        );
      }

      // Handle horizontal rules
      if (section === "---" || section === "***") {
        return <hr key={index} className="my-8 border-slate-200 dark:border-slate-700" />;
      }

      // Default paragraph
      return (
        <p key={index} className="text-slate-700 dark:text-slate-300 leading-relaxed my-4">
          {renderInlineFormatting(section)}
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
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
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
              className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-tiffany-600 dark:text-tiffany-400 rounded text-sm font-mono"
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
            className="text-tiffany-600 hover:text-tiffany-700 underline underline-offset-2"
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
