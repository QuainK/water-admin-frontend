<template>
  <main>
    <div class="title">
      <!--标题-->
      <h2>水表位置</h2>

      <!--新增按钮-->
      <el-button @click="showLocationEditor(-1)" size="mini" type="primary">新增</el-button>
    </div>

    <!--水表位置表格-->
    <el-table :data="$store.state.location" border id="table-location" stripe>
      <el-table-column label="序号" type="index" width="100"></el-table-column>
      <el-table-column label="名称" prop="name"></el-table-column>
      <el-table-column label="经度" prop="longitude" width="100"></el-table-column>
      <el-table-column label="纬度" prop="latitude" width="100"></el-table-column>
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <el-button @click="showLocationEditor(scope.$index)" size="mini" type="warning">修改
          </el-button>
          <el-button @click="deleteLocation(scope.$index)" size="mini" type="danger">删除</el-button>
          <el-button @click="jumpToRecord(scope.$index)" size="mini" type="primary">记录</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页组件-->
    <div class="block">
      <el-pagination
        :current-page="$store.state.locationPageIndex"
        :page-size="$store.state.locationPageSize"
        :page-sizes="[5, 10, 20]"
        :total="$store.state.locationTotalCount"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </div>

    <!--水表位置编辑对话框-->
    <el-dialog :visible.sync="isLocationEditorVisible" center title="水表位置">
      <!--水表位置表单-->
      <el-form :model="$store.state.locationEditing">
        <el-form-item label="水表名称">
          <el-input v-model="$store.state.locationEditing.name"></el-input>
        </el-form-item>
        <el-form-item label="位置经度">
          <el-input v-model="$store.state.locationEditing.longitude"></el-input>
        </el-form-item>
        <el-form-item label="位置纬度">
          <el-input v-model="$store.state.locationEditing.latitude"></el-input>
        </el-form-item>
      </el-form>
      <!--按钮组-->
      <div class="dialog-footer" slot="footer">
        <el-button @click="selectLocationOnMap" type="info">从地图中选取经纬度</el-button>
        <el-button @click="$store.state.locationEditing = {}" type="warning">清空</el-button>
        <el-button @click="isLocationEditorVisible = false" type="danger">取消</el-button>
        <el-button @click="submitLocation" type="primary">确定</el-button>
      </div>
    </el-dialog>
  </main>
</template>

<script>
  import axios from "axios";

  export default {
    name: 'TableLocation',
    data() {
      return {
        isLocationEditorVisible: false, // 是否显示位置编辑对话框
        isEditingNewLocation: true, // 是否在编辑新的水表位置
      }
    },
    created() {
      this.$store.commit("getAllLocationPageable");
    },
    methods: {
      // 显示位置编辑对话框。scopeIndex = -1，是新增；scopeIndex = 自然数，是列表序号对应的水表位置
      showLocationEditor(scopeIndex) {
        const _ss = this.$store.state;
        this.isLocationEditorVisible = true;
        if (scopeIndex !== -1) {
          this.isEditingNewLocation = false; // 修改已有水表，不是新增
          _ss.locationEditing.waterId = _ss.location[scopeIndex].waterId;
          _ss.locationEditing.name = _ss.location[scopeIndex].name;
          _ss.locationEditing.longitude = _ss.location[scopeIndex].longitude;
          _ss.locationEditing.latitude = _ss.location[scopeIndex].latitude;
        } else
          this.isEditingNewLocation = true; // 新增记录
      },

      // 添加位置
      addLocation() {
        const _this = this;
        const _ss = this.$store.state;
        axios({
          method: 'post',
          url: _ss.serverUrl + "/locations",
          params: {
            name: _ss.locationEditing.name,
            longitude: _ss.locationEditing.longitude,
            latitude: _ss.locationEditing.latitude,
          }
        }).then(() => {
          _this.$parent.notifySuccess();
          _this.$store.commit("getAllLocationPageable");
          _this.isLocationEditorVisible = false;
        }).catch(() => {
          _this.notifyError();
        });
      },

      // 更新位置
      updateLocation() {
        const _this = this;
        const _ss = this.$store.state;
        axios({
          method: 'put',
          url: _ss.serverUrl + "/locations/" + _ss.locationEditing.waterId,
          params: {
            name: _ss.locationEditing.name,
            longitude: _ss.locationEditing.longitude,
            latitude: _ss.locationEditing.latitude,
          }
        }).then(() => {
          _this.$parent.notifySuccess();
          _this.$store.commit("getAllLocationPageable");
          _this.isLocationEditorVisible = false;
        }).catch(() => {
          _this.notifyError();
        });
      },

      // 删除位置。scopeIndex = 自然数，是列表序号对应的水表位置
      deleteLocation(scopeIndex) {
        const _this = this;
        const _ss = this.$store.state;
        axios
          .delete(_ss.serverUrl + "/locations/" + _ss.location[scopeIndex].waterId)
          .then(() => {
            _this.$parent.notifySuccess();
            _this.$store.commit("getAllLocationPageable");
          }).catch(() => {
          _this.$parent.notifyError();
        });
      },

      // 提交添加或更新的位置
      submitLocation() {
        if (this.isEditingNewLocation) this.addLocation();
        else this.updateLocation();
        this.isLocationEditorVisible = false;
      },

      // 跳转至记录页面。scopeIndex = 自然数，是列表序号对应的水表
      jumpToRecord(scopeIndex) {
        const _ss = this.$store.state;
        _ss.locationEditing.waterId = _ss.location[scopeIndex].waterId;
        _ss.recordEditing.waterId = _ss.location[scopeIndex].waterId;
        _ss.locationEditing.name = _ss.location[scopeIndex].name;
        this.$store.commit("getAllRecordByWaterIdPageable");
        this.$parent.activeMenuIndex = '3';
        this.$router.push({path: '/TableRecord'});
      },

      // 跳转至地图并选取经纬度位置作为当前编辑的水表的经纬度位置
      selectLocationOnMap() {
        this.isLocationEditorVisible = false;
        this.$parent.activeMenuIndex = '1';
        this.$router.push({path: '/Map'});
      },

      // 改变分页大小
      handleSizeChange(val) {
        this.$store.state.locationPageSize = val;
        this.$store.commit("getAllLocationPageable");
      },

      // 切换分页页码
      handleCurrentChange(val) {
        this.$store.state.locationPageIndex = val;
        this.$store.commit("getAllLocationPageable");
      },
    },
  }
</script>
