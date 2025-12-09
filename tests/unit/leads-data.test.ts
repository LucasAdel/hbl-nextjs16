import { describe, it, expect } from 'vitest';
import {
  sampleLeads,
  statusLabels,
  statusColors,
  sourceLabels,
  getLeadsByStatus,
  getLeadStats,
  type LeadStatus,
  type LeadSource,
} from '@/lib/leads-data';

describe('leads-data', () => {
  describe('sampleLeads', () => {
    it('should have sample leads', () => {
      expect(sampleLeads.length).toBeGreaterThan(0);
    });

    it('should have valid lead structure', () => {
      const lead = sampleLeads[0];
      expect(lead).toHaveProperty('id');
      expect(lead).toHaveProperty('name');
      expect(lead).toHaveProperty('email');
      expect(lead).toHaveProperty('source');
      expect(lead).toHaveProperty('status');
      expect(lead).toHaveProperty('createdAt');
      expect(lead).toHaveProperty('updatedAt');
    });

    it('should have valid email format', () => {
      sampleLeads.forEach((lead) => {
        expect(lead.email).toMatch(/@/);
      });
    });
  });

  describe('statusLabels', () => {
    it('should have all status labels', () => {
      const expectedStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost'];
      expectedStatuses.forEach((status) => {
        expect(statusLabels[status]).toBeDefined();
        expect(typeof statusLabels[status]).toBe('string');
      });
    });
  });

  describe('statusColors', () => {
    it('should have colors for all statuses', () => {
      const expectedStatuses: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost'];
      expectedStatuses.forEach((status) => {
        expect(statusColors[status]).toBeDefined();
        expect(statusColors[status].bg).toBeDefined();
        expect(statusColors[status].text).toBeDefined();
      });
    });
  });

  describe('sourceLabels', () => {
    it('should have all source labels', () => {
      const expectedSources: LeadSource[] = ['website', 'referral', 'phone', 'social', 'other'];
      expectedSources.forEach((source) => {
        expect(sourceLabels[source]).toBeDefined();
        expect(typeof sourceLabels[source]).toBe('string');
      });
    });
  });

  describe('getLeadsByStatus', () => {
    it('should return leads with specific status', () => {
      const status: LeadStatus = 'new';
      const leads = getLeadsByStatus(status);
      leads.forEach((lead) => {
        expect(lead.status).toBe(status);
      });
    });

    it('should return correct count for converted status', () => {
      const converted = getLeadsByStatus('converted');
      const expected = sampleLeads.filter((l) => l.status === 'converted');
      expect(converted.length).toBe(expected.length);
    });
  });

  describe('getLeadStats', () => {
    it('should return correct total count', () => {
      const stats = getLeadStats();
      expect(stats.total).toBe(sampleLeads.length);
    });

    it('should return all required stat fields', () => {
      const stats = getLeadStats();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('new');
      expect(stats).toHaveProperty('contacted');
      expect(stats).toHaveProperty('qualified');
      expect(stats).toHaveProperty('converted');
      expect(stats).toHaveProperty('lost');
      expect(stats).toHaveProperty('totalValue');
      expect(stats).toHaveProperty('convertedValue');
    });

    it('should calculate total value correctly', () => {
      const stats = getLeadStats();
      const expectedValue = sampleLeads.reduce((sum, lead) => sum + (lead.value || 0), 0);
      expect(stats.totalValue).toBe(expectedValue);
    });

    it('should calculate converted value correctly', () => {
      const stats = getLeadStats();
      const expectedValue = sampleLeads
        .filter((l) => l.status === 'converted')
        .reduce((sum, lead) => sum + (lead.value || 0), 0);
      expect(stats.convertedValue).toBe(expectedValue);
    });

    it('should have consistent status counts', () => {
      const stats = getLeadStats();
      const sumOfStatuses = stats.new + stats.contacted + stats.qualified + stats.converted + stats.lost;
      expect(sumOfStatuses).toBe(stats.total);
    });
  });
});
