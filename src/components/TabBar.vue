<template>
  <div v-if="showTabBar" class="tab-bar">
    <div 
      v-for="item in tabBarList" 
      :key="item.pagePath"
      @click="navigateTo(item.pagePath)"
      class="tab-item"
      :class="{ active: isActive(item.pagePath) }"
    >
      <img :src="isActive(item.pagePath) ? item.selectedIconPath : item.iconPath" alt="" class="tab-icon" />
      <span class="tab-text">{{ item.text }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// TabBar配置，与pages.json中的配置保持一致
const tabBarList = [
  {
    pagePath: '/',
    iconPath: '/static/resource/images/tab_index.png',
    selectedIconPath: '/static/resource/images/tab_index_seled.png',
    text: '首页'
  },
  {
    pagePath: '/pages/contacts/contacts',
    iconPath: '/static/resource/images/tab_pub.png',
    selectedIconPath: '/static/resource/images/tab_pub_seled.png',
    text: '消息'
  },
  {
    pagePath: '/pages/blank/blank',
    iconPath: '/static/resource/images/image_add.png',
    selectedIconPath: '/static/resource/images/image_add.png',
    text: '创建',
    midButton: true
  },
  {
    pagePath: '/pages/order/order',
    iconPath: '/static/resource/images/tab_pub.png',
    selectedIconPath: '/static/resource/images/tab_pub_seled.png',
    text: '通知'
  },
  {
    pagePath: '/pages/user/user',
    iconPath: '/static/resource/images/tab_user.png',
    selectedIconPath: '/static/resource/images/tab_user_seled.png',
    text: '我的'
  }
]

// 检查当前路由是否是tabBar页面
const showTabBar = computed(() => {
  const currentPath = route.path
  // 首页特殊处理
  if (currentPath === '/') return true
  // 检查其他tabBar页面
  return tabBarList.some(item => item.pagePath === currentPath)
})

// 判断当前项是否激活
const isActive = (pagePath) => {
  // 首页特殊处理
  if (pagePath === '/' && route.path === '/') return true
  return route.path === pagePath
}

// 跳转到指定页面
const navigateTo = (pagePath) => {
  router.push(pagePath)
}
</script>

<style scoped>
.tab-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #ffffff;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 999;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  position: relative;
}

.tab-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 2px;
}

.tab-text {
  font-size: 10px;
  color: #535353;
}

.tab-item.active .tab-text {
  color: #0bb584;
}

/* 中间创建按钮的特殊样式 */
.tab-item:nth-child(3) .tab-icon {
  width: 36px;
  height: 36px;
  margin-top: -12px;
}

/* 主内容区域需要留出底部空间 */
:deep(.tab-content) {
  padding-bottom: 50px;
}
</style>