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
      
	  <!-- 新增绑定课程部分 -->
	  <view class="form-item">
	    <view class="label-container">
	      <text class="form-label">绑定课程</text>
	      <text class="bind-course" @tap="goToBindCourse">选择课程</text>
		  <text class="unbind-course" @tap="showUnbindOptions" v-if="teamForm.boundCourses && teamForm.boundCourses.length > 0">取消绑定</text>
	    </view>
	    <view v-if="teamForm.boundCourses && teamForm.boundCourses.length > 0" class="bound-courses">
	      <view 
	        v-for="course in teamForm.boundCourses" 
	        :key="course.id"
	        class="course-item"
	      >
	        {{ course.name }}
	      </view>
	    </view>
	    <view v-else class="no-courses">
	      <text>暂未绑定课程</text>
	    </view>
	  </view>
	  
	  <view class="form-item">
	    <text class="form-label">队伍标签</text>
		<text class="create-tag" @tap="goToCreateTag">新建标签</text>
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
      
      <view v-for="(item, index) in teamList" :key="index" class="team-card" @click="goToTeamDetail(item)">
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
		boundCourses: [], // 用于存储绑定的课程
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
	// const type = uni.getStorageSync('blank_type');
	// console.log("type is ???");
	// console.log(type);
	// console.log("storage is ???");
	// console.log(uni.getStorageSync('blank_type'));
	// if (type) {
	// 	this.currentTeamType = type;
	// 	//// 使用localStorage替代uni.removeStorageSync
    localStorage.removeItem('blank_type'); // 使用后删除
	//     this.getMyTeams(type);
	//     // 使用localStorage替代uni.removeStorageSync
    localStorage.removeItem('blank_type'); // 使用后删除
	// }
	
	// 添加事件监听器 - 使用标准浏览器API替代uni.$on
  window.addEventListener('courseSelected', this.handleCourseSelected)
  },
  onUnload() {
    // 移除事件监听器 - 使用标准浏览器API替代uni.$off
    window.removeEventListener('courseSelected', this.handleCourseSelected)
  },
  onShow() {
	  // 获取标签列表
	  this.loadTagList();
	  console.log("refresh creater");
	  //showCreateForm = false;
	this.getTeamList();
    // 使用localStorage替代uni.getStorageSync
    const type = localStorage.getItem('blank_type');
    console.log("onShow: type is ???");
    console.log(toString(type));
    console.log("onShow: storage is ???");
    console.log(localStorage.getItem('blank_type'));
    
    if (type) {
      this.currentTeamType = type;
      this.getMyTeams(type);
      // 使用localStorage替代uni.removeStorageSync
      //localStorage.removeItem('blank_type');
    } else {
		showCreateForm = true;
	}
	// 使用localStorage替代uni.removeStorageSync
	localStorage.removeItem('blank_type');
	//showCreateForm = false;
  },
  methods: {
	  // 显示解绑选项
	    showUnbindOptions() {
	      const that = this;
	      wx.showActionSheet({
	        itemList: this.teamForm.boundCourses.map(course => course.name),
	        success(res) {
	          const selectedIndex = res.tapIndex;
	          const selectedCourse = that.teamForm.boundCourses[selectedIndex];
	          that.confirmUnbind(selectedCourse);
	        },
	        fail(res) {
	          console.log(res.errMsg);
	        }
	      });
	    },
	    
	    // 确认解绑
	    confirmUnbind(course) {
	      const that = this;
	      wx.showModal({
	        title: '提示',
	        content: `确定要解绑课程: ${course.name}?`,
	        success(res) {
	          if (res.confirm) {
	            // 执行解绑操作
	            that.teamForm.boundCourses = that.teamForm.boundCourses.filter(
	              item => item.id !== course.id
	            );
	            wx.showToast({
	              title: '解绑成功',
	              icon: 'success'
	            });
	          }
	        }
	      });
	    },

	  // 添加处理接收课程的方法
	    handleCourseSelected(course) {
	      if (!this.teamForm.boundCourses) {
	        this.teamForm.boundCourses = []
	      }
	      this.teamForm.boundCourses.push(course)
	    },
	  async chooseFile() {
	      try {
	        const res = await uni.chooseImage({
	          count: 1,
	          sizeType: ['compressed'],
	          sourceType: ['album', 'camera'],
	        });
	    
	        const filePath = res.tempFilePaths[0];
	        console.log("选择的文件路径:", filePath);
	    
	        // 使用标准浏览器API替代uni.uploadFile
	const uploadFile = async (url, filePath, name) => {
		// 模拟上传文件的函数
		console.log('模拟上传文件:', filePath);
		const formData = new FormData();
		// 注意：在实际环境中，这里应该是文件对象而不是文件路径
		formData.append(name, { uri: filePath, name: 'file.jpg', type: 'image/jpeg' });
		try {
			const response = await fetch(url, {
				method: 'POST',
				headers: {
					'Authorization': 'Bearer ' + localStorage.getItem('token') || ''
				},
				body: formData
			});
			return await response.json();
		} catch (error) {
			console.error('文件上传失败:', error);
			return { success: false, data: { url: 'https://example.com/default.jpg' } };
		}
	};
	const uploadRes = await uploadFile(
	          'https://joinup.org.cn/api/oss/file/upload',
	          filePath,
	          'file'
	        );
	        // 模拟上传成功的响应
	        if (!uploadRes.success) {
	          uploadRes.data = { url: 'https://example.com/default.jpg' };
	        }
	    
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
	  
	  // // 切换创建表单显示
	  // toggleCreateForm() {
	  //   this.showCreateForm = !this.showCreateForm;
	  //   this.loadTagList();
	  //   // 如果关闭表单，重置回全部队伍列表
	  //   if (!this.showCreateForm) {
	  //     this.currentTeamType = 'all';
	  //     this.getTeamList();
	  //   }
	  // },
	
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
        
        uni.showLoading({
          title: '加载中...'
        });
        
        const response = await getMyTeam({
          role: role
        });
        
        uni.hideLoading();
        this.isLoading = false;
		
        console.log('队伍信息API返回:', response);
		
        // 检查响应结构，正确提取data字段中的数据
        if (response && response.code === 1 && response.data) {
          this.teamList = response.data || [];
          console.log('成功获取到队伍列表:', this.teamList);
        } else {
          uni.showToast({
            title: response?.msg || '获取队伍信息失败',
            icon: 'none'
          });
          this.teamList = [];
        }
      } catch (error) {
        uni.hideLoading();
        this.isLoading = false;
        uni.showToast({
          title: '获取队伍信息失败，请稍后重试',
          icon: 'none'
        });
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
	      uni.showToast({
	        title: '获取标签列表失败',
	        icon: 'none'
	      });
	    }
	  } catch (error) {
	    console.error('获取标签列表出错', error);
	    uni.showToast({
	      title: '获取标签列表出错',
	      icon: 'none'
	    });
	  }
	},
	
	// 选择或取消选择标签
	toggleTagSelection(tagId) {
	  const index = this.selectedTagIds.indexOf(tagId);
	  
	  if (index === -1) {
	    // 如果标签数量超过10个，显示提示并返回
	    if (this.selectedTagIds.length >= 10) {
	      uni.showToast({
	        title: '队伍标签不能超过10个',
	        icon: 'none'
	      });
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
        case '已解散':
          return '已解散';
        case '封禁':
          return '封禁';
		case '正常':
		  return '正常';	
        default:
          return '未知';
      }
    },
    
    // 创建新的组队
    async createTeam() {
      try {
        // 表单验证
        if (!this.teamForm.name || this.teamForm.name.length < 1 || this.teamForm.name.length > 60) {
          uni.showToast({
            title: '队伍名称必须在1至60字符之间',
            icon: 'none'
          });
          return;
        }
        
        if (!this.teamForm.themeId) {
          uni.showToast({
            title: '请输入队伍主题',
            icon: 'none'
          });
          return;
        }
        
        const maxMembers = parseInt(this.teamForm.maxMembers);
        if (!maxMembers || maxMembers <= 0 || maxMembers > 100) {
          uni.showToast({
            title: '最大人数必须在1至100之间',
            icon: 'none'
          });
          return;
        }
        
        // 处理标签ID
        let tagIds = [];
        if (this.teamForm.tagIdsInput) {
          tagIds = this.teamForm.tagIdsInput.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
          
          if (tagIds.length > 10) {
            uni.showToast({
              title: '队伍标签不能超过10个',
              icon: 'none'
            });
            return;
          }
        }
		
		if (this.selectedTagIds.length > 10) {
			uni.showToast({
				title: '队伍标签不能超过10个',
				icon: 'none'
			});
			return;
		}
        
        // uni.showLoading({
        //   title: '创建中...'
        // });

        // 准备提交数据
        const teamData = {
          name: this.teamForm.name,
		  cover:this.teamForm.cover,
          description: this.teamForm.description,
          themeId: parseInt(this.teamForm.themeId),
          open: this.teamForm.open,
          maxMembers: maxMembers,
          tagIds: this.selectedTagIds
        };

        const result = await createNewTeam(teamData);

        console.log('创建队伍API返回:', result);
        
        uni.hideLoading();
        
        if (result) {
          uni.showToast({
            title: '创建成功',
            icon: 'success'
          });
          
          // 重置表单
          this.resetForm();
          
          // 显示我创建的队伍
          this.getMyTeams('CREATOR');
          
          // 隐藏表单
          this.showCreateForm = false;
          
          // 创建成功
          if (result.data && result.data.id) {
            uni.navigateTo({
              url: `/pages/team/team-detail?id=${result.data.id}`
            });
          }
        } else {
          uni.showToast({
            title: result.msg || '创建失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.hideLoading();
        uni.showToast({
          title: error || '创建失败，请稍后重试',
          icon: 'none'
        });
        console.error('创建组队失败:', error);
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
    async getTeamList() {
      // 重置当前类型
      this.currentTeamType = 'all';
      
      try {
        uni.showLoading({
          title: '加载中...'
        });
        
        // 调用API获取所有队伍信息，使用getMyTeam但不指定角色
        const response = await getMyTeam({});
        
        uni.hideLoading();
        this.isLoading = false;
        
        console.log('全部队伍信息API返回:', response);
        
        // 检查响应结构，正确提取data字段中的数据
        if (response && response.code === 1 && response.data) {
          this.teamList = response.data || [];
          console.log('成功获取到全部队伍列表:', this.teamList);
        } else {
          uni.showToast({
            title: response?.msg || '获取队伍信息失败',
            icon: 'none'
          });
          this.teamList = [];
        }
      } catch (error) {
        uni.hideLoading();
        this.isLoading = false;
        uni.showToast({
          title: '获取队伍信息失败，请稍后重试',
          icon: 'none'
        });
        console.error('获取队伍信息失败:', error);
        this.teamList = [];
      }
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
        url: `/pages/team/team-detail?id=${item.id}`
      });
    },
	
	
	goToCreateTag() {
	    uni.navigateTo({
	      url: '/pages/detail/createTag'
	    });
	},
	
	// 添加新方法
	goToBindCourse() {
		uni.navigateTo({
			url: '/pages/course/bindCourse'
		});
	},
	  
	// 添加用于接收绑定课程返回数据的方法
	onCourseSelected(courses) {
		this.teamForm.boundCourses = courses;
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
.label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.create-tag {
  font-size: 14px;
  color: #007AFF;
}

.label-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.bind-course {
  font-size: 14px;
  color: #007AFF;
}

.bound-courses {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.course-item {
  background-color: #f0f0f0;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 14px;
}

.no-courses {
  color: #999;
  font-size: 14px;
  margin-top: 10px;
}

.unbind-section {
  margin-top: 20rpx;
  padding: 20rpx;
}

.bind-options {
  display: flex;
  align-items: center;
}

.bind-course {
  color: #007aff;
  margin-right: 20rpx;
}

.unbind-course {
  color: #ff3b30;
}

</style>
