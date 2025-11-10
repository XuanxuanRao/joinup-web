<template>
	<!-- // 创建者 -->
	<view v-if="userRole === 'creator'">
		<view class="team-detail" v-if="teamDetails">
		    <!-- 团队介绍部分 -->
		    <view class="team-intro">
		      <view class="team-header">
		        <view class="team-info">
				  <image
				    :src="teamDetails.cover || 'https://joinup.oss-cn-beijing.aliyuncs.com/images/img-0424/11.png'"
				    class="cover-img"
				    mode="aspectFill"
				  />

		          <view class="team-name">{{ teamDetails.name }}</view>
		          <view class="team-description">🌟{{ teamDetails.description }}</view>
		        </view>
		      </view>
		    </view>
		
		    <!-- <view class="divider"></view> -->
		
		    <!-- 状态 & 时间 -->
		    <!-- <view class="status-time">
		      <view class="status">🔒状态: <span class="status-text">{{ teamDetails.status }}</span></view>
		      <view class="time">📅创建: {{ formatDate(teamDetails.createTime) }}</view>
		    </view> -->
		
		    <view class="divider"></view>
		
		    <!-- 标签 -->
		    <view v-if="teamDetails.tags && teamDetails.tags.length > 0">
		      <view class="tag-title">🏷️标签：</view>
		      <view class="tags">
		        <view
		          v-for="tag in teamDetails.tags"
		          :key="tag.id"
		          class="tag-item"
		          @click="onSearch(tag.name)"
		        >
		          {{ tag.name }}
		        </view>
		      </view>

		    </view>
		
		    <view class="divider"></view>
		
		    <!-- 成员展示 -->
		    <view v-if="teamDetails.members && teamDetails.members.length > 0">
		      <view class="member-header">
		        <view class="member-title">👥成员：</view>
		        <view class="member-count">
		          最大成员数: {{ teamDetails.maxMembers }} | 当前成员数: {{ teamDetails.currentMembersCount }}
		        </view>
		      </view>
		      <view v-for="member in teamDetails.members" :key="member.id" class="member">
		        <image  :src="member.avatar || defaultAvatar" class="member-avatar" @click="add(member.userId)"/>
		        <view class="member-info">
		          <view class="member-name">{{ member.userName }}</view>
		          <view class="member-role">角色: {{ member.role }} </view>
		        </view>
				<button
				  v-if="member.role !== '创建者'"
				  class="kick-btn"
				  @click="handleKick(member.userId)"
				>踢出队伍</button>
		      </view>
		    </view>
			
			<!-- 申请列表（仅创建者） -->
			<!-- <view v-if="userRole === 'creator' && applicationList.length > 0">
			  <view class="member-title">📬申请列表：</view>
			  <view v-for="app in applicationList" :key="app.id" class="application-item">
			    <text>{{ app.userName }}</text>
			    <button @click="handleApprove(app.id)">同意</button>
			  </view>
			</view> -->
		  </view>
		
		  <!-- 空状态 -->
		  <view v-else class="empty-message">
		    <text>加载失败或暂无数据</text>
		  </view>
		
		  <view class="creator-btns-row">
		    <button class="application-btn" @click="goToApplicationList">
		      📬 查看申请
		    </button>
		    <button class="modify-btn" @click="modifyTeamInfo(teamDetails.name, teamDetails.description, teamDetails.currentMembersCount, teamDetails.cover)">
		      ✏️ 修改队伍
		    </button>
			<button class="disband-btn" @click="handleDisbandTeam">
			    🗑️ 解散队伍
			  </button>
		  </view>
		  
		  <!-- 聊天按钮 -->
		  <view class="chat-button-wrapper">
			  <button class="chat-button" @click="goShare">
			    📤
			  </button> 
			  <div style="margin: 10px 0;"></div> <!-- 空行 div -->
				<button class="chat-button" @click="goToChat">
		      💬
		    </button>
				    <!-- Popup Modal with the contact list -->
					<view>
						<!-- Popup Modal with the contact list -->
						<uni-popup v-if="showContactModal" type="custom" @close="closeModal">
							<view class="modal-content">
								<view class="modal-header">
									<text class="modal-title">选择联系人</text>
									<button class="close-button" @click="closeModal">✖️</button>
								</view>
								<view class="contact-list">
									<view v-for="contact in contacts" :key="contact.id" class="contact-item" @click="selectContact(contact)">
										<image :src="contact.cover" class="contact-avatar" />
										<text class="contact-name">{{ contact.name }}</text>
									</view>
								</view>
							</view>
						</uni-popup>
					</view>
		  </view>



	</view>
	
	<!-- // 普通队伍成员 -->
	<view v-else-if="userRole === 'teamMember'">
		<view class="team-detail" v-if="teamDetails">
		    <!-- 团队介绍部分 -->
		    <view class="team-intro">
		      <view class="team-header">
		        <view class="team-info">
				  <image
				    :src="teamDetails.cover || 'https://joinup.oss-cn-beijing.aliyuncs.com/images/img-0424/11.png'"
				    class="cover-img"
				    mode="aspectFill"
				  />
		          <view class="team-name">{{ teamDetails.name }}</view>
		          <view class="team-description">🌟{{ teamDetails.description }}</view>
		        </view>
		      </view>
		    </view>
		
		    <!-- <view class="divider"></view> -->
		
		    <!-- 状态 & 时间 -->
		    <!-- <view class="status-time">
		      <view class="status">🔒状态: <span class="status-text">{{ teamDetails.status }}</span></view>
		      <view class="time">📅创建: {{ formatDate(teamDetails.createTime) }}</view>
		    </view> -->
		
		    <view class="divider"></view>
		
		    <!-- 标签 -->
		    <view v-if="teamDetails.tags && teamDetails.tags.length > 0">
		      <view class="tag-title">🏷️标签：</view>
		      <view class="tags">
		        <view
		          v-for="tag in teamDetails.tags"
		          :key="tag.id"
		          class="tag-item"
		          @click="onSearch(tag.name)"
		        >
		          {{ tag.name }}
		        </view>
		      </view>

		    </view>
		
		    <view class="divider"></view>
		
		    <!-- 成员展示 -->
		    <view v-if="teamDetails.members && teamDetails.members.length > 0">
		      <view class="member-header">
		        <view class="member-title">👥成员：</view>
		        <view class="member-count">
		          最大成员数: {{ teamDetails.maxMembers }} | 当前成员数: {{ teamDetails.currentMembersCount }}
		        </view>
		      </view>
		      <view v-for="member in teamDetails.members" :key="member.id" class="member">
		        <image :src="member.avatar || defaultAvatar" class="member-avatar" @click="add(member.userId)"/>
		        <view class="member-info">
		          <view class="member-name">{{ member.userName }}</view>
		          <view class="member-role">角色: {{ member.role }}</view>
		        </view>
		      </view>
		    </view>
		  </view>
		
		  <!-- 空状态 -->
		  <view v-else class="empty-message">
		    <text>加载失败或暂无数据</text>
		  </view>
		
		  <!-- 退出队伍按钮 -->
		  <view class="leave-btn-wrapper">
		    <button class="leave-btn" @click="leaveTeam">退出队伍</button>
		  </view>
		  <!-- 聊天按钮 -->
			<view class="chat-button-wrapper">
				<button class="chat-button" @click="goShare">
				  📤
				</button> 
				<div style="margin: 10px 0;"></div> <!-- 空行 div -->
				<button class="chat-button" @click="goToChat">
				  💬
				</button>
			  </view>
			<view>
				<!-- Popup Modal with the contact list -->
				<uni-popup v-if="showContactModal" type="custom" @close="closeModal">
					<view class="modal-content">
						<view class="modal-header">
							<text class="modal-title">选择联系人</text>
							<button class="close-button" @click="closeModal">✖️</button>
						</view>
						<view class="contact-list">
							<view v-for="contact in contacts" :key="contact.id" class="contact-item" @click="selectContact(contact)">
								<image :src="contact.cover" class="contact-avatar" />
								<text class="contact-name">{{ contact.name }}</text>
							</view>
						</view>
					</view>
				</uni-popup>
			</view>
	</view>
	
	<!-- // 游客 -->
	<view v-else="userRole === 'visitor'">
		<view class="team-detail" v-if="teamDetails">
		    <!-- 团队介绍部分 -->
		    <view class="team-intro">
		      <view class="team-header">
		        <view class="team-info">
				  <image
				    :src="teamDetails.cover || 'https://joinup.oss-cn-beijing.aliyuncs.com/images/img-0424/11.png'"
				    class="cover-img"
				    mode="aspectFill"
				  />
		          <view class="team-name">{{ teamDetails.name }}</view>
		          <view class="team-description">🌟{{ teamDetails.description }}</view>
		        </view>
		      </view>
		    </view>
		
		    <view class="divider"></view>
		
		    <!-- 状态 & 时间 -->
		    <!-- <view class="status-time">
		      <view class="status">🔒状态: <span class="status-text">{{ teamDetails.status }}</span></view>
		      <view class="time">📅创建: {{ formatDate(teamDetails.createTime) }}</view>
		    </view> -->
		
		    <view class="divider"></view>
		
		    <!-- 标签 -->
		    <view v-if="teamDetails.tags && teamDetails.tags.length > 0">
		      <view class="tag-title">🏷️标签：</view>
		      <view class="tags">
		        <view
		          v-for="tag in teamDetails.tags"
		          :key="tag.id"
		          class="tag-item"
		          @click="onSearch(tag.name)"
		        >
		          {{ tag.name }}
		        </view>
		      </view>

		    </view>
		
		    <view class="divider"></view>
		
		    <!-- 成员展示 -->
		    <view v-if="teamDetails.members && teamDetails.members.length > 0">
		      <view class="member-header">
		        <view class="member-title">👥成员：</view>
		        <view class="member-count">
		          最大成员数: {{ teamDetails.maxMembers }} | 当前成员数: {{ teamDetails.currentMembersCount }}
		        </view>
		      </view>
		      <view v-for="member in teamDetails.members" :key="member.id" class="member">
		        <image :src="member.avatar || defaultAvatar" class="member-avatar" @click="add(member.userId)"/>
		        <view class="member-info">
		          <view class="member-name">{{ member.userName }}</view>
		          <view class="member-role">角色: {{ member.role }}</view>
		        </view>
		      </view>
		    </view>
		  </view>
		
		  <!-- 空状态 -->
		  <view v-else class="empty-message">
		    <text>加载失败或暂无数据</text>
		  </view>
		
		  <!-- 加入按钮 -->
		  <view class="apply-btn-wrapper">
		    <button class="apply-btn" @click="openDialog(teamDetails.currentMembersCount, teamDetails.maxMembers)">申请加入</button>
		  </view>
		  <ApplyToJoinDialog :show="showInputArea" :teamId="teamDetails?.id" @update:show="showInputArea = $event" />
	</view>


	
	
  
