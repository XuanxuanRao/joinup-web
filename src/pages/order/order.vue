<template>
	<view class="message-container">
	  <!-- 顶部标题栏 -->
	  <view class="header">
		<text class="title">消息</text>
	  </view>
	  
	  <!-- 四个图标导航区域 -->
	  <view class="icon-nav">
		<view class="icon-item" @tap="selectMessageType(0), openMessagePopup(0)">
		  <view class="icon-box" :class="{ active: currentType === 0 }">
			<image src="https://joinup.oss-cn-beijing.aliyuncs.com/images/message/team.png" mode="aspectFit"></image>
		  </view>
		  <text class="icon-text" :class="{ active: currentType === 0 }">组队</text>
		</view>
		
		<view class="icon-item" @tap="selectMessageType(2), openMessagePopup(2)">
		  <view class="icon-box" :class="{ active: currentType === 2 }">
			<image src="https://joinup.oss-cn-beijing.aliyuncs.com/images/message/boya.png" mode="aspectFit"></image>
		  </view>
		  <text class="icon-text" :class="{ active: currentType === 2 }">博雅</text>
		</view>
		
		<view class="icon-item" @tap="selectMessageType(1), openMessagePopup(1)">
		  <view class="icon-box" :class="{ active: currentType === 1 }">
			<image src="https://joinup.oss-cn-beijing.aliyuncs.com/images/message/course.png" mode="aspectFit"></image>
		  </view>
		  <text class="icon-text" :class="{ active: currentType === 1 }">课程</text>
		</view>
		
	  </view>
	
	</view>
	
	<!-- 消息弹窗组件 -->
	  <message-popup 
	    v-if="showMessagePopup" 
	    :type="currentTypeMessage"
	    @close="closeMessagePopup"
	  />
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import MessagePopup from '../message/message.vue'
  import { getUserInfo, login, modifyUserInfo, getMyMessage, markMessageRead, deleteMessage, getMyTeam} from "../../api/api"
  
  const router = useRouter()
  
  // 跳转详情页
  const goDetail = (item) => {
	if (!item || !item.id) {
	  console.error('无效的 item 对象', item)
	  return
	}
	router.push(`/pages/detail/detail?item=${encodeURIComponent(JSON.stringify(item))}`)
  }
  
  // 响应式数据
  const currentTypeMessage = ref(null)
  const showMessagePopup = ref(false)
  const isRefreshing = ref(false)
  const isLoading = ref(false)
  const currentType = ref(null)
  const readStatus = ref(null)
  const currentPage = ref(1)
  const pageSize = ref(10)
  const totalPages = ref(0)
  const hasSelectedType = ref(false)
  const messageList = ref([])
  
  // 团队信息
  const createdTeams = ref([])
  const joinedTeams = ref([])
  // 导航链接
  const pageLinks = {
    team: '/pages/team/team',
    boya: '/pages/boya/boya',
    checkin: '/pages/checkin/checkin',
    newFeature: '/pages/team/team' 
  }
  
  // 打开消息弹窗
  const openMessagePopup = (type) => {
    currentTypeMessage.value = type
    showMessagePopup.value = true
  }
  
  // 关闭消息弹窗
  const closeMessagePopup = () => {
    showMessagePopup.value = false
  }
  
  // 获取用户相关的队伍
  const fetchTeams = () => {
    // 先获取用户创建的队伍
    getMyTeam({
      role: 'CREATOR'
    }).then(res => {
      if (res) {
        createdTeams.value = res || [];
      } else {
        console.error('获取创建的队伍失败:', res?.msg);
      }
    }).catch(err => {
      console.error('获取创建的队伍异常:', err);
    });
    
    // 再获取用户加入的队伍
    getMyTeam({
      role: 'MEMBER'
    }).then(res => {
      if (res.code === 1) {
        joinedTeams.value = res.data || [];
      } else {
        console.error('获取加入的队伍失败:', res?.msg);
      }
    }).catch(err => {
      console.error('获取加入的队伍异常:', err);
    });
  }
  
  // 跳转到队伍详情
    const goTeamDetail = (team) => {
      if (!team || !team.id) {
        console.error('无效的队伍对象', team);
        return;
      }
      router.push(`/pages/team/detail?teamId=${team.id}`);
    }
    
    // 页面加载时获取队伍信息
    fetchTeams();
    
    // 导航到对应页面
    const navigateTo = (type) => {
      const url = pageLinks[type] || '/pages/index/index';
      router.push(url);
    }
    
    // 获取消息类型对应的文本
    const getTypeText = (type) => {
      const typeMap = {
        0: '组队',
        1: '课程',
        2: '博雅'
      };
      return typeMap[type] || '';
    }
    
    // 获取阅读状态对应的文本
    const getReadStatusText = () => {
      if (readStatus.value === true) return '已读';
      if (readStatus.value === false) return '未读';
      return '';
    }
    
    // 选择消息类型
    const selectMessageType = (type) => {
      if (type === null || type === undefined) {
        return;
      }
      
      currentType.value = type;
      hasSelectedType.value = true;
      readStatus.value = null; // 默认显示全部消息
      fetchMessages();
    }
    
    // 切换阅读状态
    const switchReadStatus = (status) => {
      if (readStatus.value === status) return;
      
      readStatus.value = status;
      fetchMessages();
    }
    
    // 获取指定类型和阅读状态的消息
    const fetchMessages = () => {
      isLoading.value = true;
      currentPage.value = 1;
      messageList.value = [];
      
      const params = {
        pageSize: pageSize.value,
        pageNumber: currentPage.value,
        type: currentType.value
      };
      
      if (readStatus.value !== null) {
        params.read = readStatus.value;
      }
      
      getMyMessage(params).then(res => {
        if (res) {
          messageList.value = res.list || [];
          totalPages.value = res.pages || 0;
        } else {
          messageList.value = [];
          alert(res?.msg || '获取消息失败');
        }
        isLoading.value = false;
        if (isRefreshing.value) {
          isRefreshing.value = false;
        }
      }).catch(err => {
        console.error("获取消息失败", err);
        messageList.value = [];
        isLoading.value = false;
        if (isRefreshing.value) {
          isRefreshing.value = false;
        }
        alert('获取消息失败');
      });
    }
    
    // 下拉刷新
    const onRefresh = () => {
      isRefreshing.value = true;
      if (hasSelectedType.value) {
        fetchMessages();
      } else {
        isRefreshing.value = false;
      }
    }
    
    // 加载更多
    const loadMore = () => {
      if (isLoading.value || currentPage.value >= totalPages.value || !hasSelectedType.value) return;
      
      isLoading.value = true;
      currentPage.value++;
      
      const params = {
        pageSize: pageSize.value,
        pageNumber: currentPage.value,
        type: currentType.value
      };
      
      if (readStatus.value !== null) {
        params.read = readStatus.value;
      }
      
      getMyMessage(params).then(res => {
        if (res) {
          const newList = res.data?.list || [];
          messageList.value = [...messageList.value, ...newList];
        }
        isLoading.value = false;
      }).catch(err => {
        console.error("加载更多消息失败", err);
        isLoading.value = false;
        alert('加载更多失败');
      });
    }
    
    // 确认收到消息
    const confirmMessage = (id, index) => {
      if (messageList.value[index] && messageList.value[index].read) {
        return;
      }
      
      if (confirm('是否确认收到该消息？')) {
        try {
          // 模拟加载状态
          console.log('确认中...');
          
          markMessageRead(id).then(res => {
            if (res.code === 1) {
              alert('确认成功');
              
              if (readStatus.value === false) {
                messageList.value.splice(index, 1);
              } else {
                if (messageList.value[index]) {
                  messageList.value[index].read = true;
                }
              }
            } else {
              alert(res?.msg || '确认失败');
            }
          }).catch(err => {
            console.error("确认消息失败", err);
            alert('确认失败，请稍后重试');
          });
        } catch (e) {
          console.error(e);
        }
      }
    }
    
    // 处理删除消息逻辑
    const handleDeleteMessage = (id, isRead, index) => {
      if (!isRead) {
        if (confirm('该消息未读，确定要删除吗？')) {
          performDeleteMessage(id, index);
        }
      } else {
        if (confirm('确定要删除这条消息吗？')) {
          performDeleteMessage(id, index);
        }
      }
    }
    
    // 执行删除消息API调用
    const performDeleteMessage = (id, index) => {
      try {
        console.log('删除中...');
        
        deleteMessage(id).then(res => {
          if (res.code === 1) {
            alert('删除成功');
            messageList.value.splice(index, 1);
          } else {
            alert(res?.msg || '删除失败');
          }
        }).catch(err => {
          console.error("删除消息失败", err);
          alert('删除失败，请稍后重试');
        });
      } catch (e) {
        console.error(e);
      }
    }
    
    // 格式化时间
    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      const date = new Date(timeStr);
      return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  </script>
  <style scoped>
    /* 原有样式 */
    .message-container {
      padding: 15px;
      font-size: 14px;
    }
    
    .header {
      display: flex;
      align-items: center;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    
    .icon-nav {
      display: flex;
      justify-content: space-around;
      padding: 15px 0;
    }
    
    .message-tabs {
      display: flex;
      overflow-x: auto;
      padding: 10px 0;
    }
    
    .team-item {
      background-color: #fff;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .empty-team-tips {
      text-align: center;
      color: #999;
      padding: 40px 0;
    }
    
    .container {
      background-color: #f5f5f5;
      min-height: 100vh;
    }
    
    .message-types {
      display: flex;
      background-color: #fff;
      margin-bottom: 10px;
    }
    
    .type-button {
      flex: 1;
      text-align: center;
      padding: 12px 0;
      position: relative;
    }
    
    /* 更多样式定义 */
    .type-button.active {
      color: #07c160;
      font-weight: bold;
    }
    
    .type-button.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 25%;
      width: 50%;
      height: 2px;
      background-color: #07c160;
    }
    
    .message-item {
      background-color: #fff;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 8px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    
    .message-time {
      color: #999;
      font-size: 12px;
    }
    
    .message-content {
      color: #333;
      line-height: 1.5;
    }
    
    .message-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 10px;
      gap: 10px;
    }
    
    .action-button {
      padding: 5px 15px;
      border-radius: 4px;
      font-size: 13px;
    }
    
    .confirm-button {
      background-color: #07c160;
      color: white;
    }
    
    .delete-button {
      background-color: #fff;
      color: #e64340;
      border: 1px solid #e64340;
    }
    
    .read-badge {
      display: inline-block;
      width: 8px;
      height: 8px;
      background-color: #07c160;
      border-radius: 50%;
      margin-right: 5px;
    }
    
    .loading {
      text-align: center;
      padding: 20px 0;
      color: #999;
    }
    
    .empty-message {
      text-align: center;
      padding: 60px 0;
      color: #999;
    }
</style>