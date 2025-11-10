<template>
	<view class="content">
		<view class="topBox">
			<!-- 设置区块 -->
			<view class="setbox">
				<view class="set-left">
					<!-- 日历图标 -->
					<!-- <uni-icons type="calendar" size="30" color="#fff"></uni-icons>
					<view class="txt" @click="openSign">签到记录</view> -->
				</view>
				<up-popup closeable @close="closeSignPopup" :show="showSignPopup" round="20">
				  <view class="popup-container">
				    <view class="popup-header">
				      <text class="popup-title">签到记录</text>
				      <view class="popup-subtitle">查看您的历史签到情况</view>
				    </view>
				    
				    <view class="filter-section">
				      <!-- 页码选择 -->
				      <view class="filter-row">
				        <text class="filter-label">页码</text>
				        <picker 
				          :value="pageQuery.pageNo - 1" 
				          class="filter-picker" 
				          :range="[1, 2, 3, 4, 5]" 
				          @change="(e) => pageQuery.pageNo = e.detail.value + 1"
				        >
				          <view class="filter-value">
				            {{ pageQuery.pageNo }}
				            <uni-icons type="arrowdown" size="14" color="#666"></uni-icons>
				          </view>
				        </picker>
				      </view>
				
				      <!-- 每页条数选择 -->
				      <view class="filter-row">
				        <text class="filter-label">每页条数</text>
				        <picker 
				          @change="(e) => pageQuery.pageSize = e.detail.value + 1"
				          class="filter-picker" 
          :range="[5, 10, 15, 20]" 
          :value="Math.floor(pageQuery.pageSize / 5) - 1"
        >
				          <view class="filter-value">
				            {{ pageQuery.pageSize }}
				            <uni-icons type="arrowdown" size="14" color="#666"></uni-icons>
				          </view>
				        </picker>
				      </view>
				
				      <!-- 排序方式选择 -->
				      <view class="filter-row">
				        <text class="filter-label">排序方式</text>
				        <picker 
				          @change="(e) => pageQuery.isAsc = e.detail.value"
				          class="filter-picker" 
				          :range="['升序', '降序']" 
				          :value="pageQuery.isAsc === 'true' ? 0 : 1"
				        >
				          <view class="filter-value">
				            {{ pageQuery.isAsc === 'true' ? '升序' : '降序' }}
				            <uni-icons type="arrowdown" size="14" color="#666"></uni-icons>
				          </view>
				        </picker>
				      </view>
				      
				      <button class="query-button" @click="getSignList">查询记录</button>
				    </view>
				
				    <!-- 签到记录列表 -->
				    <scroll-view v-if="signList.length > 0" class="sign-list" scroll-y>
				      <view v-for="(item, index) in signList" :key="index" class="sign-card">
				        <view class="sign-card-header">
				          <text class="course-id">课程ID: {{ item.courseId }}</text>
				          <view :class="['sign-status', item.success ? 'success' : 'fail']">
				            {{ item.success ? '签到成功' : '签到失败' }}
				          </view>
				        </view>
				        <view class="sign-time">
				          <uni-icons type="calendar" size="14" color="#999"></uni-icons>
				          <text>{{ formatTime(item.createTime) }}</text>
				        </view>
				      </view>
				    </scroll-view>
				    
				    <view v-else class="empty-state">
				      <text class="empty-text">暂无签到记录</text>
				      <text class="empty-tip">尝试调整查询条件或刷新页面</text>
				    </view>
				  </view>
				</up-popup>
				<view class="set-right">
					<!-- 设置图标 和 聊天图标 -->
					<uni-icons type="gear" size="30" color="#fff"></uni-icons>
				</view>
			</view>
			<!-- 用户信息展示 -->
			<view class="users" >
				<view class="u-top" >
					<!-- 用户未登录时显示默认头像和"注册/登录" -->
					<template v-if="!userInfo.username">
						<image
							src="https://survey-planet-test.oss-cn-beijing.aliyuncs.com/3385f9606a5775ee842d9257248d568.jpg"
							mode="aspectFill"
						>
						</image>
						<view class="tit">
							注册/登录
						</view>
					</template>
					<!-- 用户已登录时显示用户头像和昵称 -->
					<template v-else>
						<image
							:src="userInfo.avatar"
							mode="aspectFill"
						>
						</image>
						<view class="tit">
							{{ userInfo.username }}
						</view>
						
					</template>
					<!-- 添加箭头图标 -->
  				<uni-icons class="arrow-icon" type="arrowright" size="30" color="#999" @click.stop="setFun"></uni-icons>
				</view>
				<view class="u-bottom">
					<!-- 兴趣 -->
					<view class="u-item" @click="goToTechnology">
						<view class="icon-wrapper">
							<uni-icons  type="star" size="30" color="#FF4D4F"></uni-icons>
						</view>
						<view class="u-tit">技术</view>
					</view>

					<!-- 加入队伍 -->
					<view class="u-item" @click="goToBlank('MEMBER')">
						<view class="num">{{ userInfo.joinedTeamCount }}</view>
						<view class="u-tit">已加入的队伍</view>
					</view>

					<!-- 创建队伍 -->
					<view class="u-item" @click="goToBlank('CREATOR')">
						<view class="num">{{ userInfo.createdTeamCount }}</view>
						<view class="u-tit">已创建的队伍</view>
					</view>

				</view>
			</view>
		</view>
		<!-- 功能项列表 -->
		<view class="listBox">
		    <view class="lists">
		        <u-cell-group>
		            <!-- 列出多个功能项，点击时跳转到相应页面 -->

					<u-cell  title="浏览历史" is-link url="/pages/detail/browseHistory"></u-cell>
		            <u-cell  title="课程助手" is-link 
								:url="userInfo.studentId ? '/pages/course/course' : '/pages/veri/veri'"></u-cell>
		            <u-cell  title="博雅助手" is-link url="/pages/boya/boya"></u-cell>
								<u-cell 
									title="反馈问题" 
									is-link 
									@click="openFeedbackPopup"
								/>
								<up-popup closeable @close="closeFeedbackPopup" :show="showFeedbackPopup" round="20">
									<view class="popup">
										<view class="title">反馈问题</view>

										<!-- 反馈主题选择框 -->
										<view class="form-item">
											<view class="form-label">反馈主题</view>
											<picker 
												class="form-picker" 
												:range="subjectOptions" 
												@change="onSubjectChange"
											>
												<view class="form-value">
													{{ selectedSubject || '请选择反馈主题' }}
												</view>
											</picker>
										</view>

										<!-- 反馈内容输入框 -->
										<view class="form-item">
											<view class="form-label">反馈内容</view>
											<textarea 
												class="feedback-textarea" 
												placeholder="请输入您的反馈内容..." 
												v-model="feedbackContent"
											></textarea>
										</view>

										<!-- 联系方式输入框 -->
										<view class="form-item">
											<view class="form-label">联系方式</view>
											<input 
												class="form-input" 
												type="text" 
												placeholder="请输入您的联系方式（选填）" 
												v-model="contactInfo"
											/>
										</view>

										<!-- 提交按钮 -->
										<button 
											class="submit-button" 
											@click="submitFeedback"
										>
											提交
										</button>
									</view>
								</up-popup>
		        </u-cell-group>
		    </view>
		</view>
		<!-- 弹出层，用于获取昵称和头像 -->
		<!-- @close: 这个事件监听器用于处理弹出层关闭时的事件。
		:show: 这个属性用于控制弹出层的显示状态。 -->
		<up-popup closeable @close="close" :show="show" round="20">
		  <view class="popup">
			<view class="title">获取您的昵称、头像</view>

			<!-- 获取用户头像 -->
			<view class="flex">
				<view class="label">上传头像：</view>
				<button class="upload-btn" @click="chooseFile">选择文件</button>
			</view>

			<!-- 获取用户昵称 -->
			<view class="flex">
			  <view class="label">获取用户昵称：</view>
			  <input @input="changeName" type="nickname" placeholder="请输入昵称">
			</view>

			<!-- 选择性别 -->
			<view class="flex">
			  <view class="label">选择性别：</view>
			  <picker :range="genderOptions" @change="changeGender">
				<view class="picker-value">{{ userInfo.gender || '请选择性别' }}</view>
			  </picker>
			</view>

			<!-- 输入北航密码 -->
			<view class="flex">
			  <view class="label">北航密码：</view>
			  <input v-model="userInfo.ssoPassword" type="password" placeholder="请输入北航密码（可选）">
			</view>

			<!-- 提交按钮 -->
			<button size="default" type="primary" @click="userSubmit">确定</button>
		  </view>
		</up-popup>
	</view>
