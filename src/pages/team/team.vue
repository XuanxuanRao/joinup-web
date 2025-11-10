<template>
  <view class="team-container">
    <!-- 顶部标题栏 -->
    <view class="header">
      <text class="title">组队</text>
    </view>
    
    <!-- 三个图标导航区域 -->
    <view class="icon-nav">
      <view class="icon-item" @tap="toggleCreateForm">
        <view class="icon-box">
          <!-- 发起新的组队图标 -->
          <image src="https://joinup.oss-cn-beijing.aliyuncs.com/images/message/staronhand.png" mode="aspectFit"></image>
        </view>
        <text class="icon-text">发起新的组队</text>
      </view>
      
      <view class="icon-item" @tap="getMyTeams('CREATOR')">
        <view class="icon-box">
          <!-- 我发起的组队图标 -->
          <image src="https://joinup.oss-cn-beijing.aliyuncs.com/images/message/handsup.png" mode="aspectFit"></image>
        </view>
        <text class="icon-text">我已发起的队伍</text>
      </view>
      
      <view class="icon-item" @tap="getMyTeams('MEMBER')">
        <view class="icon-box">
          <!-- 我加入的组队图标 -->
          <image src="https://joinup.oss-cn-beijing.aliyuncs.com/images/message/claphands.png" mode="aspectFit"></image>
        </view>
        <text class="icon-text">我已加入的队伍</text>
      </view>
    </view>
    
    <!-- 创建组队表单 -->
    <view class="create-team-form" v-if="showCreateForm">
      <view class="form-item">
        <text class="form-label">队伍名称</text>
        <input 
          class="form-input" 
          placeholder="请输入队伍名称(1-60字符)" 
          v-model="teamForm.name"
          maxlength="60"
        />
      </view>
      
	  <view class="input-title">上传封面：</view>
	  <view class="upload-section">
	    <button class="upload-btn" @click="chooseFile">📁 选择封面</button>
	    <image
	      v-if="teamForm.cover"
	      :src="teamForm.cover"
	      class="cover-preview"
	      mode="aspectFill"
	    />
	  </view>
	  
      <view class="form-item">
        <text class="form-label">队伍介绍</text>
        <textarea 
          class="form-textarea" 
          placeholder="请输入队伍介绍(选填)" 
          v-model="teamForm.description"
        />
      </view>
      
	  <!--
      <view class="form-item">
        <text class="form-label">队伍主题</text>
        <input 
          class="form-input" 
          placeholder="请输入队伍主题ID" 
          v-model="teamForm.themeId"
          type="number"
        />
      </view>
	  -->
	  
	  <!-- 队伍主题 -->
	  <!-- 将原来的picker组件替换为主题选择块 -->
	  <view class="form-item">
	    <text class="form-label">队伍主题</text>
	    <view class="theme-options">
	      <view 
	        v-for="theme in themeOptions" 
	        :key="theme.id"
	        class="theme-option"
	        :class="{ 'theme-selected': teamForm.themeId === theme.id }"
	        @tap="selectTheme(theme.id)"
	      >
	        {{ theme.name }}
	      </view>
	    </view>
	  </view>
      
      <view class="form-item">
        <text class="form-label">队伍是否公开</text>
        <switch 
          :checked="teamForm.open"
          @change="onOpenChange"
        />
      </view>
      
      <view class="form-item">
        <text class="form-label">最大人数</text>
        <input 
          class="form-input" 
          placeholder="请输入最大人数(不超过100)" 
          v-model="teamForm.maxMembers"
          type="number"
          maxlength="3"
        />
      </view>
      
	  <!--
      <view class="form-item">
        <text class="form-label">队伍标签</text>
        <input 
          class="form-input" 
          placeholder="请输入队伍标签ID，多个用逗号分隔(最多10个)" 
          v-model="teamForm.tagIdsInput"
        />
      </view>
	  -->
	  
	  <view class="form-item">
	    <text class="form-label">队伍标签</text>
	    <view v-if="tagList.length > 0" class="tag-options">
	      <view 
	        v-for="tag in tagList" 
	        :key="tag.id"
	        class="tag-option"
	        :class="{ 'tag-selected': selectedTagIds.includes(tag.id) }"
	        @tap="toggleTagSelection(tag.id)"
	      >
	        {{ tag.name }}
	      </view>
	    </view>
	    <view v-else class="no-tags">
	      <text>无标签</text>
	    </view>
	  </view>
      
      <button class="create-button" @tap="createTeam">确认创建</button>
	  
	  <!-- 添加一个无色但占据空间的区域 -->
	  <view class="spacer-block"></view>
    </view>
    
    <!-- 当前显示的类型提示 -->
    <view class="current-type-hint" v-if="currentTeamType !== 'all'">
      <text>{{ currentTypeText }}</text>
    </view>
    
    <!-- 组队列表 -->
    <scroll-view 
      scroll-y 
      class="team-list" 
      @scrolltolower="loadMore"
      refresher-enabled
      :refresher-triggered="isRefreshing"
      @refresherrefresh="onRefresh">
      
      <view v-for="(item, index) in teamList" :key="index" class="team-card" @click="goDetail(item)">
        <view class="team-name">{{ item.name }}</view>
        <view class="team-description" v-if="item.description">{{ item.description }}</view>
        <view class="team-info">
          <text class="team-members">成员: {{ item.currentMembersCount }}/{{ item.maxMembers }}</text>
          <text class="team-status" :class="getStatusClass(item.status)">{{ getStatusText(item.status) }}</text>
        </view>
      </view>
      
      <view v-if="teamList.length === 0" class="empty-tips">
        <text>{{ emptyTipsText }}</text>
      </view>
      
      <!-- 加载更多提示 -->
      <view class="loading-more" v-if="isLoading">
        <text>加载中...</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
