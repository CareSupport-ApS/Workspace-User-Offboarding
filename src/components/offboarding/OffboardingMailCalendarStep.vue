<template>
  <div>
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
}

defineProps<{
  form: {
    mail: MailOptions;
    calendar: CalendarOptions;
  };
}>();

</script>
