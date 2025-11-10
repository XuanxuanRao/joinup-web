<template>
  <view class="swiper-container">
    <!-- 直接使用内置的轮播图组件 -->
    <div class="custom-swiper">
      <div v-for="(item, index) in displayList" :key="index" class="swiper-item" @click="handleClick(item)">
        <img :src="item.image" :alt="item.title" class="swiper-image" />
        <div class="swiper-title">{{ item.title }}</div>
      </div>
    </div>
    

  </view>
</template>

<script setup>
import { computed } from 'vue'

const emit = defineEmits(['update:modelValue', 'itemClick'])

const props = defineProps({
  swiperList: {
    type: Array,
    default: () => []
  },

})

// 默认的模拟数据
const defaultSwiperData = [
  {
    image: '/static/resource/images/push_img.png',
    title: '轮播图1 - 测试公告',
    id: '1'
  },
  {
    image: '/static/resource/images/ic_adv.png',
    title: '轮播图2 - 最新活动',
    id: '2'
  }
]

// 计算属性：优先使用传入的数据，如果为空则使用默认数据
const displayList = computed(() => {
  // 如果传入的数据存在且有效，则使用传入的数据，否则使用默认数据
  if (Array.isArray(props.swiperList) && props.swiperList.length > 0) {
    return props.swiperList
  }
  return defaultSwiperData
})

const handleClick = (item) => {
  if (!item || !item.id) {
    return
  }
  emit('itemClick', item)
}
</script>

<style scoped>
.swiper-container {
  margin: 16rpx auto;
  width: 100%;
  max-width: 1000px;
  overflow: hidden;
}

.custom-swiper {
  display: flex;
  width: 100%;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
}

.custom-swiper::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.swiper-item {
  flex-shrink: 0;
  width: 100%;
  max-width: 700px;
  margin: 0 auto;
  scroll-snap-align: center;
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.swiper-item:hover {
  transform: scale(1.02);
}

.swiper-item:active {
  transform: scale(0.98);
}

.swiper-image {
  width: 100%;
  height: 200rpx;
  min-height: 140px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 16rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

/* 响应式设计 */
@media (min-width: 768px) {
  .swiper-container {
    margin: 24rpx auto;
  }
  
  .swiper-item {
    width: 90%;
  }
  
  .swiper-image {
    height: 220rpx;
    max-height: 240px;
  }
}

@media (min-width: 1024px) {
  .swiper-item {
    width: 80%;
  }
  
  .swiper-image {
    height: 240rpx;
    max-height: 260px;
  }
}

.swiper-title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  font-size: 28rpx;
  font-weight: 500;
  border-radius: 0 0 16rpx 16rpx;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


</style>