import { ref, reactive } from 'vue'
import { createNewTeam, deleteTeam, getMyTeam, getAllTags } from "../../api/api"
// import TeamItem from '@/components/team-item.vue';

const userInfo = reactive({
  nickName: '',
  avatarUrl: ''
})

// 跳转详情页


export default {
  components: {},
  data() {
    return {
      isRefreshing: false,
      isLoading: false,
      
      // 是否显示创建表单
      showCreateForm: false,
      
      // 创建队伍表单数据
      teamForm: {
        name: '',
		cover:'',
        description: '',
        themeId: '',
        open: true,
        maxMembers: '',
        tagIdsInput: '', // 用于输入，后续会转换为数组
      },
	  
	  // 添加主题选项数组
      themeOptions: [
          { id: 1, name: '课程' },
          { id: 2, name: '游戏' },
          { id: 3, name: '竞赛' },
          { id: 4, name: '生活' }
      ],
      
      // 组队列表
      teamList: [],
	  
	  // 添加标签列表
	  tagList: [],
	      
	  // 记录选中的标签ID数组
	  selectedTagIds: [],
      
      // 当前显示的组队类型（全部/我创建的/我加入的）
      currentTeamType: 'all',
      
      // 图标页面链接
      pageLinks: {
        createTeam: '/pages/team/create-team',
        myCreatedTeams: '/pages/team/my-created-teams',
        myJoinedTeams: '/pages/team/my-joined-teams'
      }
    };
  },
  computed: {
    // 当前显示类型文本
    currentTypeText() {
      switch(this.currentTeamType) {
        case 'CREATOR':
          return '我已发起的队伍';
        case 'MEMBER':
          return '我已加入的队伍';
        default:
          return '全部队伍';
      }
    },
    // 空提示文本
    emptyTipsText() {
      switch(this.currentTeamType) {
        case 'CREATOR':
          return '你还没有发起过队伍';
        case 'MEMBER':
          return '你还没有加入过别人发起的队伍';
        default:
          return '暂无组队信息';
      }
    }
  },
  onLoad() {
	// // 加载队伍列表
	// this.loadTeamList();
	    
	// 获取标签列表
	this.loadTagList();
		
    // 页面加载时获取组队列表
    this.getTeamList();
  },
  methods: {
	  async chooseFile() {
	    try {
	      // 使用标准浏览器API替代uni.chooseImage
    // 在浏览器环境中，我们需要使用input[type=file]来选择图片
    // 这里简化处理，实际项目中应使用适当的文件选择UI
    console.log('选择图片操作被触发');
    // 模拟返回结果
    const res = { statusCode: 200, tempFilePaths: ['temp.jpg'], tempFiles: [{ path: 'temp.jpg' }] };
    // 获取文件路径
    
	
	  
	      const filePath = res.tempFilePaths[0];
	      console.log("选择的文件路径:", filePath);
	  
	      // 使用标准浏览器API替代uni.uploadFile
    // 在浏览器环境中，我们可以使用XMLHttpRequest或fetch API
    console.log('上传文件操作被触发');
    // 模拟上传成功
    const uploadRes = { statusCode: 200, data: JSON.stringify({ code: 200, url: 'https://example.com/uploaded.jpg' }) };
	        
	      // 文件上传模拟完成
	  
	      if (uploadRes.statusCode === 200) {
	        const data = JSON.parse(uploadRes.data);
	        console.log("上传成功:", data);
	        this.teamForm.cover = data.data.url;
	        console.log("新封面url:", this.teamForm.cover);
	        uni.showToast({ title: "上传成功", icon: "success" });
	      } else {
	        console.error("上传失败，状态码:", uploadRes.statusCode);
	        uni.showToast({ title: "上传失败", icon: "none" });
	      }
	    } catch (error) {
	      console.error("文件选择或上传失败:", error);
	      uni.showToast({ title: "上传失败", icon: "none" });
	    }
	  },
	
    // 切换创建表单显示
    toggleCreateForm() {
      this.showCreateForm = !this.showCreateForm;
      this.loadTagList();
      // 如果关闭表单，重置回全部队伍列表
      if (!this.showCreateForm) {
        this.currentTeamType = 'all';
        this.getTeamList();
      }
    },
	goDetail(item) {
	      if (!item || !item.id) {
	        console.error('无效的 item 对象', item)
	        return
	      }
	      uni.navigateTo({
	        url: `/pages/detail/detail?item=${encodeURIComponent(JSON.stringify(item))}`
	      })
	    },
    
    // 处理是否公开的切换
    onOpenChange(e) {
      this.teamForm.open = e.detail.value;
    },
	
	selectTheme(themeId) {
	  this.teamForm.themeId = themeId;
	},
    
    // 获取我的队伍（发起的或加入的）
    async getMyTeams(role) {
      try {
        this.isLoading = true;
        this.currentTeamType = role;
        
        // 如果表单正在显示，隐藏表单
        this.showCreateForm = false;
        
        // 使用标准浏览器API替代uni.showLoading
          console.log('加载中...');
          const response = await getMyTeam({
          role: role
        });
        
        uni.hideLoading();
        this.isLoading = false;
		
        console.log(response);
		
        if (response) {
          this.teamList = response || [];
        } else {
          // 使用标准浏览器API替代uni.showToast
        alert(response.msg || '获取队伍信息失败');
          this.teamList = [];
        }
      } catch (error) {
        uni.hideLoading();
        this.isLoading = false;
        // 使用标准浏览器API替代uni.showToast
         alert('获取队伍信息失败，请稍后重试');
        console.error('获取队伍信息失败:', error);
        this.teamList = [];
      }
    },
	
	// 加载标签列表
	async loadTagList() {
	  try {
	    const response = await getAllTags();
	    
	    if (response) {
	      this.tagList = response || [];
	    } else {
	      console.error('获取标签列表失败:', response.msg);
	      // 使用标准浏览器API替代uni.showToast
           alert('获取标签列表失败');
	    }
	  } catch (error) {
	    console.error('获取标签列表出错', error);
	    // 使用标准浏览器API替代uni.showToast
           alert('获取标签列表出错');
	  }
	},
	
	// 选择或取消选择标签
	toggleTagSelection(tagId) {
	  const index = this.selectedTagIds.indexOf(tagId);
	  
	  if (index === -1) {
	    // 如果标签数量超过10个，显示提示并返回
	    if (this.selectedTagIds.length >= 10) {
	      // 使用标准浏览器API替代uni.showToast
           alert('队伍标签不能超过10个');
	      return;
	    }
	    
	    // 添加标签ID到选中数组
	    this.selectedTagIds.push(tagId);
	  } else {
	    // 从选中数组中移除标签ID
	    this.selectedTagIds.splice(index, 1);
	  }
	  
	  // 更新表单中的标签ID输入字段，用于后续提交
	  this.teamForm.tagIdsInput = this.selectedTagIds.join(',');
	},
    
    // 获取队伍状态样式类
    getStatusClass(status) {
      switch(status) {
        case 'DISBANDED':
          return 'status-disbanded';
        case 'BANNED':
          return 'status-banned';
        default:
          return 'status-normal';
      }
    },
    
    // 获取队伍状态文本
    getStatusText(status) {
      switch(status) {
        case 'DISBANDED':
          return '已解散';
        case 'BANNED':
          return '已封禁';
        default:
          return '正常';
      }
    },
    
    // 创建新的组队
    async createTeam() {
      try {
        // 表单验证
        if (!this.teamForm.name || this.teamForm.name.length < 1 || this.teamForm.name.length > 60) {
          alert('队伍名称必须在1至60字符之间');
          return;
        }
        
        if (!this.teamForm.themeId) {
          alert('请输入队伍主题');
          return;
        }
        
        const maxMembers = parseInt(this.teamForm.maxMembers);
        if (!maxMembers || maxMembers <= 0 || maxMembers > 100) {
          alert('最大人数必须在1至100之间');
          return;
        }
        
        // 确保selectedTagIds是数组类型
        const selectedTagIds = Array.isArray(this.selectedTagIds) ? this.selectedTagIds : [];
        
        if (selectedTagIds.length > 10) {
          alert('队伍标签不能超过10个');
          return;
        }
        
        // 准备提交数据
        const teamData = {
          name: this.teamForm.name,
          description: this.teamForm.description,
          cover: this.teamForm.cover,
          themeId: parseInt(this.teamForm.themeId),
          open: this.teamForm.open,
          maxMembers: maxMembers,
          tagIds: selectedTagIds
        };

        console.log('提交创建队伍请求:', teamData);
        const result = await createNewTeam(teamData);
        
        console.log('创建队伍响应:', result);
        
        // 由于响应拦截器中已处理返回数据，直接检查是否成功
        if (result) {
          alert('创建成功');
          
          // 重置表单
          this.resetForm();
          
          // 显示我创建的队伍
          this.getMyTeams('CREATOR');
          
          // 隐藏表单
          this.showCreateForm = false;
          
          // 创建成功并跳转到详情页
          if (result.id) {
            uni.navigateTo({
              url: `/pages/team/team-detail?id=${result.id}`
            });
          } else if (result.data && result.data.id) {
            uni.navigateTo({
              url: `/pages/team/team-detail?id=${result.data.id}`
            });
          }
        }
      } catch (error) {
        console.error('创建组队失败:', error);
        alert(error.message || error || '创建失败，请稍后重试');
      }
    },
    
    // 重置表单
    resetForm() {
      this.teamForm = {
        name: '',
        description: '',
        themeId: '',
        open: true,
        maxMembers: '',
        tagIdsInput: '',
      };
	  this.selectedTagIds = []; // 重置选中的标签ID数组
    },
    
    // 获取组队列表
    getTeamList() {
      // 重置当前类型
      this.currentTeamType = 'all';
      // 这里可以调用获取全部队伍的API
      // 暂时使用空数组
      this.teamList = [];
    },
    
    // 下拉刷新
    onRefresh() {
      this.isRefreshing = true;
      
      if (this.currentTeamType !== 'all') {
        // 如果当前是查看自己的队伍，刷新相应的数据
        this.getMyTeams(this.currentTeamType);
      } else {
        // 否则刷新全部队伍
        this.getTeamList();
      }
      
      setTimeout(() => {
        this.isRefreshing = false;
      }, 1000);
    },
    
    // 加载更多
    loadMore() {
      if (this.isLoading) return;
      
      this.isLoading = true;
      setTimeout(() => {
        // 模拟加载更多数据
        // 在实际应用中，这里应该分页加载更多组队数据
        this.isLoading = false;
      }, 1000);
    },
    
    // 跳转到组队详情页面
    goToTeamDetail(item) {
      uni.navigateTo({
        url: `/pages/detail/detail{item.id}`
      });
    }
  }
};
</script>

