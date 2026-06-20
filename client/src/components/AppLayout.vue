<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'
import logo from '../assets/JobTrack.png'

const auth = useAuthStore()
const theme = useThemeStore()
const router = useRouter()

function logout() {
  auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-[#e0e0e0] text-slate-800 dark:bg-slate-900 dark:text-slate-100">
    <header class="bg-white border-b border-slate-200 dark:bg-slate-800 dark:border-slate-700">
      <div class="max-w-6xl mx-auto px-4 h-14 grid grid-cols-3 items-center">
        <div class="flex">
          <img :src="logo" alt="JobTrack" class="h-6 dark:invert" />
        </div>

        <nav class="flex gap-5 text-sm justify-center">
          <RouterLink to="/" exact-active-class="text-indigo-600 dark:text-indigo-400 font-medium"
            class="hover:text-indigo-600 dark:hover:text-indigo-400">Board</RouterLink>
          <RouterLink to="/dashboard" active-class="text-indigo-600 dark:text-indigo-400 font-medium"
            class="hover:text-indigo-600 dark:hover:text-indigo-400">Dashboard</RouterLink>
          <RouterLink to="/companies" active-class="text-indigo-600 dark:text-indigo-400 font-medium"
            class="hover:text-indigo-600 dark:hover:text-indigo-400">Companies</RouterLink>
        </nav>

        <div class="flex items-center gap-3 justify-end">
          <button @click="theme.toggle()" :title="theme.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
            class="w-9 h-9 rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-base">
            {{ theme.isDark ? '☀️' : '🌙' }}
          </button>
          <RouterLink to="/profile" class="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400">
            {{ auth.user?.email }}
          </RouterLink>
          <button @click="logout"
            class="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-700">
            Log out
          </button>
        </div>
      </div>
    </header>
    <main class="max-w-6xl mx-auto px-4 py-6">
      <RouterView />
    </main>
  </div>
</template>
