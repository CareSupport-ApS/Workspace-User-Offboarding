export interface UserOption {
  department?: string;
  email: string;
  includeInGlobalAddressList?: boolean;
  manager?: string;
  name: string;
  orgUnitPath?: string;
  role?: string;
  status?: string;
  suspended?: boolean;
}

export interface MailOptions {
  enableAutoReply: boolean;
  autoReplySubject: string;
  autoReplyMessage: string;
}

export interface CalendarOptions {
  grantManagerAccess: boolean;
}

export interface SecurityOptions {
  suspend: boolean;
  resetPassword: boolean;
  removeGroups: boolean;
  removeAdminRoles: boolean;
  revokeTokens: boolean;
  signOut: boolean;
}

export interface UserGroupMembership {
  email: string;
  id?: string;
  name: string;
  role?: string;
}

export interface OffboardingForm {
  mail: MailOptions;
  calendar: CalendarOptions;
  security: SecurityOptions;
}

export interface OffboardingResult {
  message: string;
  [key: string]: unknown;
}

export interface MailboxSettings {
  enableAutoReply: boolean;
  responseBodyPlainText: string;
  responseSubject: string;
  restrictToContacts?: boolean;
  restrictToDomain?: boolean;
}