</template>

<script setup>
import { ref, onMounted, onUpdated } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  getTeamDetails,
  judgeRole,
  getApplicationList,
  kickMember,
  leaveTeamApi,
	faQiConversation,
  uploadBrowse,
	faQiDuiWuConversation,
	getConDetail,
	getListByPage,
	disbandTeam
} from '../../api/api'
import ApplyToJoinDialog from '../../components/applyToJoinDialog.vue'
import { useWebSocket } from '../../utils/useWebSocket.js';
const token = localStorage.getItem('token');
const ws = useWebSocket(token);
const teamDetails = ref(null)
const showInputArea = ref(false)
const userRole = ref('') // 'creator', 'member', 'visitor'
const applicationList = ref([])
const teamId = ref()
const showContactModal = ref(false);

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'

const route = useRoute()
const router = useRouter()

// 页面加载逻辑
onMounted(async () => {
  try {
    let item = route.query.item
    if (!item) return
    item = JSON.parse(decodeURIComponent(item))
	
    if (item?.id) {
	  teamId.value = item.id
	  
	  await uploadBrowse(item.id)
	  
      const res = await getTeamDetails(item.id)
	  console.log("res===================",res)
      if (res) {
        teamDetails.value = res
	  }

      const roleRes = await judgeRole(item.id)
	  if (roleRes === null) {
		  userRole.value = 'visitor'
	  } else if (roleRes === "成员") {
		  userRole.value = 'teamMember'
	  } else {
		  userRole.value = 'creator'
	  }
	  console.log("!!!",userRole.value)

      /*if (userRole.value === 'creator') {
        const list = await getApplicationList(item.id)
        applicationList.value = list || []
      }*/
    }
  } catch (error) {
    console.error('加载失败：', error)
    teamDetails.value = null
  }
})

