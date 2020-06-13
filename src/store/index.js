import Vue from "vue"
import Vuex from 'vuex'
import axios from "axios";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    author: 'QuainK', // 作者
    appVersion: '0.2.0', // 版本号
    serverUrl: 'http://localhost:8082', // 后端服务器地址
    mapApiKey: "9cdc20978e6f1ea052bcc7510c3d3237", // 申请好的高德地图API的Web端开发者Key，首次调用load时必填

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

    // 当前正在编辑的水表位置
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
  },
  mutations: {
    // 获取所有水表位置
    getAllLocation(state) {
      state.location = []; // 清空旧列表
      axios
        .get(state.serverUrl + "/location")
        .then((response) => {
          for (let i in response.data) {
            state.location.push(response.data[i]);
          }
        }).catch(() => {
      });
    },

    // 查询当前水表的所有记录
    getAllRecordByWaterId(state) {
      state.record = []; // 清空旧列表
      axios
        .get(state.serverUrl + "/record/" + state.locationEditing.waterId)
        .then((response) => {
          for (let i in response.data) {
            state.record.push(response.data[i]);
          }
        }).catch(() => {
      });
    },
  },
})
