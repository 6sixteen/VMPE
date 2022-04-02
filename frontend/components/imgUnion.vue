<template>
  <div :id="id" class="imgUnion" :class="{active:isActive}" :img="img_name" :style="{width: calcW,height: calcH}"
       @click="isActive=!isActive">
    <svg :id="'svg_'+id" :style="calcSvgInfo" :redraw="redraw"></svg>
    <img v-if="emptyDiv" :src="imgBase64" >
    <!--    {{filter_config}}-->
  </div>
</template>

<script>
import axis from "axios";
import {getImgParameterDistribution, getImgBase64} from "../js/dataRequest.js"
import {paraDistributionLine,paraDistributionLineV} from "../js/paraDistribution.js"

export default {
  name: "imgUnion",
  data() {
    return {
      imgBase64: "",
      isActive: false,
      parameterDis: "",
      testNum: 1,
      redraw_pre: "",
    }
  },
  props: ["img_name", "h", "w", "border", "id", "filter_config", "redraw", "direction", "bar_width"],
  computed: {
    emptyDiv() {
      return this.img_name !== "noImg";
    },
    calcH() {
      let h_temp = parseInt(this.h) - 2 * parseInt(this.border)
      h_temp = h_temp + "" + "px"
      return h_temp
    },
    calcW() {
      let w_temp = parseInt(this.w) - 2 * parseInt(this.border)
      w_temp = w_temp + "" + "px"
      return w_temp
    },
    calcSvgInfo() {
      if (this.direction == "vertical") {
        return {
          height: parseInt(this.h) - 2 * parseInt(this.border),
          width: this.bar_width
        }
      } else {
        return {
          height: this.bar_width,
          width: parseInt(this.w) - 2 * parseInt(this.border)
        }
      }
    }
  },
  methods: {
    chooseImg(e) {
      // debugger
      // console.log("click imgUnion",e)
    }
  },
  created() {

    var that = this
    let h_temp = 0
    let w_temp = 0
    if (this.direction == "vertical") {
      h_temp = parseInt(this.h) - 2 * parseInt(this.border)
      w_temp = parseInt(this.w) - 2 * parseInt(this.border) - parseInt(this.bar_width)

    } else {
      h_temp = parseInt(this.h) - 2 * parseInt(this.border) - parseInt(this.bar_width)
      w_temp = parseInt(this.w) - 2 * parseInt(this.border)
    }

    if (this.img_name !== "noImg") {
      let axis_data = {
        imgName: this.img_name,
        imgHeight: h_temp,
        imgWidth: w_temp
      }
      let correspond = {
        "res": "imgBase64"
      }
      getImgBase64(axis_data, that, correspond)

      axis_data = {
        "imgName": this.img_name,
        "filter_config": this.filter_config
      }
      correspond = "parameterDis"
      getImgParameterDistribution(axis_data, that, correspond, true)

    }


  },
  mounted() {
  },
  updated() {
    console.log("imgUnion updated")
    var that = this

    if (this.redraw_pre != this.redraw) {
      if (this.img_name != "noImg") {
        let axis_data = {
          "imgName": this.img_name,
          "filter_config": this.filter_config
        }
        let correspond = "parameterDis"
        try {
          getImgParameterDistribution(axis_data, that, correspond, true)
        } catch (err) {
          console.log("plh", this.filter_config)
        }
      }
    }
    if (this.direction == "vertical") {
      paraDistributionLineV(that)
    } else {
      paraDistributionLine(that)
    }
    this.redraw_pre = this.redraw
  }
}
</script>

<style scoped>
.imgUnion {
  background-color: white;
  border: 2px solid #997f7f;
}

.active {
  /*background-color: deepskyblue;*/
  border: 2px solid #f61919;
}
img {
pointer-events: none;
}
</style>