<style lang="scss">
.team-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
}

/* 顶部标题 */
.header {
  padding: 44rpx 30rpx 20rpx;
  background-color: #fff;
  display: flex;
  justify-content: center; /* 水平居中 */
  
  .title {
    font-size: 40rpx;
    font-weight: bold;
    color: #333;
  }
}

/* 三个图标导航 */
.icon-nav {
  display: flex;
  justify-content: space-around;
  align-items: flex-start;
  padding: 30rpx 20rpx;
  background-color: #fff;
  margin-bottom: 20rpx;
  
  .icon-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    
    .icon-box {
      width: 120rpx;
      height: 120rpx;
      border-radius: 30rpx; /* 圆角正方形 */
      background-color: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16rpx;
      overflow: hidden;
      
      image {
        width: 60rpx;
        height: 60rpx;
      }
    }
    
    .icon-text {
      font-size: 26rpx;
      color: #333;
    }
  }
}

/* 创建组队表单 */
.create-team-form {
  background-color: #fff;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  
  .form-item {
    margin-bottom: 30rpx;
    
    .form-label {
      display: block;
      font-size: 28rpx;
      color: #333;
      margin-bottom: 10rpx;
      font-weight: 500;
    }
    
    .form-input, .form-textarea {
      width: 100%;
      padding: 16rpx;
      border: 1px solid #e5e5e5;
      border-radius: 8rpx;
      font-size: 28rpx;
      background-color: #f9f9f9;
    }
    
    .form-textarea {
      height: 160rpx;
    }
  }
  
  .create-button {
    width: 100%;
    height: 90rpx;
    line-height: 90rpx;
    background-color: #007aff;
    color: #fff;
    font-size: 30rpx;
    border-radius: 45rpx;
    margin-top: 20rpx;
  }
}

