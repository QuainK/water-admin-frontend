<template>
  <div id="container">
    <header>
      <h1>水务用量管理系统</h1>
      <div id="header-input-box">
        <label for="input-clicked-longitude">选中的经度</label>
        <input id="input-clicked-longitude" placeholder="经度" type="number" v-model="locationEditing.longitude">
        <label for="input-clicked-latitude">选中的纬度</label>
        <input id="input-clicked-latitude" placeholder="经度" type="number" v-model="locationEditing.latitude">
      </div>
      <el-button @click="showLocationList" size="mini" type="primary">查看所有监测点</el-button>
    </header>

    <main>
      <div id="map-container"></div>

      <el-drawer :visible.sync="isLocationDrawerVisible" :with-header="false" size="50%">
        <el-button @click="showAddLocationEditor" class="btn-add" type="primary">新增</el-button>

        <el-table :data="location" border stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="地名" prop="name"></el-table-column>
          <el-table-column label="经度" prop="longitude"></el-table-column>
          <el-table-column label="纬度" prop="latitude"></el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button @click="showUpdateLocationEditor(scope.$index)" size="mini" type="warning">
                修改
              </el-button>
              <el-button @click="deleteLocation(scope.$index)" size="mini" type="danger">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-drawer :append-to-body="true" :visible.sync="isLocationEditorDrawerVisible" :with-header="false"
                   id="location-editor-drawer" size="30%">
          <el-form :model="locationEditing" label-position="right" label-width="80px">
            <el-form-item label="地名">
              <el-input clearable placeholder="地名" type="text" v-model="locationEditing.name"></el-input>
            </el-form-item>
            <el-form-item label="经度">
              <el-input clearable placeholder="经度" type="text" v-model="locationEditing.longitude"></el-input>
            </el-form-item>
            <el-form-item label="纬度">
              <el-input clearable placeholder="纬度" type="text" v-model="locationEditing.latitude"></el-input>
            </el-form-item>
          </el-form>
          <div class="btn-group">
            <el-button @click="submitLocation" type="primary">确定</el-button>
            <el-button @click="isLocationEditorDrawerVisible = false" type="info">取消</el-button>
          </div>
        </el-drawer>
      </el-drawer>

      <el-drawer :visible.sync="isRecordDrawerVisible" :with-header="false" class="drawer" size="50%">
        <el-button @click="showAddRecordEditor()" class="btn-add" type="primary">新增</el-button>

        <el-table :data="record" border fit max-height="500" stripe>
          <el-table-column type="index"></el-table-column>
          <el-table-column label="瞬时用量" prop="instantUsage"></el-table-column>
          <el-table-column :formatter="formatDateTime" label="时间" prop="recordDate"></el-table-column>
          <el-table-column label="操作" prop="operation">
            <template slot-scope="scope">
              <el-button @click="showUpdateRecordEditor(scope.$index)" size="mini" type="warning">修改</el-button>
              <el-button @click="deleteRecord(scope.$index)" size="mini" type="danger">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-drawer :append-to-body="true" :visible.sync="isRecordEditorDrawerVisible" :with-header="false"
                   id="record-editor-drawer" size="30%">
          <el-form :model="recordEditing" label-position="right" label-width="80px">
            <el-form-item label="用量">
              <el-input
                clearable
                placeholder="输入用量，保留两位小数"
                type="text"
                v-model="recordEditing.instantUsage"
              ></el-input>
            </el-form-item>
            <el-form-item label="日期">
              <div class="block">
                <el-date-picker
                  placeholder="选择日期时间"
                  type="datetime"
                  v-model="recordEditing.recordDate"
                ></el-date-picker>
              </div>
            </el-form-item>
          </el-form>

          <div class="btn-group">
            <el-button @click="submitRecord" class="drawer-item" type="primary">确定</el-button>
            <el-button @click="isRecordEditorDrawerVisible = false" class="drawer-item" type="info">取消</el-button>
          </div>
        </el-drawer>
      </el-drawer>
    </main>
  </div>
</template>

