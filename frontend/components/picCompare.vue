<link rel="stylesheet" href="../index.css">
<template>
  <div class="picCompare">
    <div class="img_view" :class="{img_view_active:img_selected[0]}"
         :style="{width: calcW,height: calcH,borderWidth:border}" @click="picSelect(0)">
      <img :src="imgBase64L">
      <p>{{ img_names[0] }}</p>
    </div>
    <div class="img_view" :class="{img_view_active:img_selected[1]}"
         :style="{width: calcW,height: calcH,borderWidth:border}" @click="picSelect(1)">
      <img :src="imgBase64R">
      <p>{{ img_names[1] }}</p>
    </div>
    <svg :id="id" :style="{width: w,height: calcH}"></svg>
  </div>
</template>

<script>
import axis from "axios";
import {getHistogram, getImgBase64} from "../js/dataRequest";
import {histogram} from "../js/histogram";

export default {
  name: "picCompare",
  // props: ["h", "w", "imgNames", "id"],
  props: {
    h: String,
    w: String,
    border: String,
    img_names: {},
    id: {},
    bin: {
      type: Number,
      default: 256,
    },
    type: {
      default: ["V", "G"]
    },
  },
  emits: ["update:selected_index"],
  data() {
    return {
      imgBase64L: "",
      imgBase64R: "",
      histogramL_V: "",
      histogramR_V: "",
      histogramL_G: "",
      histogramR_G: "",
      img_selected: [false, false],
      img_names_pre: ["noImg", "noImg"]
    }
  },
  computed: {
    calcH() {
      let h_temp = parseInt(parseInt(this.h) / 2)
      h_temp = h_temp + "" + "px"
      return h_temp
    },
    calcW() {
      let w_temp = parseInt(parseInt(this.w) / 2) - 2 * parseInt(this.border)
      w_temp = w_temp + "" + "px"
      return w_temp
    }
  },
  methods: {
    getTotalData() {

      var that = this
      let h_temp = parseInt(parseInt(this.h) / 2)
      let w_temp = parseInt(parseInt(this.w) / 2) - 2 * parseInt(this.border)
      let axis_data = {
        imgName: this.img_names[0],
        imgHeight: h_temp,
        imgWidth: w_temp
      }
      let correspond = {
        "res": "imgBase64L"
      }
      if (axis_data.imgName !== "noImg") {
        getImgBase64(axis_data, that, correspond)
      }

      axis_data.imgName = this.img_names[1]
      correspond.res = "imgBase64R"
      if (axis_data.imgName !== "noImg") {
        getImgBase64(axis_data, that, correspond)
      }


      let histogram_L_data = {
        "imgName": this.img_names[0],
        "bin": this.bin,
        "type": this.type[0]
      }
      if (histogram_L_data.imgName !== "noImg") {
        getHistogram(histogram_L_data, that, "histogramL_V")
      }

      let histogram_R_data = {
        "imgName": this.img_names[1],
        "bin": this.bin,
        "type": this.type[0]
      }
      if (histogram_R_data.imgName !== "noImg") {
        getHistogram(histogram_R_data, that, "histogramR_V")
      }

      let histogram_L_G_data = {
        "imgName": this.img_names[0],
        "bin": this.bin,
        "type": this.type[1]
      }
      if (histogram_L_G_data.imgName !== "noImg") {
        getHistogram(histogram_L_G_data, that, "histogramL_G")
      }
      let histogram_R_G_data = {
        "imgName": this.img_names[1],
        "bin": this.bin,
        "type": this.type[1]
      }
      if (histogram_R_G_data.imgName !== "noImg") {
        getHistogram(histogram_R_G_data, that, "histogramR_G")
      }
    },
    getLData() {
      var that = this;
      let h_temp = parseInt(parseInt(this.h) / 2)
      let w_temp = parseInt(parseInt(this.w) / 2) - -2 * parseInt(this.border)
      let axis_data = {
        imgName: this.img_names[0],
        imgHeight: h_temp,
        imgWidth: w_temp
      }
      let correspond = {
        "res": "imgBase64L"
      }
      if (axis_data.imgName !== "noImg") {
        getImgBase64(axis_data, that, correspond)
      }

      let histogram_L_data = {
        "imgName": this.img_names[0],
        "bin": this.bin,
        "type": this.type[0]
      }
      if (histogram_L_data.imgName !== "noImg") {
        getHistogram(histogram_L_data, that, "histogramL_V")
      }

      let histogram_L_G_data = {
        "imgName": this.img_names[0],
        "bin": this.bin,
        "type": this.type[1]
      }
      if (histogram_L_G_data.imgName !== "noImg") {
        getHistogram(histogram_L_G_data, that, "histogramL_G", true)
      }
    },
    getRData() {
      var that = this;
      let h_temp = parseInt(parseInt(this.h) / 2)
      let w_temp = parseInt(parseInt(this.w) / 2) - 2 * parseInt(this.border)
      let axis_data = {
        imgName: this.img_names[1],
        imgHeight: h_temp,
        imgWidth: w_temp
      }
      let correspond = {
        "res": "imgBase64R"
      }
      if (axis_data.imgName !== "noImg") {
        getImgBase64(axis_data, that, correspond)
      }

      let histogram_R_data = {
        "imgName": this.img_names[1],
        "bin": this.bin,
        "type": this.type[0]
      }
      if (histogram_R_data.imgName !== "noImg") {
        getHistogram(histogram_R_data, that, "histogramR_V")
      }

      let histogram_R_G_data = {
        "imgName": this.img_names[1],
        "bin": this.bin,
        "type": this.type[1]
      }
      if (histogram_R_G_data.imgName !== "noImg") {
        getHistogram(histogram_R_G_data, that, "histogramR_G", true)
      }
    },
    picSelect(index) {
      // console.log("picCompare click")
      var that = this
      let l = this.img_selected.length
      for (let i = 0; i < l; i++) {
        this.img_selected[i] = false
      }
      this.img_selected[index] = true

      this.$emit('update:selected_index', index)

    }
  },
  created() {

  },
  updated() {
    console.log("picCompare update")
    var that = this;
    // console.log("picCompare updated",this.histogramL)
    // let indexes = ["histogramL_V", "histogramR_V", "histogramL_G", "histogramR_G"]
    if (this.img_names_pre[0] !== this.img_names[0]) {
      this.getLData()
    }
    if (this.img_names_pre[1] !== this.img_names[1]) {
      this.getRData()
    }
    let indexes = []
    if (this.img_names_pre[0] !== "noImg") {
      indexes.push("histogramL_V", "histogramL_G")
    }
    if (this.img_names_pre[1] !== "noImg") {
      indexes.push("histogramR_V", "histogramR_G")
    }
    if (indexes.length !== 0) {
      histogram(indexes, that)
    }
    if (this.img_names_pre[0] !== this.img_names[0]) {
      this.img_names_pre[0] = this.img_names[0]
    }
    if (this.img_names_pre[1] !== this.img_names[1]) {
      this.img_names_pre[1] = this.img_names[1]
    }
  }
}
</script>

<style scoped>
.picCompare {
  display: flex;
  flex-wrap: wrap;
}

.img_view {
  border: 2px solid #76eedc;
}

.img_view_active {
  border: 2px solid #f69393;
}

p {
  margin: unset;
}
</style>