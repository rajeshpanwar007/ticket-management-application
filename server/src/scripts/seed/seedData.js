export const DEMO_PASSWORD = 'Demo@1234';

export const SEED_USERS = [
  {
    key: 'admin',
    name: 'Alex Admin',
    email: 'admin@demo.com',
    role: 'admin',
  },
  {
    key: 'manager',
    name: 'Morgan Manager',
    email: 'manager@demo.com',
    role: 'manager',
  },
  {
    key: 'agent',
    name: 'Bob Agent',
    email: 'agent@demo.com',
    role: 'agent',
  },
  {
    key: 'customer',
    name: 'Alice Customer',
    email: 'customer@demo.com',
    role: 'customer',
  },
];

export const SEED_TICKETS = [
  {
    key: 't1',
    title: 'Cannot login to account',
    description:
      'Getting a 401 error when trying to login since yesterday. Tried clearing cookies and using a different browser.',
    status: 'open',
    priority: 'high',
    createdByKey: 'customer',
    assignedToKey: 'agent',
    createdAtOffsetDays: -6,
  },
  {
    key: 't2',
    title: 'Password reset email not received',
    description:
      'Requested a password reset 2 hours ago but no email arrived. Checked spam folder.',
    status: 'in_progress',
    priority: 'medium',
    createdByKey: 'customer',
    assignedToKey: 'agent',
    createdAtOffsetDays: -5,
  },
  {
    key: 't3',
    title: 'Dashboard loading slowly',
    description:
      'Dashboard takes over 30 seconds to load. Started after the last deployment.',
    status: 'resolved',
    priority: 'low',
    createdByKey: 'customer',
    assignedToKey: 'agent',
    createdAtOffsetDays: -4,
  },
  {
    key: 't4',
    title: 'Billing discrepancy on invoice',
    description:
      'Invoice #1234 shows a charge for a service I cancelled last month.',
    status: 'closed',
    priority: 'medium',
    createdByKey: 'manager',
    assignedToKey: null,
    createdAtOffsetDays: -10,
  },
  {
    key: 't5',
    title: 'Feature request: export to CSV',
    description:
      'Would like the ability to export ticket history to CSV format for reporting.',
    status: 'open',
    priority: 'low',
    createdByKey: 'customer',
    assignedToKey: null,
    createdAtOffsetDays: -3,
  },
  {
    key: 't6',
    title: 'Duplicate ticket - please ignore',
    description: 'Accidentally created a duplicate of T1. Please cancel this one.',
    status: 'cancelled',
    priority: 'medium',
    createdByKey: 'customer',
    assignedToKey: null,
    createdAtOffsetDays: -2,
  },
  {
    key: 't7',
    title: 'API integration timeout errors',
    description:
      'Third-party API calls are timing out after 5 seconds. Started this morning around 9am.',
    status: 'open',
    priority: 'high',
    createdByKey: 'customer',
    assignedToKey: null,
    createdAtOffsetDays: -1,
  },
  {
    key: 't8',
    title: 'Mobile app crashes on startup',
    description:
      'App crashes immediately on launch on iOS 17. Works fine on Android.',
    status: 'open',
    priority: 'medium',
    createdByKey: 'customer',
    assignedToKey: null,
    createdAtOffsetDays: -1,
  },
];

export const SEED_COMMENTS = [
  {
    key: 'c1',
    ticketKey: 't1',
    authorKey: 'agent',
    body: 'Hi Alice, I can see your account is locked due to multiple failed login attempts. I\'ll unlock it now.',
    createdAtOffsetMinutes: 30,
  },
  {
    key: 'c2',
    ticketKey: 't1',
    authorKey: 'agent',
    body: 'Your account has been unlocked. Please try logging in again and let me know if the issue persists.',
    createdAtOffsetMinutes: 45,
  },
  {
    key: 'c3',
    ticketKey: 't1',
    authorKey: 'customer',
    body: 'Thanks Bob! I was able to login successfully now.',
    createdAtOffsetMinutes: 60,
  },
  {
    key: 'c4',
    ticketKey: 't2',
    authorKey: 'agent',
    body: 'I\'ve checked the email delivery logs. The reset email was sent but bounced due to a full mailbox. Please clear some space and request a new reset.',
    createdAtOffsetMinutes: 20,
  },
  {
    key: 'c5',
    ticketKey: 't3',
    authorKey: 'agent',
    body: 'Identified a slow database query on the dashboard. Deployed a fix in v2.3.1. Please confirm the dashboard loads normally now.',
    createdAtOffsetMinutes: 120,
  },
  {
    key: 'c6',
    ticketKey: 't4',
    authorKey: 'manager',
    body: 'Refund of $49.99 has been processed. Invoice #1234 has been corrected. Closing this ticket.',
    createdAtOffsetDays: 3,
  },
];
