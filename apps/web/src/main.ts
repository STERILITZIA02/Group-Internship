import { createApp } from 'vue'
import App from './App.vue'
import './style.css'
import { installEditorI18n } from './i18n'

const app = createApp(App)
installEditorI18n(app)
app.mount('#app')
