<template>
  <view class="homePage">
    <!-- 封装的搜索框 -->
    <SearchBar v-model="keyword" @search="onSearch" @clear="onClear" />

    <!-- 轮播图 -->
    <SwiperBanner :swiperList="swiperList" @itemClick="goAnnouncement" />

    <!-- Tabs：使用 position: sticky 实现吸顶 -->
    <view class="tabs-sticky">
      <div class="custom-tabs">
        <div 
          v-for="(theme, index) in themes" 
          :key="theme.id"
          class="tab-item"
          :class="{ active: currentTab === index }"
          @click="onTabChange(index)"
        >
          {{ theme.name }}
        </div>
      </div>
    </view>

    <!-- 内容区 -->
    <WaterfallList v-model="flowList" @itemClick="goDetail" />
  </view>
</template>

<style scoped>
.tabs-sticky {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.custom-tabs {
  display: flex;
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.custom-tabs::-webkit-scrollbar {
  display: none;
}

.tab-item {
  padding: 12px 20px;
  cursor: pointer;
  position: relative;
  color: #666;
  font-size: 14px;
  transition: color 0.3s;
}

.tab-item.active {
  color: #3c9cff;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  background-color: #3c9cff;
  border-radius: 3px;
}
</style>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getTeamList, getThemeList, getSwiperList, searchTeam } from '../../api/api'
import WaterfallList from '@/components/waterFallList.vue'
import SearchBar from '@/components/searchBar.vue'
import SwiperBanner from '@/components/SwiperBanner.vue'
import { useWebSocket } from '../../utils/useWebSocket.js';

const router = useRouter()
const token = localStorage.getItem('token') || '';
const ws = useWebSocket(token);
const keyword = ref('')
const themes = reactive([])
const swiperList = ref([])  // 存储轮播图数据
let currentTab = ref(0)
let flowList = ref([])

// 浏览器环境不使用onShow，直接使用onMounted

// 页面加载时触发的逻辑
onMounted(() => {
	fetchSwiperList()  // 获取轮播图数据
  fetchThemes()
  loadList(0)
  
})

// 处理tab切换
function onTabChange(index) {
  currentTab.value = index
  const themeId = themes[index].id  // 获取当前选中主题的 themeId
  loadList(themeId)
}

// 加载首页列表数据
function loadList(themeId) {
  getTeamList(themeId).then(res => {
    if (res && res.list) {
      flowList.value = res.list || []
    } else {
      flowList.value = []  // 默认空数据
    }
  }).catch(error => {
    flowList.value = []  // 请求失败时设置为空
  })
}

// 获取主题列表
function fetchThemes() {
  getThemeList().then(res => {
    themes.splice(0, themes.length, ...res.map(item => ({
      name: item.name,
      id: item.id,
      description: item.description || '暂无描述'
    })))

    if (themes.length > 0) {
      loadList(themes[currentTab.value].id)
    }
  }).catch(() => {
    // 静默处理错误
  })
}

// 获取轮播图数据
const fetchSwiperList = async () => {
  try {
    const res = await getSwiperList();

    // 处理不同可能的响应格式
    let dataArray = [];
    if (Array.isArray(res)) {
      // 直接返回数组的情况
      dataArray = res;
    } else if (res && res.list && Array.isArray(res.list)) {
      // 返回对象包含list字段的情况
      dataArray = res.list;
    } else if (res && Array.isArray(res.data)) {
      // 返回对象包含data字段的情况
      dataArray = res.data;
    }
    
    if (dataArray.length > 0) {
      // Filter out null/undefined items before mapping
      swiperList.value = dataArray
        .filter(item => item !== null && item !== undefined)
        .map(item => ({
          image: item.cover || '',
          title: item.title || '未命名公告',
          id: item.id || '',
        }));
    } else {
      swiperList.value = [];
    }
  } catch (err) {
    swiperList.value = [];
  }
};

// 搜索触发
function onSearch(value) {
  if (!value.trim()) {
    alert('请输入关键字')
    return
  }
  router.push({
    path: '/pages/detail/searchResult',
    query: { keyword: value }
  })
}

// 清空搜索
function onClear() {
  keyword.value = ''
}

// 跳转详情页
const goDetail = (item) => {
  if (!item || !item.id) {
    return
  }
  router.push({
    path: '/pages/detail/detail',
    query: { item: JSON.stringify(item) }
  })
}

const goAnnouncement = (item) => {
  if (!item || !item.id) {
    return
  }
  router.push({
    path: '/announcement',
    query: { item: JSON.stringify(item) }
  })
}
</script>

<style scoped>
.tabs-sticky {
  position: sticky;
  top: 0;
  z-index: 999;
  background-color: #fff;
}
</style>
