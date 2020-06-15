import Vue from "vue"
import Vuex from 'vuex'
import axios from "axios";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    author: 'QuainK', // 作者
    appVersion: '0.3.0', // 版本号
    serverUrl: 'http://localhost:8082', // 后端服务器地址
    mapApiKey: "9cdc20978e6f1ea052bcc7510c3d3237", // 申请好的高德地图API的Web端开发者Key

    locationAll: [], // 所有水表位置，地图点标记专用
    /*
     * 水表位置
     * waterId 水表编号
     * name 水表名称
     * longitude 位置经度
     * latitude 位置纬度
     */
    location: [],
    locationPageIndex: 1, // 当前页码
    locationPageSize: 10, // 每页大小
    locationTotalCount: 0, // 项目总数
    /*
     * 水表记录
     * recordId 记录编号 int
     * waterId 水表编号 int
     * recordDate 记录时间（时间戳） long 毫秒级别
     * instantUsage 瞬时用量 double
     */
    record: [],
    recordPageIndex: 1, // 当前页码
    recordPageSize: 10, // 每页大小
    recordTotalCount: 0, // 项目总数

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
      state.locationAll = []; // 清空旧列表
      axios({
        method: 'get',
        url: state.serverUrl + "/locations/-1",
      }).then((response) => {
        for (let i in response.data) {
          state.locationAll.push(response.data[i]);
        }
      }).catch(() => {
      });
    },

    // 获取所有水表位置，分页
    getAllLocationPageable(state) {
      state.location = []; // 清空旧列表
      axios({
        method: 'get',
        url: state.serverUrl + "/locations",
        params: {
          pageIndex: state.locationPageIndex - 1,
          pageSize: state.locationPageSize,
        }
      }).then((response) => {
        state.locationTotalCount = response.data.totalElements; // 获取总数
        for (let i in response.data.content) {
          state.location.push(response.data.content[i]); // 遍历存入
        }
      }).catch(() => {
      });
    },

    // 查询当前水表的所有记录
    getAllRecordByWaterId(state) {
      state.record = []; // 清空旧列表
      axios({
        method: 'get',
        url: state.serverUrl + "/records/" + state.locationEditing.waterId + "/all",
      }).then((response) => {
        for (let i in response.data) {
          state.record.push(response.data[i]);
        }
      }).catch(() => {
      });
    },

    // 获取所有水表记录，分页
    getAllRecordByWaterIdPageable(state) {
      state.record = []; // 清空旧列表
      axios({
        method: 'get',
        url: state.serverUrl + "/records/" + state.locationEditing.waterId,
        params: {
          pageIndex: state.recordPageIndex - 1,
          pageSize: state.recordPageSize,
        }
      }).then((response) => {
        state.recordTotalCount = response.data.totalElements; // 获取总数
        for (let i in response.data.content) {
          state.record.push(response.data.content[i]); // 遍历存入
        }
      }).catch(() => {
      });
    },
  },
})