</template>

<script setup>
	import {reactive,ref, onMounted, nextTick, computed} from "vue"
	import { useRouter } from 'vue-router'
	import { getUserInfo,modifyUserInfo,getSignRecord,feedback,uploadFile } from "../../api/api"
	import { useIntersectionObserver } from '@vueuse/core'
	// 获取router实例
	const router = useRouter();
	const userInfo = ref({
			username: '',
			avatar: '',
			studentId: '',
			gender:'',
			joinedTeamCount: 0,
			createdTeamCount: 0,
			createTime: '',
			ssoPassword: ''
	})
	
	// 动画相关状态
	const animations = ref({
		userInfo: {
			opacity: 0,
			y: 20,
			transition: 'opacity 0.6s ease, transform 0.6s ease'
		},
		stats: {
			opacity: 0,
			scale: 0.9,
			transition: 'opacity 0.5s ease, transform 0.5s ease 0.2s'
		},
		features: {
			opacity: 0,
			y: 30,
			transition: 'opacity 0.5s ease, transform 0.5s ease 0.4s'
		}
	})
	
	// 交互状态
	const loading = ref(false)
	const isRefreshing = ref(false)
	// 性别选项
	const genderOptions = ["男", "女"];
	
	// 修改性别
	const changeGender = (e) => {
	  userInfo.value.gender = genderOptions[e.detail.value];
	};

