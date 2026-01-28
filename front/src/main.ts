import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Dialog, Notify, Quasar, QBtn, QLinearProgress, QTooltip } from 'quasar';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import './assets/tailwind.css';
import App from './App.vue';

const app = createApp(App);

app.use(createPinia());
app.use(Quasar, {
  plugins: { Dialog, Notify },
  components: { QBtn, QLinearProgress, QTooltip }
});

app.mount('#app');
