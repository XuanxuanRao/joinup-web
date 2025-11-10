import { ref } from 'vue';

const wss = ref(null);
const isConnected = ref(false);
const listeners = [];

let url = '';

export function useWebSocket(token) {
  // 初始化连接
  function connect() {
    url = "wss://joinup.org.cn/chat";
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}token=${encodeURIComponent(token)}`;
    
    try {
      // 使用标准 WebSocket API 替代 uni.connectSocket
      wss.value = new WebSocket(url);
      
      wss.value.onopen = () => {
        isConnected.value = true;
        console.log("WebSocket连接已打开");
      };
      
      wss.value.onclose = () => {
        isConnected.value = false;
        console.log("WebSocket连接已关闭");
        restart();
      };
      
      wss.value.onerror = (err) => {
        isConnected.value = false;
        console.error("WebSocket错误:", err);
        restart();
      };
      
      wss.value.onmessage = (event) => {
        listeners.forEach(fn => fn(event));
        // 解析消息内容
        const data = JSON.parse(event.data);
        console.log("收到消息:", data);
        // 获取当前用户ID（从localStorage中获取）
        const userInfoStr = localStorage.getItem('userInfo');
        let userId = null;
        if (userInfoStr) {
          try {
            const userInfo = JSON.parse(userInfoStr);
            userId = userInfo.id;
          } catch (e) {
            console.error('解析用户信息失败:', e);
          }
        }
        // 判断消息是否是发给当前用户的
        if (userId && data.receiverId == userId) {
          // 简单的浏览器通知
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('新消息', {
              body: '你有一条新消息',
              icon: '/favicon.ico'
            });
          }
        }
      };
    } catch (error) {
      console.error('创建WebSocket连接失败:', error);
    }
  }
  
  // 发送消息
  function send(message) {
    if (wss.value && isConnected.value) {
      wss.value.send(typeof message === 'string' ? message : JSON.stringify(message));
    } else {
      console.warn('WebSocket未连接，无法发送消息');
    }
  }
  
  // 关闭连接
  function close() {
    if (wss.value) {
      wss.value.close();
      wss.value = null;
      isConnected.value = false;
    }
  }
  
  // 重新连接
  function restart() {
    console.log('尝试重新连接WebSocket...');
    close();
    // 延迟2秒后重新连接
    setTimeout(() => {
      if (token) {
        connect();
      }
    }, 2000);
  }
  
  // 监听消息
  function onMessage(callback) {
    if (typeof callback === 'function' && !listeners.includes(callback)) {
      listeners.push(callback);
    }
  }
  
  // 移除消息监听
  function offMessage(callback) {
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }
  
  return {
    connect,
    send,
    close,
    restart,
    onMessage,
    offMessage,
    isConnected
  };
}