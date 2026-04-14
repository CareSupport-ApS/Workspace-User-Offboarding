<template>
  <WorkflowSplitPanel>
    <template #left>
      <div class="flex h-full flex-col gap-6">
        <div class="space-y-2">
          <h3 class="m-0 text-xl font-semibold text-slate-900">Security controls</h3>
          <p class="m-0 max-w-2xl text-sm leading-6 text-slate-600">
            Choose which access-removal actions should be included when the offboarding run is executed.
          </p>
        </div>

        <div class="space-y-3">
          <label
            v-for="action in securityActions"
            :key="action.key"
            :for="action.key"
            class="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 transition hover:border-slate-300"
          >
            <Checkbox
              :id="action.key"
              v-model="form.security[action.key]"
              binary
              class="mt-1"
            />

            <div class="space-y-1">
              <div class="text-sm font-semibold text-slate-900">{{ action.label }}</div>
              <p class="m-0 text-sm leading-6 text-slate-600">{{ action.description }}</p>
            </div>
          </label>
        </div>
      </div>
    </template>

    <template #right>
      <div class="flex h-full flex-col gap-5">
        <div class="space-y-2">
          <div class="flex items-center justify-between gap-3">
            <h3 class="m-0 text-lg font-semibold text-slate-900">Current group memberships</h3>
            <Tag
              :value="`${groupMemberships.length} ${groupMemberships.length === 1 ? 'group' : 'groups'}`"
              severity="secondary"
            />
          </div>

          <p class="m-0 text-sm leading-6 text-slate-600">
            {{ selectedUser ? `Review ${selectedUser.name}'s current memberships before removing access.` : 'Select a user to review current memberships.' }}
          </p>
        </div>

        <LoadingState
          v-if="loadingGroups"
          title="Loading groups"
          description="Fetching current Google Group memberships for the selected user."
        />

        <Message
          v-else-if="groupsError"
          severity="error"
        >
          {{ groupsError }}
        </Message>

        <Message
          v-else-if="!selectedUser"
          severity="secondary"
        >
          No user selected yet.
        </Message>

        <Message
          v-else-if="groupMemberships.length === 0"
          severity="secondary"
        >
          This user is not currently a member of any Google Groups.
        </Message>

        <div
          v-else
          class="flex max-h-[500px] flex-col gap-3 overflow-y-auto pr-1"
        >
          <div
            v-for="group in groupMemberships"
            :key="group.id || group.email"
            class="rounded-2xl border border-slate-200 bg-white/80 p-4"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0 space-y-1">
                <div class="truncate text-sm font-semibold text-slate-900">{{ group.name }}</div>
                <div class="truncate text-sm text-slate-600">{{ group.email }}</div>
              </div>

              <Tag
                v-if="group.role"
                :value="group.role"
                severity="info"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </WorkflowSplitPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LoadingState from '../LoadingState.vue';
import WorkflowSplitPanel from '../WorkflowSplitPanel.vue';
import type { SecurityOptions, UserGroupMembership, UserOption } from '../../offboarding-types';

const props = defineProps<{
  form: {
    security: SecurityOptions;
  };
  groupMemberships: UserGroupMembership[];
  groupsError: string;
  loadingGroups: boolean;
  selectedUser: UserOption | null;
}>();

const securityActions = computed(() => [
  {
    key: 'moveToOffboardedOu' as const,
    label: 'Move to Offboarded Users OU',
    description: 'Moves the account into the `/Offboarded users` organizational unit for cleaner policy targeting and isolation.'
  },
  {
    key: 'suspend' as const,
    label: 'Suspend user',
    description: 'Blocks sign-in across Google Workspace so the account can no longer be used.'
  },
  {
    key: 'resetPassword' as const,
    label: 'Reset password',
    description: 'Generates a new random password to invalidate any password the user may still know.'
  },
  {
    key: 'removeGroups' as const,
    label: 'Remove from groups',
    description: 'Removes the user from all Google Groups memberships listed on the right.'
  },
  {
    key: 'removeAdminRoles' as const,
    label: 'Remove admin roles',
    description: 'Revokes any assigned custom admin roles so elevated permissions are removed.'
  },
  {
    key: 'revokeTokens' as const,
    label: 'Revoke OAuth tokens',
    description: 'Invalidates connected app sessions and refresh tokens for third-party integrations.'
  },
  {
    key: 'signOut' as const,
    label: 'Sign out all sessions',
    description: 'Forces the user out of active Google sessions across devices and browsers.'
  }
]);
</script>
