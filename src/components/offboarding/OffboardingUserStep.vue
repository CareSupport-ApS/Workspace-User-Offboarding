<template>
  <div class="user-step-layout">
    <div class="user-list-card">
      <div class="user-step-header">
        <label class="required-field">Select user to offboard</label>
        <span class="user-count">{{ users.length }} users</span>
      </div>

      <div class="user-table-scroll">
        <table class="user-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.email"
              class="user-table-row"
              :class="{ selected: selectedUser?.email === user.email }"
              @click="$emit('select-user', user)"
            >
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="user-detail-card">
      <div v-if="selectedUser && loadingDetails" class="user-empty-state">
        <h3>Loading user details</h3>
        <p>Fetching the latest directory profile for the selected user.</p>
      </div>

      <div v-else-if="selectedUser && detailsError" class="user-empty-state">
        <h3>Could not load details</h3>
        <p>{{ detailsError }}</p>
      </div>

      <div v-else-if="selectedUser">
        <div class="user-detail-header">
          <h3>{{ selectedUser.name }}</h3>
          <span class="detail-pill">{{ selectedUser.status || 'Ready for review' }}</span>
        </div>

        <dl class="user-detail-grid">
          <div>
            <dt>Email</dt>
            <dd>{{ selectedUser.email }}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{{ selectedUser.status || 'Not provided' }}</dd>
          </div>
          <div>
            <dt>Role</dt>
            <dd>{{ selectedUser.role || 'Not provided' }}</dd>
          </div>
          <div>
            <dt>Department</dt>
            <dd>{{ selectedUser.department || 'Not provided' }}</dd>
          </div>
          <div>
            <dt>Manager</dt>
            <dd>{{ selectedUser.manager || 'Not provided' }}</dd>
          </div>
          <div>
            <dt>Org Unit</dt>
            <dd>{{ selectedUser.orgUnitPath || 'Not provided' }}</dd>
          </div>
        </dl>

        <p class="user-detail-copy">
          Review the selected user before continuing to mail, calendar, and security actions.
        </p>
      </div>

      <div v-else class="user-empty-state">
        <h3>No user selected</h3>
        <p>Choose a user from the list to inspect their details here before continuing.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

defineProps<{
  detailsError: string;
  loadingDetails: boolean;
  selectedUser: UserOption | null;
  users: UserOption[];
}>();

defineEmits<{
  'select-user': [user: UserOption];
}>();
</script>
