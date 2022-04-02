<template>
  <div class="view1b">
    <svg :id="id" class="view1b_svg"></svg>
    <svg :id="[id + '_1']" class="view1b_1_svg"></svg>
  </div>
</template>

<script>
import {forceLayoutCluster, resultView} from "../js/forceLayout2";
import {postRequest} from "../js/dataRequest"
import axis from "axios";

export default {
  name: "view1",
  data() {
    return {
      flag: "",
      graph_force_data: "",
      img_feature:"",
      w: '400px',
      h: '300px',
    }
  },
  props: {
    id: String,
    img_names: Array,
    img_address: Array,
    filter_config: {},
    cluster_method: String,
    edge: String, //边权重的选择方式
    process_method: String,  // 边的省略方式
    p: Number,  // 边的省略方式 参数
    n_clusters: Number, 
    matrix_name: String,
    showZero: Boolean
  },
  emits: [],
  methods: {},
  computed: {
  },
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
      "n_clusters": that.n_clusters,
      "matrix_name": that.matrix_name
    }

    //key(response) value(data)
    let correspond = {
      "flag": "flag",
      "cluster_element_force_data": "cluster_element_force_data",
      "cluster_force_data": "cluster_force_data",
      "cluster_res": "cluster_res",
      "group_data": "group_data",
      "no_parameter_image": "no_parameter_image",
      "img_feature": "img_feature"
    }
    let url = "/getView11"
    postRequest(url, axis_data, that, correspond, true)

  },
  updated() {
    console.log("view1 updated")
    this.w = document.querySelector('.main-view2').clientWidth;
    this.h = document.querySelector('.main-view2').clientHeight;
    forceLayoutCluster(this)
    resultView(this)
    this.$emit("getClusterForceData", this.cluster_force_data)
  }
}
</script>

<style scoped>
.view1b {
    overflow: hidden;
    display: inline-block;
}
.view1b_svg {
    width: 100%;
    height: 84%;
    padding: 0;
    margin: 0;
}
.view1b_1_svg {
    width: 100%;
    height: 13%;
    padding: 0;
    margin-bottom: 3%;
}
</style>