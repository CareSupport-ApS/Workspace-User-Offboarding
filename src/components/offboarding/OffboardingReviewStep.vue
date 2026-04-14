<template>
  <div>
    <h3>Review</h3>
    <p><strong>User:</strong> {{ userSearch }}</p>

    <pre class="review">{{ form }}</pre>
  </div>
</template>

<script setup lang="ts">
interface MailOptions {
  enableAutoReply: boolean;
  autoReplySubject: string;
  autoReplyMessage: string;
}

interface CalendarOptions {
  grantManagerAccess: boolean;
  hideFromGlobalAddressList: boolean;
}

interface SecurityOptions {
  moveToOffboardedOu: boolean;
  suspend: boolean;
  resetPassword: boolean;
  removeGroups: boolean;
  removeAdminRoles: boolean;
  revokeTokens: boolean;
  signOut: boolean;
}

defineProps<{
  form: {
    mail: MailOptions;
    calendar: CalendarOptions;
    security: SecurityOptions;
  };
  userSearch: string;
}>();
</script>