/* 当前显示类型提示 */
.current-type-hint {
  background-color: #fff;
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #f0f0f0;
  
  text {
    font-size: 28rpx;
    color: #666;
    font-weight: 500;
  }
}

/* 组队列表 */
.team-list {
  flex: 1;
  background-color: #fff;
  padding: 0 20rpx;
}

/* 队伍卡片 */
.team-card {
  background-color: #fff;
  border-radius: 12rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.05);
  padding: 30rpx;
  margin: 20rpx 0;
  
  .team-name {
    font-size: 32rpx;
    font-weight: bold;
    color: #333;
    margin-bottom: 12rpx;
  }
  
  .team-description {
    font-size: 28rpx;
    color: #666;
    margin-bottom: 20rpx;
    line-height: 1.5;
  }
  
  .team-info {
    display: flex;
    justify-content: space-between;
    
    .team-members {
      font-size: 24rpx;
      color: #999;
    }
    
    .team-status {
      font-size: 24rpx;
      &.status-normal {
        color: #07c160;
      }
      &.status-disbanded {
        color: #999;
      }
      &.status-banned {
        color: #fa5151;
      }
    }
  }
}

/* 空状态提示 */
.empty-tips {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  
  image {
    width: 200rpx;
    height: 200rpx;
    margin-bottom: 20rpx;
  }
  
  text {
    font-size: 28rpx;
    color: #999;
  }
}

