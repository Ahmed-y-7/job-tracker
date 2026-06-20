import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { useThemeStore } from './stores/theme'

const app = createApp(App)
app.use(createPinia())
app.use(router)

// Apply the saved/preferred theme before mount to avoid a flash.
useThemeStore().init()

app.mount('#app')
