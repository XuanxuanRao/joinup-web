<template>
  <!-- 创建者视图 -->
  <div v-if="userRole === 'creator'">
    <div class="team-detail" v-if="teamDetails">
      <!-- 团队介绍部分 -->
      <div class="team-intro">
        <div class="team-header">
          <div class="team-info">
            <img
              :src="teamDetails.cover || 'https://joinup.oss-cn-beijing.aliyuncs.com/images/img-0424/11.png'"
              class="cover-img"
            />
            <div class="team-name">{{ teamDetails.name }}</div>
            <div class="team-description">🌟{{ teamDetails.description }}</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 标签 -->
      <div v-if="teamDetails.tags && teamDetails.tags.length > 0">
        <div class="tag-title">🏷️标签：</div>
        <div class="tags">
          <div
            v-for="tag in teamDetails.tags"
            :key="tag.id"
            class="tag-item"
            @click="onSearch(tag.name)"
          >
            {{ tag.name }}
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 成员展示 -->
      <div v-if="teamDetails.members && teamDetails.members.length > 0" class="members-section">
        <div class="member-header">
          <div class="member-title">团队成员</div>
          <div class="member-count">{{ teamDetails.members.length }} 位成员</div>
        </div>
        <div class="members-list">
          <div v-for="member in teamDetails.members" :key="member.id" class="member-card">
            <div class="member-content">
              <div class="member-avatar-container">
                <img :src="member.avatar || defaultAvatar" class="member-avatar" @click="add(member.userId)"/>
                <div class="online-indicator"></div>
              </div>
              <div class="member-info">
                <div class="member-name">{{ member.userName }}</div>
                <div class="member-role-badge">
                  <span :class="['role-badge', { 'creator-badge': member.role === '创建者', 'member-badge': member.role !== '创建者' }]">
                    {{ member.role }}
                  </span>
                </div>
              </div>
            </div>
            <button v-if="member.role !== '创建者'" class="kick-btn" @click="handleKick(member.userId)">踢出队伍</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-message">
      <span>加载失败或暂无数据</span>
    </div>

    <div class="creator-btns-row">
      <button class="application-btn" @click="goToApplicationList">📬 查看申请</button>
      <button class="modify-btn" @click="modifyTeamInfo(teamDetails.name, teamDetails.description, teamDetails.currentMembersCount, teamDetails.cover)">✏️ 修改队伍</button>
      <button class="disband-btn" @click="handleDisbandTeam">🗑️ 解散队伍</button>
    </div>
    
    <!-- 聊天按钮 -->
    <div class="chat-button-wrapper">
      <button class="chat-button" @click="goShare">📤</button>
      <div style="margin: 10px 0;"></div>
      <button class="chat-button" @click="goToChat">💬</button>
    </div>
  </div>

  <!-- 普通队伍成员视图 -->
  <div v-else-if="userRole === 'teamMember'">
    <div class="team-detail" v-if="teamDetails">
      <!-- 团队介绍部分 -->
      <div class="team-intro">
        <div class="team-header">
          <div class="team-info">
            <img
              :src="teamDetails.cover || 'https://joinup.oss-cn-beijing.aliyuncs.com/images/img-0424/11.png'"
              class="cover-img"
            />
            <div class="team-name">{{ teamDetails.name }}</div>
            <div class="team-description">🌟{{ teamDetails.description }}</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 标签 -->
      <div v-if="teamDetails.tags && teamDetails.tags.length > 0">
        <div class="tag-title">🏷️标签：</div>
        <div class="tags">
          <div
            v-for="tag in teamDetails.tags"
            :key="tag.id"
            class="tag-item"
            @click="onSearch(tag.name)"
          >
            {{ tag.name }}
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 成员展示 -->
      <div v-if="teamDetails.members && teamDetails.members.length > 0" class="members-section">
        <div class="member-header">
          <div class="member-title">团队成员</div>
          <div class="member-count">{{ teamDetails.members.length }} 位成员</div>
        </div>
        <div class="members-list">
          <div v-for="member in teamDetails.members" :key="member.id" class="member-card">
            <div class="member-content">
              <div class="member-avatar-container">
                <img :src="member.avatar || defaultAvatar" class="member-avatar" @click="add(member.userId)"/>
                <div class="online-indicator"></div>
              </div>
              <div class="member-info">
                <div class="member-name">{{ member.userName }}</div>
                <div class="member-role-badge">
                  <span :class="['role-badge', { 'creator-badge': member.role === '创建者' || member.role === 'creator', 'member-badge': member.role !== '创建者' && member.role !== 'creator' }]">
                    {{ member.role === 'creator' ? '创建者' : '成员' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-message">
      <span>加载失败或暂无数据</span>
    </div>

    <!-- 退出队伍按钮 -->
    <div class="leave-btn-wrapper">
      <button class="leave-btn" @click="leaveTeam">退出队伍</button>
    </div>
    
    <!-- 聊天按钮 -->
    <div class="chat-button-wrapper">
      <button class="chat-button" @click="goShare">📤</button>
      <div style="margin: 10px 0;"></div>
      <button class="chat-button" @click="goToChat">💬</button>
    </div>
  </div>

  <!-- 游客视图 - 当用户不在队伍中（role返回null）时显示 -->
  <div v-else>
    <div class="team-detail" v-if="teamDetails">
      <!-- 团队介绍部分 -->
      <div class="team-intro">
        <div class="team-header">
          <div class="team-info">
            <img
              :src="teamDetails.cover || 'https://joinup.oss-cn-beijing.aliyuncs.com/images/img-0424/11.png'"
              class="cover-img"
            />
            <div class="team-name">{{ teamDetails.name }}</div>
            <div class="team-description">🌟{{ teamDetails.description }}</div>
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 标签 -->
      <div v-if="teamDetails.tags && teamDetails.tags.length > 0">
        <div class="tag-title">🏷️标签：</div>
        <div class="tags">
          <div
            v-for="tag in teamDetails.tags"
            :key="tag.id"
            class="tag-item"
            @click="onSearch(tag.name)"
          >
            {{ tag.name }}
          </div>
        </div>
      </div>

      <div class="divider"></div>

      <!-- 成员展示 -->
      <div v-if="teamDetails.members && teamDetails.members.length > 0">
        <div class="member-header">
          <div class="member-title">👥成员：</div>
          <div class="member-count">
            最大成员数: {{ teamDetails.maxMembers }} | 当前成员数: {{ teamDetails.currentMembersCount }}
          </div>
        </div>
        <div class="members-list">
          <div v-for="member in teamDetails.members" :key="member.id" class="member-card">
            <div class="member-content">
              <div class="member-avatar-container">
                <img :src="member.avatar || defaultAvatar" class="member-avatar" @click="add(member.userId)"/>
                <div class="online-indicator"></div>
              </div>
              <div class="member-info">
                <div class="member-name">{{ member.userName }}</div>
                <div class="member-role-badge">
                  <span :class="['role-badge', { 'creator-badge': member.role === '创建者' || member.role === 'creator', 'member-badge': member.role !== '创建者' && member.role !== 'creator' }]">
                    {{ member.role === 'creator' ? '创建者' : '成员' }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-message">
      <span>加载失败或暂无数据</span>
    </div>

    <!-- 加入按钮 -->
    <div class="apply-btn-wrapper">
      <button class="apply-btn" @click="openDialog(teamDetails.currentMembersCount, teamDetails.maxMembers)">申请加入</button>
    </div>
    <ApplyToJoinDialog :show="showInputArea" :teamId="teamDetails?.id" @update:show="showInputArea = $event" />
  </div>
  
  <!-- Web Modal Component -->
  <div v-if="showContactModal" class="web-modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <div class="modal-header">
        <h3>选择联系人分享</h3>
        <button class="close-button" @click="closeModal">✖️</button>
      </div>
      <div class="contact-list">
        <div v-for="contact in contacts" :key="contact.id" class="contact-item" @click="selectContact(contact)">
          <img :src="contact.cover" class="contact-avatar" />
          <span class="contact-name">{{ contact.name }}</span>
        </div>
      </div>
    </div>
  </div>
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

// 定义props接收item属性
const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const token = localStorage.getItem('token');
const ws = useWebSocket(token);
const teamDetails = ref(null)
const showInputArea = ref(false)
const userRole = ref('') // 'creator', 'member', 'visitor'
const applicationList = ref([])
const teamId = ref()
const showContactModal = ref(false);
const contacts = ref([])

const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png'

const route = useRoute()
const router = useRouter()

// 页面加载逻辑
onMounted(async () => {
  try {
    let currentTeamId = null
    
    // 优先从路由参数获取ID
    if (route.params && route.params.id) {
      currentTeamId = route.params.id
      console.log("从路由参数获取队伍ID:", currentTeamId)
    }
    // 从props.item中提取ID - 重点处理JSON格式字符串
    else if (props.item) {
      // 转换为字符串进行处理
      const itemStr = String(props.item)
      console.log("item转换为字符串:", itemStr)
      
      // 尝试用正则表达式直接从字符串中提取ID
      // 处理格式如: {"id":"11"} 或类似的JSON格式
      const idRegex = /"id":"(\d+)"/;
      const match = itemStr.match(idRegex);
      
      if (match && match[1]) {
        currentTeamId = match[1];
        console.log("通过正则表达式提取到ID:", currentTeamId);
      } 
      // 如果是对象，尝试直接访问
      else if (typeof props.item === 'object') {
        // 使用字符串形式的键访问（处理可能的Proxy或特殊对象）
        currentTeamId = props.item['id'];
        console.log("使用字符串键访问ID:", currentTeamId);
      }
    }
    
    // 最后验证并使用
    if (!currentTeamId) {
      console.error('未找到有效的队伍ID');
      // 如果ID获取失败，可以尝试使用固定值进行测试
      currentTeamId = '11'; // 这是一个临时的测试值，实际使用时应该移除
      console.log('使用默认测试ID:', currentTeamId);
    }
    
    teamId.value = currentTeamId;
    console.log("确认使用的队伍ID:", teamId.value);
    
    // 继续后续业务逻辑
    await uploadBrowse(teamId.value);
    
    const res = await getTeamDetails(teamId.value);
    console.log("队伍详情数据：", res);
    if (res) {
      teamDetails.value = res;
    }

    const roleRes = await judgeRole(teamId.value);
    console.log("角色判断结果：", roleRes);
    if (roleRes === "创建者") {
      userRole.value = 'creator';
    } else if (roleRes === "成员") {
      userRole.value = 'teamMember';
    } else {
      userRole.value = 'visitor';
    }
    console.log("用户角色：", userRole.value, roleRes)

      /*if (userRole.value === 'creator') {
        const list = await getApplicationList(teamId.value)
        applicationList.value = list || []
      }*/
  } catch (error) {
    console.error('加载失败：', error)
    teamDetails.value = null
  }
})

// 添加一个显式的数据刷新函数，只有在需要时才调用
// 这样可以避免每次组件更新时都重复调用API
const refreshTeamData = async () => {
  if (teamId.value) {
    try {
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
      console.log("数据已刷新，用户角色：", userRole.value)
    } catch (error) {
      console.error("刷新数据失败：", error)
    }
  }
}

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
}

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

<style scoped>
/* 全局页面样式 */
:deep(body) {
  background-color: #f5f7fa;
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* 团队详情卡片样式 */
.team-detail {
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin: 20px auto;
  padding: 30px;
  max-width: 1000px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.team-detail:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
}

/* 团队介绍部分 */
.team-intro {
  margin-bottom: 30px;
}

.team-header {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 24px;
}

.team-info {
  text-align: center;
}

.cover-img {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.5s ease;
}

.cover-img:hover {
  transform: scale(1.02);
}

.team-name {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 20px 0 12px;
  letter-spacing: -0.5px;
}

.team-description {
  font-size: 16px;
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px;
}

/* 分隔线样式 */
.divider {
  height: 2px;
  background: linear-gradient(90deg, transparent, #e0e0e0, transparent);
  margin: 30px 0;
  border: none;
}

/* 标签样式 */
.tag-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tag-item {
  background-color: #f0f2f5;
  color: #4a5568;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.tag-item:hover {
  background-color: #e2e8f0;
  transform: translateY(-1px);
  border-color: #cbd5e0;
}

/* 成员展示部分 */
.members-section {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.member-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #1890ff, #40a9ff);
  border-radius: 2px;
}

.member-count {
  font-size: 14px;
  color: #666;
  background-color: #f7fafc;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.member-count:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e0;
}

.members-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.member-card {
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.member-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: #e6f7ff;
}

.member-card:hover::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #1890ff, #40a9ff);
}

.member-content {
  display: flex;
  align-items: center;
}

.member-avatar-container {
  position: relative;
  margin-right: 16px;
}

.member-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #f0f2f5;
  transition: transform 0.3s ease, border-color 0.3s ease;
  cursor: pointer;
}

.member-card:hover .member-avatar {
  transform: scale(1.05);
  border-color: #1890ff;
}

.online-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 18px;
  height: 18px;
  background-color: #52c41a;
  border-radius: 50%;
  border: 3px solid white;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(82, 196, 26, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(82, 196, 26, 0);
  }
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 18px;
  font-weight: 700;
  color: #333;
  margin-bottom: 8px;
  transition: color 0.2s ease;
}

.member-card:hover .member-name {
  color: #1890ff;
}

.member-role-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.role-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 600;
}

