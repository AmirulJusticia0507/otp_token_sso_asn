import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { router, installGuard } from './router'
import { useAuthStore } from './stores/auth.js'
import './assets/main.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
installGuard(router, useAuthStore)
app.mount('#app')
