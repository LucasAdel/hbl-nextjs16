import { describe, it, expect } from 'vitest';
import {
  services,
  getServiceBySlug,
  getRelatedServices,
  getAllServiceSlugs,
} from '@/lib/services-data';

describe('Services Data', () => {
  describe('services array', () => {
    it('should have at least 6 services', () => {
      expect(services.length).toBeGreaterThanOrEqual(6);
    });

    it('should have required fields for each service', () => {
      services.forEach((service) => {
        expect(service.id).toBeDefined();
        expect(service.title).toBeDefined();
        expect(service.shortDescription).toBeDefined();
        expect(service.fullDescription).toBeDefined();
        expect(service.icon).toBeDefined();
        expect(service.features).toBeInstanceOf(Array);
        expect(service.features.length).toBeGreaterThan(0);
        expect(service.benefits).toBeInstanceOf(Array);
        expect(service.faqs).toBeInstanceOf(Array);
        expect(service.relatedServices).toBeInstanceOf(Array);
      });
    });
  });

  describe('getServiceBySlug', () => {
    it('should return service for valid slug', () => {
      const service = getServiceBySlug('practice-setup');
      expect(service).toBeDefined();
      expect(service?.id).toBe('practice-setup');
      expect(service?.title).toBe('Practice Setup & Structuring');
    });

    it('should return undefined for invalid slug', () => {
      const service = getServiceBySlug('invalid-service');
      expect(service).toBeUndefined();
    });
  });

  describe('getRelatedServices', () => {
    it('should return related services', () => {
      const related = getRelatedServices('practice-setup');
      expect(related.length).toBeGreaterThan(0);
      expect(related.every((s) => s.id !== 'practice-setup')).toBe(true);
    });

    it('should return empty array for invalid service', () => {
      const related = getRelatedServices('invalid-service');
      expect(related).toEqual([]);
    });
  });

  describe('getAllServiceSlugs', () => {
    it('should return all service slugs', () => {
      const slugs = getAllServiceSlugs();
      expect(slugs.length).toBe(services.length);
      expect(slugs.includes('practice-setup')).toBe(true);
      expect(slugs.includes('regulatory-compliance')).toBe(true);
    });
  });
});
