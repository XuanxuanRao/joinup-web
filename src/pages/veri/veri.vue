<template>
	
  <view class="auth-container">
	  <view class="logo-container">
		<img src="https://survey-planet-test.oss-cn-beijing.aliyuncs.com/9ec3b3d8670e11a01fbc7d586f3433f.png" alt="北航" class="logo" />
	  </view>
    <up-toast ref="uToastRef"></up-toast>
    
    <!-- 主卡片 -->
    <view class="auth-card">
		<!-- 头部标题 -->
		<view class="auth-header">
		  <text class="auth-title">北航邮箱验证</text>
		  <text class="auth-subtitle">请输入您的北航邮箱完成验证</text>
		</view>
		<!-- 邮箱输入行 -->
		<view class="input-row">
        <up-input
          v-model="email"
          placeholder="请输入邮箱"
          border="none"
          class="email-input"
          placeholder-class="input-placeholder"
        >
          <template #prefix>
            <up-icon name="email" color="#7d7d7d" size="20"></up-icon>
          </template>
        </up-input>
        
        <button
          @tap="getCode"
          class="code-btn"
        >
          {{ tips }}
        </button>
      </view>
      
      <!-- 验证码输入行 -->
      <view class="input-row">
        <up-input
          v-model="vcode"
          placeholder="请填写验证码"
          border="none"
          class="code-input"
          placeholder-class="input-placeholder"
        >
          <template #prefix>
            <up-icon name="lock" color="#7d7d7d" size="20"></up-icon>
          </template>
        </up-input>
        
        <button
          @click="bhyanzheng"
          class="verify-btn"
        >
          请北航认证
        </button>
      </view>
      
      <!-- 隐藏的验证码组件（保持原有功能） -->
      <up-code
        :seconds="seconds"
        @end="end"
        @start="start"
        ref="uCodeRef"
        @change="codeChange"
        style="display: none;"
      ></up-code>
    </view>
  </view>
</template>

<script setup>
	import {reactive,ref} from "vue"
	import {onMounted} from 'vue'
	import { useRouter } from 'vue-router'
	import {  sendVerifyCode,yanzheng} from "../../api/api"
	// 获取router实例
	onMounted(() => {
		// 页面加载时的初始化逻辑
	})
	const router = useRouter();
	const email = ref('')
	const type = ref('')
	const vcode = ref('')
	const tips = ref('');
	const seconds = ref(10);
	const uCodeRef = ref(null);

	const codeChange = (text) => {
		tips.value = text;
	};

	const getCode = async() => {
		if (uCodeRef.value?.canGetCode) {
			const data={
				email: email.value,
				type: 4
			}
			const emailRegex = /^[a-zA-Z0-9._%+-]+@buaa\.edu\.cn$/;
			if (!emailRegex.test(email.value)) {
				// 使用标准浏览器API替代uni.showToast
				alert("请输入有效的北航邮箱");
				email.value = ""; // 清空输入框
			} else {
				const res=await sendVerifyCode(data)
				// 使用标准浏览器API替代uni.showLoading
				console.log('加载中...')
				setTimeout(() => {
					// 使用标准浏览器API替代uni.hideLoading
    console.log('加载完成')
					// 通知验证码组件内部开始倒计时
					uCodeRef.value?.start();
				}, 2000);
				
			}
		} else {
			// 使用标准浏览器API替代uni.$u.toast
		alert('倒计时结束后再发送');
		}
	};

	const end = () => {
		// 使用标准浏览器API替代uni.$u.toast
	alert('现在可重新发送');
	};

	const start = () => {
		// 使用标准浏览器API替代uni.$u.toast
	alert('验证码已发送');
	};
	const send = async() => {
		const data={
			email: email.value,
			type: 4
		}
		const emailRegex = /^[a-zA-Z0-9._%+-]+@buaa\.edu\.cn$/;
		if (!emailRegex.test(email.value)) {
			// 使用标准浏览器API替代uni.showToast
		alert("请输入有效的北航邮箱");
			email.value = ""; // 清空输入框
		}else{
			const res=await sendVerifyCode(data)
		}
	};
	const bhyanzheng= async() =>{
		const data={
			email: email.value,
			verifyCode: vcode.value
		}
		const vcodeRegex = /^\d{6}$/; // 验证码必须为 6 位数字
  if (!vcodeRegex.test(vcode.value)) {
			// 使用标准浏览器API替代uni.showToast
		alert("验证码必须为6位数字");
			vcode.value = ""; // 清空输入框
		}else{
			const res=await yanzheng(data)
			if(res.code==1){
				// 使用路由跳转替代uni.navigateTo
				router.push({
					path: '/pages/course/course'
				});
			}else{
				// 使用标准浏览器API替代uni.showToast
		alert("验证码错误");
				vcode.value = ""; // 清空输入框
			}
		}
	}
</script>

<style scoped>
.auth-container {
	padding: 40rpx;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4eaf2 100%);
    min-height: 100vh;
    display: flex;
    flex-direction: column; /* 垂直布局 */
    justify-content: center; /* 垂直居中 */
    align-items: center; /* 水平居中 */
    gap: 40rpx; /* 图片和卡片之间的间距 */
}
.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  width: 400rpx; /* 图片宽度 */
  height: 400rpx; /* 图片高度 */
  object-fit: contain; /* 保持图片比例 */
}
.auth-header {
  margin-bottom: 60rpx;
  text-align: center;
}

.auth-title {
  font-size: 42rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 16rpx;
}

.auth-subtitle {
  font-size: 28rpx;
  color: #7d7d7d;
  line-height: 1.6;
}

.auth-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  width: 100%;
  max-width: 650rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.08);
}

.input-row {
  display: flex;
  gap: 20rpx;
  margin-bottom: 30rpx;
}

.email-input, .code-input {
  flex: 1;
  background: #f8f9fa;
  border-radius: 12rpx;
  padding: 24rpx;
}

.input-placeholder {
  color: #bdbdbd;
  font-size: 28rpx;
}

.code-btn {
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  white-space: nowrap;
  transition: all 0.3s;
}

.code-btn[disabled] {
  background: #d9d9d9;
  color: #999;
}

.verify-btn {
  background: #1890ff;
  color: #fff;
  border: none;
  border-radius: 12rpx;
  padding: 0 30rpx;
  font-size: 28rpx;
  white-space: nowrap;
  transition: all 0.3s;
}

.code-btn:active, 
.verify-btn:active {
  opacity: 0.9;
  transform: scale(0.98);
}
</style>
