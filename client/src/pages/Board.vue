<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import api from '../api'
import ApplicationDetail from '../components/ApplicationDetail.vue'

const COLUMNS = [
  { key: 'wishlist', label: 'Wishlist', dot: 'bg-slate-400' },
  { key: 'applied', label: 'Applied', dot: 'bg-blue-500' },
  { key: 'interview', label: 'Interview', dot: 'bg-amber-500' },
  { key: 'offer', label: 'Offer', dot: 'bg-green-600' },
  { key: 'rejected', label: 'Rejected', dot: 'bg-red-500' },
]

const applications = ref([])
const companies = ref([])
const draggedId = ref(null)
const search = ref('')
const detailApp = ref(null)

const showForm = ref(false)
const editingId = ref(null)
const form = reactive({
  role: '', company: '', status: 'wishlist',
  job_url: '', location: '', salary: '', applied_on: '',
})

async function load() {
  const [apps, comps] = await Promise.all([
    api.get('/applications'),
    api.get('/companies'),
  ])
  applications.value = apps.data
  companies.value = comps.data
}
onMounted(load)

const grouped = computed(() => {
  const q = search.value.trim().toLowerCase()
  const map = {}
  for (const col of COLUMNS) map[col.key] = []
  for (const a of applications.value) {
    if (q && !`${a.company_name || ''} ${a.role || ''}`.toLowerCase().includes(q)) continue
    ;(map[a.status] ??= []).push(a)
  }
  return map
})

async function ensureCompany(name) {
  const trimmed = name.trim()
  if (!trimmed) return null
  const existing = companies.value.find((c) => c.name.toLowerCase() === trimmed.toLowerCase())
  if (existing) return existing.id
  const { data } = await api.post('/companies', { name: trimmed })
  companies.value.push(data)
  return data.id
}

function openAdd() {
  editingId.value = null
  Object.assign(form, { role: '', company: '', status: 'wishlist', job_url: '', location: '', salary: '', applied_on: '' })
  showForm.value = true
}

function openEdit(app) {
  editingId.value = app.id
  Object.assign(form, {
    role: app.role,
    company: app.company_name || '',
    status: app.status,
    job_url: app.job_url || '',
    location: app.location || '',
    salary: app.salary || '',
    applied_on: app.applied_on || '',
  })
  showForm.value = true
}

async function submitForm() {
  const company_id = await ensureCompany(form.company)
  const payload = {
    role: form.role, company_id, status: form.status,
    job_url: form.job_url, location: form.location, salary: form.salary,
    applied_on: form.applied_on || null,
  }
  if (editingId.value) await api.put(`/applications/${editingId.value}`, payload)
  else await api.post('/applications', payload)
  showForm.value = false
  await load()
}

async function remove(id) {
  if (!confirm('Delete this application?')) return
  await api.delete(`/applications/${id}`)
  await load()
}

function onDragStart(id) { draggedId.value = id }
async function onDrop(status) {
  const id = draggedId.value
  draggedId.value = null
  if (!id) return
  const app = applications.value.find((a) => a.id === id)
  if (!app || app.status === status) return
  const sort_order = grouped.value[status].length
  app.status = status
  await api.patch(`/applications/${id}/move`, { status, sort_order })
  await load()
}

const inputCls =
  'mt-1 w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-3 py-2'
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4 gap-3">
      <h1 class="text-xl font-semibold">Board</h1>
      <input v-model="search" placeholder="Search job or company…"
        class="ml-auto w-56 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      <button @click="openAdd"
        class="bg-indigo-600 text-white text-sm rounded-lg px-3 py-1.5 hover:bg-indigo-700 whitespace-nowrap">
        + Add application
      </button>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 items-start">
      <div v-for="col in COLUMNS" :key="col.key"
        class="bg-slate-100 dark:bg-slate-800 rounded-lg p-2 min-h-[120px]"
        @dragover.prevent @drop="onDrop(col.key)">
        <div class="flex items-center gap-2 mb-2 px-1">
          <span :class="['w-2 h-2 rounded-full', col.dot]"></span>
          <span class="text-sm font-medium">{{ col.label }}</span>
          <span class="ml-auto text-xs text-slate-400">{{ grouped[col.key].length }}</span>
        </div>

        <div v-for="app in grouped[col.key]" :key="app.id" draggable="true"
          @dragstart="onDragStart(app.id)"
          class="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-2.5 mb-2 cursor-grab active:cursor-grabbing">
          <div class="text-sm font-medium">{{ app.company_name || 'Untitled' }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">{{ app.role }}</div>
          <div v-if="app.applied_on" class="text-xs text-slate-400 dark:text-slate-500 mt-1.5">{{ app.applied_on }}</div>
          <div class="flex gap-2 mt-2">
            <button @click="detailApp = app" class="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600">Details</button>
            <button @click="openEdit(app)" class="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600">Edit</button>
            <button @click="remove(app.id)" class="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600">Delete</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showForm" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-10">
      <form @submit.prevent="submitForm"
        class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl p-5 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-3">{{ editingId ? 'Edit application' : 'Add application' }}</h2>
        <div class="grid grid-cols-2 gap-3">
          <label class="text-sm col-span-2">Role
            <input v-model="form.role" required :class="inputCls" />
          </label>
          <label class="text-sm col-span-2">Company
            <input v-model="form.company" list="company-list" placeholder="Type or pick a company" :class="inputCls" />
            <datalist id="company-list">
              <option v-for="c in companies" :key="c.id" :value="c.name" />
            </datalist>
          </label>
          <label class="text-sm">Status
            <select v-model="form.status" :class="inputCls">
              <option v-for="col in COLUMNS" :key="col.key" :value="col.key">{{ col.label }}</option>
            </select>
          </label>
          <label class="text-sm">Applied on
            <input v-model="form.applied_on" type="date" :class="inputCls" />
          </label>
          <label class="text-sm">Location
            <input v-model="form.location" :class="inputCls" />
          </label>
          <label class="text-sm">Salary
            <input v-model="form.salary" :class="inputCls" />
          </label>
          <label class="text-sm col-span-2">Job link
            <input v-model="form.job_url" placeholder="https://…" :class="inputCls" />
          </label>
        </div>
        <div class="flex gap-2 mt-4">
          <button type="submit" class="bg-indigo-600 text-white rounded-lg px-4 py-2 hover:bg-indigo-700">
            {{ editingId ? 'Update' : 'Add' }}
          </button>
          <button type="button" @click="showForm = false"
            class="border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-700">
            Cancel
          </button>
        </div>
      </form>
    </div>

    <ApplicationDetail v-if="detailApp" :app="detailApp" @close="detailApp = null" @updated="load" />
  </div>
</template>