// 控制反馈弹窗的显示
const showFeedbackPopup = ref(false);

// 反馈主题选项
const subjectOptions = ["功能建议", "使用问题", "界面优化", "其他"];
const selectedSubject = ref(""); // 当前选择的主题

// 反馈内容
const feedbackContent = ref("");

// 联系方式
const contactInfo = ref("");
const fileInput = ref(); // 引用文件输入框


// 处理文件上传
	const chooseFile = async () => {
	  try {
	    // 显示加载状态
	    loading.value = true
	    
	    // 选择文件
	    console.log('选择图片...');
	    // 模拟返回结果
	    const res = {
	      statusCode: 200,
	      tempFilePaths: ['https://example.com/uploaded-image.jpg'],
	      tempFiles: [{ path: 'https://example.com/uploaded-image.jpg', size: 102400 }]
	    }

	    const filePath = res.tempFilePaths[0]; // 获取临时文件路径
	    console.log("选择的文件路径:", filePath);

	    // 上传文件
	    console.log('上传文件...');
	    // 获取token
	    const token = localStorage.getItem('token') || '';
	    // 模拟上传结果
	    const uploadRes = {
	      statusCode: 200,
	      data: '{"code":1,"data":{"url":"https://example.com/uploaded-image.jpg"}}'
	    }

	    // 模拟网络延迟
	    await new Promise(resolve => setTimeout(resolve, 800));
	    
	    // 处理上传结果
	    if (uploadRes.statusCode === 200) {
	      const data = JSON.parse(uploadRes.data); // 解析返回的数据
	      console.log("上传成功:", data);
	      
	      // 添加图片更新动画效果
	      const avatarElement = document.querySelector('.users image');
	      if (avatarElement) {
	        avatarElement.style.transition = 'opacity 0.3s ease';
	        avatarElement.style.opacity = '0';
	        
	        setTimeout(() => {
	          userInfo.value.avatar = data.data.url;
	          avatarElement.style.opacity = '1';
	        }, 300);
	      } else {
	        userInfo.value.avatar = data.data.url;
	      }
	      
	      showNotification("上传成功", 'success');
	    } else {
	      console.error("上传失败，状态码:", uploadRes.statusCode);
	      showNotification("上传失败，请重试", 'error');
	    }
	  } catch (error) {
	    console.error("文件选择或上传失败:", error);
	    showNotification("上传失败，请重试", 'error');
	  } finally {
	    loading.value = false;
	  }
	};
	
	// 显示通知提示
	const showNotification = (message, type = 'info') => {
	  // 创建通知元素
	  const notification = document.createElement('div');
	  notification.className = `custom-notification ${type}`;
	  notification.textContent = message;
	  notification.style.cssText = `
	    position: fixed;
	    top: 20px;
	    right: 20px;
	    padding: 12px 20px;
	    border-radius: 6px;
	    color: white;
	    font-size: 14px;
	    z-index: 9999;
	    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	    opacity: 0;
	    transform: translateX(100%);
	    transition: all 0.3s ease;
	  `;
	  
	  // 设置不同类型的样式
	  if (type === 'success') {
	    notification.style.backgroundColor = '#52c41a';
	  } else if (type === 'error') {
	    notification.style.backgroundColor = '#f5222d';
	  } else if (type === 'warning') {
	    notification.style.backgroundColor = '#faad14';
	  } else {
	    notification.style.backgroundColor = '#1890ff';
	  }
	  
	  // 添加到页面
	  document.body.appendChild(notification);
	  
	  // 显示动画
	  setTimeout(() => {
	    notification.style.opacity = '1';
	    notification.style.transform = 'translateX(0)';
	  }, 10);
	  
	  // 自动关闭
	  setTimeout(() => {
	    notification.style.opacity = '0';
	    notification.style.transform = 'translateX(100%)';
	    setTimeout(() => {
	      document.body.removeChild(notification);
	    }, 300);
	  }, 2500);
	};
// 打开反馈弹窗
const openFeedbackPopup = () => {
  showFeedbackPopup.value = true;
};

// 关闭反馈弹窗
const closeFeedbackPopup = () => {
  showFeedbackPopup.value = false;
};

// 选择反馈主题
const onSubjectChange = (e) => {
  selectedSubject.value = subjectOptions[e.detail.value];
};

