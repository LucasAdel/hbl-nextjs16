import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Tag,
  Share2,
  Linkedin,
  Twitter,
  Facebook,
  Mail,
  ChevronRight,
} from "lucide-react";
import { blogPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog-data";
import ReactMarkdown from "react-markdown";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Article Not Found",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(slug);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-16 md:py-24">
        <div className="absolute inset-0 bg-[url('/images/pattern-grid.svg')] opacity-5" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Resources
          </Link>

          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-3 text-sm mb-6">
            <span className="px-3 py-1 bg-tiffany/20 text-tiffany rounded-full font-medium">
              {post.category}
            </span>
            <span className="text-gray-400 flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {new Date(post.publishedAt).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="text-gray-400 flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {post.readTime} min read
            </span>
          </div>

          {/* Title */}
          <h1 className="font-blair text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
            {post.title}
          </h1>

          {/* Excerpt */}
          <p className="text-xl text-gray-300 mb-8">{post.excerpt}</p>

          {/* Author */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-tiffany/20 rounded-full flex items-center justify-center">
              <User className="h-7 w-7 text-tiffany" />
            </div>
            <div>
              <p className="font-semibold text-white">{post.author.name}</p>
              <p className="text-gray-400">{post.author.role}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_280px] gap-12">
            {/* Main Content */}
            <article className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12">
              <div className="prose prose-lg max-w-none prose-headings:font-blair prose-headings:text-gray-900 prose-p:text-gray-600 prose-a:text-tiffany prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-li:text-gray-600">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>

              {/* Tags */}
              <div className="mt-12 pt-8 border-t">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="mt-8 pt-8 border-t">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Share2 className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600 font-medium">Share this article</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://hamiltonbailey.com/resources/${post.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-100 hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="h-5 w-5 text-gray-600 hover:text-blue-600" />
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(`https://hamiltonbailey.com/resources/${post.slug}`)}&text=${encodeURIComponent(post.title)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-100 hover:bg-sky-100 rounded-full flex items-center justify-center transition-colors"
                      aria-label="Share on Twitter"
                    >
                      <Twitter className="h-5 w-5 text-gray-600 hover:text-sky-500" />
                    </a>
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`https://hamiltonbailey.com/resources/${post.slug}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-100 hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors"
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="h-5 w-5 text-gray-600 hover:text-blue-700" />
                    </a>
                    <a
                      href={`mailto:?subject=${encodeURIComponent(post.title)}&body=${encodeURIComponent(`Check out this article: https://hamiltonbailey.com/resources/${post.slug}`)}`}
                      className="w-10 h-10 bg-gray-100 hover:bg-tiffany/10 rounded-full flex items-center justify-center transition-colors"
                      aria-label="Share via Email"
                    >
                      <Mail className="h-5 w-5 text-gray-600 hover:text-tiffany" />
                    </a>
                  </div>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Author Card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-blair text-lg font-bold text-gray-900 mb-4">About the Author</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-tiffany/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-tiffany" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{post.author.name}</p>
                    <p className="text-sm text-gray-600">{post.author.role}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Expert in healthcare law with extensive experience advising medical practitioners
                  across Australia.
                </p>
              </div>

              {/* CTA Card */}
              <div className="bg-gradient-to-br from-tiffany to-tiffany-dark rounded-xl p-6 text-white">
                <h3 className="font-blair text-lg font-bold mb-3">Need Legal Advice?</h3>
                <p className="text-white/90 text-sm mb-4">
                  Book a consultation with our team to discuss your specific needs.
                </p>
                <Link
                  href="/book-appointment"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white text-tiffany-dark rounded-lg font-medium text-sm hover:bg-gray-100 transition-colors"
                >
                  Book Consultation
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-blair text-2xl md:text-3xl font-bold text-gray-900 mb-8">
              Related Articles
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost.slug}
                  className="group bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <span className="px-2 py-1 bg-white rounded-md font-medium">
                        {relatedPost.category}
                      </span>
                      <span>•</span>
                      <span>{relatedPost.readTime} min read</span>
                    </div>
                    <h3 className="font-blair text-lg font-bold text-gray-900 mb-2 group-hover:text-tiffany transition-colors line-clamp-2">
                      <Link href={`/resources/${relatedPost.slug}`}>{relatedPost.title}</Link>
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{relatedPost.excerpt}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Back to Resources */}
      <section className="py-8 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Link
            href="/resources"
            className="inline-flex items-center gap-2 text-tiffany font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            View All Resources
          </Link>
        </div>
      </section>
    </div>
  );
}
