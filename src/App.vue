<template>
  <div>
    <router-view />
    <TabBar />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import TabBar from './components/TabBar.vue'

const router = useRouter()

// 页面加载时触发的逻辑
onMounted(() => {
  // 获取token
  const token = localStorage.getItem('token')
  
  // 检查登录状态
  checkLoginStatus()
})

// 页面卸载时触发的逻辑 - 暂时不需要特殊处理

// 检查登录状态
function checkLoginStatus() {
  const token = localStorage.getItem('token')
  
  if (!token) {
    // 如果没有token，跳转到登录页
    router.push('/login')
  }
}


</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
  max-width: 100%;
  height: 100vh;
  margin: 0;
  padding: 0;
}

/* 确保所有页面内容都居中且有最大宽度限制 */
.router-view {
  max-width: 800px;
  margin: 0 auto;
  width: 100%;
}

/* 为主要内容区域添加底部边距，避免被TabBar遮挡 */
.tab-content {
  padding-bottom: 50px;
}
</style>