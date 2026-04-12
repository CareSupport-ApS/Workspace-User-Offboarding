<template>
  <div>
    <h3>Provisioning checklist</h3>

    <div class="field-checkbox">
      <Checkbox v-model="form.createWorkspaceAccount" binary />
      <label>Create Google Workspace account</label>
    </div>

    <div class="field-checkbox">
      <Checkbox v-model="form.assignStarterGroups" binary />
      <label>Assign starter groups and org units</label>
    </div>

    <div class="field-checkbox">
      <Checkbox v-model="form.shareDriveAccess" binary />
      <label>Share drive and folder access</label>
    </div>

    <div class="field-checkbox">
      <Checkbox v-model="form.sendWelcomeEmail" binary />
      <label>Send welcome email</label>
    </div>

    <div class="field-checkbox">
      <Checkbox v-model="form.scheduleIntroMeetings" binary />
      <label>Schedule intro meetings</label>
    </div>

    <div class="info-banner">
      This onboarding section is ready for a future backend flow. For now it acts
      as a clean planning surface alongside the live offboarding workflow.
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  form: {
    createWorkspaceAccount: boolean;
    assignStarterGroups: boolean;
    shareDriveAccess: boolean;
    sendWelcomeEmail: boolean;
    scheduleIntroMeetings: boolean;
  };
}>();

</script>
