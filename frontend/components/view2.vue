<template>
  <div class="view2-main">
    <svg :id="id" class="view2-svg"></svg>
    <svg :id="id_1" class="view2-svg-1"></svg>
  </div>
</template>

<script>
import { riverSet3 } from "../js/riverSet.js";
import { getView1Simple, postRequest } from "../js/dataRequest";
import axis from "axios";
import { forceLayout } from "../js/forceLayout";

export default {
  name: "view2",
  props: {
    id: String,
    id_1: String,
    img_indices: {},
    method: String,
    filter_config: {},
    request_number: Number,
    graph: {},
    combine_type: Number
  },
  data() {
    return {
      request_number_temp: -1
    };
  },
  emits: ["brush_img"],
  methods: {},
  created() {
  },
  updated() {
    console.log("view2 updated")
    if (this.request_number !== this.request_number_temp) {
      axis.defaults.baseURL = "http://localhost:4999"
      let that = this
      let axis_data = {
        "img_indices": that.img_indices,
        "filter_config": that.filter_config,
        "method": that.method,
        "combine_type": that.combine_type
      }

      //key(response) value(data)
      let correspond = {
        "flag": "flag",
        "combine": "combine",
        "combine_detail": "combine_detail",
        "parameter_static_matrices": "parameter_static_matrices",
        "pixel_river": "pixel_river",
        "parameter_info": "parameter_info",
        "heatmap": "heatmap",
        "parameter_matrix_num": "parameter_matrix_num",
        "pixel_img": "pixel_img",
        "info_after_combine": "info_after_combine",
        "parameter_statistical_matrix": "parameter_statistical_matrix",
        "canTwoCluster": "canTwoCluster",
        "newCluster": "newCluster",
        "combine_1": "combine_1",
        "info_after_combine_1": "info_after_combine_1",
        "pixel_img_1":"pixel_img_1",
        "parameter_statistical_matrix_1":"parameter_statistical_matrix_1"

      }
      let url = "/getView2"
      let addinfo = {"request_number_temp": this.request_number}
      postRequest(url, axis_data, this, correspond, true, addinfo)
    }
    if (this.request_number === this.request_number_temp) {
      console.log("riverSet this.request_number ", this.request_number, this.request_number_temp)
      // riverSet(this)
      // riverSet2(this)
      riverSet3(this)
      // this.request_view2 = false
    }
    // 绘制view1
  },
};
</script>

<style scoped>
.view2-main {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
}
.view2-svg {
  width: 98%;
  height: 47%;
  margin-top: 1%;
}

.view2-svg-1 {
  width: 98%;
  height: 47%;
  margin-top: 1%;
}
</style>