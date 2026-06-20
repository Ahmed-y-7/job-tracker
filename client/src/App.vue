<script setup>
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

// On load, restore the session from the stored token.
onMounted(() => auth.fetchMe())
</script>

<template>
  <RouterView />
</template>