.creator-badge {
  background-color: #fff1f0;
  color: #ff4d4f;
  border: 1px solid #ffccc7;
}

.member-badge {
  background-color: #f0f5ff;
  color: #1890ff;
  border: 1px solid #adc6ff;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .members-list {
    grid-template-columns: 1fr;
  }
  
  .member-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .member-title {
    font-size: 18px;
  }
  
  .member-card {
    padding: 16px;
  }
  
  .member-avatar {
    width: 56px;
    height: 56px;
  }
}

/* 按钮样式 */
.kick-btn {
  background-color: #ff4d4f;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.kick-btn:hover {
  background-color: #ff7875;
  transform: translateY(-1px);
}

.creator-btns-row {
  display: flex;
  gap: 16px;
  margin: 30px auto;
  max-width: 1000px;
  padding: 0 20px;
}

.application-btn, .modify-btn, .disband-btn, .leave-btn, .apply-btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.application-btn {
  background-color: #1890ff;
  color: white;
}

.application-btn:hover {
  background-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.modify-btn {
  background-color: #52c41a;
  color: white;
}

.modify-btn:hover {
  background-color: #73d13d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.disband-btn {
  background-color: #ff4d4f;
  color: white;
}

.disband-btn:hover {
  background-color: #ff7875;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 77, 79, 0.3);
}

.leave-btn-wrapper, .apply-btn-wrapper {
  margin: 30px auto;
  max-width: 1000px;
  padding: 0 20px;
}

.leave-btn {
  background-color: #faad14;
  color: white;
  width: 100%;
}

.leave-btn:hover {
  background-color: #ffc53d;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
}

.apply-btn {
  background-color: #1890ff;
  color: white;
  width: 100%;
}

.apply-btn:hover {
  background-color: #40a9ff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

/* 聊天按钮样式 */
.chat-button-wrapper {
  position: fixed;
  bottom: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 100;
}

.chat-button {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background-color: #1890ff;
  color: white;
  font-size: 24px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-button:hover {
  background-color: #40a9ff;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(24, 144, 255, 0.4);
}

/* 空状态样式 */
.empty-message {
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
}

/* Web Modal Styles */
.web-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(2px);
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  animation: modalSlideIn 0.3s ease-out;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.modal-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  color: #999;
}

.close-button:hover {
  background-color: #f5f5f5;
  color: #333;
}

.contact-list {
  max-height: 400px;
  overflow-y: auto;
  padding: 8px;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  margin: 4px 0;
}

.contact-item:hover {
  background-color: #f8f9fa;
}

.contact-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  margin-right: 16px;
  object-fit: cover;
  border: 2px solid #e0e0e0;
}

.contact-name {
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

/* 滚动条样式 */
.contact-list::-webkit-scrollbar {
  width: 6px;
}

.contact-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.contact-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.contact-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .team-detail {
    margin: 10px;
    padding: 20px;
    border-radius: 8px;
  }
  
  .cover-img {
    height: 200px;
  }
  
  .team-name {
    font-size: 24px;
  }
  
  .creator-btns-row {
    flex-direction: column;
    gap: 12px;
  }
  
  .creator-btns-row button {
    width: 100%;
  }
  
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .chat-button-wrapper {
    bottom: 30px;
    right: 30px;
  }
  
  .chat-button {
    width: 50px;
    height: 50px;
    font-size: 20px;
    line-height: 50px;
  }
}

@media (min-width: 1024px) {
  .team-detail {
    max-width: 900px;
    padding: 40px;
  }
  
  .cover-img {
    height: 350px;
  }
  
  .modal-content {
    max-width: 600px;
  }
}
</style>
