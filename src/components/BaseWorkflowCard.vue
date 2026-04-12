<template>
  <section class="panel">
    <div class="panel-header">
      <div>
        <p class="section-kicker">{{ kicker }}</p>
        <h2>{{ title }}</h2>
      </div>
      <span class="panel-badge" :class="badgeClass">{{ badge }}</span>
    </div>

    <div v-if="$slots.notice" class="workflow-notice">
      <slot name="notice" />
    </div>

    <p v-if="intro" class="panel-intro">
      {{ intro }}
    </p>

    <div class="surface-card">
      <Stepper :value="step" linear>
        <StepList>
          <Step v-for="item in steps" :key="item.value" :value="item.value">
            {{ item.label }}
          </Step>
        </StepList>

        <div class="workflow-content">
          <slot :current-step="step" :set-step="setStep" />
        </div>

        <div v-if="showActions" class="actions split">
          <Button
            v-if="showBackButton"
            :label="backLabel"
            severity="secondary"
            outlined
            @click="$emit('back')"
          />
          <Button
            v-if="showNextButton"
            :label="nextLabel"
            :severity="nextSeverity"
            :disabled="nextDisabled"
            :loading="nextLoading"
            @click="$emit('next')"
          />
        </div>
      </Stepper>
    </div>

    <slot name="footer" />
  </section>
</template>

<script setup lang="ts">
import Step from 'primevue/step';
import StepList from 'primevue/steplist';
import Stepper from 'primevue/stepper';
import { computed } from 'vue';

interface WorkflowStep {
  value: string;
  label: string;
}

const props = withDefaults(defineProps<{
  badge: string;
  badgeClass?: string;
  backLabel?: string;
  intro?: string;
  kicker: string;
  modelValue: string;
  nextDisabled?: boolean;
  nextLabel?: string;
  nextLoading?: boolean;
  nextSeverity?: 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger' | 'contrast' | undefined;
  showActions?: boolean;
  showBackButton?: boolean;
  showNextButton?: boolean;
  steps: WorkflowStep[];
  title: string;
}>(), {
  badgeClass: '',
  backLabel: 'Back',
  intro: '',
  nextDisabled: false,
  nextLabel: 'Continue',
  nextLoading: false,
  nextSeverity: undefined,
  showActions: true,
  showBackButton: true,
  showNextButton: true
});

const emit = defineEmits<{
  back: [];
  next: [];
  'update:modelValue': [value: string];
}>();

const step = computed(() => props.modelValue);

function setStep(value: string) {
  emit('update:modelValue', value);
}
</script>
