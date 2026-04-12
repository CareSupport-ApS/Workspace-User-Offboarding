<template>
  <div class="app-shell">
    <div v-if="loading" class="modal-overlay active">
      <div class="modal-content">
        <div class="spinner" />
        <div class="processing-text">Processing...</div>
      </div>
    </div>

    <header class="topbar">
      <div class="brand">
        <img
          class="brand-logo"
          src="https://caresupport.dk/wp-content/uploads/2025/12/DearFuture_Logo_TrueBlack-scaled.webp"
          alt="Dear Future logo"
        >
        <div>
          <p class="brand-eyebrow">Workspace Lifecycle</p>
          <h1>User Onboarding & Offboarding</h1>
        </div>
      </div>

      <div class="topbar-summary">
        <span class="status-dot" />
        Admin workspace tool
      </div>
    </header>

    <div class="workspace-layout">
      <aside class="sidebar">
        <p class="sidebar-label">Navigation</p>

        <button
          class="nav-item"
          :class="{ active: activeSection === 'onboarding' }"
          type="button"
          @click="activeSection = 'onboarding'"
        >
          <span class="nav-item-title">Onboarding</span>
          <span class="nav-item-copy">Prepare new hires for day one</span>
        </button>

        <button
          class="nav-item"
          :class="{ active: activeSection === 'offboarding' }"
          type="button"
          @click="activeSection = 'offboarding'"
        >
          <span class="nav-item-title">Offboarding</span>
          <span class="nav-item-copy">Securely remove access and hand off data</span>
        </button>
      </aside>

      <main class="content-area">
        <section v-if="activeSection === 'onboarding'" class="panel">
          <div class="panel-header">
            <div>
              <p class="section-kicker">Onboarding</p>
              <h2>Set up a new team member</h2>
            </div>
            <span class="panel-badge neutral">Planning mode</span>
          </div>

          <p class="panel-intro">
            Use this simple view to collect the essentials before provisioning accounts,
            access, and welcome material.
          </p>

          <div class="panel-grid">
            <div class="surface-card">
              <h3>New hire details</h3>

              <div class="form-group">
                <label for="onboardingName">Full name</label>
                <InputText id="onboardingName" v-model="onboardingForm.fullName" />
              </div>

              <div class="form-group">
                <label for="onboardingEmail">Work email</label>
                <InputText id="onboardingEmail" v-model="onboardingForm.email" />
              </div>

              <div class="form-group">
                <label for="onboardingRole">Role</label>
                <InputText id="onboardingRole" v-model="onboardingForm.role" />
              </div>

              <div class="form-group">
                <label for="onboardingManager">Manager</label>
                <InputText id="onboardingManager" v-model="onboardingForm.manager" />
              </div>

              <div class="form-group">
                <label for="onboardingStartDate">Start date</label>
                <InputText id="onboardingStartDate" v-model="onboardingForm.startDate" placeholder="YYYY-MM-DD" />
              </div>
            </div>

            <div class="surface-card">
              <h3>Provisioning checklist</h3>

              <div class="field-checkbox">
                <Checkbox v-model="onboardingForm.createWorkspaceAccount" binary />
                <label>Create Google Workspace account</label>
              </div>

              <div class="field-checkbox">
                <Checkbox v-model="onboardingForm.assignStarterGroups" binary />
                <label>Assign starter groups and org units</label>
              </div>

              <div class="field-checkbox">
                <Checkbox v-model="onboardingForm.shareDriveAccess" binary />
                <label>Share drive and folder access</label>
              </div>

              <div class="field-checkbox">
                <Checkbox v-model="onboardingForm.sendWelcomeEmail" binary />
                <label>Send welcome email</label>
              </div>

              <div class="field-checkbox">
                <Checkbox v-model="onboardingForm.scheduleIntroMeetings" binary />
                <label>Schedule intro meetings</label>
              </div>

              <div class="info-banner">
                This onboarding section is ready for a future backend flow. For now it acts
                as a clean planning surface alongside the live offboarding workflow.
              </div>
            </div>
          </div>

          <div class="surface-card summary-card">
            <div class="summary-header">
              <h3>Summary</h3>
              <Button label="Reset" severity="secondary" outlined @click="resetOnboardingForm" />
            </div>

            <p class="summary-copy">
              {{ onboardingSummary }}
            </p>
          </div>
        </section>

        <section v-else class="panel">
          <div class="panel-header">
            <div>
              <p class="section-kicker">Offboarding</p>
              <h2>Run a secure offboarding flow</h2>
            </div>
            <span class="panel-badge">Live workflow</span>
          </div>

          <div class="notice">
            <strong>Note:</strong> Only Google Workspace super admins can use this offboarding tool.
          </div>

          <p class="panel-intro">
            Select a user, review the transfer and security actions, then run the workflow.
          </p>

          <div class="surface-card">
            <Stepper v-model:value="step" linear>
              <StepList>
                <Step value="1">User</Step>
                <Step value="2">Mail & Calendar</Step>
                <Step value="3">Security</Step>
                <Step value="4">Review</Step>
              </StepList>

              <StepPanels>
                <StepPanel value="1">
                  <div class="form-group">
                    <label class="required-field" for="userSearch">Select user to offboard</label>

                    <div ref="inputWrap" class="input-wrap">
                      <input
                        id="userSearch"
                        v-model="userSearch"
                        type="text"
                        placeholder="Start typing a name or email..."
                        required
                        @focus="showSuggestions = true"
                        @input="onInput"
                      >
                      <div v-if="showSuggestions && filteredUsers.length" class="autocomplete-suggestions">
                        <div
                          v-for="user in filteredUsers"
                          :key="user.email"
                          class="autocomplete-suggestion"
                          @click="selectUser(user)"
                        >
                          {{ user.name }} &lt;{{ user.email }}&gt;
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="actions">
                    <Button label="Continue" :disabled="!userEmail" @click="goNextFromUser" />
                  </div>
                </StepPanel>

                <StepPanel value="2">
                  <h3>Mail & Calendar</h3>

                  <div class="field-checkbox">
                    <Checkbox v-model="form.mail.enableAutoReply" binary />
                    <label>Enable auto-reply</label>
                  </div>

                  <div v-if="form.mail.enableAutoReply" class="form-group">
                    <label for="autoReplySubject">Auto-reply subject</label>
                    <InputText id="autoReplySubject" v-model="form.mail.autoReplySubject" />
                  </div>

                  <div v-if="form.mail.enableAutoReply" class="form-group">
                    <label for="autoReplyMessage">Auto-reply message</label>
                    <Textarea id="autoReplyMessage" v-model="form.mail.autoReplyMessage" rows="4" />
                  </div>

                  <div class="field-checkbox">
                    <Checkbox v-model="form.calendar.grantManagerAccess" binary />
                    <label>Grant manager calendar access</label>
                  </div>

                  <div class="actions split">
                    <Button label="Back" severity="secondary" outlined @click="step = '1'" />
                    <Button label="Continue" @click="step = '3'" />
                  </div>
                </StepPanel>

                <StepPanel value="3">
                  <h3>Security</h3>

                  <div class="field-checkbox">
                    <Checkbox v-model="form.security.suspend" binary />
                    <label>Suspend user</label>
                  </div>
                  <div class="field-checkbox">
                    <Checkbox v-model="form.security.resetPassword" binary />
                    <label>Reset password</label>
                  </div>
                  <div class="field-checkbox">
                    <Checkbox v-model="form.security.removeGroups" binary />
                    <label>Remove from groups</label>
                  </div>
                  <div class="field-checkbox">
                    <Checkbox v-model="form.security.removeAdminRoles" binary />
                    <label>Remove admin roles</label>
                  </div>
                  <div class="field-checkbox">
                    <Checkbox v-model="form.security.revokeTokens" binary />
                    <label>Revoke OAuth tokens</label>
                  </div>
                  <div class="field-checkbox">
                    <Checkbox v-model="form.security.signOut" binary />
                    <label>Sign out all sessions</label>
                  </div>

                  <div class="actions split">
                    <Button label="Back" severity="secondary" outlined @click="step = '2'" />
                    <Button label="Continue" @click="step = '4'" />
                  </div>
                </StepPanel>

                <StepPanel value="4">
                  <h3>Review</h3>
                  <p><strong>User:</strong> {{ userSearch }}</p>

                  <pre class="review">{{ form }}</pre>

                  <div class="actions split">
                    <Button label="Back" severity="secondary" outlined @click="step = '3'" />
                    <Button
                      label="Run offboarding"
                      severity="danger"
                      :loading="loading"
                      @click="runOffboarding"
                    />
                  </div>
                </StepPanel>
              </StepPanels>
            </Stepper>
          </div>

          <Message v-if="successResult" severity="success" class="feedback-message">
            {{ successResult.message }}
          </Message>

          <Message v-if="errorMessage" severity="error" class="feedback-message">
            {{ errorMessage }}
          </Message>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';