// 提交反馈
	const submitFeedback = async() => {
	  if (!selectedSubject.value) {
	    showNotification("请选择反馈主题", 'warning');
	    return;
	  }

	  if (!feedbackContent.value.trim()) {
	    showNotification("请输入反馈内容", 'warning');
	    return;
	  }

	  try {
	    loading.value = true;
	    
	    // 提交数据
	    console.log("反馈主题:", selectedSubject.value);
	    console.log("反馈内容:", feedbackContent.value);
	    console.log("联系方式:", contactInfo.value);
	    
	    const data={
	      "subject" :selectedSubject.value,
	      "content":feedbackContent.value,
	      "contact":contactInfo.value
	    }
	    
	    // 添加提交按钮动画
	    const submitBtn = document.querySelector('.submit-button');
	    if (submitBtn) {
	      submitBtn.style.transform = 'scale(0.95)';
	      submitBtn.style.transition = 'transform 0.2s ease';
	    }
	    
	    // 模拟网络延迟
	    await new Promise(resolve => setTimeout(resolve, 1000));
	    
	    const res=await feedback(data)
	    console.log("feedback",res)
	    
	    showNotification("反馈已提交，感谢您的宝贵意见", 'success');
	    
	    // 清空输入框并关闭弹窗
	    selectedSubject.value = "";
	    feedbackContent.value = "";
	    contactInfo.value = "";
	    
	    // 添加延迟关闭，让用户有时间看到成功提示
	    setTimeout(() => {
	      closeFeedbackPopup();
	    }, 800);
	    
	  } catch (error) {
	    console.error("提交反馈失败:", error);
	    showNotification("提交失败，请稍后重试", 'error');
	  } finally {
	    loading.value = false;
	    
	    // 恢复按钮状态
	    const submitBtn = document.querySelector('.submit-button');
	    if (submitBtn) {
	      submitBtn.style.transform = 'scale(1)';
	    }
	  }
	};
	// 控制弹出层的显示
	const show = ref(false)
	const goToTechnology = () => {
			// 使用路由跳转替代uni.navigateTo
  router.push({
					url: '/pages/technology/technology' // 跳转到 technology 页面
			});
	};
	// 定义格式化时间函数
	const formatTime = (time) => {
	  if (!time) return '--';
	  const date = new Date(time);
	  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
	};
	const getSignList = async () => {
			const res = await getSignRecord(pageQuery);
			console.log("res",res)
			signList.value = res.list;
	}
	// 关闭弹出层
	const close = () => {
	    show.value = false
	}
	const showSignPopup = ref(false); // 控制签到记录弹窗的显示
	const signList = ref([]); // 存储签到记录列表
	const pageQuery = reactive({
	  pageNo: 1, // 页码
	  pageSize: 10, // 每页条数
	  isAsc: true // 排序方式（升序/降序）
	});

	// 打开签到记录弹窗
	const openSign = async () => {
	  // 添加页面跳转动画提示
	  const targetElement = document.querySelector('.set-left');
	  if (targetElement) {
	    targetElement.style.transform = 'scale(0.95)';
	    targetElement.style.transition = 'transform 0.2s ease';
	    
	    setTimeout(() => {
	      targetElement.style.transform = 'scale(1)';
	      // 跳转页面
	      router.push({
	        path: '/pages/sign/sign' // 跳转到签到记录页面
	      });
	    }, 200);
	  } else {
	    router.push({
	      path: '/pages/sign/sign'
	    });
	  }
	};
	
	const goToBlank = (type) => {
	  // 添加点击反馈效果
	  const targetElement = event.currentTarget;
	  if (targetElement) {
	    targetElement.style.transform = 'scale(0.95)';
	    targetElement.style.transition = 'transform 0.2s ease';
	  }
	  
	  // 存储类型并跳转
	  localStorage.setItem('blank_type', type);
	  console.log(localStorage.getItem('blank_type'));
	  console.log("跳转到blank页面");
	  
	  // 添加延迟跳转，让用户看到点击效果
	  setTimeout(() => {
	    if (targetElement) {
	      targetElement.style.transform = 'scale(1)';
	    }
	    router.push({
	      path: '/pages/blank/blank'
	    });
	  }, 200);
	};
	
	// 关闭签到记录弹窗
	const closeSignPopup = () => {
	  showSignPopup.value = false; // 隐藏弹窗
	};
	// 页面加载时获取用户信息
	onMounted(async () => {
	  try {
	    // 开始加载动画
	    loading.value = true;
	    
	    // 获取用户信息
	    const storedInfo = localStorage.getItem('userInfo');
	    if (storedInfo) {
	      try {
	        userInfo.value = JSON.parse(storedInfo);
	      } catch (e) {
	        console.error("解析用户信息失败:", e);
	        userInfo.value = {
	          username: '',
	          avatar: '',
	          joinedTeamCount: 0,
	          createdTeamCount: 0
	        };
	      }
	    } else {
	      userInfo.value = {
	        username: '',
	        avatar: '',
	        joinedTeamCount: 0,
	        createdTeamCount: 0
	      };
	    }
	    
	    // 模拟API请求延迟
	    await new Promise(resolve => setTimeout(resolve, 600));
	    
	    // 启动页面加载动画
	    await startAnimations();
	    
	    // 添加页面可见性变化监听
	    document.addEventListener('visibilitychange', () => {
	      if (!document.hidden) {
	        // 当页面重新可见时刷新数据
	        refreshUserInfo();
	      }
	    });
	    
	  } catch (error) {
	    console.error("加载用户信息失败:", error);
	    showNotification("加载失败，请刷新页面", 'error');
	  } finally {
	    loading.value = false;
	  }
	});
	
	// 页面加载动画
	const startAnimations = async () => {
	  await nextTick();
	  
	  // 启动顺序动画
	  animations.value.userInfo = {
	    ...animations.value.userInfo,
	    opacity: 1,
	    y: 0
	  };
	  
	  setTimeout(() => {
	    animations.value.stats = {
	      ...animations.value.stats,
	      opacity: 1,
	      scale: 1
	    };
	  }, 200);
	  
	  setTimeout(() => {
	    animations.value.features = {
	      ...animations.value.features,
	      opacity: 1,
	      y: 0
	    };
	  }, 400);
	};
	
	// 刷新用户信息
	const refreshUserInfo = async () => {
	  if (isRefreshing.value) return;
	  
	  try {
	    isRefreshing.value = true;
	    
	    // 模拟刷新操作
	    await new Promise(resolve => setTimeout(resolve, 800));
	    
	    const storedInfo = localStorage.getItem('userInfo');
	    if (storedInfo) {
	      try {
	        userInfo.value = JSON.parse(storedInfo);
	      } catch (e) {
	        console.error("解析用户信息失败:", e);
	      }
	    }
	    
	  } catch (error) {
	    console.error("刷新用户信息失败:", error);
	  } finally {
	    isRefreshing.value = false;
	  }
	};
	
	//提交用户信息，保存到本地存储
	const userSubmit = async() => {
	  try {
	    // 添加表单验证
	    if (!userInfo.value.username || userInfo.value.username.trim().length < 2) {
	      showNotification("请输入有效的昵称（至少2个字符）", 'warning');
	      return;
	    }
	    
	    loading.value = true;
	    
	    // 收集提交数据
	    const data={
	      "username": userInfo.value.username.trim(),
	      "avatar": userInfo.value.avatar,
	      "gender": userInfo.value.gender,
	      "ssoPassword": userInfo.value.ssoPassword
	    }
	    
	    // 提交数据
	    const res = await modifyUserInfo(data)
	    console.log("modifyUserInfo", res)
	    
	    // 保存到本地存储
	    localStorage.setItem('userInfo', JSON.stringify({
	      ...userInfo.value,
	      username: userInfo.value.username.trim()
	    }));
	    
	    showNotification("信息保存成功", 'success');
	    
	    // 添加延迟关闭，让用户有时间看到成功提示
	    setTimeout(() => {
	      show.value = false;
	      // 刷新页面动画
	      refreshAnimations();
	    }, 1000);
	    
	  } catch (error) {
	    console.error("保存用户信息失败:", error);
	    showNotification("保存失败，请稍后重试", 'error');
	  } finally {
	    loading.value = false;
	  }
	};
	
	// 刷新动画
	const refreshAnimations = () => {
	  // 重置动画
	  animations.value.userInfo = {
	    ...animations.value.userInfo,
	    opacity: 0,
	    y: 20
	  };
	  
	  // 重新触发动画
	  setTimeout(() => {
	    startAnimations();
	  }, 100);
	};
	
	// 选择头像时更新头像
	const onChooseavatar = (e) => {
	    userInfo.value.avatar = e.detail.avatarUrl
	}
	
	// 输入昵称时更新昵称
	const changeName = (e) => {
	    userInfo.value.username = e.detail.value
			console.log("userInfo",userInfo)
	}
	
	// 设置用户信息的方法
	const setFun = () => {
	  // 给用户一个确认的提醒
	  if (confirm('授权登录后可以使用更多功能')) {
	    // 添加打开弹窗动画
	    show.value = true;
	    
	    // 延迟添加弹窗动画效果
	    setTimeout(() => {
	      const popup = document.querySelector('.popup');
	      if (popup) {
	        popup.style.transform = 'scale(1)';
	        popup.style.opacity = '1';
	      }
	    }, 10);
	  }
	};
	
	// 监听反馈弹窗的显示状态
	const handleFeedbackPopupShow = () => {
	  setTimeout(() => {
	    const popup = document.querySelector('.popup');
	    if (popup) {
	      popup.style.transform = 'scale(1)';
	      popup.style.opacity = '1';
	    }
	  }, 10);
	};
	
	// 监听签到记录弹窗的显示状态
	const handleSignPopupShow = () => {
	  setTimeout(() => {
	    const popup = document.querySelector('.popup-container');
	    if (popup) {
	      popup.style.transform = 'translateY(0)';
	      popup.style.opacity = '1';
	    }
	  }, 10);
	};
