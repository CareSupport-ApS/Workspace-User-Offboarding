import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';
import Button from 'primevue/button';
import { Checkbox, InputText, Message, Textarea } from 'primevue';
import App from './App.vue';
import router from './router';
import './styles.css';

const app = createApp(App);

app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});

app.component('Button', Button);
app.component('InputText', InputText);
app.component('Checkbox', Checkbox);
app.component('Textarea', Textarea);
app.component('Message', Message);
app.use(router);

app.mount('#app');