import { computed, onMounted, onUnmounted, reactive, ref } from 'vue';
import { gasCall } from './gas-client';

interface UserOption {
  email: string;
  name: string;
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

interface OnboardingForm {
  fullName: string;
  email: string;
  role: string;
  manager: string;
  startDate: string;
  createWorkspaceAccount: boolean;
  assignStarterGroups: boolean;
  shareDriveAccess: boolean;
  sendWelcomeEmail: boolean;
  scheduleIntroMeetings: boolean;
}

const activeSection = ref<'onboarding' | 'offboarding'>('offboarding');
const step = ref('1');

const allUsers = ref<UserOption[]>([]);
const userSearch = ref('');
const userEmail = ref('');
const loading = ref(false);
const successResult = ref<OffboardingResult | null>(null);
const errorMessage = ref('');
const showSuggestions = ref(false);
const inputWrap = ref<HTMLElement | null>(null);

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

const onboardingForm = reactive<OnboardingForm>({
  fullName: '',
  email: '',
  role: '',
  manager: '',
  startDate: '',
  createWorkspaceAccount: true,
  assignStarterGroups: true,
  shareDriveAccess: true,
  sendWelcomeEmail: true,
  scheduleIntroMeetings: true
});

function cloneFormState(): OffboardingForm {
  return {
    mail: { ...form.mail },
    calendar: { ...form.calendar },
    security: { ...form.security }
  };
}

const filteredUsers = computed(() => {
  const value = userSearch.value.trim().toLowerCase();
  if (!value) return [];

  return allUsers.value
    .filter((u) => u.name.toLowerCase().includes(value) || u.email.toLowerCase().includes(value))
    .slice(0, 10);
});

const onboardingSummary = computed(() => {
  const name = onboardingForm.fullName || 'New team member';
  const role = onboardingForm.role || 'their role';
  const startDate = onboardingForm.startDate || 'the planned start date';
  const tasks = [
    onboardingForm.createWorkspaceAccount ? 'create the Workspace account' : null,
    onboardingForm.assignStarterGroups ? 'assign starter groups' : null,
    onboardingForm.shareDriveAccess ? 'grant drive access' : null,
    onboardingForm.sendWelcomeEmail ? 'send the welcome email' : null,
    onboardingForm.scheduleIntroMeetings ? 'schedule intro meetings' : null
  ].filter(Boolean);

  const taskSummary = tasks.length ? tasks.join(', ') : 'review onboarding tasks manually';
  return `${name} is being prepared for ${role} starting on ${startDate}. Next steps: ${taskSummary}.`;
});

async function fetchUsers() {
  try {
    allUsers.value = await gasCall<UserOption[]>('getAllUsers');
  } catch (error: unknown) {
    errorMessage.value = error instanceof Error ? error.message : 'Failed to fetch users.';
  }
}

function resetOnboardingForm() {
  onboardingForm.fullName = '';
  onboardingForm.email = '';
  onboardingForm.role = '';
  onboardingForm.manager = '';
  onboardingForm.startDate = '';
  onboardingForm.createWorkspaceAccount = true;
  onboardingForm.assignStarterGroups = true;
  onboardingForm.shareDriveAccess = true;
  onboardingForm.sendWelcomeEmail = true;
  onboardingForm.scheduleIntroMeetings = true;
}

function selectUser(user: UserOption) {
  userSearch.value = `${user.name} <${user.email}>`;
  userEmail.value = user.email;
  showSuggestions.value = false;
}

function onInput() {
  userEmail.value = '';
  showSuggestions.value = true;
}

function goNextFromUser() {
  errorMessage.value = '';
  if (!userEmail.value) {
    errorMessage.value = 'Please select a user from the list.';
    return;
  }

  step.value = '2';
}

async function runOffboarding() {
  loading.value = true;
  errorMessage.value = '';
  successResult.value = null;

  try {
    const result = await gasCall<OffboardingResult>('offboardUser', {
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

function onDocumentClick(event: MouseEvent) {
  const target = event.target;
  if (!(target instanceof Node) || !inputWrap.value?.contains(target)) {
    showSuggestions.value = false;
  }
}

onMounted(() => {
  void fetchUsers();
  document.addEventListener('click', onDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>
