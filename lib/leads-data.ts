export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
export type LeadSource = 'website' | 'referral' | 'phone' | 'social' | 'other';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: LeadSource;
  status: LeadStatus;
  service?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastContactedAt?: string;
  assignedTo?: string;
  value?: number;
}

export const statusLabels: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  converted: 'Converted',
  lost: 'Lost',
};

export const statusColors: Record<LeadStatus, { bg: string; text: string }> = {
  new: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  contacted: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  qualified: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  converted: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  lost: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-700 dark:text-gray-400' },
};

export const sourceLabels: Record<LeadSource, string> = {
  website: 'Website',
  referral: 'Referral',
  phone: 'Phone',
  social: 'Social Media',
  other: 'Other',
};

// Sample data for demonstration
export const sampleLeads: Lead[] = [
  {
    id: '1',
    name: 'Dr. Sarah Chen',
    email: 'sarah.chen@clinic.com.au',
    phone: '0412 345 678',
    company: 'Chen Medical Practice',
    source: 'website',
    status: 'new',
    service: 'Practice Setup & Structuring',
    notes: 'Interested in setting up a new practice in Adelaide',
    createdAt: '2024-12-06T09:00:00Z',
    updatedAt: '2024-12-06T09:00:00Z',
    value: 5000,
  },
  {
    id: '2',
    name: 'Dr. James Wilson',
    email: 'j.wilson@medcentre.com',
    phone: '0423 456 789',
    company: 'Wilson Healthcare',
    source: 'referral',
    status: 'contacted',
    service: 'Tenant Doctor Agreement',
    notes: 'Referred by existing client. Needs TDA review urgently.',
    createdAt: '2024-12-05T14:30:00Z',
    updatedAt: '2024-12-06T10:00:00Z',
    lastContactedAt: '2024-12-06T10:00:00Z',
    assignedTo: 'Sarah Mitchell',
    value: 2500,
  },
  {
    id: '3',
    name: 'Dr. Michelle Park',
    email: 'mpark@dermatology.com.au',
    phone: '0434 567 890',
    company: 'Park Dermatology',
    source: 'phone',
    status: 'qualified',
    service: 'Regulatory Compliance',
    notes: 'AHPRA notification received. High priority.',
    createdAt: '2024-12-04T11:00:00Z',
    updatedAt: '2024-12-06T08:00:00Z',
    lastContactedAt: '2024-12-05T16:00:00Z',
    assignedTo: 'James Wong',
    value: 8000,
  },
  {
    id: '4',
    name: 'Dr. David Thompson',
    email: 'dthompson@gp.net.au',
    phone: '0445 678 901',
    source: 'social',
    status: 'converted',
    service: 'Employment & HR',
    notes: 'Needed employment contracts. Now a recurring client.',
    createdAt: '2024-11-28T09:00:00Z',
    updatedAt: '2024-12-02T14:00:00Z',
    lastContactedAt: '2024-12-02T14:00:00Z',
    assignedTo: 'Michelle Chen',
    value: 3500,
  },
  {
    id: '5',
    name: 'Dr. Emma Roberts',
    email: 'emma.r@specialists.com',
    phone: '0456 789 012',
    company: 'Roberts Specialists',
    source: 'website',
    status: 'new',
    service: 'Property & Leasing',
    notes: 'Looking to lease space in new medical centre',
    createdAt: '2024-12-06T07:30:00Z',
    updatedAt: '2024-12-06T07:30:00Z',
    value: 4000,
  },
  {
    id: '6',
    name: 'Dr. Andrew Kim',
    email: 'akim@ortho.com.au',
    source: 'referral',
    status: 'lost',
    service: 'Dispute Resolution',
    notes: 'Went with competitor. Price sensitive.',
    createdAt: '2024-11-20T10:00:00Z',
    updatedAt: '2024-11-30T11:00:00Z',
    lastContactedAt: '2024-11-28T15:00:00Z',
    value: 6000,
  },
];

export function getLeadsByStatus(status: LeadStatus): Lead[] {
  return sampleLeads.filter((lead) => lead.status === status);
}

export function getLeadStats() {
  const stats = {
    total: sampleLeads.length,
    new: sampleLeads.filter((l) => l.status === 'new').length,
    contacted: sampleLeads.filter((l) => l.status === 'contacted').length,
    qualified: sampleLeads.filter((l) => l.status === 'qualified').length,
    converted: sampleLeads.filter((l) => l.status === 'converted').length,
    lost: sampleLeads.filter((l) => l.status === 'lost').length,
    totalValue: sampleLeads.reduce((sum, l) => sum + (l.value || 0), 0),
    convertedValue: sampleLeads
      .filter((l) => l.status === 'converted')
      .reduce((sum, l) => sum + (l.value || 0), 0),
  };
  return stats;
}