onUpdated(async () => {
	
  if (teamId.value) {
		await uploadBrowse(teamId.value)
    const res = await getTeamDetails(teamId.value)
    
	teamDetails.value = res
	
    const roleRes = await judgeRole(teamId.value)
    if (roleRes === null) {
      userRole.value = 'visitor'
    } else if (roleRes === "成员") {
      userRole.value = 'teamMember'
    } else {
      userRole.value = 'creator'
    }

    // 如果是创建者可以加载申请列表（你目前注释掉了）
    // if (userRole.value === 'creator') {
    //   const list = await getApplicationList(teamId.value)
    //   applicationList.value = list || []
    // }
  }
})

const add=async(userId)=> {
	const res= await faQiConversation(userId)
  console.log('res', res);
	//TODO 导航到chat页面,传入对应参数
	const res1=await getConDetail(res.id)
	const conversation = {
		id: res.id,
		type: "private",
		name:res1.name,
		cover:res1.cover,
	}
	console.log("跳转到聊天页面conversation", conversation);
  const conversationStr = encodeURIComponent(JSON.stringify(conversation));
  router.push({
    path: '/pages/chat/chat',
    query: { conversation: conversationStr }
  })
}

// 打开弹窗
const openDialog = (currentMembersCount, maxMembers) => {
	
	console.log(currentMembersCount)
	console.log(maxMembers)
  // 判断是否满员
  if (currentMembersCount >= maxMembers) {
    alert('团队已满员');
  } else {
    // 未满员时打开对话框
    showInputArea.value = true;
  }
}

