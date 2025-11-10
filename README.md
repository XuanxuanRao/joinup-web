# JoinUp Web 项目

## 项目介绍
JoinUp Web 是一个基于 Vue 3 + Vite 的 Web 应用，用于团队协作与课程管理。

## 技术栈
- **前端框架**: Vue 3
- **构建工具**: Vite
- **路由管理**: Vue Router 4
- **状态管理**: Pinia
- **HTTP客户端**: Axios
- **UI组件**: 自定义组件

## 开始使用

### 安装依赖
```bash
npm install
```

### 开发环境运行
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

### 预览生产构建
```bash
npm run preview
```

## 项目结构
```
joinup-web/
├── public/          # 静态资源目录
├── src/             # 源代码目录
│   ├── api/         # API接口定义
│   ├── components/  # 公共组件
│   ├── pages/       # 页面组件
│   ├── router/      # 路由配置
│   ├── stores/      # Pinia状态管理
│   ├── utils/       # 工具函数
│   ├── App.vue      # 根组件
│   └── main.js      # 入口文件
├── .gitignore       # Git忽略文件
├── index.html       # HTML入口
├── package.json     # 项目配置
├── vite.config.js   # Vite配置
└── README.md        # 项目说明
```

## 注意事项
- 确保已配置正确的API基础地址：`http://101.42.43.228/api`
- 开发环境默认端口为3000
- 项目使用ES模块语法

## License
MIT