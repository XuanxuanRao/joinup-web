import { createRouter, createWebHistory } from 'vue-router'

// 导入页面组件
// 注意：这里使用动态导入以实现代码分割
const Home = () => import('../pages/index/index.vue')
const Login = () => import('../pages/login/login.vue')
const SearchResult = () => import('../pages/detail/searchResult.vue')
const Detail = () => import('../pages/detail/detail.vue')
const Announcement = () => import('../pages/detail/announcement.vue')
const Contacts = () => import('../pages/contacts/contacts.vue')
const Blank = () => import('../pages/blank/blank.vue')
const Order = () => import('../pages/order/order.vue')
const User = () => import('../pages/user/user.vue')
const Course = () => import('../pages/course/course.vue')
const Team = () => import('../pages/team/team.vue')
const Chat = () => import('../pages/chat/chat.vue')
const Message = () => import('../pages/message/message.vue')

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      requiresAuth: true, // 需要登录才能访问
      tabBar: true // 显示在底边栏
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      requiresAuth: false // 不需要登录即可访问
    }
  },
  {
    path: '/searchResult',
    name: 'SearchResult',
    component: SearchResult,
    meta: {
      requiresAuth: true,
      title: '搜索结果'
    },
    props: (route) => ({ keyword: route.query.keyword })
  },
  {    
    path: '/detail',    
    name: 'Detail',    
    component: Detail,    
    meta: {      
      requiresAuth: true,      
      title: '详情页'    
    },    
    props: (route) => ({ item: route.query.item })  },
  {
    path: '/announcement',
    name: 'Announcement',
    component: Announcement,
    meta: {
      requiresAuth: true,
      title: '公告详情'
    },
    props: (route) => ({ item: route.query.item })
  },
  // TabBar页面路由配置
  {
    path: '/pages/contacts/contacts',
    name: 'Contacts',
    component: Contacts,
    meta: {
      requiresAuth: true,
      title: '消息',
      tabBar: true
    }
  },
  {
    path: '/pages/blank/blank',
    name: 'Blank',
    component: Blank,
    meta: {
      requiresAuth: true,
      title: '创建',
      tabBar: true
    }
  },
  {
    path: '/pages/order/order',
    name: 'Order',
    component: Order,
    meta: {
      requiresAuth: true,
      title: '通知',
      tabBar: true
    }
  },
  {
    path: '/pages/user/user',
    name: 'User',
    component: User,
    meta: {
      requiresAuth: true,
      title: '我的',
      tabBar: true
    }
  },
  // 其他主要页面
  {
    path: '/pages/course/course',
    name: 'Course',
    component: Course,
    meta: {
      requiresAuth: true,
      title: '课程'
    }
  },
  {
    path: '/pages/team/team',
    name: 'Team',
    component: Team,
    meta: {
      requiresAuth: true,
      title: '组队'
    }
  },
  {
    path: '/pages/chat/chat',
    name: 'Chat',
    component: Chat,
    meta: {
      requiresAuth: true,
      title: '聊天'
    }
  },
  {
    path: '/pages/message/message',
    name: 'Message',
    component: Message,
    meta: {
      requiresAuth: true,
      title: '消息'
    }
  },
  // 捕获所有未匹配的路由，重定向到首页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 全局路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title || 'JoinUp'
  
  // 检查是否需要登录
  if (to.meta.requiresAuth) {
    // 从localStorage或Pinia中获取token
    const token = localStorage.getItem('token')
    
    if (token) {
      // 有token，允许访问
      next()
    } else {
      // 无token，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 记录要访问的页面，登录后可以跳转回去
      })
    }
  } else {
    // 不需要登录的页面，直接放行
    next()
  }
})

export default router