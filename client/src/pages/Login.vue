<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import logo from '../assets/JobTrack.png'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (e) {
    error.value = e.response?.data?.message || 'Login failed'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-[#e0e0e0] dark:bg-slate-900 flex items-center justify-center px-4">
    <form @submit.prevent="submit"
      class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 w-full max-w-sm text-slate-800 dark:text-slate-100">
      <img :src="logo" alt="JobTrack" class="h-7 mx-auto mb-5 dark:invert" />
      <h1 class="text-xl font-semibold mb-4">Welcome back</h1>
      <p v-if="error" class="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-sm rounded-lg px-3 py-2 mb-3">{{ error }}</p>

      <label class="block text-sm font-medium mb-3">
        Email
        <input v-model="email" type="email" required
          class="mt-1 w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </label>
      <label class="block text-sm font-medium mb-4">
        Password
        <input v-model="password" type="password" required
          class="mt-1 w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </label>

      <button :disabled="loading"
        class="w-full bg-indigo-600 text-white rounded-lg py-2 hover:bg-indigo-700 disabled:opacity-60">
        {{ loading ? 'Logging in…' : 'Log in' }}
      </button>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-3">
        No account?
        <RouterLink to="/signup" class="text-indigo-600 dark:text-indigo-400 hover:underline">Sign up</RouterLink>
      </p>
    </form>
  </div>
</template>
