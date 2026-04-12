import { gasCall, hasAppsScriptRuntime } from '../gas-client';
import { getMockMailboxSettings, getMockUserDetails, getMockUserGroups, MOCK_USERS } from '../offboarding-mocks';
import type { MailboxSettings, UserGroupMembership, UserOption } from '../offboarding-types';
import { useAppsScriptRequest } from './useAppsScriptRequest';

const isTestingMode = !hasAppsScriptRuntime();

export function useFetchAllUsers() {
  const query = useAppsScriptRequest<UserOption[]>();

  async function fetchUsers() {
    return query.execute(async () => {
      if (isTestingMode) {
        return MOCK_USERS;
      }

      return gasCall<UserOption[]>('getAllUsers');
    });
  }

  return {
    ...query,
    fetchUsers
  };
}

export function useFetchUserDetails() {
  const query = useAppsScriptRequest<UserOption>();

  async function fetchUserDetails(email: string) {
    return query.execute(async () => {
      if (isTestingMode) {
        return getMockUserDetails(email);
      }

      return gasCall<UserOption>('getUserDetails', email);
    });
  }

  return {
    ...query,
    fetchUserDetails
  };
}

export function useFetchMailboxSettings() {
  const query = useAppsScriptRequest<MailboxSettings>();

  async function fetchMailboxSettings(email: string) {
    return query.execute(async () => {
      if (isTestingMode) {
        return getMockMailboxSettings(email);
      }

      return gasCall<MailboxSettings>('getUserMailboxSettings', email);
    });
  }

  return {
    ...query,
    fetchMailboxSettings
  };
}

export function useFetchUserGroups() {
  const query = useAppsScriptRequest<UserGroupMembership[]>();

  async function fetchUserGroups(email: string) {
    return query.execute(async () => {
      if (isTestingMode) {
        return getMockUserGroups(email);
      }

      return gasCall<UserGroupMembership[]>('getUserGroups', email);
    });
  }

  return {
    ...query,
    fetchUserGroups
  };
}

export function useOffboardingEnvironment() {
  return {
    isTestingMode
  };
}
