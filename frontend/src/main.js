import {createApp} from 'vue'
import App from './App.vue'
import './index.css'
import Axios from 'axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'


const app = createApp(App)
    .use(ElementPlus)
const vm = app
    .mount('#app')
