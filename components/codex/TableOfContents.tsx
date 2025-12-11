"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { List, ChevronRight, Clock } from "lucide-react";

interface TableOfContentsProps {
  content: string;
}

interface TocItem {
  id: string;
  text: string;
  level: number;
  wordCount: number;
  readTime: string;
}

// Average reading speed for technical/legal content (words per minute)
const WORDS_PER_MINUTE = 180;

export function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>("");
  const tocRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  const tocItems = useMemo(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    const matches: { level: number; text: string; index: number }[] = [];
    let match;

    // First pass: collect all headings with their positions
    while ((match = headingRegex.exec(content)) !== null) {
      matches.push({
        level: match[1].length,
        text: match[2],
        index: match.index,
      });
    }

    // Second pass: calculate word count for each section
    for (let i = 0; i < matches.length; i++) {
      const currentMatch = matches[i];
      const nextMatch = matches[i + 1];

      // Get content between this heading and the next (or end of content)
      const sectionStart = currentMatch.index;
      const sectionEnd = nextMatch ? nextMatch.index : content.length;
      const sectionContent = content.slice(sectionStart, sectionEnd);

      // Count words (excluding markdown syntax)
      const cleanContent = sectionContent
        .replace(/^#{1,6}\s+.+$/gm, "") // Remove headings
        .replace(/[*_`#\[\]()]/g, "") // Remove markdown syntax
        .replace(/\n+/g, " ") // Replace newlines with spaces
        .trim();

      const wordCount = cleanContent.split(/\s+/).filter(word => word.length > 0).length;
      const readTimeMinutes = Math.ceil(wordCount / WORDS_PER_MINUTE);

      // Format read time
      let readTime: string;
      if (readTimeMinutes < 1) {
        readTime = "<1 min";
      } else if (readTimeMinutes === 1) {
        readTime = "1 min";
      } else {
        readTime = `${readTimeMinutes} min`;
      }

      items.push({
        id: slugify(currentMatch.text),
        text: currentMatch.text,
        level: currentMatch.level,
        wordCount,
        readTime,
      });
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

  // Auto-scroll TOC to keep active item visible
  useEffect(() => {
    if (activeButtonRef.current && tocRef.current) {
      const button = activeButtonRef.current;
      const container = tocRef.current;
      const buttonTop = button.offsetTop;
      const containerHeight = container.clientHeight;
      const scrollTop = container.scrollTop;

      // If button is outside visible area, scroll to center it
      if (buttonTop < scrollTop + 50 || buttonTop > scrollTop + containerHeight - 100) {
        container.scrollTo({
          top: buttonTop - containerHeight / 3,
          behavior: "smooth",
        });
      }
    }
  }, [activeId]);

  if (tocItems.length === 0) {
    return null;
  }

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Calculate total read time
  const totalReadTime = useMemo(() => {
    const totalWords = tocItems.reduce((sum, item) => sum + item.wordCount, 0);
    const minutes = Math.ceil(totalWords / WORDS_PER_MINUTE);
    return minutes;
  }, [tocItems]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-slate-800 flex items-center gap-2 text-sm">
            <List className="h-4 w-4 text-tiffany-600" />
            Contents
          </h4>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {totalReadTime} min read
          </span>
        </div>
        {/* Progress bar in header */}
        <div className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-tiffany-400 to-tiffany-600 rounded-full transition-all duration-300"
            style={{
              width: `${activeId ? ((tocItems.findIndex(item => item.id === activeId) + 1) / tocItems.length * 100) : 0}%`
            }}
          />
        </div>
      </div>

      {/* Navigation - compact scrollable list */}
      <nav
        ref={tocRef}
        className="max-h-[calc(100vh-20rem)] overflow-y-auto py-2 scroll-smooth"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#e2e8f0 transparent" }}
      >
        {tocItems.map((item) => {
          const isActive = activeId === item.id;
          return (
            <button
              key={item.id}
              ref={isActive ? activeButtonRef : null}
              onClick={() => scrollToSection(item.id)}
              className={`
                w-full text-left py-1.5 px-4 transition-all duration-150
                flex items-center gap-2 group text-[13px]
                ${item.level === 1 ? "font-medium" : ""}
                ${item.level === 2 ? "pl-7" : ""}
                ${item.level === 3 ? "pl-10 text-xs" : ""}
                ${
                  isActive
                    ? "bg-tiffany-50 text-tiffany-700 border-l-2 border-tiffany-500"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-800 border-l-2 border-transparent"
                }
              `}
            >
              <ChevronRight
                className={`h-3 w-3 shrink-0 transition-transform duration-150 ${
                  isActive ? "rotate-90 text-tiffany-600" : "text-slate-400 group-hover:text-slate-500"
                }`}
              />
              <span className="line-clamp-1 flex-1">{item.text}</span>
              {item.level <= 2 && item.wordCount > 50 && (
                <span className={`text-[10px] shrink-0 ${isActive ? "text-tiffany-500" : "text-slate-400"}`}>
                  {item.readTime}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer with section count */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 text-center">
        Section {activeId ? tocItems.findIndex(item => item.id === activeId) + 1 : 0} of {tocItems.length}
      </div>
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
