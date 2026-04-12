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
          :details-error="detailsError"
          :loading-details="loadingDetails"
          :loading-users="loadingUsers"
          :selected-user="selectedUser"
          :users="allUsers"
          @select-user="selectUser"
        />

        <OffboardingMailCalendarStep
          v-else-if="currentStep === '2'"
          :current-mailbox-settings="currentMailboxSettings"
          :form="form"
          :loading-mailbox-settings="loadingMailboxSettings"
          :mailbox-settings-error="mailboxSettingsError"
        />

        <OffboardingSecurityStep
          v-else-if="currentStep === '3'"
          :form="form"
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

        <Message v-if="errorMessage" severity="error" class="feedback-message">
          {{ errorMessage }}
        </Message>
      </template>
    </BaseWorkflowCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { gasCall, hasAppsScriptRuntime } from '../gas-client';
import BaseWorkflowCard from '../components/BaseWorkflowCard.vue';
import LoadingOverlay from '../components/LoadingOverlay.vue';
import OffboardingMailCalendarStep from '../components/offboarding/OffboardingMailCalendarStep.vue';
import OffboardingReviewStep from '../components/offboarding/OffboardingReviewStep.vue';
import OffboardingSecurityStep from '../components/offboarding/OffboardingSecurityStep.vue';
import OffboardingUserStep from '../components/offboarding/OffboardingUserStep.vue';

interface UserOption {
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

interface MailOptions {
  enableAutoReply: boolean;
  autoReplySubject: string;
  autoReplyMessage: string;
}

interface CalendarOptions {
  grantManagerAccess: boolean;
}

interface SecurityOptions {
  suspend: boolean;
  resetPassword: boolean;
  removeGroups: boolean;
  removeAdminRoles: boolean;
  revokeTokens: boolean;
  signOut: boolean;
}

interface OffboardingForm {
  mail: MailOptions;
  calendar: CalendarOptions;
  security: SecurityOptions;
}

interface OffboardingResult {
  message: string;
  [key: string]: unknown;
}

interface MailboxSettings {
  enableAutoReply: boolean;
  responseBodyPlainText: string;
  responseSubject: string;
  restrictToContacts?: boolean;
  restrictToDomain?: boolean;
}

const MOCK_USERS: UserOption[] = [
  { name: 'Ava Thompson', email: 'ava.thompson@dearfuture.dk', role: 'Senior Designer', department: 'Brand', manager: 'Emma Collins', status: 'Active', orgUnitPath: '/Brand' },
  { name: 'Lucas Jensen', email: 'lucas.jensen@dearfuture.dk', role: 'Operations Manager', department: 'Operations', manager: 'Henrik Olsen', status: 'Active', orgUnitPath: '/Operations' },
  { name: 'Maya Patel', email: 'maya.patel@dearfuture.dk', role: 'Growth Specialist', department: 'Marketing', manager: 'Sarah Ahmed', status: 'Active', orgUnitPath: '/Marketing' },
  { name: 'Noah Berg', email: 'noah.berg@dearfuture.dk', role: 'Frontend Engineer', department: 'Product', manager: 'Lina Sorensen', status: 'Active', orgUnitPath: '/Product' },
  { name: 'Sofia Nielsen', email: 'sofia.nielsen@dearfuture.dk', role: 'People Partner', department: 'People & Culture', manager: 'Maria Lund', status: 'Active', orgUnitPath: '/People' }
];

const step = ref('1');
const steps = [
  { value: '1', label: 'User' },
  { value: '2', label: 'Mail & Calendar' },
  { value: '3', label: 'Security' },
  { value: '4', label: 'Review' }
];
const allUsers = ref<UserOption[]>([]);
const userEmail = ref('');
const loading = ref(false);
const loadingDetails = ref(false);
const loadingMailboxSettings = ref(false);
const loadingUsers = ref(false);
const successResult = ref<OffboardingResult | null>(null);
const detailsError = ref('');
const errorMessage = ref('');
const mailboxSettingsError = ref('');
const isTestingMode = !hasAppsScriptRuntime();
const userDetailsCache = reactive<Record<string, UserOption>>({});
const mailboxSettingsCache = reactive<Record<string, MailboxSettings>>({});

const form = reactive<OffboardingForm>({
  mail: {
    enableAutoReply: true,
    autoReplySubject: 'Out of office',
    autoReplyMessage: 'This mailbox is no longer monitored. Please contact your manager or IT support.'
  },
  calendar: { grantManagerAccess: true },
  security: {
    suspend: true,
    resetPassword: true,
    removeGroups: true,
    removeAdminRoles: true,
    revokeTokens: true,
    signOut: true
  }
});

const selectedUser = computed(() => {
  if (!userEmail.value) return null;
  return userDetailsCache[userEmail.value] || allUsers.value.find((user) => user.email === userEmail.value) || null;
});

const currentMailboxSettings = computed(() => {
  if (!userEmail.value) return null;
  return mailboxSettingsCache[userEmail.value] || null;
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

async function fetchUsers() {
  loadingUsers.value = true;

  if (isTestingMode) {
    allUsers.value = MOCK_USERS;
    for (const user of MOCK_USERS) {
      userDetailsCache[user.email] = user;
    }
    loadingUsers.value = false;
    return;
  }

  try {
    allUsers.value = await gasCall<UserOption[]>('getAllUsers');
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to fetch users.';
  } finally {
    loadingUsers.value = false;
  }
}

async function loadUserDetails(email: string) {
  detailsError.value = '';

  if (userDetailsCache[email]) {
    return;
  }

  const listUser = allUsers.value.find((user) => user.email === email);
  if (listUser) {
    userDetailsCache[email] = listUser;
  }

  if (isTestingMode) {
    return;
  }

  loadingDetails.value = true;

  try {
    const details = await gasCall<UserOption>('getUserDetails', email);
    userDetailsCache[email] = details;
  } catch (error: unknown) {
    detailsError.value = error instanceof Error ? error.message : 'Failed to fetch user details.';
  } finally {
    loadingDetails.value = false;
  }
}

async function loadMailboxSettings(email: string) {
  mailboxSettingsError.value = '';

  if (mailboxSettingsCache[email]) {
    return;
  }

  if (isTestingMode) {
    mailboxSettingsCache[email] = {
      enableAutoReply: email === 'ava.thompson@dearfuture.dk',
      responseSubject: email === 'ava.thompson@dearfuture.dk' ? 'On leave' : '',
      responseBodyPlainText: email === 'ava.thompson@dearfuture.dk'
        ? 'Thanks for your message. I am currently out of office and will reply when I return.'
        : '',
      restrictToContacts: false,
      restrictToDomain: true
    };
    return;
  }

  loadingMailboxSettings.value = true;

  try {
    const settings = await gasCall<MailboxSettings>('getUserMailboxSettings', email);
    mailboxSettingsCache[email] = settings;
  } catch (error: unknown) {
    mailboxSettingsError.value = error instanceof Error ? error.message : 'Failed to fetch mailbox settings.';
  } finally {
    loadingMailboxSettings.value = false;
  }
}

function selectUser(user: UserOption) {
  userEmail.value = user.email;
  void loadUserDetails(user.email);
  void loadMailboxSettings(user.email);
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
  void fetchUsers();
});
</script>