</script>

<style lang="scss" scoped>
// 全局样式变量
:root {
  --primary-color: #4361ee;
  --primary-light: #4895ef;
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
  --radius-full: 9999rpx;
}

// 灯泡图标发光效果
.icon-lightbulb {
  width: 30rpx;
  height: 30rpx;
  filter: drop-shadow(0 0 10px #FFD700);
}

// 主容器样式
.content {
  min-height: 100vh;
  background-color: var(--bg-light);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		.popup-container {
			padding: 20rpx;
			background-color: #fff;
			border-radius: 20rpx 20rpx 0 0;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
		}

		.popup-header {
			margin-bottom: 20rpx;
			text-align: center;
		}

		.popup-title {
			font-size: 36rpx;
			font-weight: bold;
			color: #333;
		}

		.popup-subtitle {
			font-size: 28rpx;
			color: #999;
			margin-top: 8rpx;
		}

		.filter-section {
			padding: 20rpx;
			background-color: #f9f9f9;
			border-radius: 12rpx;
			margin-bottom: 20rpx;
		}

		.filter-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-bottom: 20rpx;
		}

		.filter-label {
			font-size: 28rpx;
			color: #333;
			flex: 1;
		}

		.filter-picker {
			flex: 2;
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 10rpx 20rpx;
			border: 1rpx solid #ccc;
			border-radius: 10rpx;
			background-color: #fff;
			font-size: 28rpx;
			color: #666;
		}

		.filter-value {
			display: flex;
			align-items: center;
			justify-content: space-between;
			width: 100%;
		}

		.query-button {
			width: 100%;
			height: 80rpx;
			background-color: #2979ff;
			color: #fff;
			font-size: 30rpx;
			text-align: center;
			line-height: 80rpx;
			border-radius: 10rpx;
			box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1);
			transition: background-color 0.3s ease;
		}

		.query-button:active {
			background-color: #1a5fbf;
		}

		.sign-list {
			max-height: 50vh;
			overflow-y: auto;
			margin-bottom: 24rpx;
		}

		.sign-card {
			background-color: #fff;
			border-radius: 12rpx;
			padding: 24rpx;
			margin-bottom: 20rpx;
			box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
		}

		.sign-card-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			margin-bottom: 16rpx;
		}

		.course-id {
			font-size: 28rpx;
			color: #333;
		}

		.sign-status {
			font-size: 24rpx;
			padding: 4rpx 16rpx;
			border-radius: 24rpx;
		}

		.sign-status.success {
			background-color: #e8f5e9;
			color: #4caf50;
		}

		.sign-status.fail {
			background-color: #ffebee;
			color: #f44336;
		}

		.sign-time {
			display: flex;
			align-items: center;
			font-size: 24rpx;
			color: #999;
		}

		.empty-state {
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 60rpx 0;
		}

		.empty-text {
			font-size: 28rpx;
			color: #999;
			margin-bottom: 8rpx;
		}

		.empty-tip {
			font-size: 24rpx;
			color: #ccc;
		}
    .topBox {
        width: 100%;
        position: relative;
        z-index: 1;
        overflow: hidden;
        padding: 60rpx 30rpx 50rpx;
        box-sizing: border-box;
        
        // 顶部渐变背景
        &::after {
            content: "";
            width: 140%;
            height: 300px;
            position: absolute;
            z-index: -1;
            top: 0;
            left: -20%;
            background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
            border-radius: 0 0 50% 50%;
            box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
        }
    }
    .setbox {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
        
        .set-left {
            width: 18%;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .txt {
            font-size: 32rpx;
            font-weight: 500;
            opacity: 0.9;
            transition: opacity 0.3s ease;
            
            &:hover {
                opacity: 1;
            }
        }
        
        .set-right {
            transition: transform 0.3s ease;
            
            &:hover {
                transform: scale(1.1);
            }
        }
    }
    .users {
        margin-top: 40rpx;
        padding: 35rpx;
        box-sizing: border-box;
        background: white;
        box-shadow: var(--shadow-lg);
        border-radius: var(--radius-lg);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        
        &:hover {
            transform: translateY(-5rpx);
            box-shadow: 0 12rpx 24rpx rgba(0, 0, 0, 0.15);
        }
        
        // 用户信息顶部
        .u-top {
            display: flex;
            align-items: center;
            margin-bottom: 30rpx;
            
            image {
                width: 130rpx;
                height: 130rpx;
                border-radius: 50%;
                margin-right: 25rpx;
                border: 6rpx solid white;
                box-shadow: var(--shadow-md);
                transition: transform 0.3s ease;
                
                &:hover {
                    transform: scale(1.05);
                }
            }
            
            .tit {
                font-size: 36rpx;
                font-weight: 700;
                color: var(--text-primary);
            }
            
            .arrow-icon {
                margin-left: auto;
                opacity: 0.7;
                transition: opacity 0.3s ease, transform 0.3s ease;
                
                &:hover {
                    opacity: 1;
                    transform: translateX(5rpx);
                }
            }
        }
        
        // 用户信息底部统计
        .u-bottom {
            display: flex;
            justify-content: space-around;
            align-items: center;
            background: var(--bg-light);
            border-radius: var(--radius-lg);
            padding: 25rpx 0;
        }
        
        .u-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 140rpx;
            padding: 0 30rpx;
            transition: transform 0.3s ease;
            
            &:hover {
                transform: translateY(-5rpx);
            }
        }
        
        .icon-wrapper {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 80rpx;
            height: 80rpx;
            background: linear-gradient(135deg, var(--success-color), #4895ef);
            border-radius: 50%;
            box-shadow: var(--shadow-md);
            margin-bottom: 10rpx;
            transition: transform 0.3s ease;
            
            &:hover {
                transform: scale(1.1);
            }
        }
        
        .u-tit {
            font-size: 28rpx;
            color: var(--text-secondary);
            margin-top: 10rpx;
            font-weight: 500;
        }
        
        .num {
            font-size: 54rpx;
            font-weight: 700;
            color: var(--primary-color);
            line-height: 1;
        }
    }
    .popup {
        padding: 20rpx;
        border-radius: 20rpx 20rpx 0 0;
        .title {
            margin-bottom: 20rpx;
            font-size: 40rpx;
            text-align: center;
        }
        .flex {
            display: flex;
            justify-content: flex-start;
            align-items: center;
            border-bottom: 1px solid #f5f5f5;
            padding: 24rpx 0;
						.file-input {
						width: 100%;
						height: 80rpx;
						border: 1rpx solid #ccc;
						border-radius: 10rpx;
						padding: 10rpx;
						font-size: 28rpx;
						box-sizing: border-box;
						background-color: #fff;
						color: #666;
					}
        }
        image {
            width: 70rpx;
            height: 70rpx;
        }
        .avatar-warpper {
            border: none;
            border-radius: 10rpx;
            width: 70rpx;
            height: 70rpx;
            margin-left: 20rpx;
            padding: 0;
        }
    }
    .listBox {
        margin: -30rpx 30rpx 30rpx;
        padding: 30rpx;
        background: white;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-md);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        
        &:hover {
            box-shadow: var(--shadow-lg);
        }
        
        .lists {
            .u-cell-group {
                .u-cell {
                    padding: 28rpx 0;
                    border-bottom: 1rpx solid var(--border-color);
                    transition: background-color 0.2s ease;
                    
                    &:last-child {
                        border-bottom: none;
                    }
                    
                    &:hover {
                        background-color: var(--bg-light);
                        border-radius: var(--radius-md);
                    }
                    
                    &::after {
                        border-bottom: none !important;
                    }
                    
                    .u-cell__title {
                        font-size: 32rpx;
                        color: var(--text-primary);
                        font-weight: 500;
                    }
                    
                    .u-cell__arrow {
                        opacity: 0.6;
                    }
                }
            }
        }
    }
}

