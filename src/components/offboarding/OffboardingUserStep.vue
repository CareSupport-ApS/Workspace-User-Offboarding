<template>
  <WorkflowSplitPanel>
    <template #left>
      <LoadingState
        v-if="loadingUsers"
        description="Fetching available users from the directory."
        title="Loading users"
      />

      <template v-else>
        <div class="flex items-center justify-between gap-3 px-[18px] pb-3 pt-[18px]">
          <label class="required-field">Select user to offboard</label>
          <span class="inline-flex items-center rounded-full bg-slate-200 px-2.5 py-1 text-[0.82rem] font-bold text-slate-700">
            {{ filteredUsers.length }} of {{ users.length }} users
          </span>
        </div>

        <div class="pb-3">
          <InputText
            v-model="searchQuery"
            class="w-full"
            placeholder="Search by name or email"
          />
        </div>

        <DataTable
          :value="filteredUsers"
          :selection="selectedUser"
          data-key="email"
          scrollable
          scroll-height="500px"
          selection-mode="single"
          table-style="min-width: 100%"
          @row-click="onRowClick"
        >
          <Column field="name" header="Name" />
          <Column field="email" header="Email" />
        </DataTable>
      </template>
    </template>

    <template #right>
      <LoadingState
        v-if="loadingUsers"
        description="User details will appear here once the directory list has loaded."
        title="Waiting for users"
      />

      <div v-else class="h-full">
        <div v-if="selectedUser && loadingDetails" class="flex min-h-full flex-col justify-center">
          <h3 class="m-0">Loading user details</h3>
          <p class="text-slate-500">Fetching the latest directory profile for the selected user.</p>
        </div>

        <div v-else-if="selectedUser && detailsError" class="flex min-h-full flex-col justify-center">
          <h3 class="m-0">Could not load details</h3>
          <p class="text-slate-500">{{ detailsError }}</p>
        </div>

        <div v-else-if="selectedUser">
          <div class="flex items-center justify-between gap-3 pb-4">
            <h3 class="m-0">{{ selectedUser.name }}</h3>
            <Tag :severity="selectedUser.suspended ? 'danger' : 'success'" :value="selectedUser.status || 'Ready for review'" />
          </div>

          <dl class="grid gap-4 md:grid-cols-2">
            <div>
              <dt class="mb-1.5 text-[0.78rem] uppercase tracking-[0.06em] text-slate-500">Email</dt>
              <dd class="m-0 font-semibold">{{ selectedUser.email }}</dd>
            </div>
            <div>
              <dt class="mb-1.5 text-[0.78rem] uppercase tracking-[0.06em] text-slate-500">Status</dt>
              <dd class="m-0 font-semibold">{{ selectedUser.status || 'Not provided' }}</dd>
            </div>
            <div>
              <dt class="mb-1.5 text-[0.78rem] uppercase tracking-[0.06em] text-slate-500">Role</dt>
              <dd class="m-0 font-semibold">{{ selectedUser.role || 'Not provided' }}</dd>
            </div>
            <div>
              <dt class="mb-1.5 text-[0.78rem] uppercase tracking-[0.06em] text-slate-500">Department</dt>
              <dd class="m-0 font-semibold">{{ selectedUser.department || 'Not provided' }}</dd>
            </div>
            <div>
              <dt class="mb-1.5 text-[0.78rem] uppercase tracking-[0.06em] text-slate-500">Manager</dt>
              <dd class="m-0 font-semibold">{{ selectedUser.manager || 'Not provided' }}</dd>
            </div>
            <div>
              <dt class="mb-1.5 text-[0.78rem] uppercase tracking-[0.06em] text-slate-500">Org Unit</dt>
              <dd class="m-0 font-semibold">{{ selectedUser.orgUnitPath || 'Not provided' }}</dd>
            </div>
          </dl>

          <p class="text-slate-500">
            Review the selected user before continuing to mail, calendar, and security actions.
          </p>
        </div>

        <div v-else class="flex min-h-full flex-col justify-center">
          <h3 class="m-0">No user selected</h3>
          <p class="text-slate-500">Choose a user from the list to inspect their details here before continuing.</p>
        </div>
      </div>
    </template>
  </WorkflowSplitPanel>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import LoadingState from '../LoadingState.vue';
import WorkflowSplitPanel from '../WorkflowSplitPanel.vue';

interface UserOption {
  department?: string;
  email: string;
  manager?: string;
  name: string;
  orgUnitPath?: string;
  role?: string;
  status?: string;
  suspended?: boolean;
}

const props = defineProps<{
  detailsError: string;
  loadingDetails: boolean;
  loadingUsers: boolean;
  selectedUser: UserOption | null;
  users: UserOption[];
}>();

const emit = defineEmits<{
  'select-user': [user: UserOption];
}>();

const searchQuery = ref('');

const filteredUsers = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) {
    return props.users;
  }

  return props.users.filter((user) =>
    user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
  );
});

function onRowClick(event: { data: UserOption }) {
  emit('select-user', event.data);
}
</script>

<style scoped>
:deep(.split-panel-card .p-card-content) {
  padding-top: 0;
}

:deep(.split-panel-card .p-datatable) {
  border-top: 1px solid rgba(148, 163, 184, 0.18);
}

:deep(.split-panel-card .p-datatable-thead > tr > th) {
  padding: 0.9rem 1rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted);
  background: #f8fbff;
}

:deep(.split-panel-card .p-datatable-tbody > tr > td) {
  padding: 0.95rem 1rem;
}

:deep(.split-panel-card .p-datatable-tbody > tr) {
  cursor: pointer;
}

:deep(.split-panel-card .p-datatable-tbody > tr:hover) {
  background: #eff6ff;
}

:deep(.split-panel-card .p-datatable-tbody > tr.p-datatable-row-selected) {
  background: #dbeafe;
}
</style>
