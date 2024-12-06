import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import VxeUI from 'vxe-pc-ui'
import 'vxe-pc-ui/lib/style.css'
import VxeUITable from 'vxe-table'
import 'vxe-table/lib/style.css'

createApp(App).use(VxeUI).use(VxeUITable).mount('#app')
