<template>
  <div>
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
  </div>
</template>

<script setup lang="ts">
interface SecurityOptions {
  suspend: boolean;
  resetPassword: boolean;
  removeGroups: boolean;
  removeAdminRoles: boolean;
  revokeTokens: boolean;
  signOut: boolean;
}

defineProps<{
  form: {
    security: SecurityOptions;
  };
}>();

</script>
