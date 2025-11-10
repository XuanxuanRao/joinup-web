<template>
  <view>
    <!-- 这里展示公告详情 -->
    <view v-if="announcementDetails">
      <!-- 公告封面 -->
      <image v-if="announcementDetails.cover" :src="announcementDetails.cover" mode="aspectFill" class="cover-image" />
      
      <!-- 公告标题：用 view 包住 text -->
      <view class="announcement-title-wrapper">
        <text class="announcement-title">{{ announcementDetails.title || '未命名公告' }}</text>
      </view>

      
      <!-- 发布者和发布时间信息 -->
      <view class="poster-time-info">
        <view class="poster-info">
          <text class="poster-label">发布者：</text>
          <image v-if="announcementDetails.posterAvatar" :src="announcementDetails.posterAvatar" mode="aspectFill" class="poster-avatar" />
          <text class="poster-username">{{ announcementDetails.posterUsername || '未知用户' }}</text>
        </view>

        <text class="announcement-time">发布时间：{{ formattedCreateTime }}</text>
      </view>
	  
	  <!-- 公告内容 -->
	  <text class="announcement-content">{{ announcementDetails.content || '暂无内容' }}</text>
    </view>
    <view v-else class="loading">
      <text>加载中...</text>
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

// 页面加载时获取公告详情
onMounted(async () => {
  try {
    let item = route.query.item
    if (!item) return

    item = JSON.parse(decodeURIComponent(item))
    if (item && item.id) {
      const res = await getAnnouncementDetails(item.id)
      if (res) {
        announcementDetails.value = res
      }
    }
  } catch (error) {
    console.error('获取公告详情失败：', error)
    announcementDetails.value = null
  }
})

// 格式化时间
const formattedCreateTime = computed(() => {
  if (!announcementDetails.value || !announcementDetails.value.createTime) return ''
  const date = new Date(announcementDetails.value.createTime)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
})
</script>

<style lang="scss">
/* 页面样式 */
.cover-image {
  width: 90%;
  height: 300rpx;
  margin: 32rpx auto 24rpx;
  border-radius: 16rpx;
  box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.1);
  display: block;
}

.poster-label {
  font-size: 28rpx;
  color: #333;
  margin-right: 8rpx;
}


.announcement-title-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24rpx;
}

.announcement-title {
  font-size: 40rpx;
  font-weight: 700;
  padding: 0 20rpx;
  line-height: 1.4;
  color: #222;
  border-bottom: 4rpx solid #f1f1f1;
  max-width: 90%;
  text-align: center;
  word-break: break-word;
}



.announcement-content {
  font-size: 28rpx;
  color: #333;
  line-height: 1.5;
  margin-bottom: 16rpx;
}

.poster-time-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16rpx;
  margin-bottom: 16rpx;
}

.poster-info {
  display: flex;
  align-items: center;
}

.poster-avatar {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  margin-right: 8rpx;
}

.poster-username {
  font-size: 28rpx;
  color: #555;
}

.announcement-time {
  font-size: 24rpx;
  color: #777;
  margin-left: 16rpx;
}

</style>
