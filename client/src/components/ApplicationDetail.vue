<script setup>
import { ref, onMounted } from 'vue'
import api from '../api'

const props = defineProps({ app: { type: Object, required: true } })
const emit = defineEmits(['close', 'updated'])

const notes = ref([])
const reminders = ref([])
const newNote = ref('')
const reminderTitle = ref('')
const reminderAt = ref('')
const resumePath = ref(props.app.resume_path || null)

async function load() {
  notes.value = (await api.get('/notes', { params: { application_id: props.app.id } })).data
  reminders.value = (await api.get('/reminders', { params: { application_id: props.app.id } })).data
}
onMounted(load)

async function addNote() {
  if (!newNote.value.trim()) return
  await api.post('/notes', { application_id: props.app.id, body: newNote.value.trim() })
  newNote.value = ''
  await load()
}
async function deleteNote(id) {
  await api.delete(`/notes/${id}`)
  await load()
}

async function addReminder() {
  if (!reminderTitle.value.trim() || !reminderAt.value) return
  await api.post('/reminders', {
    application_id: props.app.id, title: reminderTitle.value.trim(), remind_at: reminderAt.value,
  })
  reminderTitle.value = ''
  reminderAt.value = ''
  await load()
}
async function toggleReminder(r) {
  await api.patch(`/reminders/${r.id}`, { done: !r.done })
  await load()
}
async function deleteReminder(id) {
  await api.delete(`/reminders/${id}`)
  await load()
}

async function uploadResume(e) {
  const file = e.target.files[0]
  if (!file) return
  const fd = new FormData()
  fd.append('resume', file)
  const { data } = await api.post(`/applications/${props.app.id}/resume`, fd)
  resumePath.value = data.resume_path
  emit('updated')
}

const inputCls = 'border border-slate-300 dark:border-slate-600 dark:bg-slate-700 rounded-lg px-2 py-1.5 text-sm'
</script>

<template>
  <div class="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-20" @click.self="emit('close')">
    <div class="bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
      <div class="flex items-start justify-between p-5 border-b border-slate-200 dark:border-slate-700">
        <div>
          <h2 class="text-lg font-semibold">{{ app.company_name || 'Application' }}</h2>
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ app.role }}</p>
        </div>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">✕</button>
      </div>

      <div class="p-5 space-y-6">
        <section>
          <h3 class="text-sm font-medium mb-2">Resume</h3>
          <a v-if="resumePath" :href="resumePath" target="_blank" class="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
            View current resume
          </a>
          <p v-else class="text-sm text-slate-400">No resume uploaded.</p>
          <input type="file" accept=".pdf,.doc,.docx" @change="uploadResume" class="mt-2 text-sm" />
        </section>

        <section>
          <h3 class="text-sm font-medium mb-2">Reminders</h3>
          <ul class="space-y-1 mb-2">
            <li v-for="r in reminders" :key="r.id" class="flex items-center gap-2 text-sm">
              <input type="checkbox" :checked="r.done" @change="toggleReminder(r)" />
              <span :class="r.done ? 'line-through text-slate-400' : ''">
                {{ r.title }} — {{ new Date(r.remind_at).toLocaleString() }}
              </span>
              <button @click="deleteReminder(r.id)" class="ml-auto text-xs text-slate-400 hover:text-red-600">remove</button>
            </li>
          </ul>
          <div class="flex gap-2">
            <input v-model="reminderTitle" placeholder="e.g. Interview" :class="['flex-1', inputCls]" />
            <input v-model="reminderAt" type="datetime-local" :class="inputCls" />
            <button @click="addReminder" class="bg-indigo-600 text-white rounded-lg px-3 text-sm hover:bg-indigo-700">Add</button>
          </div>
        </section>

        <section>
          <h3 class="text-sm font-medium mb-2">Notes</h3>
          <ul class="space-y-2 mb-2">
            <li v-for="n in notes" :key="n.id"
              class="bg-slate-50 dark:bg-slate-700 rounded-lg p-2 text-sm flex justify-between gap-2">
              <span>{{ n.body }}</span>
              <button @click="deleteNote(n.id)" class="text-xs text-slate-400 hover:text-red-600">remove</button>
            </li>
          </ul>
          <div class="flex gap-2">
            <input v-model="newNote" placeholder="Add a note…" :class="['flex-1', inputCls]" @keyup.enter="addNote" />
            <button @click="addNote" class="bg-indigo-600 text-white rounded-lg px-3 text-sm hover:bg-indigo-700">Add</button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
