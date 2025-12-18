import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createHead } from '@unhead/vue/client'

import './assets/locale-font.css'
import './assets/darkmode.css'

const app = createApp(App)

app.use(router)
app.use(createHead())

app.mount('#app')
