<template>
  <div id="container">
    <header>
      <h1>水务用量管理系统</h1>
      <el-menu :default-active="activeMenuIndex"
               @select="selectMenu"
               active-text-color="#fc3"
               background-color="#345"
               id="header-nav-menu"
               mode="horizontal"
               text-color="#fff">
        <router-link to="/">
          <el-menu-item index="0">首页</el-menu-item>
        </router-link>
        <router-link to="/Map">
          <el-menu-item index="1">地图</el-menu-item>
        </router-link>
        <router-link to="/TableLocation">
          <el-menu-item index="2">位置</el-menu-item>
        </router-link>
        <router-link to="/TableRecord">
          <el-menu-item index="3">记录</el-menu-item>
        </router-link>
      </el-menu>
    </header>

    <!--保留子组件页面缓存-->
    <keep-alive>
      <router-view/>
    </keep-alive>

    <footer>
      <h3>水务用量管理系统 {{$store.state.appVersion}} &copy; 2020 {{$store.state.author}}</h3>
    </footer>
  </div>
</template>

<script>
  export default {
    name: "App",
    data() {
      return {
        activeMenuIndex: '0', // 激活的导航菜单序号。0首页，1地图，2位置，3记录
      };
    },
    methods: {
      // 点击导航栏，切换激活的菜单index
      selectMenu(key) {
        this.activeMenuIndex = key;
      },

      // 成功通知
      notifySuccess() {
        this.$notify({
          title: "成功",
          type: "success",
          position: "top-left",
        });
      },

      // 失败通知
      notifyError() {
        this.$notify({
          title: "失败",
          type: "error",
          position: "top-left",
        });
      },
    },
  };
</script>
