<template>
  <main>
    <div class="title">
      <!--水表名称标题-->
      <h2>水表记录 - {{$store.state.locationEditing.name}}</h2>

      <!--新增按钮-->
      <el-button @click="showRecordEditor(-1)" size="mini" type="primary">新增</el-button>
    </div>

    <!--水表记录表格-->
    <el-table :data="$store.state.record" border id="table-record" stripe>
      <el-table-column label="序号" type="index" width="100"></el-table-column>
      <el-table-column :formatter="formatTimestampToDateTime" label="日期时间"
                       prop="recordDate" width="200"></el-table-column>
      <el-table-column label="瞬时用量" prop="instantUsage"></el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button @click="showRecordEditor(scope.$index)" size="mini" type="warning">修改
          </el-button>
          <el-button @click="deleteRecord(scope.$index)" size="mini" type="danger">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!--分页组件-->
    <div class="block" id="table-pagination">
      <el-pagination
        :current-page="$store.state.recordPageIndex"
        :page-size="$store.state.recordPageSize"
        :page-sizes="[5, 10, 20]"
        :total="$store.state.recordTotalCount"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        layout="total, sizes, prev, pager, next, jumper">
      </el-pagination>
    </div>

    <!--水表记录编辑对话框-->
    <el-dialog :visible.sync="isRecordEditorVisible" center title="水表记录">
      <el-form label-position="left" label-width="100px">
        <el-form-item label="日期时间">
          <div class="block">
            <el-date-picker
              placeholder="选择日期时间"
              type="datetime"
              v-model="$store.state.recordEditing.recordDate">
            </el-date-picker>
          </div>
        </el-form-item>
        <el-form-item label="当前用量">
          <el-input v-model="$store.state.recordEditing.instantUsage"></el-input>
        </el-form-item>
      </el-form>
      <div class="dialog-footer" slot="footer">
        <el-button @click="isRecordEditorVisible = false">取消</el-button>
        <el-button @click="submitRecord" type="primary">确定</el-button>
      </div>
    </el-dialog>
  </main>
</template>

<script>
  import axios from "axios";
  import moment from "moment";

  export default {
    name: 'TableRecord',
    data() {
      return {
        isRecordEditorVisible: false, // 是否显示记录编辑对话框
        isEditingNewRecord: true, // 是否在编辑新的水表记录
      }
    },
    methods: {
      // 显示记录编辑对话框。scopeIndex = -1，是新增；scopeIndex = 自然数，是列表序号对应的记录
      showRecordEditor(scopeIndex) {
        const _ss = this.$store.state;
        this.isRecordEditorVisible = true;
        if (scopeIndex !== -1) {
          this.isEditingNewRecord = false;
          _ss.recordEditing.recordId = _ss.record[scopeIndex].recordId;
          _ss.recordEditing.waterId = _ss.record[scopeIndex].waterId;
          _ss.recordEditing.recordDate = _ss.record[scopeIndex].recordDate;
          _ss.recordEditing.instantUsage = _ss.record[scopeIndex].instantUsage;
        } else
          this.isEditingNewRecord = true;
      },

      // 添加记录
      addRecord() {
        const _this = this;
        const _ss = this.$store.state;
        axios({
          method: 'post',
          url: _ss.serverUrl + "/records",
          params: {
            waterId: _ss.recordEditing.waterId,
            recordDate: _ss.recordEditing.recordDate,
            instantUsage: _ss.recordEditing.instantUsage,
          }
        }).then(() => {
          _this.$parent.notifySuccess();
          _this.$store.commit("getAllRecordByWaterIdPageable");
          _this.isRecordEditorVisible = false;
        }).catch(() => {
          _this.$parent.notifyError();
        });
      },

      // 更新记录
      updateRecord() {
        const _this = this;
        const _ss = this.$store.state;
        axios({
          method: 'put',
          url: _ss.serverUrl + "/records/" + _ss.recordEditing.recordId,
          params: {
            recordId: _ss.recordEditing.recordId,
            waterId: _ss.recordEditing.waterId,
            recordDate: _ss.recordEditing.recordDate,
            instantUsage: _ss.recordEditing.instantUsage,
          }
        }).then(() => {
          _this.$parent.notifySuccess();
          _this.$store.commit("getAllRecordByWaterIdPageable");
          _this.isRecordEditorVisible = false;
        }).catch(() => {
          _this.$parent.notifyError();
        });
      },

      // 删除记录。scopeIndex = 自然数，是列表序号对应的水表记录
      deleteRecord(scopeIndex) {
        const _this = this;
        const _ss = this.$store.state;
        axios
          .delete(_ss.serverUrl + "/records/" + _ss.record[scopeIndex].recordId)
          .then(() => {
            _this.$parent.notifySuccess();
            _this.$store.commit("getAllRecordByWaterIdPageable");
          }).catch(() => {
          _this.$parent.notifyError();
        });
      },

      // 提交添加或更新的记录
      submitRecord() {
        const _ss = this.$store.state;
        _ss.recordEditing.recordDate = moment(_ss.recordEditing.recordDate).valueOf();
        if (this.isEditingNewRecord) this.addRecord();
        else this.updateRecord();
        this.isRecordEditorVisible = false;
      },

      // 时间戳转日期格式
      formatTimestampToDateTime(row, column) {
        let date = row[column.property];
        return moment(date).format("YYYY-MM-DD HH:mm:ss");
      },

      // 改变分页大小
      handleSizeChange(val) {
        this.$store.state.recordPageSize = val;
        this.$store.commit("getAllRecordByWaterIdPageable");
      },

      // 切换分页页码
      handleCurrentChange(val) {
        this.$store.state.recordPageIndex = val;
        this.$store.commit("getAllRecordByWaterIdPageable");
      },
    },
  }
</script>
