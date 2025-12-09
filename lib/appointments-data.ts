export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
export type AppointmentType = 'consultation' | 'follow-up' | 'document-review' | 'phone-call' | 'video-call';

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  type: AppointmentType;
  status: AppointmentStatus;
  service: string;
  date: string;
  time: string;
  duration: number; // minutes
  notes?: string;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  googleCalendarEventId?: string;
  stripePaymentId?: string;
  amount?: number;
}

export const statusLabels: Record<AppointmentStatus, string> = {
  scheduled: 'Scheduled',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  'no-show': 'No Show',
};

export const statusColors: Record<AppointmentStatus, { bg: string; text: string }> = {
  scheduled: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  confirmed: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  completed: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400' },
  cancelled: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  'no-show': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
};

export const typeLabels: Record<AppointmentType, string> = {
  consultation: 'Initial Consultation',
  'follow-up': 'Follow-up',
  'document-review': 'Document Review',
  'phone-call': 'Phone Call',
  'video-call': 'Video Call',
};

export const typeIcons: Record<AppointmentType, string> = {
  consultation: 'Users',
  'follow-up': 'RefreshCw',
  'document-review': 'FileText',
  'phone-call': 'Phone',
  'video-call': 'Video',
};

// Sample data for demonstration
export const sampleAppointments: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    clientName: 'Dr. Sarah Chen',
    clientEmail: 'sarah.chen@clinic.com.au',
    clientPhone: '0412 345 678',
    type: 'consultation',
    status: 'confirmed',
    service: 'Practice Setup & Structuring',
    date: '2024-12-09',
    time: '10:00',
    duration: 60,
    notes: 'Initial consultation for new practice setup in Adelaide CBD',
    assignedTo: 'James Wong',
    createdAt: '2024-12-06T09:00:00Z',
    updatedAt: '2024-12-06T14:00:00Z',
    amount: 350,
  },
  {
    id: '2',
    clientId: '2',
    clientName: 'Dr. James Wilson',
    clientEmail: 'j.wilson@medcentre.com',
    clientPhone: '0423 456 789',
    type: 'document-review',
    status: 'scheduled',
    service: 'Tenant Doctor Agreement',
    date: '2024-12-09',
    time: '14:00',
    duration: 45,
    notes: 'Review TDA amendments before signing',
    assignedTo: 'Sarah Mitchell',
    createdAt: '2024-12-05T14:30:00Z',
    updatedAt: '2024-12-05T14:30:00Z',
    amount: 250,
  },
  {
    id: '3',
    clientId: '3',
    clientName: 'Dr. Michelle Park',
    clientEmail: 'mpark@dermatology.com.au',
    clientPhone: '0434 567 890',
    type: 'phone-call',
    status: 'confirmed',
    service: 'Regulatory Compliance',
    date: '2024-12-10',
    time: '09:00',
    duration: 30,
    notes: 'Urgent: AHPRA notification discussion',
    assignedTo: 'James Wong',
    createdAt: '2024-12-06T08:00:00Z',
    updatedAt: '2024-12-06T10:00:00Z',
    amount: 200,
  },
  {
    id: '4',
    clientId: '4',
    clientName: 'Dr. David Thompson',
    clientEmail: 'dthompson@gp.net.au',
    clientPhone: '0445 678 901',
    type: 'follow-up',
    status: 'completed',
    service: 'Employment & HR',
    date: '2024-12-05',
    time: '11:00',
    duration: 30,
    notes: 'Contract review complete, signed off',
    assignedTo: 'Michelle Chen',
    createdAt: '2024-11-28T09:00:00Z',
    updatedAt: '2024-12-05T12:00:00Z',
    amount: 150,
  },
  {
    id: '5',
    clientId: '5',
    clientName: 'Dr. Emma Roberts',
    clientEmail: 'emma.r@specialists.com',
    clientPhone: '0456 789 012',
    type: 'video-call',
    status: 'scheduled',
    service: 'Property & Leasing',
    date: '2024-12-11',
    time: '15:30',
    duration: 45,
    notes: 'Lease negotiation strategy session',
    assignedTo: 'Sarah Mitchell',
    createdAt: '2024-12-06T07:30:00Z',
    updatedAt: '2024-12-06T07:30:00Z',
    amount: 280,
  },
  {
    id: '6',
    clientId: '6',
    clientName: 'Dr. Andrew Kim',
    clientEmail: 'akim@ortho.com.au',
    type: 'consultation',
    status: 'cancelled',
    service: 'Dispute Resolution',
    date: '2024-12-04',
    time: '13:00',
    duration: 60,
    notes: 'Client cancelled - went with competitor',
    assignedTo: 'James Wong',
    createdAt: '2024-11-20T10:00:00Z',
    updatedAt: '2024-12-03T16:00:00Z',
    amount: 350,
  },
  {
    id: '7',
    clientId: '7',
    clientName: 'Dr. Lisa Zhang',
    clientEmail: 'lzhang@paediatrics.com.au',
    clientPhone: '0467 890 123',
    type: 'consultation',
    status: 'scheduled',
    service: 'Medical Practice Setup',
    date: '2024-12-12',
    time: '10:00',
    duration: 60,
    notes: 'New paediatric practice - structure advice',
    assignedTo: 'Michelle Chen',
    createdAt: '2024-12-06T11:00:00Z',
    updatedAt: '2024-12-06T11:00:00Z',
    amount: 350,
  },
  {
    id: '8',
    clientId: '8',
    clientName: 'Dr. Peter Murphy',
    clientEmail: 'pmurphy@surgeons.com.au',
    clientPhone: '0478 901 234',
    type: 'document-review',
    status: 'no-show',
    service: 'Employment Contracts',
    date: '2024-12-03',
    time: '16:00',
    duration: 45,
    notes: 'Did not attend - follow up required',
    assignedTo: 'Sarah Mitchell',
    createdAt: '2024-11-25T14:00:00Z',
    updatedAt: '2024-12-03T16:30:00Z',
    amount: 250,
  },
];

