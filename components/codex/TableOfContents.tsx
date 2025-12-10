"use client";

import { useMemo, useState, useEffect } from "react";
import { List, ChevronRight } from "lucide-react";

interface TableOfContentsProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");

  const tocItems = useMemo(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      const id = slugify(text);
      items.push({ id, text, level });
    }

    return items;
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-100px 0px -80% 0px",
      }
    );

    tocItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [tocItems]);

  if (tocItems.length === 0) {
    return null;
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
      <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <List className="h-5 w-5 text-tiffany-600" />
        Table of Contents
      </h4>
      <nav className="space-y-1">
        {tocItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={`
              w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors
              flex items-center gap-2
              ${item.level === 1 ? "font-medium" : ""}
              ${item.level === 2 ? "ml-3" : ""}
              ${item.level === 3 ? "ml-6 text-xs" : ""}
              ${
                activeId === item.id
                  ? "bg-tiffany-100 dark:bg-tiffany-900/30 text-tiffany-700 dark:text-tiffany-300"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
              }
            `}
          >
            <ChevronRight
              className={`h-3 w-3 shrink-0 transition-transform ${
                activeId === item.id ? "rotate-90 text-tiffany-600" : ""
              }`}
            />
            <span className="line-clamp-2">{item.text}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}
