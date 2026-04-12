<template>
  <BaseWorkflowCard
    v-model="step"
    kicker="Onboarding"
    title="Set up a new team member"
    badge="Planning mode"
    badge-class="neutral"
    intro="Use this simple view to collect the essentials before provisioning accounts, access, and welcome material."
    :next-label="step === '3' ? 'Done' : 'Continue'"
    :show-back-button="step !== '1'"
    :show-next-button="step !== '3'"
    :steps="steps"
    @back="goBack"
    @next="goNext"
  >
    <template #default="{ currentStep, setStep }">
      <OnboardingDetailsStep
        v-if="currentStep === '1'"
        :form="form"
      />

      <OnboardingAccessStep
        v-else-if="currentStep === '2'"
        :form="form"
      />

      <OnboardingReviewStep
        v-else
        :summary="summary"
        @reset="resetForm"
      />
    </template>
  </BaseWorkflowCard>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import BaseWorkflowCard from './BaseWorkflowCard.vue';
import OnboardingAccessStep from './onboarding/OnboardingAccessStep.vue';
import OnboardingDetailsStep from './onboarding/OnboardingDetailsStep.vue';
import OnboardingReviewStep from './onboarding/OnboardingReviewStep.vue';

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

function createDefaultForm(): OnboardingForm {
  return {
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
  };
}

const form = reactive<OnboardingForm>(createDefaultForm());
const step = ref('1');
const steps = [
  { value: '1', label: 'Details' },
  { value: '2', label: 'Access' },
  { value: '3', label: 'Review' }
];
const currentStepIndex = computed(() =>
  Math.max(steps.findIndex((item) => item.value === step.value), 0)
);

const summary = computed(() => {
  const name = form.fullName || 'New team member';
  const role = form.role || 'their role';
  const startDate = form.startDate || 'the planned start date';
  const tasks = [
    form.createWorkspaceAccount ? 'create the Workspace account' : null,
    form.assignStarterGroups ? 'assign starter groups' : null,
    form.shareDriveAccess ? 'grant drive access' : null,
    form.sendWelcomeEmail ? 'send the welcome email' : null,
    form.scheduleIntroMeetings ? 'schedule intro meetings' : null
  ].filter(Boolean);

  const taskSummary = tasks.length ? tasks.join(', ') : 'review onboarding tasks manually';
  return `${name} is being prepared for ${role} starting on ${startDate}. Next steps: ${taskSummary}.`;
});

function resetForm() {
  Object.assign(form, createDefaultForm());
}

function goBack() {
  const previousStep = steps[currentStepIndex.value - 1];
  if (previousStep) {
    step.value = previousStep.value;
  }
}

function goNext() {
  const nextStep = steps[currentStepIndex.value + 1];
  if (nextStep) {
    step.value = nextStep.value;
  }
}
</script>
