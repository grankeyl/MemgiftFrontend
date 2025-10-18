// main.ts (исправлено)
import { Buffer } from 'buffer'
import process from 'process'
if (!globalThis.Buffer) (globalThis as any).Buffer = Buffer
if (!globalThis.process) (globalThis as any).process = process

import './hot-shim'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import AppVue from './App.vue'
import Router from './router'
import I18NextVue from 'i18next-vue'
import i18next from './i18n'
import { createRedux } from './stores/storePlugin'
import { store } from './stores/store'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-bootstrap.css'
import { Confirm } from 'notiflix'

// Confirm.init({ backgroundColor: 'transparent', zindex: 2000 })
Confirm.init({ zindex: 2000 })

const app = createApp(AppVue)
const pinia = createPinia()

app.config.warnHandler = () => {}

app.use(pinia)

app.use(I18NextVue, { i18next })
app.use(createRedux(store))
app.use(Router)
app.use(VueToast, { position: 'top-right' })

app.mount('#app')