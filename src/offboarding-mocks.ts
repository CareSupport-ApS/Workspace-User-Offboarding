import type { MailboxSettings, UserGroupMembership, UserOption } from './offboarding-types';

export const MOCK_USERS: UserOption[] = [
  { name: 'Ava Thompson', email: 'ava.thompson@dearfuture.dk', role: 'Senior Designer', department: 'Brand', manager: 'Emma Collins', status: 'Active', orgUnitPath: '/Brand' },
  { name: 'Lucas Jensen', email: 'lucas.jensen@dearfuture.dk', role: 'Operations Manager', department: 'Operations', manager: 'Henrik Olsen', status: 'Active', orgUnitPath: '/Operations' },
  { name: 'Maya Patel', email: 'maya.patel@dearfuture.dk', role: 'Growth Specialist', department: 'Marketing', manager: 'Sarah Ahmed', status: 'Active', orgUnitPath: '/Marketing' },
  { name: 'Noah Berg', email: 'noah.berg@dearfuture.dk', role: 'Frontend Engineer', department: 'Product', manager: 'Lina Sorensen', status: 'Active', orgUnitPath: '/Product' },
  { name: 'Sofia Nielsen', email: 'sofia.nielsen@dearfuture.dk', role: 'People Partner', department: 'People & Culture', manager: 'Maria Lund', status: 'Active', orgUnitPath: '/People' }
];

export function getMockUserDetails(email: string): UserOption {
  const user = MOCK_USERS.find((item) => item.email === email);
  if (!user) {
    throw new Error('Test user not found.');
  }

  return user;
}

export function getMockMailboxSettings(email: string): MailboxSettings {
  return {
    enableAutoReply: email === 'ava.thompson@dearfuture.dk',
    responseSubject: email === 'ava.thompson@dearfuture.dk' ? 'On leave' : '',
    responseBodyPlainText: email === 'ava.thompson@dearfuture.dk'
      ? 'Thanks for your message. I am currently out of office and will reply when I return.'
      : '',
    restrictToContacts: false,
    restrictToDomain: true
  };
}

const MOCK_GROUPS_BY_USER: Record<string, UserGroupMembership[]> = {
  'ava.thompson@dearfuture.dk': [
    { email: 'brand@dearfuture.dk', name: 'Brand Team', role: 'MEMBER' },
    { email: 'figma-admins@dearfuture.dk', name: 'Figma Admins', role: 'OWNER' },
    { email: 'all-company@dearfuture.dk', name: 'All Company', role: 'MEMBER' }
  ],
  'lucas.jensen@dearfuture.dk': [
    { email: 'operations@dearfuture.dk', name: 'Operations', role: 'MANAGER' },
    { email: 'leadership@dearfuture.dk', name: 'Leadership Team', role: 'MEMBER' }
  ],
  'maya.patel@dearfuture.dk': [
    { email: 'marketing@dearfuture.dk', name: 'Marketing', role: 'MEMBER' },
    { email: 'newsletter@dearfuture.dk', name: 'Newsletter Editors', role: 'OWNER' }
  ],
  'noah.berg@dearfuture.dk': [
    { email: 'engineering@dearfuture.dk', name: 'Engineering', role: 'MEMBER' },
    { email: 'frontend-guild@dearfuture.dk', name: 'Frontend Guild', role: 'MEMBER' },
    { email: 'product-all@dearfuture.dk', name: 'Product All Hands', role: 'MEMBER' }
  ],
  'sofia.nielsen@dearfuture.dk': [
    { email: 'people-culture@dearfuture.dk', name: 'People & Culture', role: 'OWNER' },
    { email: 'all-company@dearfuture.dk', name: 'All Company', role: 'MEMBER' }
  ]
};

export function getMockUserGroups(email: string): UserGroupMembership[] {
  return MOCK_GROUPS_BY_USER[email] ?? [];
}
