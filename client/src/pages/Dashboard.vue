<script setup>
import { ref, onMounted, computed } from 'vue'
import api from '../api'
import Chart from 'chart.js/auto'

const apps = ref([])
const canvas = ref(null)
let chart

const counts = computed(() => {
  const c = { wishlist: 0, applied: 0, interview: 0, offer: 0, rejected: 0 }
  for (const a of apps.value) c[a.status] = (c[a.status] || 0) + 1
  return c
})

const total = computed(() => apps.value.length)
const active = computed(() => counts.value.applied + counts.value.interview)
const offers = computed(() => counts.value.offer)
const responseRate = computed(() => {
  if (total.value === 0) return '0%'
  const responded = counts.value.interview + counts.value.offer + counts.value.rejected
  return Math.round((responded / total.value) * 100) + '%'
})

onMounted(async () => {
  const { data } = await api.get('/applications')
  apps.value = data

  const c = counts.value
  chart = new Chart(canvas.value, {
    type: 'doughnut',
    data: {
      labels: ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'],
      datasets: [{
        data: [c.wishlist, c.applied, c.interview, c.offer, c.rejected],
        backgroundColor: ['#94a3b8', '#3b82f6', '#f59e0b', '#16a34a', '#ef4444'],
      }],
    },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { color: '#94a3b8' } },
      },
    },
  })
})

const cardCls = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4'
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold mb-4">Dashboard</h1>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      <div :class="cardCls">
        <div class="text-sm text-slate-500 dark:text-slate-400">Total</div>
        <div class="text-2xl font-semibold">{{ total }}</div>
      </div>
      <div :class="cardCls">
        <div class="text-sm text-slate-500 dark:text-slate-400">Active</div>
        <div class="text-2xl font-semibold text-blue-600 dark:text-blue-400">{{ active }}</div>
      </div>
      <div :class="cardCls">
        <div class="text-sm text-slate-500 dark:text-slate-400">Offers</div>
        <div class="text-2xl font-semibold text-green-600 dark:text-green-400">{{ offers }}</div>
      </div>
      <div :class="cardCls">
        <div class="text-sm text-slate-500 dark:text-slate-400">Response rate</div>
        <div class="text-2xl font-semibold">{{ responseRate }}</div>
      </div>
    </div>

    <div :class="cardCls" class="max-w-md">
      <h2 class="text-sm font-medium mb-3">Applications by status</h2>
      <div v-if="total === 0" class="text-slate-500 dark:text-slate-400 text-sm">No applications yet.</div>
      <canvas v-show="total > 0" ref="canvas" height="220"></canvas>
    </div>
  </div>
</template>
