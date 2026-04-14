<template>
  <div>
    <LoadingOverlay :visible="loading" />
    <BaseWorkflowCard
      v-model="step"
      kicker="Offboarding"
      title="Run a secure offboarding flow"
      :badge="isTestingMode ? 'Testing mode' : 'Live workflow'"
      :badge-class="isTestingMode ? 'neutral' : ''"
      :intro="introCopy"
      :next-disabled="nextDisabled"
      :next-label="nextLabel"
      :next-loading="loading && step === '4'"
      :next-severity="step === '4' ? 'danger' : undefined"
      :show-back-button="step !== '1'"
      :steps="steps"
      @back="goBack"
      @next="goNext"
    >
      <template #notice>
        <div v-if="isTestingMode" class="info-banner">
          <strong>Testing mode:</strong> Google Apps Script is not available, so this page is using mock users
          and a simulated offboarding response.
        </div>

        <div v-else class="notice">
          <strong>Note:</strong> Only Google Workspace super admins can use this offboarding tool.
        </div>
      </template>

      <template #default="{ currentStep }">
        <OffboardingUserStep
          v-if="currentStep === '1'"
          :details-error="userDetailsQuery.error.value"
          :loading-details="userDetailsQuery.loading.value"
          :loading-users="usersQuery.loading.value"
          :selected-user="selectedUser"
          :users="allUsers"
          @select-user="selectUser"
        />

        <OffboardingMailCalendarStep
          v-else-if="currentStep === '2'"
          :current-mailbox-settings="mailboxSettingsQuery.result.value"
          :form="form"
          :loading-mailbox-settings="mailboxSettingsQuery.loading.value"
          :mailbox-settings-error="mailboxSettingsQuery.error.value"
        />

        <OffboardingSecurityStep
          v-else-if="currentStep === '3'"
          :form="form"
          :group-memberships="userGroupsQuery.result.value ?? []"
          :groups-error="userGroupsQuery.error.value"
          :loading-groups="userGroupsQuery.loading.value"
          :selected-user="selectedUser"
        />

        <OffboardingReviewStep
          v-else
          :form="form"
          :user-search="selectedUser ? `${selectedUser.name} <${selectedUser.email}>` : ''"
        />
      </template>

      <template #footer>
        <Message v-if="successResult" severity="success" class="feedback-message">
          {{ successResult.message }}
        </Message>

        <Message v-if="usersQuery.error.value || errorMessage" severity="error" class="feedback-message">
          {{ usersQuery.error.value || errorMessage }}
        </Message>
      </template>
    </BaseWorkflowCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { gasCall } from '../gas-client';
import { useFetchAllUsers, useFetchMailboxSettings, useFetchUserDetails, useFetchUserGroups, useOffboardingEnvironment } from '../composables/useOffboardingQueries';
import BaseWorkflowCard from '../components/BaseWorkflowCard.vue';
import LoadingOverlay from '../components/LoadingOverlay.vue';
import OffboardingMailCalendarStep from '../components/offboarding/OffboardingMailCalendarStep.vue';
import OffboardingReviewStep from '../components/offboarding/OffboardingReviewStep.vue';
import OffboardingSecurityStep from '../components/offboarding/OffboardingSecurityStep.vue';
import OffboardingUserStep from '../components/offboarding/OffboardingUserStep.vue';
import type { OffboardingForm, OffboardingResult, UserOption } from '../offboarding-types';

const step = ref('1');
const steps = [
  { value: '1', label: 'User' },
  { value: '2', label: 'Mail & Calendar' },
  { value: '3', label: 'Security' },
  { value: '4', label: 'Review' }
];
const userEmail = ref('');
const loading = ref(false);
const successResult = ref<OffboardingResult | null>(null);
const errorMessage = ref('');
const { isTestingMode } = useOffboardingEnvironment();

const usersQuery = useFetchAllUsers();
const userDetailsQuery = useFetchUserDetails();
const mailboxSettingsQuery = useFetchMailboxSettings();
const userGroupsQuery = useFetchUserGroups();

const form = reactive<OffboardingForm>({
  mail: {
    enableAutoReply: true,
    autoReplySubject: 'Out of office',
    autoReplyMessage: 'This mailbox is no longer monitored. Please contact your manager or IT support.'
  },
  calendar: {
    grantManagerAccess: true,
    hideFromGlobalAddressList: true
  },
  security: {
    moveToOffboardedOu: true,
    suspend: true,
    resetPassword: true,
    removeGroups: true,
    removeAdminRoles: true,
    revokeTokens: true,
    signOut: true
  }
});

const allUsers = computed(() => usersQuery.result.value ?? []);
const selectedUser = computed(() => {
  if (!userEmail.value) return null;
  return userDetailsQuery.result.value || allUsers.value.find((user) => user.email === userEmail.value) || null;
});

const currentStepIndex = computed(() =>
  Math.max(steps.findIndex((item) => item.value === step.value), 0)
);
const nextDisabled = computed(() => step.value === '1' && !userEmail.value);
const nextLabel = computed(() => step.value === '4' ? 'Run offboarding' : 'Continue');
const introCopy = computed(() => {
  if (isTestingMode) {
    return 'Select a mock user, review the transfer and security actions, and test the workflow locally.';
  }

  return 'Select a user, review the transfer and security actions, then run the workflow.';
});

function cloneFormState(): OffboardingForm {
  return {
    mail: { ...form.mail },
    calendar: { ...form.calendar },
    security: { ...form.security }
  };
}

async function selectUser(user: UserOption) {
  userEmail.value = user.email;
  userDetailsQuery.reset();
  mailboxSettingsQuery.reset();
  userGroupsQuery.reset();

  await Promise.allSettled([
    userDetailsQuery.fetchUserDetails(user.email),
    mailboxSettingsQuery.fetchMailboxSettings(user.email),
    userGroupsQuery.fetchUserGroups(user.email)
  ]);
}

function goNextFromUser() {
  errorMessage.value = '';
  if (!userEmail.value) {
    errorMessage.value = 'Please select a user from the list.';
    return;
  }

  const nextStep = steps[currentStepIndex.value + 1];
  if (nextStep) {
    step.value = nextStep.value;
  }
}

function goBack() {
  const previousStep = steps[currentStepIndex.value - 1];
  if (previousStep) {
    step.value = previousStep.value;
  }
}

function goNext() {
  if (step.value === '1') {
    goNextFromUser();
    return;
  }

  const isLastStep = currentStepIndex.value === steps.length - 1;
  if (isLastStep) {
    void runOffboarding();
    return;
  }

  const nextStep = steps[currentStepIndex.value + 1];
  if (nextStep) {
    step.value = nextStep.value;
  }
}

async function runOffboarding() {
  loading.value = true;
  errorMessage.value = '';
  successResult.value = null;

  try {
    const result = isTestingMode
      ? await runMockOffboarding()
      : await gasCall<OffboardingResult>('offboardUser', {
          email: userEmail.value,
          options: cloneFormState()
        });
    successResult.value = result;
    step.value = '1';
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Offboarding failed.';
  } finally {
    loading.value = false;
  }
}

async function runMockOffboarding(): Promise<OffboardingResult> {
  await new Promise((resolve) => window.setTimeout(resolve, 600));

  return {
    message: `Test offboarding completed for ${userEmail.value}. No live Google Workspace changes were made.`,
    mode: 'testing',
    email: userEmail.value,
    options: cloneFormState()
  };
}

onMounted(() => {
  void usersQuery.fetchUsers();
});
</script>