<script>
  import axios from "axios";
  import AMapLoader from "@amap/amap-jsapi-loader";
  import moment from "moment";

  export default {
    name: "App",
    components: {AMapLoader},
    data() {
      return {
        appVersion: "0.1.0", // 版本号
        serverUrl: "http://localhost:8082", // 后端地址

        mapApiKey: "9cdc20978e6f1ea052bcc7510c3d3237", // 申请好的高德地图API的Web端开发者Key，首次调用load时必填
        map: null, // 地图
        markerList: [], // 点标记列表

        /*
        * 水表位置
        * waterId 水表编号
        * name 水表名称
        * longitude 位置经度
        * latitude 位置纬度
        */
        location: [],
        /*
        * 水表记录
        * recordId 记录编号 int
        * waterId 水表编号 int
        * recordDate 记录时间（时间戳） long
        * instantUsage 瞬时用量 double
        */
        record: [],

        waterIdFocused: "1", // 当前针对的水表的编号
        //当前正在编辑的水表位置
        locationEditing: {
          waterId: '',
          name: '',
          longitude: '',
          latitude: '',
        },
        // 当前正在编辑的水表记录
        recordEditing: {
          recordId: '',
          waterId: '',
          recordDate: '',
          instantUsage: '',
        },

        isLocationDrawerVisible: false, // 是否显示水表位置抽屉
        isRecordDrawerVisible: false, // 是否显示水表记录抽屉

        // computed中已经存在，此处不用重复定义，注释仍保留作为说明
        // isLocationEditorDrawerVisible: false,// 是否显示编辑水表位置抽屉
        // isRecordEditorDrawerVisible: false,// 是否显示编辑水表记录抽屉

        isReadyToAddLocation: false, // 准备添加位置
        isReadyToUpdateLocation: false, // 准备更新位置
        isReadyToAddRecord: false, // 准备添加记录
        isReadyToUpdateRecord: false, // 准备更新记录
      };
    },
    created() {
      this.loadingAMap(); // 加载地图
    },
    watch: {
      // 记录列表抽屉打开就发送GET请求获取记录
      isRecordDrawerVisible: function () {
        if (this.isRecordDrawerVisible) {
          this.getRecord();
        }
      },

      // 位置列表发生变化就重新在地图上画点标记并重新注册事件监听
      location: function () {
        const _this = this;
        _this.markerList = []; // 清空旧的点标记位置列表
        for (let i in _this.location) {
          if (!_this.location.hasOwnProperty(i)) continue;
          let marker = new AMap.Marker({
            position: [_this.location[i].longitude, _this.location[i].latitude], // 点标记经纬度
            title: _this.location[i].name, // 点标记名称
          });
          _this.markerList.push(marker); // 点标记加入列表中
          marker.on("click", _this.markerClick); // 列表添加点击事件监听
        }
        _this.map.add(_this.markerList); // 点标记列表加入地图中

        _this.map.on("click", _this.clickMap); // 地图添加点击事件监听
      },
    },
    computed: {
      // 添加或更新位置时显示编辑器抽屉
      isLocationEditorDrawerVisible: {
        get: function () {
          return this.isReadyToAddLocation || this.isReadyToUpdateLocation;
        },
        set: function (val) {
          if (!val) {
            this.isReadyToAddLocation = false;
            this.isReadyToUpdateLocation = false;
          }
        },
      },

      // 添加或更新记录时显示编辑器抽屉
      isRecordEditorDrawerVisible: {
        get: function () {
          return this.isReadyToAddRecord || this.isReadyToUpdateRecord;
        },
        set: function (val) {
          if (!val) {
            this.isReadyToAddRecord = false;
            this.isReadyToUpdateRecord = false;
          }
        },
      },
    },
    methods: {
      // 显示位置列表
      showLocationList() {
        this.getLocation();
        this.isLocationDrawerVisible = true;
      },

      // 显示添加位置编辑器
      showAddLocationEditor() {
        this.isReadyToAddLocation = true;
        this.isReadyToUpdateLocation = false;
      },

      // 显示更新位置编辑器
      showUpdateLocationEditor(scopeIndex) {
        this.isReadyToAddLocation = false;
        this.isReadyToUpdateLocation = true;
        this.locationEditing.waterId = this.location[scopeIndex].waterId;
        this.locationEditing.name = this.location[scopeIndex].name;
        this.locationEditing.longitude = this.location[scopeIndex].longitude;
        this.locationEditing.latitude = this.location[scopeIndex].latitude;
      },

      // 提交添加或更新的位置
      submitLocation() {
        if (this.isReadyToAddLocation) this.postLocation();
        else if (this.isReadyToUpdateLocation) this.putLocation();
      },

      // 发送POST请求添加位置
      postLocation() {
        const _this = this;
        axios({
          method: "post",
          url: _this.serverUrl + "/location",
          params: {
            name: _this.locationEditing.name,
            longitude: _this.locationEditing.longitude,
            latitude: _this.locationEditing.latitude,
          },
        }).then(() => {
          _this.notifySuccess();
          _this.getLocation();
          _this.isReadyToAddLocation = false;
        }).catch(() => {
          _this.notifyError();
        });
      },

      // 发送DELETE请求删除位置
      deleteLocation(scopeIndex) {
        const _this = this;
        axios
          .delete(_this.serverUrl + "/location/" + _this.location[scopeIndex].waterId)
          .then(function () {
            _this.notifySuccess();
            _this.getLocation();
          })
          .catch(() => {
            _this.notifyError();
          });
      },

      // 发送PUT请求更新位置
      putLocation() {
        const _this = this;
        axios({
          method: "put",
          url: _this.serverUrl + "/location/" + _this.locationEditing.waterId,
          params: {
            waterId: _this.locationEditing.waterId,
            name: _this.locationEditing.name,
            longitude: _this.locationEditing.longitude,
            latitude: _this.locationEditing.latitude,
          },
        })
          .then(() => {
            _this.notifySuccess();
            _this.getLocation();
            _this.isReadyToUpdateLocation = false;
          })
          .catch(() => {
            _this.notifyError();
          });
      },

      // 发送GET请求获取位置
      getLocation() {
        const _this = this;
        this.location = []; //清空旧的位置列表
        axios
          .get(this.serverUrl + "/location")
          .then((response) => {
            for (let i in response.data) {
              _this.location.push(response.data[i]);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      },

      // 显示添加记录编辑器
      showAddRecordEditor() {
        this.isReadyToAddRecord = true;
        this.isReadyToUpdateRecord = false;
        this.recordEditing.recordId = '';
        this.recordEditing.instantUsage = '';
        this.recordEditing.recordDate = '';
      },

      // 显示更新记录编辑器
      showUpdateRecordEditor(scopeIndex) {
        this.isReadyToUpdateRecord = true;
        this.isReadyToAddRecord = false;
        this.recordEditing.recordId = this.record[scopeIndex].recordId;
        this.recordEditing.instantUsage = this.record[scopeIndex].instantUsage;
        let dateTimeStamp = this.record[scopeIndex].recordDate;
        this.recordEditing.recordDate = moment(dateTimeStamp).format("YYYY-MM-DD HH:mm:ss");
      },

      // 提交添加或更新的记录
      submitRecord() {
        if (this.isReadyToAddRecord) this.postRecord();
        else if (this.isReadyToUpdateRecord) this.putRecord();
      },

      // 发送POST请求添加记录
      postRecord() {
        const _this = this;
        let formattedRecordDate = moment(this.recordEditing.recordDate).format("YYYY-MM-DD HH:mm:ss");
        axios({
          method: "post",
          url: _this.serverUrl + "/record",
          params: {
            waterId: _this.waterIdFocused,
            recordDate: formattedRecordDate,
            instantUsage: _this.recordEditing.instantUsage,
          },
        }).then(() => {
          _this.notifySuccess();
          _this.getRecord();
          _this.isReadyToAddRecord = false;
        }).catch(() => {
          _this.notifyError();
        });
      },

      // 发送DELETE请求删除记录
      deleteRecord(scopeIndex) {
        const _this = this;
        axios
          .delete(_this.serverUrl + "/record/" + _this.record[scopeIndex].recordId)
          .then(function () {
            _this.notifySuccess();
            _this.getRecord();
          })
          .catch(function () {
            _this.notifyError();
          });
      },

      // 发送PUT请求更新记录
      putRecord() {
        const _this = this;
        let formattedRecordDate = moment(this.recordEditing.recordDate).format("YYYY-MM-DD HH:mm:ss");
        axios({
          method: "put",
          url: _this.serverUrl + "/record/" + _this.recordEditing.recordId,
          params: {
            waterId: _this.waterIdFocused,
            recordId: _this.recordEditing.recordId,
            recordDate: formattedRecordDate,
            instantUsage: _this.recordEditing.instantUsage,
          },
        }).then(function () {
          _this.notifySuccess();
          _this.getRecord();
          _this.isReadyToUpdateRecord = false;
        }).catch(function () {
          _this.notifyError();
        });
      },

      // 发送GET请求获取记录
      getRecord() {
        this.record = []; //清空旧的记录列表
        axios
          .get(this.serverUrl + "/record/" + this.waterIdFocused)
          .then((response) => {
            for (let i in response.data) {
              this.record.push(response.data[i]);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      },

      // 格式化日期时间
      formatDateTime(row, column) {
        let dateTime = row[column.property];
        if (dateTime === undefined) return "";
        return moment(dateTime).format("YYYY-MM-DD HH:mm:ss");
      },

      // 加载地图和点标记，启用点击事件监听
      loadingAMap() {
        const _this = this;
        AMapLoader.load({
          key: _this.mapApiKey, // 开发者key
          version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
          plugins: [], // 插件列表
        }).then((AMap) => {
          _this.map = new AMap.Map("map-container", {
            zoom: 12, // 级别
            center: [114.33, 30.57], // 武汉中心点坐标
            viewMode: "3D", // 使用3D视图
          });
          _this.getLocation();
        }).catch((error) => {
          console.log(error);
        });
      },

      // 点击点标记
      markerClick(e) {
        const _this = this;
        let position = e.target.getPosition().toString();
        let clickedLongitude = position.split(",")[0]; // 点击的经度
        let clickedLatitude = position.split(",")[1]; // 点击的纬度

        // 遍历location列表判断是哪个水表
        for (let i in _this.location) {
          if (!_this.location.hasOwnProperty(i)) continue;
          if (parseFloat(clickedLongitude) === parseFloat(_this.location[i].longitude)
            && parseFloat(clickedLatitude) === parseFloat(_this.location[i].latitude)) {
            _this.waterIdFocused = _this.location[i].waterId;
            _this.isRecordDrawerVisible = true;
            break;
          }
        }
      },

      // 点击地图
      clickMap(e) {
        this.locationEditing.longitude = e.lnglat.getLng().toString(); // 点击的经度
        this.locationEditing.latitude = e.lnglat.getLat().toString(); // 点击的纬度
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
