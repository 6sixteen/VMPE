<template>
  <div>
    <svg :id="id" :style="{width: h,height: w}"></svg>
  </div>
</template>

<script>
import {forceLayoutCluster} from "../js/forceLayout";
import {postRequest} from "../js/dataRequest"
import axis from "axios";

export default {
  name: "view1",
  data() {
    return {
      flag: "",
      graph_force_data: "",
      img_feature:""
    }
  },
  props: {
    id: String,
    w: String,
    h: String,
    img_names: {},
    filter_config: {},
    cluster_method: String,
    edge: String //边权重的选择方式
    , process_method: String // 边的省略方式
    , p: Number // 边的省略方式 参数
    , n_cluster: Number
    , matrix_name: String
  },
  emits: [],
  methods: {},
  created() {
    // 请求绘制view1的数据
    console.log("view1.vue created")

    axis.defaults.baseURL = "http://localhost:4999"
    let that = this
    let axis_data = {
      "img_names": that.img_names,
      "filter_config": that.filter_config,
      "method": that.cluster_method,
      "edge": that.edge,
      "process_method": that.process_method,
      "p": that.p,
      "n_cluster": that.n_cluster,
      "matrix_name": that.matrix_name
    }

    //key(response) value(data)
    let correspond = {
      "flag": "flag",
      "cluster_element_force_data": "cluster_element_force_data",
      "cluster_force_data": "cluster_force_data",
      "cluster_res": "cluster_res",
      "img_feature": "img_feature"
    }
    let url = "/getView1"
    postRequest(url, axis_data, that, correspond, true)

  },
  updated() {
    console.log("view1 updated")
    forceLayoutCluster(this)

    // 绘制view1
  }
}
</script>

<style scoped>

</style>