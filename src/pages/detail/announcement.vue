<template>
  <view class="announcement-page">
    <!-- 这里展示公告详情 -->
    <view v-if="announcementDetails" class="announcement-card">
      <!-- 公告封面 -->
      <view class="cover-section">
        <!-- 使用view包裹图片，确保即使图片加载失败也有背景显示 -->
        <view class="image-wrapper">
          <img 
            :src="announcementDetails.cover" 
            class="cover-image" 
            mode="aspectFill"
          />
        </view>
        <view class="cover-gradient"></view>
      </view>
      
      <!-- 公告内容区域 -->
      <view class="content-section">
        <!-- 公告标题 - 确保完全居中 -->
        <view class="title-section">
          <!-- 装饰图标 -->
          <view class="title-icon">📢</view>
          
          <!-- 主标题 -->
          <text class="announcement-title">{{ announcementDetails.title || '未命名公告' }}</text>
          
          <!-- 元数据信息 -->
          <view class="title-meta">
            <view class="view-count">👁️ {{ announcementDetails.viewCount || 0 }} 阅读</view>
            <view class="separator">•</view>
            <view class="share-count">🔗 {{ announcementDetails.shareCount || 0 }} 分享</view>
          </view>
        </view>

        <!-- 发布者和发布时间信息 -->
        <view class="metadata-section">
          <view class="publisher-card">
            <view class="publisher-avatar-section">
              <view class="avatar-container">
                <img :src="announcementDetails.posterAvatar" mode="aspectFill" class="publisher-avatar" />
                <view class="avatar-status"></view>
              </view>
            </view>
            <view class="publisher-info-section">
              <view class="publisher-name-badge">
                <text class="publisher-name">{{ announcementDetails.posterUsername || '未知用户' }}</text>
                <view class="official-badge">
                  <text class="badge-text">官方</text>
                </view>
              </view>
              <view class="publisher-meta">
                <text class="publish-time">🕒 {{ formattedCreateTime }}</text>
                <text class="publisher-role">管理员</text>
              </view>
            </view>
            <view class="publisher-actions">
              <view class="follow-button" @click="handleFollow">
                <text class="follow-text">{{ isFollowed ? '已关注' : '关注' }}</text>
              </view>
            </view>
          </view>
        </view>
	  
        <!-- 公告内容 -->
        <view class="announcement-content">
          <view class="content-container">
            <!-- 处理空内容的特殊样式 -->
            <view v-if="!announcementDetails.content || announcementDetails.content.trim() === ''" class="empty-content">
              <view class="empty-icon">📄</view>
              <text class="empty-text">暂无公告内容</text>
          </view>
          <!-- 普通文本内容显示 -->
            <view v-else class="content-wrapper">
              <text class="content-text">{{ announcementDetails.content }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 加载状态 -->
    <view v-else-if="isLoading" class="loading-container">
      <view class="loading-spinner"></view>
      <text class="loading-text">正在加载公告...</text>
    </view>
    
    <!-- 错误状态 -->
    <view v-else-if="hasError" class="error-container">
      <view class="error-icon">⚠️</view>
      <text class="error-title">加载失败</text>
      <text class="error-message">{{ errorMessage || '网络异常，请稍后重试' }}</text>
      <view class="retry-button" @click="fetchAnnouncementDetails">
        <text class="retry-text">重新加载</text>
      </view>
    </view>
    
    <!-- 兜底空状态 -->
    <view v-else class="empty-container">
      <view class="empty-icon">📭</view>
      <text class="empty-title">暂无公告信息</text>
      <text class="empty-message">该公告不存在或已被删除</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getAnnouncementDetails } from '../../api/api'

const route = useRoute()
const announcementDetails = ref(null)
const isLoading = ref(true)
const hasError = ref(false)
const errorMessage = ref('')
const isFollowed = ref(false)

// 处理关注按钮点击
const handleFollow = () => {
  isFollowed.value = !isFollowed.value
  // 这里可以添加实际的关注/取消关注逻辑
}

// 获取公告详情的函数
const fetchAnnouncementDetails = async () => {
  isLoading.value = true
  hasError.value = false
  try {
    let item = route.query.item
    if (!item) {
      hasError.value = true
      errorMessage.value = '未找到公告信息'
      return
    }

    item = JSON.parse(decodeURIComponent(item))
    if (!item || !item.id) {
      hasError.value = true
      errorMessage.value = '公告信息不完整'
      return
    }

    const res = await getAnnouncementDetails(item.id)
    if (res) {
        announcementDetails.value = res
    } else {
      hasError.value = true
      errorMessage.value = '获取公告详情失败'
    }
  } catch (error) {
    console.error('获取公告详情失败：', error)
    hasError.value = true
    errorMessage.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
  }
}

