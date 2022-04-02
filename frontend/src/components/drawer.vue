<template>
  <el-drawer
    v-model="drawer"
    title="I am the title"
    size="40%"
    :with-header="false"
  >
    <el-scrollbar :height="windowHeight">
      <el-card class="form-card">
        <el-form
          ref="formRef"
          label-position="left"
          label-width="100px"
          class="drawer-form"
          size="small"
          :model="view1Info.filter_config"
          :inline="true"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="maxValue">
                <el-input v-model="view1Info.filter_config.maxValue" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="minValue">
                <el-input v-model="view1Info.filter_config.minValue" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="threshold">
                <el-input v-model="view1Info.filter_config.threshold" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="groupNumber">
                <el-input v-model="view1Info.filter_config.group_number" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="12">
              <el-form-item label="clusterNumber">
                <el-input v-model="clusterNumber" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="combineType">
                <el-select
                  v-model="combineType2"
                  placeholder="Select"
                  size="small"
                  @change="changeCombineType"
                >
                  <el-option
                    v-for="item in combineTypeList"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row style="justify-content: center">
            <el-form-item label-width="0px">
              <el-button type="primary" @click="changeShowZero"
                >{{this.showZero?"hide ZeroCluster":"show ZeroCluster"}}</el-button
              >
              <el-button type="primary" @click="changeFilter"
                >change filter</el-button
              >
            </el-form-item>
          </el-row>
        </el-form>
        <el-divider />
        <el-collapse class="drawer-collapse" v-model="activeNames">
          <el-collapse-item
            v-for="(item, i) in cluster_force_data.nodes"
            :key="i"
            :name="i"
          >
            <template #title>
              <font
                :style="[
                  item.cluster_matrix.length ? 'color: green' : 'color: black',
                ]"
                >Cluster</font
              >&nbsp;&nbsp;<svg
                :id="['collapse-svg-' + i]"
                class="collapse-svg"
              ></svg>
            </template>
            <div v-if="item.cluster_matrix.length > 0">
              <el-scrollbar height="150px">
                <el-table :data="tableData[i]" style="width: 100%" size="small">
                  <el-table-column
                    prop="thresholdMin"
                    label="thresholdMin"
                    width="110"
                  />
                  <el-table-column
                    prop="thresholdMax"
                    label="thresholdMax"
                    width="110"
                  />
                  <el-table-column
                    prop="openingCircle"
                    label="openingCircle"
                    width="110"
                  />
                  <el-table-column
                    prop="selectShapeMatrix"
                    label="selectShapeMatrix"
                  />
                </el-table>
              </el-scrollbar>
            </div>
            <div v-else>没有满足要求的参数集合！</div>
          </el-collapse-item>
        </el-collapse>
      </el-card>
    </el-scrollbar>
  </el-drawer>
</template>

<script>
import { ref } from "vue";
import * as d3 from "d3";

export default {
  name: "drawer",
  data() {
    return {
      drawer: ref(false),
      activeNames: ref([]),
      combineType2: 0
    };
  },
  props: {
    view1Info: Object,
    cluster_force_data: Object,
    combineType: Number,
    combineTypeList: Array,
    changeShowZero: Function,
    showZero: Number
  },
  computed: {
    windowHeight() {
      return window.innerHeight - 40;
    },
    tableData() {
      let res = [];
      this.cluster_force_data["nodes"].forEach((item) => {
        let temp = [];
        item["cluster_matrix"].forEach((it) => {
          let obj = {};
          obj["thresholdMin"] = it[0];
          obj["thresholdMax"] = it[1];
          obj["openingCircle"] = it[2];
          obj["selectShapeMatrix"] = it[3];
          temp.push(obj);
        });
        res.push(temp);
      });
      return res;
    },
    clusterNumber() {
      return this.cluster_force_data.nodes.length;
    },
    // collapseCluster() {
    //   // 这样写好像不太科学，换种方式
    //   this.cluster_force_data.nodes.splice(-1, 1)
    //   return this.cluster_force_data.nodes;
    // }
  },
  emits: [],
  methods: {
    openDrawer() {
      let that = this;
      document.onkeydown = function (e) {
        if (e.code === "KeyX") {
          that.drawer = true;
        }
      };
    },
    draw() {
      for (let i = 0; i < this.cluster_force_data.nodes.length; i++) {
        let svg = d3.select("#collapse-svg-" + i);
        let x = 10;
        let y = 0;
        let r = 10;
        switch (i) {
          case 0:
            svg
              .append("polygon")
              .attr("points", [
                x,
                y,
                x - 0.5 * Math.sqrt(3) * r,
                y + 1.5 * r,
                x + 0.5 * Math.sqrt(3) * r,
                y + 1.5 * r,
              ])
              .attr("fill", "black");
            break;
          case 1:
            r *= 1.3;
            svg
              .append("polygon")
              .attr("points", [
                x,
                y,
                x - (0.5 * Math.sqrt(3) * r) / 2,
                y + (1.5 * r) / 2,
                x,
                y + (3 * r) / 2,
                x + (0.5 * Math.sqrt(3) * r) / 2,
                y + (1.5 * r) / 2,
              ])
              .attr("fill", "black");
            break;
          case 2:
            svg
              .append("polygon")
              .attr("points", [
                x,
                y,
                x - 1 * r * Math.cos((Math.PI * 36) / 180),
                y + 1 * r * Math.sin((Math.PI * 36) / 180),
                x - 0.5 * r,
                y + ((1 * Math.sqrt(5 + 2 * Math.sqrt(5))) / 2) * r,
                x + 0.5 * r,
                y + ((1 * Math.sqrt(5 + 2 * Math.sqrt(5))) / 2) * r,
                x + 1 * r * Math.cos((Math.PI * 36) / 180),
                y + 1 * r * Math.sin((Math.PI * 36) / 180),
              ])
              .attr("fill", "black");
            break;
          case 3:
            svg
              .append("polygon")
              .attr("points", [
                x,
                y,
                x - ((1 * Math.sqrt(3)) / 2) * r,
                y + 0.5 * r,
                x - ((1 * Math.sqrt(3)) / 2) * r,
                y + 1.5 * r,
                x,
                y + 2 * r,
                x + ((1 * Math.sqrt(3)) / 2) * r,
                y + 1.5 * r,
                x + ((1 * Math.sqrt(3)) / 2) * r,
                y + 0.5 * r,
              ])
              .attr("fill", "black");
            break;
          default:
            svg
              .append("polygon")
              .attr("points", [
                x,
                y,
                x - 0.5 * Math.sqrt(3) * r,
                y + 1.5 * r,
                x + 0.5 * Math.sqrt(3) * r,
                y + 1.5 * r,
              ])
              .attr("fill", "black");
        }
      }
    },
    changeCombineType(val) {
      this.$emit("changeCombineType", val)
    }
  },
  mounted() {
    this.openDrawer();
    this.combineType2 = this.combineType
  },
  updated() {
    this.draw();
  },
};
</script>

<style scoped>
.collapse-svg {
  width: 20px;
  height: 20px;
}
</style>