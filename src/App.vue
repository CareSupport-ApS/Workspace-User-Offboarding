<template>
  <div>
    <div v-if="loading" class="modal-overlay active">
      <div class="modal-content">
        <div class="spinner" />
        <div class="processing-text">Processing...</div>
      </div>
    </div>

    <div class="card">
      <div class="notice">
        <strong>Note:</strong> Only Google Workspace super admins can use this offboarding tool.
      </div>

      <div class="logo">
        <img src="https://via.placeholder.com/200x60?text=Your+Logo" alt="Company Logo">
      </div>

      <h1 class="title">Workspace Offboard (Vue)</h1>

      <form autocomplete="off" @submit.prevent="onSubmit">
        <div class="form-group">
          <label class="required-field" for="userSearch">Select User to Offboard</label>
          <div ref="inputWrap" class="input-wrap">
            <input
              id="userSearch"
              v-model="userSearch"
              type="text"
              placeholder="Start typing a name or email..."
              required
              @focus="showSuggestions = true"
              @input="onInput"
            >
            <div v-if="showSuggestions && filteredUsers.length" class="autocomplete-suggestions">
              <div
                v-for="user in filteredUsers"
                :key="user.email"
                class="autocomplete-suggestion"
                @click="selectUser(user)"
              >
                {{ user.name }} &lt;{{ user.email }}&gt;
              </div>
            </div>
          </div>
        </div>

        <button type="submit">Continue</button>
      </form>

      <div v-if="successResult" class="result success">
        <strong>{{ successResult.message }}</strong>
        <p>{{ successResult.userDisplay }}</p>
      </div>

      <div v-if="errorMessage" class="result error">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { gasCall } from './gas-client.js';

const allUsers = ref([]);
const userSearch = ref('');
const userEmail = ref('');
const loading = ref(false);
const successResult = ref(null);
const errorMessage = ref('');
const showSuggestions = ref(false);
const inputWrap = ref(null);

const filteredUsers = computed(() => {
  const value = userSearch.value.trim().toLowerCase();
  if (!value) return [];

  return allUsers.value
    .filter((u) => u.name.toLowerCase().includes(value) || u.email.toLowerCase().includes(value))
    .slice(0, 10);
});

async function fetchUsers() {
  try {
    allUsers.value = await gasCall('getAllUsers');
  } catch (error) {
    errorMessage.value = error.message || 'Failed to fetch users.';
  }
}

function selectUser(user) {
  userSearch.value = `${user.name} <${user.email}>`;
  userEmail.value = user.email;
  showSuggestions.value = false;
}

function onInput() {
  userEmail.value = '';
  showSuggestions.value = true;
}

async function onSubmit() {
  if (!userEmail.value) {
    errorMessage.value = 'Please select a user from the list.';
    return;
  }

  loading.value = true;
  errorMessage.value = '';
  successResult.value = null;

  try {
    const result = await gasCall('offboardUser', {
      email: userEmail.value,
      manager: null
    });

    if (result?.success) {
      successResult.value = result;
      userSearch.value = '';
      userEmail.value = '';
    }
  } catch (error) {
    errorMessage.value = error.message || 'An error occurred while offboarding the user.';
  } finally {
    loading.value = false;
  }
}

function onDocumentClick(event) {
  if (!inputWrap.value?.contains(event.target)) {
    showSuggestions.value = false;
  }
}

onMounted(() => {
  fetchUsers();
  document.addEventListener('click', onDocumentClick);
});

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick);
});
</script>
