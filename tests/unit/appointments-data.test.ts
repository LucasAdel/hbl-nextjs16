import { describe, it, expect } from 'vitest';
import {
  sampleAppointments,
  statusLabels,
  statusColors,
  typeLabels,
  getAppointmentsByDate,
  getAppointmentsByStatus,
  getUpcomingAppointments,
  getAppointmentStats,
  getAppointmentsForWeek,
  type AppointmentStatus,
  type AppointmentType,
} from '@/lib/appointments-data';

describe('appointments-data', () => {
  describe('sampleAppointments', () => {
    it('should have sample appointments', () => {
      expect(sampleAppointments.length).toBeGreaterThan(0);
    });

    it('should have valid appointment structure', () => {
      const appointment = sampleAppointments[0];
      expect(appointment).toHaveProperty('id');
      expect(appointment).toHaveProperty('clientId');
      expect(appointment).toHaveProperty('clientName');
      expect(appointment).toHaveProperty('clientEmail');
      expect(appointment).toHaveProperty('type');
      expect(appointment).toHaveProperty('status');
      expect(appointment).toHaveProperty('service');
      expect(appointment).toHaveProperty('date');
      expect(appointment).toHaveProperty('time');
      expect(appointment).toHaveProperty('duration');
      expect(appointment).toHaveProperty('assignedTo');
      expect(appointment).toHaveProperty('createdAt');
      expect(appointment).toHaveProperty('updatedAt');
    });

    it('should have valid date format', () => {
      sampleAppointments.forEach((apt) => {
        expect(apt.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      });
    });

    it('should have valid time format', () => {
      sampleAppointments.forEach((apt) => {
        expect(apt.time).toMatch(/^\d{2}:\d{2}$/);
      });
    });
  });

  describe('statusLabels', () => {
    it('should have all status labels', () => {
      const expectedStatuses: AppointmentStatus[] = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
      expectedStatuses.forEach((status) => {
        expect(statusLabels[status]).toBeDefined();
        expect(typeof statusLabels[status]).toBe('string');
      });
    });
  });

  describe('statusColors', () => {
    it('should have colors for all statuses', () => {
      const expectedStatuses: AppointmentStatus[] = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'];
      expectedStatuses.forEach((status) => {
        expect(statusColors[status]).toBeDefined();
        expect(statusColors[status].bg).toBeDefined();
        expect(statusColors[status].text).toBeDefined();
      });
    });
  });

  describe('typeLabels', () => {
    it('should have all type labels', () => {
      const expectedTypes: AppointmentType[] = ['consultation', 'follow-up', 'document-review', 'phone-call', 'video-call'];
      expectedTypes.forEach((type) => {
        expect(typeLabels[type]).toBeDefined();
        expect(typeof typeLabels[type]).toBe('string');
      });
    });
  });

  describe('getAppointmentsByDate', () => {
    it('should return appointments for a specific date', () => {
      const date = sampleAppointments[0].date;
      const appointments = getAppointmentsByDate(date);
      expect(appointments.length).toBeGreaterThan(0);
      appointments.forEach((apt) => {
        expect(apt.date).toBe(date);
      });
    });

    it('should return empty array for date with no appointments', () => {
      const appointments = getAppointmentsByDate('1999-01-01');
      expect(appointments).toEqual([]);
    });
  });

  describe('getAppointmentsByStatus', () => {
    it('should return appointments with specific status', () => {
      const status: AppointmentStatus = 'confirmed';
      const appointments = getAppointmentsByStatus(status);
      appointments.forEach((apt) => {
        expect(apt.status).toBe(status);
      });
    });

    it('should return correct count for completed status', () => {
      const completed = getAppointmentsByStatus('completed');
      const expected = sampleAppointments.filter((a) => a.status === 'completed');
      expect(completed.length).toBe(expected.length);
    });
  });

  describe('getUpcomingAppointments', () => {
    it('should not include cancelled appointments', () => {
      const upcoming = getUpcomingAppointments();
      upcoming.forEach((apt) => {
        expect(apt.status).not.toBe('cancelled');
      });
    });

    it('should be sorted by date and time', () => {
      const upcoming = getUpcomingAppointments();
      for (let i = 1; i < upcoming.length; i++) {
        const prev = `${upcoming[i - 1].date}T${upcoming[i - 1].time}`;
        const curr = `${upcoming[i].date}T${upcoming[i].time}`;
        expect(prev <= curr).toBe(true);
      }
    });
  });

  describe('getAppointmentStats', () => {
    it('should return correct total count', () => {
      const stats = getAppointmentStats();
      expect(stats.total).toBe(sampleAppointments.length);
    });

    it('should return all required stat fields', () => {
      const stats = getAppointmentStats();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('upcoming');
      expect(stats).toHaveProperty('todayCount');
      expect(stats).toHaveProperty('completed');
      expect(stats).toHaveProperty('cancelled');
      expect(stats).toHaveProperty('noShow');
      expect(stats).toHaveProperty('thisWeekRevenue');
      expect(stats).toHaveProperty('totalRevenue');
    });

    it('should calculate total revenue correctly', () => {
      const stats = getAppointmentStats();
      const expectedRevenue = sampleAppointments
        .filter((apt) => apt.status === 'completed')
        .reduce((sum, apt) => sum + (apt.amount || 0), 0);
      expect(stats.totalRevenue).toBe(expectedRevenue);
    });
  });

  describe('getAppointmentsForWeek', () => {
    it('should return appointments within the week range', () => {
      const startDate = new Date('2024-12-09');
      const appointments = getAppointmentsForWeek(startDate);

      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      appointments.forEach((apt) => {
        const aptDate = new Date(apt.date);
        expect(aptDate >= startDate).toBe(true);
        expect(aptDate <= endDate).toBe(true);
      });
    });
  });
});
