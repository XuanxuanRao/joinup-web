import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import App from './App.vue'
import router from './router'

// 创建Vue应用实例
const app = createApp(App)

// 配置Pinia状态管理
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// 使用插件
app.use(pinia)
app.use(router)

// 挂载应用
app.mount('#app')

console.log('Vue应用已成功初始化')