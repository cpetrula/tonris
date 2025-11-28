import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'

import App from './App.vue'
import router from './router'

import './style.css'

// PrimeVue components
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Menu from 'primevue/menu'
import Message from 'primevue/message'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'

const app = createApp(App)

// Pinia
app.use(createPinia())

// Vue Router
app.use(router)

// PrimeVue
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'system',
      cssLayer: false
    }
  }
})
app.use(ToastService)

// Register PrimeVue components globally
app.component('PButton', Button)
app.component('PCard', Card)
app.component('PInputText', InputText)
app.component('PPassword', Password)
app.component('PMenu', Menu)
app.component('PMessage', Message)
app.component('PToast', Toast)

app.mount('#app')
