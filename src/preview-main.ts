// Локальный стенд: монтирует настоящую модалку подарка с заглушками,
// чтобы посмотреть форму отправки для подарка в локе. В сборку не входит —
// точка входа подключается только из preview.html
import { Buffer } from 'buffer'
import process from 'process'
if (!globalThis.Buffer) (globalThis as any).Buffer = Buffer
if (!globalThis.process) (globalThis as any).process = process

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import I18NextVue from 'i18next-vue'
import i18next from './i18n'
import { createRedux } from './stores/storePlugin'
import { store } from './stores/store'
import VueToast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-bootstrap.css'

import PreviewVue from './Preview.vue'

// вне Telegram язык не определяется, а смотреть надо русские строки
i18next.changeLanguage('ru')

const app = createApp(PreviewVue)
app.config.warnHandler = () => {}
app.use(createPinia())
app.use(I18NextVue, { i18next })
app.use(createRedux(store))
app.use(VueToast, { position: 'top-right' })
app.mount('#app')
