<template>
  <main>
    <!--点击的经纬度位置-->
    <div id="clicked-location-box">
      <label for="input-clicked-longitude">选中的经度</label>
      <input id="input-clicked-longitude" placeholder="经度"
             type="number" v-model="$store.state.locationEditing.longitude">
      <label for="input-clicked-latitude">选中的纬度</label>
      <input id="input-clicked-latitude" placeholder="经度"
             type="number" v-model="$store.state.locationEditing.latitude">
    </div>

    <!--地图容器-->
    <div id="map-container"></div>

    <!--水表信息抽屉-->
    <el-drawer
      :show-close="false"
      :visible.sync="isWaterInfoDrawerVisible"
      :withHeader="false"
      direction="rtl"
      size="40%">

      <table class="water-info-table">
        <tr>
          <td>水表编号</td>
          <td>{{$store.state.locationEditing.waterId}}</td>
        </tr>
        <tr>
          <td>水表名称</td>
          <td>{{$store.state.locationEditing.name}}</td>
        </tr>
        <tr>
          <td>位置经度</td>
          <td>{{$store.state.locationEditing.longitude}}</td>
        </tr>
        <tr>
          <td>位置纬度</td>
          <td>{{$store.state.locationEditing.latitude}}</td>
        </tr>
        <tr>
          <td>最新记录编号</td>
          <td>{{$store.state.recordEditing.recordId}}</td>
        </tr>
        <tr>
          <td>最新记录时间</td>
          <td>{{formattedRecordDate}}</td>
        </tr>
        <tr>
          <td>最新记录用量</td>
          <td>{{$store.state.recordEditing.instantUsage}}</td>
        </tr>
      </table>

      <el-button @click="jumpToRecord" type="info">查看全部记录</el-button>
      <el-button @click="isWaterInfoDrawerVisible = false" type="primary">关闭水表信息</el-button>
    </el-drawer>
  </main>
</template>

<script>
  import AMapLoader from "@amap/amap-jsapi-loader"
  import axios from "axios";
  import moment from "moment";

  export default {
    name: 'Map',
    components: {AMapLoader},
    data() {
      return {
        map: null, // 地图
        markerList: [], // 点标记列表
        isWaterInfoDrawerVisible: false, // 是否显示水表信息抽屉
      }
    },
    created() {
      this.$store.commit("getAllLocation");
    },
    mounted() {
      // 加载高德地图API，渲染地图和点标记，添加点击事件监听
      const _this = this;
      const _ss = this.$store.state;
      AMapLoader.load({
        key: _this.$store.state.mapApiKey, // 开发者key
        version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
        plugins: [], // 插件列表
      }).then((AMap) => {
        _this.map = new AMap.Map('map-container', {
          zoom: 12, // 缩放级别
          center: [114.33, 30.57], // 武汉市中心点坐标
        });

        _this.markerList = []; // 清空点标记列表
        for (let i = 0; i < _ss.locationAll.length; i++) {
          let myMarker = new AMap.Marker({
            position: [_ss.locationAll[i].longitude, _ss.locationAll[i].latitude], // 水表经纬度位置
            title: _ss.locationAll[i].name, // 水表名称
          });
          _this.markerList.push(myMarker); // 点标记对象加入点标记列表
          myMarker.on('click', _this.clickMarker); // 点标记列表添加点击事件监听
        }
        _this.map.add(_this.markerList); // 点标记列表加入地图
        _this.map.on('click', _this.clickMap); // 地图添加点击事件监听（和点标记的点击事件不同）
      }).catch((error) => {
        console.log(error);
      });
    },
    computed: {
      // formattedRecordDate: '2020-05-01 00:00:00', // 格式化显示日期时间
      formattedRecordDate() {
        // 时间戳转日期格式
        return this.formatTimestampToDateTime();
      }
    },
    methods: {
      // 点击点标记
      clickMarker(event) {
        const _ss = this.$store.state;
        // 获取被点击的点标记的经纬度位置
        let position = event.target.getPosition().toString();
        let clickedLongitude = position.split(",")[0];
        let clickedLatitude = position.split(",")[1];

        // 遍历判断经纬度相等，得出点击的是哪个点标记
        for (let i in _ss.locationAll) {
          if (parseFloat(clickedLongitude) === parseFloat(_ss.locationAll[i].longitude)
            && parseFloat(clickedLatitude) === parseFloat(_ss.locationAll[i].latitude)) {
            this.isWaterInfoDrawerVisible = true;
            _ss.locationEditing.waterId = _ss.locationAll[i].waterId;

            axios
              .get(_ss.serverUrl + "/records/" + _ss.locationEditing.waterId)
              .then((response) => {
                _ss.locationEditing.name = _ss.locationAll[i].name;
                _ss.locationEditing.longitude = _ss.locationAll[i].longitude;
                _ss.locationEditing.latitude = _ss.locationAll[i].latitude;
                // 该水表最新一条记录
                _ss.recordEditing.recordId = response.data.content[0].recordId;
                _ss.recordEditing.recordDate = response.data.content[0].recordDate;
                _ss.recordEditing.instantUsage = response.data.content[0].instantUsage;
              }).catch((error) => {
              console.log(error);
            });
            break;
          }
        }
      },

      // 点击地图（不包括点标记）
      clickMap(event) {
        const _ss = this.$store.state;
        // 点击的经纬度赋值给当前编辑的水表位置
        _ss.locationEditing.longitude = event.lnglat.getLng().toString();
        _ss.locationEditing.latitude = event.lnglat.getLat().toString();
      },

      // 时间戳转日期格式
      formatTimestampToDateTime() {
        let date = this.$store.state.recordEditing.recordDate;
        return moment(date).format("YYYY-MM-DD HH:mm:ss");
      },

      // 跳转至记录页面，查看该水表的全部历史记录
      jumpToRecord() {
        this.isWaterInfoDrawerVisible = false;
        this.$store.commit("getAllRecordByWaterIdPageable");
        this.$parent.activeMenuIndex = '3';
        this.$router.push({path: '/TableRecord'})
      }
    },
  }
</script>
