<template>
  <div>
    <div v-if="loading" class="modal-overlay active">
      <div class="modal-content">
        <div class="spinner" />
        <div class="processing-text">Processing...</div>
      </div>
    </div>

    <div class="logo">
      <img width="100" src="https://caresupport.dk/wp-content/uploads/2025/12/DearFuture_Logo_TrueBlack-scaled.webp"
        alt="Company Logo">
    </div>

    <div class="card">
      <div class="notice">
        <strong>Note:</strong> Only Google Workspace super admins can use this offboarding tool.
      </div>

      <h1 class="title">Dear Future Offboarding tool</h1>
      <p>Use this tool to offboard @dearfuture.dk users in a secure, compliant and easy manner.</p>


      <Stepper v-model:value="step" linear>
        <StepList>
          <Step value="1">User</Step>
          <Step value="2">Mail & Calendar</Step>
          <Step value="3">Security</Step>
          <Step value="4">Review</Step>
        </StepList>

        <StepPanels>
          <!-- STEP 1 -->
          <StepPanel value="1">
            <div class="form-group">
              <label class="required-field" for="userSearch">Select User to Offboard</label>

              <div ref="inputWrap" class="input-wrap">
                <input id="userSearch" v-model="userSearch" type="text" placeholder="Start typing a name or email..."
                  required @focus="showSuggestions = true" @input="onInput" />
                <div v-if="showSuggestions && filteredUsers.length" class="autocomplete-suggestions">
                  <div v-for="user in filteredUsers" :key="user.email" class="autocomplete-suggestion"
                    @click="selectUser(user)">
                    {{ user.name }} &lt;{{ user.email }}&gt;
                  </div>
                </div>
              </div>
            </div>

            <div class="actions">
              <Button label="Continue" :disabled="!userEmail" @click="goNextFromUser" />
            </div>
          </StepPanel>

          <!-- STEP 2 -->
          <StepPanel value="2">
            <h2>Mail & Calendar</h2>

            <div class="field-checkbox">
              <Checkbox v-model="form.mail.enableAutoReply" binary />
              <label>Enable auto-reply</label>
            </div>

            <div v-if="form.mail.enableAutoReply" class="form-group">
              <label>Auto-reply subject</label>
              <InputText v-model="form.mail.autoReplySubject" />
            </div>

            <div v-if="form.mail.enableAutoReply" class="form-group">
              <label>Auto-reply message</label>
              <Textarea v-model="form.mail.autoReplyMessage" rows="4" />
            </div>

            <div class="field-checkbox">
              <Checkbox v-model="form.calendar.grantManagerAccess" binary />
              <label>Grant manager calendar access</label>
            </div>

            <div class="actions">
              <Button label="Back" severity="secondary" @click="step = '1'" />
              <Button label="Continue" @click="step = '3'" />
            </div>
          </StepPanel>

          <!-- STEP 3 -->
          <StepPanel value="3">
            <h2>Security</h2>

            <div class="field-checkbox">
              <Checkbox v-model="form.security.suspend" binary /><label>Suspend user</label>
            </div>
            <div class="field-checkbox">
              <Checkbox v-model="form.security.resetPassword" binary /><label>Reset password</label>
            </div>
            <div class="field-checkbox">
              <Checkbox v-model="form.security.removeGroups" binary /><label>Remove from groups</label>
            </div>
            <div class="field-checkbox">
              <Checkbox v-model="form.security.removeAdminRoles" binary /><label>Remove admin roles</label>
            </div>
            <div class="field-checkbox">
              <Checkbox v-model="form.security.revokeTokens" binary /><label>Revoke OAuth tokens</label>
            </div>
            <div class="field-checkbox">
              <Checkbox v-model="form.security.signOut" binary /><label>Sign out all sessions</label>
            </div>

            <div class="actions">
              <Button label="Back" severity="secondary" @click="step = '2'" />
              <Button label="Continue" @click="step = '4'" />
            </div>
          </StepPanel>

          <!-- STEP 4 -->
          <StepPanel value="4">
            <h2>Review</h2>
            <p><strong>User:</strong> {{ userSearch }}</p>

            <pre class="review">{{ form }}</pre>

            <div class="actions">
              <Button label="Back" severity="secondary" @click="step = '3'" />
              <Button label="Run offboarding" severity="danger" :loading="loading" @click="runOffboarding" />
            </div>
          </StepPanel>
        </StepPanels>
      </Stepper>

      <Message v-if="successResult" severity="success" class="mt-3">
        {{ successResult.message }}
      </Message>

      <Message v-if="errorMessage" severity="error" class="mt-3">
        {{ errorMessage }}
      </Message>
    </div>
  </div>
</template>

<script setup>
import Stepper from 'primevue/stepper';
import StepList from 'primevue/steplist';
import StepPanels from 'primevue/steppanels';
import StepItem from 'primevue/stepitem';
import Step from 'primevue/step';
import StepPanel from 'primevue/steppanel';

import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { gasCall } from './gas-client.js';

const step = ref('1')

const allUsers = ref([])
const userSearch = ref('')
const userEmail = ref('')
const loading = ref(false)
const successResult = ref(null)
const errorMessage = ref('')
const showSuggestions = ref(false)
const inputWrap = ref(null)

const form = reactive({
  mail: {
    enableAutoReply: true,
    autoReplySubject: 'Out of office',
    autoReplyMessage: 'This mailbox is no longer monitored. Please contact your manager or IT support.'
  },
  calendar: { grantManagerAccess: true },
  security: {
    suspend: true,
    resetPassword: true,
    removeGroups: true,
    removeAdminRoles: true,
    revokeTokens: true,
    signOut: true
  }
})

const filteredUsers = computed(() => {
  const value = userSearch.value.trim().toLowerCase()
  if (!value) return []
  return allUsers.value
    .filter((u) => u.name.toLowerCase().includes(value) || u.email.toLowerCase().includes(value))
    .slice(0, 10)
})

async function fetchUsers() {
  try {
    allUsers.value = await gasCall('getAllUsers')
  } catch (e) {
    errorMessage.value = e?.message || 'Failed to fetch users.'
  }
}

function selectUser(user) {
  userSearch.value = `${user.name} <${user.email}>`
  userEmail.value = user.email
  showSuggestions.value = false
}
function onInput() {
  userEmail.value = ''
  showSuggestions.value = true
}

function goNextFromUser() {
  errorMessage.value = ''
  if (!userEmail.value) {
    errorMessage.value = 'Please select a user from the list.'
    return
  }
  step.value = '2'
}

async function runOffboarding() {
  loading.value = true
  errorMessage.value = ''
  successResult.value = null

  try {
    const result = await gasCall('offboardUser', {
      email: userEmail.value,
      options: JSON.parse(JSON.stringify(form))
    })
    successResult.value = result
    // optionally reset
    step.value = '1'
  } catch (e) {
    errorMessage.value = e?.message || 'Offboarding failed.'
  } finally {
    loading.value = false
  }
}

function onDocumentClick(event) {
  if (!inputWrap.value?.contains(event.target)) showSuggestions.value = false
}

onMounted(() => {
  fetchUsers()
  document.addEventListener('click', onDocumentClick)
})
onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>
