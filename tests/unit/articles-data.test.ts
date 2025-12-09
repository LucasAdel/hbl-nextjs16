import { describe, it, expect } from 'vitest';
import {
  articles,
  getArticleBySlug,
  getArticlesByCategory,
  getFeaturedArticles,
  getRelatedArticles,
  getAllArticleSlugs,
  searchArticles,
  categoryLabels,
} from '@/lib/articles-data';

describe('Articles Data', () => {
  describe('articles array', () => {
    it('should have articles', () => {
      expect(articles.length).toBeGreaterThan(0);
    });

    it('should have required fields for each article', () => {
      articles.forEach((article) => {
        expect(article.id).toBeDefined();
        expect(article.slug).toBeDefined();
        expect(article.title).toBeDefined();
        expect(article.excerpt).toBeDefined();
        expect(article.content).toBeDefined();
        expect(article.category).toBeDefined();
        expect(article.author).toBeDefined();
        expect(article.author.name).toBeDefined();
        expect(article.publishedAt).toBeDefined();
        expect(article.readTime).toBeGreaterThan(0);
        expect(article.tags).toBeInstanceOf(Array);
      });
    });

    it('should have valid categories', () => {
      const validCategories = Object.keys(categoryLabels);
      articles.forEach((article) => {
        expect(validCategories).toContain(article.category);
      });
    });
  });

  describe('getArticleBySlug', () => {
    it('should return article for valid slug', () => {
      const article = getArticleBySlug('understanding-tenant-doctor-agreements');
      expect(article).toBeDefined();
      expect(article?.slug).toBe('understanding-tenant-doctor-agreements');
    });

    it('should return undefined for invalid slug', () => {
      const article = getArticleBySlug('invalid-article');
      expect(article).toBeUndefined();
    });
  });

  describe('getArticlesByCategory', () => {
    it('should return articles for valid category', () => {
      const propertyArticles = getArticlesByCategory('property');
      expect(propertyArticles.length).toBeGreaterThan(0);
      expect(propertyArticles.every((a) => a.category === 'property')).toBe(true);
    });
  });

  describe('getFeaturedArticles', () => {
    it('should return only featured articles', () => {
      const featured = getFeaturedArticles();
      expect(featured.length).toBeGreaterThan(0);
      expect(featured.every((a) => a.featured)).toBe(true);
    });
  });

  describe('getRelatedArticles', () => {
    it('should return related articles', () => {
      const related = getRelatedArticles('understanding-tenant-doctor-agreements');
      expect(related.length).toBeGreaterThan(0);
      expect(related.every((a) => a.slug !== 'understanding-tenant-doctor-agreements')).toBe(true);
    });

    it('should limit results', () => {
      const related = getRelatedArticles('understanding-tenant-doctor-agreements', 2);
      expect(related.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getAllArticleSlugs', () => {
    it('should return all article slugs', () => {
      const slugs = getAllArticleSlugs();
      expect(slugs.length).toBe(articles.length);
    });
  });

  describe('searchArticles', () => {
    it('should find articles by title', () => {
      const results = searchArticles('tenant doctor');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should find articles by tag', () => {
      const results = searchArticles('ahpra');
      expect(results.length).toBeGreaterThan(0);
    });

    it('should return empty for no matches', () => {
      const results = searchArticles('xyznonexistent');
      expect(results.length).toBe(0);
    });
  });
});
