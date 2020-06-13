# water-admin-frontend

水务用量管理系统的前端工程

_此工程使用 Vue.js 2.x 开发_

_更新日志请移步至 [CHANGELOG.md](CHANGELOG.md)_

## 一、环境依赖

- Vue.js 2.6.11

- @vue/cli 4.4.1

- vue-router 3.3.3

- vuex 3.4.0

- axios 0.19.2

- element-ui 2.13.2

- moment 2.26.0

- @amap/amap-jsapi-loader 0.0.1

## 二、主要功能

- 显示地图，并将水表的位置在地图上以点标记的形式呈现

- 显示水表的位置信息和记录信息，提供基本的增删改查功能

## 三、使用方法

### 0. 安装依赖

检查根目录的包依赖配置文件 package.json，安装必需的依赖

```
npm install
```

### 1. 开发环境

默认端口是从 8080 往后延续选择第一个未被占用的端口

```
npm run serve
```

### 2. 生产环境

编译后的文件位于 /dist

```
npm run build
```

## 四、工程结构

### 1. static 静态文件

HTML 模板（Vue 要挂载的 HTML），图标 favicon 等

### 2. src 源文件

工程的主要内容

#### 2.1 main.js 和 App.vue

main.js 是 Vue 的主入口，加载 vue 以及全局依赖，并将根组件 App.vue 挂载到 index.html 中 id 为 app 的 节点

#### 2.2 assets

资源文件，存放图片、CSS 和 JS 等

## 五、其他

本工程创建于 2020.05.08 14:09

本工程的版本号严格遵守[语义化版本](https://semver.org/lang/zh-CN/)
