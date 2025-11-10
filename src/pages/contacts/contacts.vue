<template>
  <div class="contact-list">
    <!-- 搜索栏 -->
    <div class="search-bar">
      <div class="search-container">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="搜索" 
          v-model="searchQuery" 
          class="search-input"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>
    
    <!-- 联系人列表 -->
    <div class="contacts" style="overflow-y: auto;">
      
      <!-- 加载状态 -->
        <div v-if="loading" class="loading">
          <p>正在加载联系人列表...</p>
        </div>
        
        <!-- 空状态 -->
        <div v-else-if="filteredContacts.length === 0" class="empty-state">
          <p>暂无联系人</p>
          <small>您的联系人列表为空</small>
        </div>
        
        <!-- 联系人列表 -->
        <template v-else>
          <div 
            v-for="contact in filteredContacts" 
            :key="contact.id" 
            class="contact-item" 
            @click="goToChat(contact.conversation)"
          >
          <!-- contact.unreadMessageCount为0时不显示,大于99显示99+ -->
            <div class="avatar">
              <img :src="contact.cover || '/static/resource/images/default-avatar.png'" :alt="contact.name" />
              <div v-if="contact.unreadMessageCount" class="badge">{{ contact.unreadMessageCount > 99 ? '99+' : contact.unreadMessageCount }}</div>
            </div>
            <div class="info">
              <div class="name">{{ contact.name }}</div>
              <div class="last-msg">{{ contact.lastMessageContent }}</div>
            </div>
            <div class="right-content">
              <div v-if="contact.lastMessage && contact.lastMessage.createTime" class="time">{{ formatTime(contact.lastMessage.createTime) }}</div>
            </div>
          </div>
        </template>
      </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, onUpdated } from 'vue';
import { useRouter } from 'vue-router';
import {getListByPage,clearUnread} from "../../api/api";
// 暂时注释掉WebSocket导入
// import { useWebSocket } from '../../utils/useWebSocket.js';
// 搜索框绑定的值
const searchQuery = ref('');
// 使用localStorage替代uni.getStorageSync
const token = localStorage.getItem('token');
// 暂时不初始化WebSocket，创建一个空对象避免报错
const ws = {
  onMessage: () => console.log('WebSocket已暂时关闭')
};
// 联系人列表数据
const contacts = ref([]);
// 初始化路由
const router = useRouter();
// 标记是否已经显示过
let hasShown = false;

// 过滤联系人列表
const filteredContacts = computed(() => {
  if (!searchQuery.value) return contacts.value;
  return contacts.value.filter(contact =>
    contact.name.includes(searchQuery.value) || 
    contact.lastMessageContent.includes(searchQuery.value)
  );
});
const beforeTime=ref(new Date().getTime()-9000000);
let wsMessageListener = async(event) => {
    try {
      console.log('WebSocket 消息:', event.data);
      const data = JSON.parse(event.data);
      console.log('解析后的消息:', data);
      // 判断当前时间与 beforeTime 的差值是否大于 1 秒
      const now = new Date().getTime();
      console.log('当前时间:', now, '上次更新时间:', beforeTime.value);
      if (now - beforeTime.value > 1000) {
        beforeTime.value = now;
        const res = await getListByPage(1, 100);
        console.log("获取联系人列表:", res);
        contacts.value = res.list.map(item => ({
          id: item.id,
          name: item.name,
          cover: item.cover, 
          lastMessageContent: item.lastMessage?.content?.text || '', 
          lastTime: item.lastMessage?.createTime,
          unreadMessageCount: item.unreadMessageCount,
          type: item.type,
          lastMessage: item.lastMessage,
          conversation: {
            "id": item.id,
            "type": item.type,
            "name": item.name,
            "cover": item.cover
          }
        }));
      } else {
        // 跳过刷新
        console.log('1秒内重复消息，跳过刷新');
      }
    } catch (e) {
      console.error('消息解析失败', e);
    }
};

// 加载聊天列表的函数
const loadChatList = async () => {
  try {
    const res = await getListByPage(1, 100);
    console.log("获取联系人列表:", res);
    
    // 添加空值检查
    if (!res || !res.list || !Array.isArray(res.list)) {
      console.error("获取联系人列表失败: 返回数据格式不正确");
      contacts.value = [];
      return;
    }
    
    contacts.value = res.list
      .filter(item => item !== null && item !== undefined) // 过滤空值项
      .map(item => ({
          id: item.id || '',
          name: item.name || '未知联系人',
          cover: item.cover || '', 
          lastMessageContent: item.lastMessage?.content?.text || '', 
          lastTime: item.lastMessage?.createTime || '',
          unreadMessageCount: item.unreadMessageCount || 0,
          type: item.type || '',
          lastMessage: item.lastMessage || {},
          conversation:{
            "id": item.id || '',
            "type": item.type || '',
            "name": item.name || '未知联系人',
            "cover": item.cover || ''
          }
      }));
  } catch (error) {
    console.error("加载聊天列表出错:", error);
    contacts.value = [];
  }
};

// 使用Vue的标准生命周期钩子
onMounted(async () => {
  // 加载聊天列表
  await loadChatList();
  // 监听消息
  // 暂时注释掉WebSocket相关代码
  // const ws = getWebsocketClient();
  // onMessage(ws, handleReceiveMessage);
  console.log('WebSocket已暂时关闭，跳过消息监听注册');
});