/* 加载提示 */
.loading-more {
  text-align: center;
  padding: 30rpx 0;
  
  text {
    font-size: 24rpx;
    color: #999;
  }
}

.picker-view {
  border: 1rpx solid #e5e5e5;
  border-radius: 10rpx;
  padding: 15rpx;
  font-size: 28rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selected-theme {
  flex: 1;
}

.placeholder-text {
  color: #999999;
}

/* 主题选择样式 */
.theme-options {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-top: 10rpx;
}

.theme-option {
  width: 24%;
  text-align: center;
  padding: 15rpx 0;
  margin-bottom: 15rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-size: 28rpx;
  color: #666666;
  border: 1rpx solid #e0e0e0;
}

.theme-selected {
  background-color: #1296db;
  color: #ffffff;
  border-color: #1296db;
  box-shadow: 0 2rpx 6rpx rgba(18, 150, 219, 0.3);
}

/* 标签选择样式 */
.tag-options {
  display: flex;
  flex-wrap: wrap;
  gap: 15rpx;
  margin-top: 10rpx;
}

.tag-option {
  padding: 10rpx 20rpx;
  background-color: #f5f5f5;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666666;
  border: 1rpx solid #e0e0e0;
}

.tag-selected {
  background-color: #1296db;
  color: #ffffff;
  border-color: #1296db;
  box-shadow: 0 2rpx 6rpx rgba(18, 150, 219, 0.3);
}

.no-tags {
  padding: 20rpx;
  text-align: center;
  color: #999;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  margin-top: 10rpx;
}

/* 添加一个无色但占据空间的大块区域 */
.spacer-block {
  width: 100%;
  height: 3000rpx; /* 可以根据需要调整高度 */
  background-color: transparent; /* 透明背景 */
  display: block; /* 确保它是块级元素 */
  pointer-events: none; /* 不接收鼠标事件 */
}

.upload-section {
  display: flex;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 32rpx;
}

.upload-btn {
  background-color: #f0f4ff;
  color: #2979ff;
  border: 2rpx dashed #2979ff;
  border-radius: 12rpx;
  padding: 16rpx 24rpx;
  font-size: 28rpx;
  font-weight: 500;
}
.input-title {
  font-size: 30rpx;
  margin-bottom: 16rpx;
  font-weight: 600;
  color: #2c3e50;
}
</style>