// 页面加载时获取公告详情
onMounted(() => {
  fetchAnnouncementDetails()
})

// 格式化时间
const formattedCreateTime = computed(() => {
  if (!announcementDetails.value || !announcementDetails.value.createTime) return ''
  const date = new Date(announcementDetails.value.createTime)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
})
</script>

<style lang="scss">
/* ============================ */
/* 变量定义 - 集中管理主题配置 */
/* ============================ */
$primary-color: #3498db;
$secondary-color: #2ecc71;
$text-primary: #2c3e50;
$text-secondary: #7f8c8d;
$text-light: #bdc3c7;
$background-primary: #f8fafc;
$background-secondary: #ffffff;
$border-color: #e2e8f0;
$shadow-light: 0 4px 6px rgba(0, 0, 0, 0.05);
$shadow-medium: 0 10px 25px rgba(0, 0, 0, 0.1);
$radius-small: 8px;
$radius-medium: 12px;
$radius-large: 16px;
$radius-full: 9999px;

/* ============================ */
/* 基础样式 - 全局和页面级别 */
/* ============================ */
page {
  background-color: $background-primary;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
  width: 100%;
}

.announcement-page {
  min-height: 100vh;
  background-color: $background-primary;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;
}

/* ============================ */
/* 组件样式 - 按功能模块组织 */
/* ============================ */
/* 公告卡片样式 */
.announcement-card {
  background-color: $background-secondary;
  border-radius: $radius-large;
  overflow: hidden;
  box-shadow: $shadow-light;
  transition: all 0.3s ease;
  margin-bottom: 20px;
  width: 100%;
}

.announcement-card:hover {
  box-shadow: $shadow-medium;
  transform: translateY(-2px);
}

/* 封面图片样式 */
.cover-section {
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
  height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4CAF50, #2E7D32);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.announcement-card:hover .cover-image {
  transform: scale(1.02);
}

.cover-gradient {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.3));
  pointer-events: none;
}

/* 内容区域样式 */
.content-section {
  padding: 24px;
}

/* 标题样式 */
.title-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid $border-color;
  position: relative;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.title-icon {
  font-size: 28px;
  color: $primary-color;
  margin-bottom: 16px;
  animation: pulse 2s infinite;
  background-color: $background-secondary;
  padding: 12px;
  border-radius: 50%;
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.2);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.announcement-title {
  font-size: 32px;
  font-weight: 700;
  color: $text-primary;
  line-height: 1.3;
  word-break: break-word;
  margin-bottom: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  text-align: center;
  width: 100%;
  max-width: 100%;
  display: block;
}

.title-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: $text-secondary;
  margin-top: 8px;
  justify-content: center;
}

.view-count, .share-count {
  display: flex;
  align-items: center;
  gap: 4px;
}

.separator {
  color: $text-light;
  font-size: 12px;
}

/* 元数据信息样式 */
.metadata-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 1px solid $border-color;
}

.publisher-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  padding: 16px;
  border-radius: $radius-large;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(226, 232, 240, 0.5);
}

.publisher-avatar-section {
  flex: 0 0 auto;
}

.avatar-container {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, $primary-color, $secondary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid $background-secondary;
  box-shadow: 0 6px 15px rgba(52, 152, 219, 0.2);
  transition: all 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 20px rgba(52, 152, 219, 0.3);
}

.publisher-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
}

.avatar-status {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: $secondary-color;
  border: 2px solid $background-secondary;
  animation: statusPulse 2s infinite;
}

@keyframes statusPulse {
  0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.7); }
  70% { box-shadow: 0 0 0 8px rgba(46, 204, 113, 0); }
  100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
}

.publisher-info-section {
  flex: 1;
  margin: 0 20px;
}