// 修改队伍信息
const modifyTeamInfo = (name, description,currentMembersCount, cover) => {
	
  router.push({
    path: '/pages/detail/modifyTeam',
    query: {
      teamId: teamId.value,
      currentMembers: currentMembersCount,
      name: encodeURIComponent(name),
      description: encodeURIComponent(description),
      cover: encodeURIComponent(cover)
    }
  });
};

const handleDisbandTeam = async () => {
  const confirmed = confirm('确定要解散该队伍吗？此操作不可恢复。');
  if (confirmed) {
    try {
      await disbandTeam(teamId.value)
      alert('已解散');
      // 返回上一页或首页
      setTimeout(() => {
        router.back()
      }, 1000)
    } catch (err) {
      alert('解散失败');
      console.error(err)
    }
  }
}


const contacts=ref();
const goShare = async() => {
  if (!teamId.value) return
	const res=await getListByPage(1, 100);
  console.log("获取联系人列表:", res);
  console.log("teamId.value", teamId.value);
contacts.value = res.list
  .filter(item => item.teamId !== teamId.value) // Filter out items with the same teamId
  .map(item => ({
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
	showContactModal.value = true;
}

const closeModal = () => {
	showContactModal.value = false;
};

const selectContact = async(contact) => {
	console.log('Sending message to:', contact);
	const res=await getTeamDetails(teamId.value)
	console.log("res",res)
	const res1=await faQiDuiWuConversation(teamId.value)
	console.log("res1",res1)
	const msgObj = {
    conversationId: contact.id,
    content: { teamId: teamId.value, conversationId: contact.id, 
      groupName: res.name, cover: res.cover },
    type: 'TEXT'
  };
  console.log("msgObj",msgObj)
  await ws.sendMessage(msgObj)
  alert('发送成功');
	closeModal(); // Close the modal after selection
};

const goToChat = async() => {
  if (!teamId.value) return
	const res=await getTeamDetails(teamId.value)
	console.log("res",res)
	console.log("teamId.value",teamId.value)
	const res1=await faQiDuiWuConversation(teamId.value)
	console.log("res1",res1)
	const conversation = {
		id: res1.id,
		type: "group",
		name:res.name,
		cover:res.cover,
		members: res.members
	}
	console.log("跳转到聊天页面conversation", conversation);
  const conversationStr = encodeURIComponent(JSON.stringify(conversation));
  router.push({
    path: '/pages/chat/chat',
    query: { conversation: conversationStr }
  })
}


function onSearch(value) {
  if (!value.trim()) {
    alert('请输入关键字')
    return
  }
  router.push({
    path: '/pages/detail/searchResult',
    query: { keyword: encodeURIComponent(value) }
  })
}

// 同意加入
const handleApprove = async (applicantId) => {
  await processApplication(teamDetails.value.id, applicantId, 0, '')
  const list = await getApplicationList(teamDetails.value.id)
  applicationList.value = list || []
}

// 踢出成员
const handleKick = async (memberId) => {
	console.log('!!!!!!!!!!!!!!!!!!')
	console.log(teamDetails.value.id)
	console.log(memberId)
  await kickMember(teamDetails.value.id, memberId)
  const res = await getTeamDetails(teamDetails.value.id)
  if (res) teamDetails.value = res
}

// 退出队伍
const leaveTeam = async () => {
  await leaveTeamApi(teamDetails.value.id)
  userRole.value = 'visitor'
  const res = await getTeamDetails(teamDetails.value.id)
  if (res) teamDetails.value = res
}

const goToApplicationList = () => {
  router.push({
    path: '/pages/detail/applicationList',
    query: { teamId: teamId.value }
  })
}


const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
    .getDate()
    .toString()
    .padStart(2, '0')}`
}
</script>

<style scoped lang="scss">
// 全局样式重置和基础变量
:root {
  --primary-color: #4361ee;
  --success-color: #4cc9f0;
  --danger-color: #f72585;
  --warning-color: #f72585;
  --text-primary: #212529;
  --text-secondary: #495057;
  --text-muted: #6c757d;
  --bg-light: #f8f9fa;
  --border-color: #dee2e6;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 8px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.1);
  --radius-sm: 8rpx;
  --radius-md: 16rpx;
  --radius-lg: 24rpx;
  --radius-xl: 32rpx;
}

// 基础容器样式
.team-detail {
  padding: 30rpx;
  background-color: #ffffff;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: 20rpx;
}

// 团队介绍部分
.team-intro {
  margin-bottom: 30rpx;
}

.team-header {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.team-info {
  width: 100%;
}

.cover-img {
  width: 100%;
  height: 350rpx;
  border-radius: var(--radius-lg);
  object-fit: cover;
  background-color: #f0f0f0;
  display: block;
  box-shadow: var(--shadow-sm);
  transition: transform 0.3s ease;
}

.cover-img:hover {
  transform: scale(1.02);
}

.team-name {
  font-size: 44rpx;
  font-weight: 700;
  margin: 20rpx 0 10rpx;
  color: var(--text-primary);
  line-height: 1.3;
}

.team-description {
  font-size: 30rpx;
  color: var(--text-secondary);
  line-height: 1.6;
  padding: 15rpx 0;
}

// 分隔线样式
.divider {
  height: 4rpx;
  background: linear-gradient(to right, transparent, var(--border-color), transparent);
  margin: 30rpx 0;
  border: none;
}

// 状态和时间（保持注释但样式已优化）
.status-time {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  color: var(--text-secondary);
  padding: 15rpx 0;
  background: var(--bg-light);
  border-radius: var(--radius-md);
  padding: 20rpx;
}

.status-text {
  color: var(--warning-color);
  font-weight: 600;
}

// 标签样式
.tag-title {
  font-size: 30rpx;
  font-weight: 600;
  margin-bottom: 15rpx;
  color: var(--text-primary);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 10rpx;
}

.tag-item {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 12rpx 24rpx;
  border-radius: 50rpx;
  font-size: 28rpx;
  color: white;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.tag-item:hover {
  transform: translateY(-2rpx);
  box-shadow: var(--shadow-md);
  opacity: 0.9;
}

// 成员部分样式
.member-header {
  margin-bottom: 30rpx;
  padding-bottom: 15rpx;
  border-bottom: 2rpx solid var(--border-color);
}

.member-title {
  font-size: 32rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.member-count {
  font-size: 28rpx;
  color: var(--text-muted);
  margin-top: 8rpx;
}

.member {
  display: flex;
  align-items: center;
  padding: 25rpx 0;
  border-bottom: 1rpx solid var(--border-color);
  transition: background-color 0.2s ease;
}

.member:hover {
  background-color: var(--bg-light);
  padding-left: 10rpx;
  border-radius: var(--radius-sm);
}

.member-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  object-fit: cover;
  background-color: #eee;
  margin-right: 30rpx;
  border: 4rpx solid var(--success-color);
  transition: transform 0.3s ease;
}

.member-avatar:hover {
  transform: scale(1.05);
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 34rpx;
  font-weight: 600;
  margin-bottom: 10rpx;
  color: var(--text-primary);
}

.member-role {
  font-size: 28rpx;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

// 踢出按钮样式
.kick-btn {
  margin-left: 30rpx;
  padding: 12rpx 28rpx;
  background-color: var(--danger-color);
  color: white;
  font-size: 28rpx;
  border-radius: var(--radius-md);
  border: none;
  line-height: 1.4;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.kick-btn:hover {
  background-color: #d62828;
  transform: translateY(-2rpx);
  box-shadow: var(--shadow-md);
}

.kick-btn::after {
  display: none;
}

// 申请项样式
.application-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 15rpx 0;
  padding: 20rpx;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: white;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
}

.application-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2rpx);
}

// 按钮容器样式
.apply-btn-wrapper,
.leave-btn-wrapper,
.application-btn-wrapper,
.modify-btn-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30rpx;
  margin-bottom: 20rpx;
}

// 创建者按钮组
.creator-btns-row {
  display: flex;
  justify-content: space-between;
  gap: 25rpx;
  margin-top: 40rpx;
  padding: 0 20rpx;
}

.creator-btns-row button {
  flex: 1;
  padding: 28rpx 20rpx;
  font-size: 30rpx;
  border-radius: var(--radius-lg);
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
  text-align: center;
  font-weight: 600;
  position: relative;
  overflow: hidden;
}

.creator-btns-row button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.creator-btns-row button:hover::before {
  left: 100%;
}

// 三个按钮不同背景色
.application-btn {
  background: linear-gradient(135deg, #4caf50, #45a049);
}

.modify-btn {
  background: linear-gradient(135deg, var(--primary-color), #3f37c9);
}

.disband-btn {
  background: linear-gradient(135deg, var(--danger-color), #e63946);
}

.creator-btns-row button:hover {
  transform: translateY(-3rpx);
  box-shadow: var(--shadow-lg);
}

// 申请按钮样式
.apply-btn {
  background: linear-gradient(135deg, var(--success-color), #4895ef);
  color: #fff;
  padding: 28rpx 70rpx;
  border: none;
  border-radius: var(--radius-xl);
  font-size: 32rpx;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
}

.apply-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.apply-btn:hover::before {
  left: 100%;
}

.apply-btn:hover {
  transform: translateY(-3rpx);
  box-shadow: var(--shadow-lg);
}

// 退出按钮样式
.leave-btn {
  background: linear-gradient(135deg, #6c757d, #5a6268);
  color: #fff;
  padding: 28rpx 70rpx;
  border: none;
  border-radius: var(--radius-xl);
  font-size: 32rpx;
  font-weight: 700;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md);
}

.leave-btn:hover {
  transform: translateY(-3rpx);
  box-shadow: var(--shadow-lg);
  opacity: 0.95;
}

// 按钮通用样式重置
.apply-btn::after,
.leave-btn::after,
.creator-btns-row button::after {
  display: none;
}

// 空状态样式
.empty-message {
  text-align: center;
  color: var(--text-muted);
  margin: 80rpx 0;
  padding: 60rpx 0;
  background-color: var(--bg-light);
  border-radius: var(--radius-lg);
  font-size: 30rpx;
}

// 浮动操作按钮
.chat-button-wrapper {
  position: fixed;
  bottom: 100rpx;
  right: 60rpx;
  z-index: 999;
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.chat-button {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary-color), #4895ef);
  color: white;
  font-size: 48rpx;
  text-align: center;
  line-height: 120rpx;
  box-shadow: var(--shadow-lg);
  border: none;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.chat-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s;
}

.chat-button:hover::before {
  left: 100%;
}

.chat-button:hover {
  transform: translateY(-5rpx) scale(1.05);
  box-shadow: var(--shadow-lg), 0 0 20rpx rgba(67, 97, 238, 0.3);
}

.chat-button::after {
  display: none;
}

// 模态框样式优化
.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: white;
  border-radius: var(--radius-xl);
  padding: 40rpx;
  width: 85%;
  max-height: 75%;
  overflow-y: auto;
  z-index: 999;
  box-shadow: var(--shadow-lg), 0 0 40rpx rgba(0, 0, 0, 0.15);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translate(-50%, -60%);
  }
  to {
    opacity: 1;
    transform: translate(-50%, -50%);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid var(--border-color);
  margin-bottom: 30rpx;
}

.modal-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.close-button {
  background: none;
  border: none;
  font-size: 40rpx;
  color: var(--text-muted);
  cursor: pointer;
  padding: 10rpx;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-button:hover {
  background-color: var(--bg-light);
  color: var(--text-primary);
  transform: scale(1.1);
}

.contact-list {
  margin-top: 10rpx;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 25rpx;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.3s ease;
  margin-bottom: 10rpx;
}

.contact-item:hover {
  background-color: var(--bg-light);
  transform: translateX(10rpx);
}

.contact-avatar {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  margin-right: 30rpx;
  border: 3rpx solid var(--success-color);
  transition: transform 0.3s ease;
}

.contact-item:hover .contact-avatar {
  transform: scale(1.1);
}

.contact-name {
  font-size: 32rpx;
  font-weight: 500;
  color: var(--text-primary);
}

// 响应式设计
@media screen and (max-width: 768px) {
  .team-name {
    font-size: 40rpx;
  }
  
  .creator-btns-row {
    flex-direction: column;
    gap: 20rpx;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>
