<template>
  <div>
    <h3>New hire details</h3>

    <div class="form-group">
      <label for="onboardingName">Full name</label>
      <InputText id="onboardingName" v-model="form.fullName" />
    </div>

    <div class="form-group">
      <label for="onboardingEmail">Work email</label>
      <InputText id="onboardingEmail" v-model="form.email" />
    </div>

    <div class="form-group">
      <label for="onboardingRole">Role</label>
      <InputText id="onboardingRole" v-model="form.role" />
    </div>

    <div class="form-group">
      <label for="onboardingManager">Manager</label>
      <InputText id="onboardingManager" v-model="form.manager" />
    </div>

    <div class="form-group">
      <label for="onboardingStartDate">Start date</label>
      <InputText id="onboardingStartDate" v-model="form.startDate" placeholder="YYYY-MM-DD" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  form: {
    fullName: string;
    email: string;
    role: string;
    manager: string;
    startDate: string;
  };
}>();

</script>