.publisher-name-badge {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.publisher-name {
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
  margin-right: 12px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.official-badge {
  background: linear-gradient(135deg, $primary-color, #2980b9);
  color: white;
  padding: 4px 12px;
  border-radius: $radius-full;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
  display: flex;
  align-items: center;
  gap: 4px;
}

.official-badge::before {
  content: '✓';
  font-size: 10px;
}

.publisher-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: $text-secondary;
}

.publish-time {
  display: flex;
  align-items: center;
  gap: 4px;
}

.publisher-role {
  background-color: #f1f5f9;
  padding: 2px 8px;
  border-radius: $radius-full;
  font-size: 12px;
  color: $text-secondary;
  border: 1px solid $border-color;
}

.publisher-actions {
  flex: 0 0 auto;
}

.follow-button {
  background: linear-gradient(135deg, $primary-color, #2980b9);
  color: white;
  padding: 10px 20px;
  border-radius: $radius-full;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
  border: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.follow-button:hover {
  background: linear-gradient(135deg, #2980b9, #1f5f8b);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(52, 152, 219, 0.4);
}

.follow-button:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
}

/* 公告内容样式 - 修复白色块问题 */
.announcement-content {
  margin-bottom: 10px;
}

/* 内容容器 */
.content-container {
  background-color: $background-secondary;
  border-radius: $radius-large;
  box-shadow: $shadow-light;
  padding: 24px;
  border: 1px solid $border-color;
  transition: all 0.3s ease;
}

.content-container:hover {
  box-shadow: $shadow-medium;
  transform: translateY(-2px);
}

/* 内容文本样式 */
.content-wrapper {
  padding: 0;
  margin: 0;
  line-height: 1.8;
}

.content-text {
  font-size: 16px;
  line-height: 1.8;
  color: $text-primary;
  white-space: pre-line;
  word-break: break-word;
  hyphens: auto;
  display: block;
}

/* 空内容状态 */
.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
  background-color: $background-primary;
  border-radius: $radius-medium;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: $text-light;
}

.empty-text {
  font-size: 16px;
  color: $text-secondary;
  font-weight: 500;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px 20px;
  background-color: $background-secondary;
  border-radius: $radius-large;
  box-shadow: $shadow-light;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid $border-color;
  border-top-color: $primary-color;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 16px;
  color: $text-secondary;
  font-weight: 500;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 错误状态样式 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px 20px;
  text-align: center;
  background-color: $background-secondary;
  border-radius: $radius-large;
  box-shadow: $shadow-light;
}

.error-icon {
  font-size: 64px;
  margin-bottom: 20px;
  color: #f39c12;
}

.error-title {
  font-size: 20px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8px;
}

.error-message {
  font-size: 14px;
  color: $text-secondary;
  margin-bottom: 24px;
  line-height: 1.5;
  max-width: 300px;
}

.retry-button {
  padding: 12px 24px;
  background-color: $primary-color;
  color: white;
  border-radius: $radius-medium;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
}

.retry-button:active {
  background-color: #2980b9;
  transform: scale(0.98);
  box-shadow: 0 2px 6px rgba(52, 152, 219, 0.2);
}

/* 空状态样式 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px 20px;
  text-align: center;
  background-color: $background-secondary;
  border-radius: $radius-large;
  box-shadow: $shadow-light;
}

.empty-title {
  font-size: 18px;
  font-weight: 600;
  color: $text-primary;
  margin-bottom: 8px;
}

.empty-message {
  font-size: 14px;
  color: $text-secondary;
  line-height: 1.5;
  max-width: 300px;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .announcement-page {
    padding: 12px;
    max-width: 100%;
  }
  
  .content-section {
    padding: 16px;
  }
  
  .announcement-title {
    font-size: 24px;
  }
  
  .content-text {
    font-size: 14px;
  }
  
  .cover-section {
    height: 180px;
  }
  
  .publisher-card {
    flex-direction: column;
    text-align: center;
    padding: 12px;
  }
  
  .publisher-info-section {
    margin: 12px 0;
  }
  
  .publisher-meta {
    justify-content: center;
  }
  
  .title-meta {
    flex-direction: column;
    gap: 8px;
  }
  
  .title-icon {
    font-size: 24px;
    padding: 10px;
  }
}

@media (min-width: 768px) {
  .announcement-page {
    padding: 24px;
  }
  
  .announcement-card {
    margin-bottom: 32px;
  }
  
  .cover-section {
    height: 280px;
  }
  
  .announcement-title {
    font-size: 36px;
  }
  
  .content-text {
    font-size: 16px;
  }
}

/* 大屏幕优化 */
@media (min-width: 1200px) {
  .announcement-page {
    padding: 30px;
  }
}

/* 夜间模式支持 */
@media (prefers-color-scheme: dark) {
  :root {
    --primary-color: #3498db;
    --secondary-color: #2ecc71;
    --text-primary: #ecf0f1;
    --text-secondary: #bdc3c7;
    --text-light: #95a5a6;
    --background-primary: #1a252f;
    --background-secondary: #2c3e50;
    --border-color: #34495e;
    --shadow-light: 0 4px 6px rgba(0, 0, 0, 0.3);
    --shadow-medium: 0 10px 25px rgba(0, 0, 0, 0.5);
  }
  
  $primary-color: var(--primary-color);
  $secondary-color: var(--secondary-color);
  $text-primary: var(--text-primary);
  $text-secondary: var(--text-secondary);
  $text-light: var(--text-light);
  $background-primary: var(--background-primary);
  $background-secondary: var(--background-secondary);
  $border-color: var(--border-color);
  $shadow-light: var(--shadow-light);
  $shadow-medium: var(--shadow-medium);
}
</style>