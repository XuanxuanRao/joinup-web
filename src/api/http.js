import axios from 'axios';
import { useUserStore } from '../stores/user.js'

// 创建 axios 实例
const instance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
instance.interceptors.request.use(
  config => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器
instance.interceptors.response.use(
  response => {
    // 统一处理响应数据
    const res = response.data;
    
    // 根据后端返回的结构进行处理
    // 假设后端返回的数据结构包含 code 和 data 字段
    if (res.code === 1) {
      return res.data || res;
    } else if (res.code === 0) {
      // 显示错误信息
      console.error('API Error:', res);
      return Promise.reject(res.msg);
    }
    return res;
  },
  error => {
    // 处理网络错误
    console.error('Network Error:', error);
    
    // 处理超时等错误
    if (error.code === 'ECONNABORTED') {
      console.error('请求超时，请检查网络连接');
    }
    
    return Promise.reject(error);
  }
);

// 导出请求方法
export default function http(url1, data = {}, method = 'GET') {
  // 根据method参数调用对应的axios方法
  switch (method.toUpperCase()) {
    case 'GET':
      return instance.get(url1, { params: data });
    case 'POST':
      return instance.post(url1, data);
    case 'PUT':
      return instance.put(url1, data);
    case 'DELETE':
      return instance.delete(url1, { params: data });
    default:
      return instance.get(url1, { params: data });
  }
}