// 通用弹窗样式
.popup {
  padding: 30rpx;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  background-color: white;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.popup-container {
  padding: 30rpx;
  background-color: white;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.1);
}

// 弹窗头部
.popup-header {
  margin-bottom: 30rpx;
  text-align: center;
  padding-bottom: 20rpx;
  border-bottom: 2rpx solid var(--border-color);
}

.popup-title {
  font-size: 38rpx;
  font-weight: 700;
  color: var(--text-primary);
}

.popup-subtitle {
  font-size: 30rpx;
  color: var(--text-muted);
  margin-top: 10rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 700;
  text-align: center;
  margin-bottom: 30rpx;
  color: var(--text-primary);
}

// 表单样式
.form-item {
  margin-bottom: 30rpx;
}

.form-label {
  font-size: 30rpx;
  color: var(--text-primary);
  margin-bottom: 10rpx;
  font-weight: 500;
}

.form-picker,
.form-input {
  width: 100%;
  height: 90rpx;
  border: 1rpx solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 20rpx;
  font-size: 30rpx;
  box-sizing: border-box;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 4rpx rgba(67, 97, 238, 0.1);
  }
}

.form-value {
  line-height: 90rpx;
  color: var(--text-secondary);
}

.feedback-textarea {
  width: 100%;
  height: 240rpx;
  border: 1rpx solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 20rpx;
  font-size: 30rpx;
  box-sizing: border-box;
  resize: none;
  transition: all 0.3s ease;
  
  &:focus {
    border-color: var(--primary-color);
    outline: none;
    box-shadow: 0 0 0 4rpx rgba(67, 97, 238, 0.1);
  }
}

