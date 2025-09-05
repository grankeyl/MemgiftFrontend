import './hot-shim'

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRedux } from './stores/storePlugin';
import { store } from './stores/store';
import { Confirm } from 'notiflix';

import AppVue from './App.vue';
import Router from './router';
import I18NextVue from 'i18next-vue';
import i18next from './i18n';

import VueToast from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';

const app = createApp(AppVue);
const pinia = createPinia();

Confirm.init({
  backgroundColor: 'transparent',
  zindex: 2000,
});

app.config.warnHandler = () => {};
app.use(Router);
app.use(createRedux(store));
app.use(I18NextVue, { i18next });
app.use(pinia);
app.use(VueToast, { position: 'top-right' });

app.mount('#app');