export function getAppointmentsByDate(date: string): Appointment[] {
  return sampleAppointments.filter((apt) => apt.date === date);
}

export function getAppointmentsByStatus(status: AppointmentStatus): Appointment[] {
  return sampleAppointments.filter((apt) => apt.status === status);
}

export function getUpcomingAppointments(): Appointment[] {
  const today = new Date().toISOString().split('T')[0];
  return sampleAppointments
    .filter((apt) => apt.date >= today && apt.status !== 'cancelled')
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });
}

export function getAppointmentStats() {
  const today = new Date().toISOString().split('T')[0];
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekEnd = new Date(thisWeekStart);
  thisWeekEnd.setDate(thisWeekEnd.getDate() + 6);

  const stats = {
    total: sampleAppointments.length,
    upcoming: sampleAppointments.filter(
      (apt) => apt.date >= today && ['scheduled', 'confirmed'].includes(apt.status)
    ).length,
    todayCount: sampleAppointments.filter((apt) => apt.date === today).length,
    completed: sampleAppointments.filter((apt) => apt.status === 'completed').length,
    cancelled: sampleAppointments.filter((apt) => apt.status === 'cancelled').length,
    noShow: sampleAppointments.filter((apt) => apt.status === 'no-show').length,
    thisWeekRevenue: sampleAppointments
      .filter((apt) => {
        const aptDate = new Date(apt.date);
        return (
          aptDate >= thisWeekStart &&
          aptDate <= thisWeekEnd &&
          apt.status === 'completed'
        );
      })
      .reduce((sum, apt) => sum + (apt.amount || 0), 0),
    totalRevenue: sampleAppointments
      .filter((apt) => apt.status === 'completed')
      .reduce((sum, apt) => sum + (apt.amount || 0), 0),
  };
  return stats;
}

export function getAppointmentsForWeek(startDate: Date): Appointment[] {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];

  return sampleAppointments.filter(
    (apt) => apt.date >= start && apt.date <= end
  );
}