// 提交按钮
.submit-button {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  font-size: 32rpx;
  font-weight: 600;
  text-align: center;
  line-height: 90rpx;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  border: none;
  margin-top: 20rpx;
  
  &:active {
    transform: scale(0.98);
  }
  
  &:hover {
    box-shadow: var(--shadow-lg);
  }
}

// 筛选区域
.filter-section {
  padding: 25rpx;
  background-color: var(--bg-light);
  border-radius: var(--radius-lg);
  margin-bottom: 30rpx;
}

.filter-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 25rpx;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.filter-label {
  font-size: 30rpx;
  color: var(--text-primary);
  font-weight: 500;
  flex: 1;
}

.filter-picker {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15rpx 20rpx;
  border: 1rpx solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: white;
  font-size: 30rpx;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  
  &:hover {
    border-color: var(--primary-color);
    box-shadow: var(--shadow-sm);
  }
}

.filter-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

// 查询按钮
.query-button {
  width: 100%;
  height: 90rpx;
  background: linear-gradient(135deg, var(--primary-color), var(--primary-light));
  color: white;
  font-size: 32rpx;
  text-align: center;
  line-height: 90rpx;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
  border: none;
  margin-top: 20rpx;
  
  &:active {
    transform: scale(0.98);
  }
  
  &:hover {
    box-shadow: var(--shadow-lg);
  }
}

