<template>
  <div>
    <svg :id=id :style="{width: w,height: h}"></svg>
  </div>
</template>

<script>
import {calGreedyMatrix} from "../js/dataRequest";
import {drawGreedyMatrix} from "../js/greedyMatrix";

export default {
  name: "greedyMatrix",
   data() {
     return {
       greedy_matrix_data:""
     }
   },
  props: {
    h: String,
    w: String,
    id: {},
    img_names:{},
    filter_config:{},
    res:{}
  },
  created() {
    let axis_data = {
      imgNames: this.img_names,
      filterConfig:this.filter_config,
      res:this.res,
      h:parseInt(this.h),
      w:parseInt(this.w)
    }
    let correspond = {
      "res": "greedy_matrix_data"
    }

    calGreedyMatrix(axis_data, this, correspond,true)
  },
  updated() {

    drawGreedyMatrix(this.greedy_matrix_data,this)

  }
}
</script>

<style scoped>

</style>