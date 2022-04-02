import {createApp} from 'vue'
import App from './App.vue'
import './index.css'
import Axios from 'axios'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './css/iconfont.css'
import * as ElIconModules from '@element-plus/icons-vue'


const app = createApp(App)

for (const name in ElIconModules){
	app.component(name,(ElIconModules)[name])
}
    
app.use(ElementPlus)

const vm = app
    .mount('#app')