// 使用onUpdated模拟onShow的刷新效果
onUpdated(() => {
  if (hasShown) {
    loadChatList();
  }
  hasShown = true;
});

// 格式化时间显示
const formatTime = (time) => {
  // 如果time是字符串，则转换为Date对象
  if (typeof time === 'string') {
    time = new Date(time);
  }
  
  // 如果不是Date对象或转换失败，则返回空字符串
  if (!(time instanceof Date) || isNaN(time.getTime())) {
    return '';
  }
  
  const now = new Date();
  const diffDays = Math.floor((now - time) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'][time.getDay()];
  } else {
    return time.toLocaleDateString([], { month: 'numeric', day: 'numeric' });
  }
};

// 搜索处理函数
const handleSearch = () => {
  console.log('搜索:', searchQuery.value);
  // 搜索逻辑已经通过computed属性filteredContacts实现
};

// 标记已读
const markAsRead = async (id) => {
  try {
    const res = await clearUnread(id);
    console.log('标记已读成功:', res);
    // 更新列表状态
    const item = contacts.value.find(contact => contact.id === id);
    if (item) {
      item.unreadMessageCount = 0;
    }
  } catch (error) {
    console.error('标记已读失败:', error);
    // 使用alert代替uni.showToast
    alert('操作失败');
  }
};

// 计算总未读数
const totalUnread = computed(() => {
  return contacts.value.reduce((sum, contact) => sum + contact.unreadMessageCount, 0);
});

// 处理接收消息的函数（模拟）
const handleReceiveMessage = (message) => {
  console.log('收到新消息:', message);
  // 这里应该更新聊天列表
};

// 跳转到聊天页面
const goToChat = (conversation) => {
  console.log("跳转到聊天页面conversation", conversation);
  const conversationStr = encodeURIComponent(JSON.stringify(conversation));
  // 使用Vue Router代替uni.navigateTo
  router.push({
    path: '/pages/chat/chat',
    query: { conversation: conversationStr }
  });
};


</script>

<style scoped>
/* 电脑端优化的样式 */
.contact-list {
  width: 100%;
  height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

/* 搜索栏样式 */
.search-bar {
  padding: 16px 24px;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
}

.search-container {
  display: flex;
  align-items: center;
  background-color: #f0f2f5;
  border-radius: 12px;
  padding: 12px 16px;
  max-width: 600px;
  margin: 0 auto;
  transition: box-shadow 0.2s ease;
}

.search-container:hover {
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}

.search-icon {
  font-size: 18px;
  color: #666;
  margin-right: 12px;
}

.search-input {
  flex: 1;
  border: none;
  background-color: transparent;
  font-size: 16px;
  outline: none;
  color: #333;
  font-family: inherit;
}

.search-input::placeholder {
  color: #999;
}

/* 联系人列表容器 */
.contacts {
  flex: 1;
  overflow-y: auto;
  max-width: 900px;
  margin: 0 auto;
  width: 100%;
  padding: 16px;
}

/* 联系人项样式 */
.contact-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  background-color: #ffffff;
  border-radius: 12px;
  margin-bottom: 8px;
  position: relative;
  transition: all 0.2s ease;
  cursor: pointer;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.contact-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: #f8f9fa;
}

.contact-item:active {
  transform: translateY(0);
}

/* 头像样式 */
.avatar {
  width: 64px;
  height: 64px;
  margin-right: 16px;
  position: relative;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
  transition: filter 0.2s ease;
}

.contact-item:hover .avatar img {
  filter: brightness(1.05);
}

/* 消息角标 */
.badge {
  position: absolute;
  top: -8px;
  right: -8px;
  min-width: 24px;
  height: 24px;
  padding: 0 6px;
  background-color: #ff4757;
  color: white;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  line-height: 24px;
  box-shadow: 0 2px 4px rgba(255, 71, 87, 0.3);
}

/* 信息区域 */
.info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
}

.name {
  font-size: 18px;
  color: #2c3e50;
  margin-bottom: 6px;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.last-msg {
  font-size: 14px;
  color: #7f8c8d;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.4;
}

/* 右侧内容 */
.right-content {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 20px;
  flex-shrink: 0;
}

.time {
  font-size: 14px;
  color: #95a5a6;
  font-weight: 400;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-bar {
    padding: 12px 16px;
  }
  
  .search-container {
    max-width: 100%;
    padding: 10px 14px;
  }
  
  .contacts {
    padding: 12px;
    max-width: 100%;
  }
  
  .contact-item {
    padding: 14px 16px;
    margin-bottom: 6px;
  }
  
  .avatar {
    width: 56px;
    height: 56px;
    margin-right: 14px;
  }
  
  .name {
    font-size: 16px;
  }
  
  .last-msg {
    font-size: 13px;
  }
}

@media (min-width: 1024px) {
  .contacts {
    max-width: 1000px;
  }
  
  .contact-item {
    padding: 20px 24px;
  }
  
  .avatar {
    width: 72px;
    height: 72px;
  }
  
  .name {
    font-size: 20px;
  }
  
  .last-msg {
    font-size: 15px;
  }
}

/* 滚动条样式 */
.contacts::-webkit-scrollbar {
  width: 6px;
}

.contacts::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.contacts::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.contacts::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.contact-item {
  animation: fadeIn 0.3s ease;
}

/* 加载状态 */
.loading {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-size: 16px;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.empty-state p {
  font-size: 16px;
  margin-bottom: 8px;
}

.empty-state small {
  font-size: 14px;
  color: #95a5a6;
}
</style>