<template>
  <div class="login-container">
    <div class="login-form">
      <h2>欢迎登录 JoinUp</h2>
      <div class="form-item">
        <label for="username">用户名</label>
        <input 
          id="username" 
          v-model="form.username" 
          type="text" 
          placeholder="请输入用户名"
        />
      </div>
      <div class="form-item">
        <label for="password">密码</label>
        <input 
          id="password" 
          v-model="form.password" 
          type="password" 
          placeholder="请输入密码"
        />
      </div>
      <button class="login-btn" @click="handleLogin" :disabled="isLoading">
        {{ isLoading ? '登录中...' : '登录' }}
      </button>
      <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { loginByUsername } from '../../api/api.js'

const router = useRouter()
const route = useRoute()

const form = ref({
  username: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

const handleLogin = async () => {
  // 简单的表单验证
  if (!form.value.username || !form.value.password) {
    errorMessage.value = '请输入用户名和密码'
    return
  }

  isLoading.value = true
  errorMessage.value = ''

  try {
    // 使用项目封装的登录API
    const data = await loginByUsername(form.value.username, form.value.password)

    // 存储token和用户信息到localStorage
    if (data && data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('userInfo', JSON.stringify({
        username: data.username,
        avatar: data.avatar,
        gender: data.gender,
        verified: data.verified
      }))
    }
    
    // 登录成功后跳转
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    errorMessage.value = error.message || '登录失败，请重试'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.login-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  margin-bottom: 8px;
  color: #666;
  font-size: 14px;
}

.form-item input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
}

.form-item input:focus {
  outline: none;
  border-color: #4CAF50;
}

.login-btn {
  width: 100%;
  padding: 12px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.login-btn:hover:not(:disabled) {
  background-color: #45a049;
}

.login-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: #f44336;
  text-align: center;
  margin-top: 15px;
  font-size: 14px;
}
</style>