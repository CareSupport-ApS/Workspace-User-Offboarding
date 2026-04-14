<template>
  <WorkflowSplitPanel>
    <template #left>
      <div class="space-y-6">
        <div>
          <h3 class="m-0">Mail & Calendar</h3>
          <p class="mt-2 text-slate-500">
            Configure the mailbox auto-reply and calendar handover before continuing.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <Checkbox v-model="form.mail.enableAutoReply" binary input-id="enableAutoReply" />
          <label for="enableAutoReply">Enable auto-reply</label>
        </div>

        <div v-if="form.mail.enableAutoReply" class="space-y-4">
          <div class="space-y-2">
            <label for="autoReplySubject" class="font-semibold">Auto-reply subject</label>
            <InputText id="autoReplySubject" v-model="form.mail.autoReplySubject" class="w-full" />
          </div>

          <div class="space-y-2">
            <label for="autoReplyMessage" class="font-semibold">Auto-reply message</label>
            <Textarea id="autoReplyMessage" v-model="form.mail.autoReplyMessage" class="w-full" rows="7" />
          </div>
        </div>

        <div class="flex items-center gap-3">
          <Checkbox v-model="form.calendar.grantManagerAccess" binary input-id="grantManagerAccess" />
          <label for="grantManagerAccess">Grant manager calendar access</label>
        </div>

        <div class="flex items-start gap-3">
          <Checkbox v-model="form.calendar.hideFromGlobalAddressList" binary input-id="hideFromGlobalAddressList" class="mt-1" />
          <div class="space-y-1">
            <label for="hideFromGlobalAddressList" class="font-medium text-slate-900">Hide from Global Address List</label>
            <p class="m-0 text-sm leading-6 text-slate-600">
              Removes the user from the Google Workspace directory so they no longer appear in address lookups.
            </p>
          </div>
        </div>
      </div>
    </template>

    <template #right>
      <div class="space-y-5">
        <div>
          <h3 class="m-0">Current mailbox settings</h3>
          <p class="mt-2 text-slate-500">
            Review the user's existing auto-reply before deciding what should be applied in this run.
          </p>
        </div>

        <LoadingState
          v-if="loadingMailboxSettings"
          description="Fetching the user's current mailbox settings."
          title="Loading mailbox settings"
        />

        <Message v-else-if="mailboxSettingsError" severity="warn">
          {{ mailboxSettingsError }}
        </Message>

        <Message v-else-if="!currentMailboxSettings?.enableAutoReply" severity="contrast">
          The selected user does not currently have an auto-reply enabled.
        </Message>

        <div v-else class="rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <div class="space-y-4">
            <div>
              <p class="mb-1 text-[0.78rem] uppercase tracking-[0.06em] text-slate-500">Subject</p>
              <p class="m-0 font-semibold text-slate-900">
                {{ currentMailboxSettings.responseSubject || 'No subject set' }}
              </p>
            </div>

            <div>
              <p class="mb-1 text-[0.78rem] uppercase tracking-[0.06em] text-slate-500">Message</p>
              <p class="m-0 whitespace-pre-wrap text-slate-700">
                {{ currentMailboxSettings.responseBodyPlainText || 'No message set' }}
              </p>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <div class="flex items-center justify-between gap-3">
            <span class="font-semibold text-slate-900">Planned offboarding auto-reply</span>
            <Tag :severity="form.mail.enableAutoReply ? 'success' : 'secondary'" :value="form.mail.enableAutoReply ? 'Enabled' : 'Disabled'" />
          </div>
          <p class="mb-0 mt-3 text-slate-500">
            {{ form.mail.enableAutoReply
              ? 'This run will update the mailbox with the configured offboarding auto-reply.'
              : 'This run will leave the mailbox auto-reply disabled.' }}
          </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <div class="flex items-center justify-between gap-3">
            <span class="font-semibold text-slate-900">Calendar handoff</span>
            <Tag :severity="form.calendar.grantManagerAccess ? 'success' : 'secondary'" :value="form.calendar.grantManagerAccess ? 'Enabled' : 'Disabled'" />
          </div>
          <p class="mb-0 mt-3 text-slate-500">
            {{ form.calendar.grantManagerAccess
              ? 'The user manager will receive writer access to the user calendar.'
              : 'No manager calendar access will be granted in this run.' }}
          </p>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5">
          <div class="flex items-center justify-between gap-3">
            <span class="font-semibold text-slate-900">Directory visibility</span>
            <Tag :severity="form.calendar.hideFromGlobalAddressList ? 'success' : 'secondary'" :value="form.calendar.hideFromGlobalAddressList ? 'Hidden from GAL' : 'Visible in GAL'" />
          </div>
          <p class="mb-0 mt-3 text-slate-500">
            {{ form.calendar.hideFromGlobalAddressList
              ? 'This run will hide the user from the Global Address List.'
              : 'This run will leave the user visible in the Global Address List.' }}
          </p>
        </div>
      </div>
    </template>
  </WorkflowSplitPanel>
</template>

<script setup lang="ts">
import LoadingState from '../LoadingState.vue';
import WorkflowSplitPanel from '../WorkflowSplitPanel.vue';

interface MailOptions {
  enableAutoReply: boolean;
  autoReplySubject: string;
  autoReplyMessage: string;
}

interface CalendarOptions {
  grantManagerAccess: boolean;
  hideFromGlobalAddressList: boolean;
}

defineProps<{
  currentMailboxSettings: {
    enableAutoReply: boolean;
    responseBodyPlainText: string;
    responseSubject: string;
    restrictToContacts?: boolean;
    restrictToDomain?: boolean;
  } | null;
  form: {
    mail: MailOptions;
    calendar: CalendarOptions;
  };
  loadingMailboxSettings: boolean;
  mailboxSettingsError: string;
}>();

</script>