// 签到记录列表
.sign-list {
  max-height: 50vh;
  overflow-y: auto;
  margin-bottom: 24rpx;
}

.sign-card {
  background: white;
  border-radius: var(--radius-lg);
  padding: 28rpx;
  margin-bottom: 20rpx;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-3rpx);
  }
}

.sign-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.course-id {
  font-size: 30rpx;
  color: var(--text-primary);
  font-weight: 500;
}

.sign-status {
  font-size: 26rpx;
  padding: 8rpx 20rpx;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.sign-status.success {
  background-color: #e8f5e9;
  color: #4caf50;
}

.sign-status.fail {
  background-color: #ffebee;
  color: #f44336;
}

.sign-time {
  display: flex;
  align-items: center;
  font-size: 26rpx;
  color: var(--text-muted);
}

// 空状态样式
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;
  background-color: var(--bg-light);
  border-radius: var(--radius-lg);
  margin-top: 30rpx;
}

.empty-text {
  font-size: 30rpx;
  color: var(--text-muted);
  margin-bottom: 10rpx;
  font-weight: 500;
}

.empty-tip {
  font-size: 26rpx;
  color: #adb5bd;
}

// 文件上传按钮
.upload-btn {
  padding: 15rpx 30rpx;
  background: linear-gradient(135deg, var(--success-color), #4895ef);
  color: white;
  font-size: 28rpx;
  font-weight: 500;
  border-radius: var(--radius-md);
  text-align: center;
  line-height: 40rpx;
  margin-left: 20rpx;
  border: none;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-sm);
  
  &:active {
    transform: scale(0.98);
  }
  
  &:hover {
    box-shadow: var(--shadow-md);
  }
}

// 表单行样式
.flex {
  display: flex;
  align-items: center;
  padding: 28rpx 0;
  border-bottom: 1rpx solid var(--border-color);
  
  &:last-child {
    border-bottom: none;
  }
  
  .label {
    font-size: 30rpx;
    color: var(--text-primary);
    font-weight: 500;
    width: 200rpx;
  }
  
  input {
    flex: 1;
    height: 70rpx;
    padding: 0 20rpx;
    font-size: 30rpx;
    color: var(--text-secondary);
    border: 1rpx solid var(--border-color);
    border-radius: var(--radius-md);
    transition: all 0.3s ease;
    
    &:focus {
      border-color: var(--primary-color);
      outline: none;
      box-shadow: 0 0 0 4rpx rgba(67, 97, 238, 0.1);
    }
  }
  
  .picker-value {
    flex: 1;
    height: 70rpx;
    line-height: 70rpx;
    padding: 0 20rpx;
    font-size: 30rpx;
    color: var(--text-secondary);
    border: 1rpx solid var(--border-color);
    border-radius: var(--radius-md);
  }
  
  .file-input {
    width: 100%;
    height: 80rpx;
    border: 1rpx solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 10rpx 20rpx;
    font-size: 28rpx;
    box-sizing: border-box;
    background-color: white;
    color: var(--text-secondary);
    
    &:focus {
      border-color: var(--primary-color);
      outline: none;
      box-shadow: 0 0 0 4rpx rgba(67, 97, 238, 0.1);
    }
  }
}

// 头像样式
.avatar-warpper {
  border: none;
  border-radius: var(--radius-md);
  width: 90rpx;
  height: 90rpx;
  margin-left: 20rpx;
  padding: 0;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  
  image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

// 响应式设计
@media screen and (max-width: 768px) {
  .topBox {
    padding: 50rpx 20rpx 40rpx;
  }
  
  .users {
    margin-top: 30rpx;
    padding: 30rpx;
  }
  
  .listBox {
    margin: -20rpx 20rpx 20rpx;
    padding: 20rpx;
  }
  
  .popup {
    padding: 20rpx;
  }
  
  .title {
    font-size: 36rpx;
  }
}
</style>
