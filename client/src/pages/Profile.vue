<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const name = ref('')
const email = ref('')
const profileMsg = ref('')
const profileErr = ref('')

const currentPassword = ref('')
const newPassword = ref('')
const pwMsg = ref('')
const pwErr = ref('')

// Populate fields once the user is loaded.
watch(
  () => auth.user,
  (u) => {
    if (u) {
      name.value = u.name || ''
      email.value = u.email || ''
    }
  },
  { immediate: true }
)

async function saveProfile() {
  profileMsg.value = ''
  profileErr.value = ''
  try {
    await auth.updateProfile(name.value, email.value)
    profileMsg.value = 'Profile saved.'
  } catch (e) {
    profileErr.value = e.response?.data?.message || 'Failed to save'
  }
}

async function savePassword() {
  pwMsg.value = ''
  pwErr.value = ''
  try {
    await auth.changePassword(currentPassword.value, newPassword.value)
    pwMsg.value = 'Password updated.'
    currentPassword.value = ''
    newPassword.value = ''
  } catch (e) {
    pwErr.value = e.response?.data?.message || 'Failed to update password'
  }
}

const inputCls = 'mt-1 w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-3 py-2'
const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 max-w-md'
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold mb-4">Profile settings</h1>

    <div class="space-y-5">
      <form @submit.prevent="saveProfile" :class="cardCls">
        <h2 class="text-sm font-medium mb-3">Account info</h2>
        <p v-if="profileMsg" class="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-lg px-3 py-2 mb-3">{{ profileMsg }}</p>
        <p v-if="profileErr" class="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg px-3 py-2 mb-3">{{ profileErr }}</p>
        <label class="block text-sm mb-3">Name
          <input v-model="name" :class="inputCls" placeholder="Your name" />
        </label>
        <label class="block text-sm mb-4">Email
          <input v-model="email" type="email" required :class="inputCls" />
        </label>
        <button type="submit" class="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700">Save changes</button>
      </form>

      <form @submit.prevent="savePassword" :class="cardCls">
        <h2 class="text-sm font-medium mb-3">Change password</h2>
        <p v-if="pwMsg" class="bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-lg px-3 py-2 mb-3">{{ pwMsg }}</p>
        <p v-if="pwErr" class="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg px-3 py-2 mb-3">{{ pwErr }}</p>
        <label class="block text-sm mb-3">Current password
          <input v-model="currentPassword" type="password" required :class="inputCls" />
        </label>
        <label class="block text-sm mb-4">New password
          <input v-model="newPassword" type="password" required placeholder="At least 6 characters" :class="inputCls" />
        </label>
        <button type="submit" class="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700">Update password</button>
      </form>
    </div>
  </div>
</template>
