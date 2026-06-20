<script setup>
import { ref, reactive, onMounted } from 'vue'
import api from '../api'

const companies = ref([])
const showForm = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', website: '', notes: '' })

async function load() {
  companies.value = (await api.get('/companies')).data
}
onMounted(load)

function openAdd() {
  editingId.value = null
  Object.assign(form, { name: '', website: '', notes: '' })
  showForm.value = true
}

function openEdit(c) {
  editingId.value = c.id
  Object.assign(form, { name: c.name, website: c.website || '', notes: c.notes || '' })
  showForm.value = true
}

async function submitForm() {
  const payload = { name: form.name, website: form.website, notes: form.notes }
  if (editingId.value) await api.put(`/companies/${editingId.value}`, payload)
  else await api.post('/companies', payload)
  showForm.value = false
  await load()
}

async function remove(id) {
  if (!confirm('Delete this company? Its applications stay but lose the company link.')) return
  await api.delete(`/companies/${id}`)
  await load()
}

const inputCls = 'mt-1 w-full border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-3 py-2'
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1 class="text-xl font-semibold">Companies</h1>
      <button @click="openAdd" class="bg-indigo-600 text-white text-sm rounded-lg px-3 py-1.5 hover:bg-indigo-700">
        + Add company
      </button>
    </div>

    <p v-if="companies.length === 0" class="text-slate-500 dark:text-slate-400">No companies yet. Add one above.</p>

    <div class="grid md:grid-cols-2 gap-3">
      <div v-for="c in companies" :key="c.id"
        class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4">
        <div class="flex items-start justify-between">
          <div>
            <div class="font-medium">{{ c.name }}</div>
            <a v-if="c.website" :href="c.website" target="_blank" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
              {{ c.website }}
            </a>
          </div>
          <div class="flex gap-2">
            <button @click="openEdit(c)" class="text-xs text-slate-500 dark:text-slate-400 hover:text-indigo-600">Edit</button>
            <button @click="remove(c.id)" class="text-xs text-slate-500 dark:text-slate-400 hover:text-red-600">Delete</button>
          </div>
        </div>
        <p v-if="c.notes" class="text-sm text-slate-500 dark:text-slate-400 mt-2">{{ c.notes }}</p>
      </div>
    </div>

    <div v-if="showForm" class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-10">
      <form @submit.prevent="submitForm"
        class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl p-5 w-full max-w-md">
        <h2 class="text-lg font-semibold mb-3">{{ editingId ? 'Edit company' : 'Add company' }}</h2>
        <label class="block text-sm mb-3">Name
          <input v-model="form.name" required :class="inputCls" />
        </label>
        <label class="block text-sm mb-3">Website
          <input v-model="form.website" placeholder="https://…" :class="inputCls" />
        </label>
        <label class="block text-sm mb-4">Notes
          <textarea v-model="form.notes" rows="3" :class="inputCls"></textarea>
        </label>
        <div class="flex gap-2">
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
  </div>
</template>
