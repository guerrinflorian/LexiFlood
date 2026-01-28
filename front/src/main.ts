import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Dialog, Notify, Quasar } from 'quasar';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import './assets/tailwind.css';
import App from './App.vue';

const app = createApp(App);

app.use(createPinia());
app.use(Quasar, {
  plugins: { Dialog, Notify }
});

app.mount('#app');
