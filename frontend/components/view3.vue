<template>
  <div class="view3-main">
    <svg :id="id" class="view3-svg"></svg>
  </div>
</template>

<script>
import {postRequest} from "../js/dataRequest"
import axis from "axios";
import {parameterMatricesCluster} from "../js/parameterMatrices"

export default {
  name: "view3",
  props: {
    id: String,
    img_indices: {},
    method: String,
    filter_config: {},
    p_value: Number,
    request_number: Number,
    parameter_order: String,
    order: []
  },
  data() {
    return {
      request_number_temp: -1,
      h: '300px',
      w: '300px'
    }
  },
  emits: [],
  methods: {},
  created() {
    // 请求绘制view1的数据
    console.log("view3.vue created")
    axis.defaults.baseURL = "http://localhost:4999"
    let that = this
    let axis_data = {
      "img_indices": that.img_indices,
      "filter_config": that.filter_config,
      "method": that.method,
      "p_value": that.p_value,
      "parameter_order": that.parameter_order,
      "order": that.order
    }

    //key(response) value(data)
    let correspond = {
      "flag": "flag",
      "parameterStep": "parameterStep",
      "parameterSets": "parameterSets",
      "view3dataOrigin": "view3dataOrigin",
      "view3dataCluster": "view3dataCluster",
      "parameterInfo": "parameterInfo",
      "operationInfo": "operationInfo"
    }
    // parameterSets 最原始的matrix

    let url = "/getView3"
    // postRequest(url, axis_data, this, correspond, true)
  },
  updated() {
    if (this.request_number !== this.request_number_temp) {
      axis.defaults.baseURL = "http://localhost:4999"
      let that = this
      let axis_data = {
        "img_indices": that.img_indices,
        "filter_config": that.filter_config,
        "method": that.method,
        "p_value": that.p_value,
        "parameter_order": that.parameter_order,
        "order": that.order
      }


      //key(response) value(data)
      let correspond = {
        "flag": "flag",
        "parameterStep": "parameterStep",
        "parameterSets": "parameterSets",
        "view3dataOrigin": "view3dataOrigin",
        "view3dataCluster": "view3dataCluster",
        "parameterInfo": "parameterInfo",
        "operationInfo": "operationInfo"
      }
      // parameterSets 最原始的matrix

      let url = "/getView3"
      let addinfo = {"request_number_temp": this.request_number}
      postRequest(url, axis_data, this, correspond, true, addinfo)
      console.log("view3 update request")
    }
    if (this.request_number === this.request_number_temp) {
      // parameterMatricesOrigin(this)
      console.log("view3 update draw")
      this.w = document.querySelector('.view3-svg').clientWidth;
      this.h = document.querySelector('.view3-svg').clientHeight;
      parameterMatricesCluster(this)
    }
  }

}
</script>

<style scoped>
.view3-main {
  display: flex;
  width: 100%;
  height: 96%;
  margin-top: 3.5%;
}
.view3-svg {
  width: 100%;
  height: 100%;
}
</style>