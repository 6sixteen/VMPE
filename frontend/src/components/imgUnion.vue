<template>
  <div :id="id" class="imgUnion" :class="{active:isActive}" :img="imgname" :style="{width: calcW,height: calcH}" @click="isActive=!isActive">
    <img v-if="emptyDiv" :src="imgBase64">
  </div>
</template>

<script>
import axis from "axios";

export default {
  name: "imgUnion",
  data() {
    return {
      imgBase64: "",
      border: 5,
      isActive:false,
    }
  },
  props: ["imgname", "h", "w", "id"],
  computed: {
    emptyDiv() {
      return this.imgname !== "noImg";
    },
    calcH() {
      console.log("imgUnion h",this.h)
      let h_temp = parseInt(this.h) - 2 * this.border
      h_temp = h_temp + "" + "px"
      return h_temp
    },
    calcW() {
      let w_temp = parseInt(this.w) - 2 * this.border
      w_temp = w_temp + "" + "px"
      return w_temp
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
    let h_temp = parseInt(this.h) - 2 * this.border
    let w_temp = parseInt(this.w) - 2 * this.border


    // if (this.imgname !== "noImg") {
    //   axis.defaults.baseURL = "http://localhost:4999"
    //   axis.post('/imgBase64', {			//官方格式
    //     imgName: that.imgname,
    //     imgHeight: h_temp,
    //     imgWidth: w_temp
    //   }, {
    //     headers: {"Content-Type": "application/json"},
    //   })
    //       .then(function (response) {
    //         // console.log(response.data.res)
    //         that.imgBase64 = "data:image/bmp;base64," + response.data.res
    //       })
    //       .catch(function (error) {
    //         console.log(error);
    //       });
    //
    // }

  }
}
</script>

<style scoped>
.imgUnion {
  background-color: white;
  border: 5px solid #997f7f;
}
.active {
  background-color: deepskyblue;
  border: 5px solid #f61919;
}
</style>