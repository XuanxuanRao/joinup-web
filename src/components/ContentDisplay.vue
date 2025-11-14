<!-- ContentDisplay 组件 - 修复模板结构问题 -->
<template>
  <!-- <view class="content-display"> -->
    <!-- 处理空内容的特殊样式 -->
    <view v-if="isEmpty" class="empty-content">
      <view class="empty-icon">📄</view>
      <text class="empty-text">暂无公告内容</text>
    </view>
    <!-- 普通文本内容显示 -->
    <view v-else class="content-wrapper">
      <text class="content-text">{{ content }}</text>
    </view>
  <!-- </view> -->
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  content: {
    type: String,
    default: ''
  }
})

const isEmpty = computed(() => {
  return !props.content || props.content.trim() === ''
})
</script>

<style lang="scss" scoped>
.content-display {
  margin-bottom: 10px;
  background-color: var(--background-secondary);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-light);
  padding: 24px;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.content-display:hover {
  box-shadow: var(--shadow-medium);
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
  color: var(--text-primary);
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
  background-color: var(--background-primary);
  border-radius: var(--radius-medium);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--text-light);
}

.empty-text {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 375px) {
  .content-display {
    padding: 16px;
  }
  .content-text {
    font-size: 14px;
  }
}

@media (min-width: 768px) {
  .content-text {
    font-size: 16px;
  }
}
</style>