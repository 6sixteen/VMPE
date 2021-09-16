<template>
  <div class="imgLayout" :style="{width: layoutW, height: layoutH}">
    <img-union :id="item[0]+'_'+item[1]"  :imgname="item[2]" :h="h" :w="w" :key="item[2]"
               v-for="(item,index) in imgInfo"
               @click="clickImgUnion"></img-union>
    <el-tag style="height:40px">Min</el-tag>
    <el-input v-model="minValue" placeholder="min value" style="width:150px; height:40px"></el-input>
    <el-tag style="height:40px">Max</el-tag>
    <el-input v-model="maxValue" placeholder="max value" style="width:150px; height:40px"></el-input>
<!--    <el-button  style="width:150px; height:40px" @click="getImgs">确定范围</el-button>-->
    <el-button  style="width:150px; height:40px" >确定范围</el-button>
    <el-button round @click="$emit('update:imgNames',this.imgSelected)">关系分析</el-button>
    <el-button round>图片合并</el-button>
  </div>
</template>

<script>
import axis from "axios";
import imgUnion from "./imgUnion.vue";
import {ref,reactive} from "vue";
export default {
  name: "imageLayout",
  components: {imgUnion},
  data() {
    return {
      h: "",
      w: "",
      imgInfo: "",
      minValue:"",
      maxValue:"",
      imgSelected:[],
    }
  },
  setup(){
    // let imgSelected = reactive([]);
    // const addImg = (e)=>{
    //   let selectedImg = e.target.getAttribute("img")
    //   let index = imgSelected.value.indexOf(selectedImg,0)
    //   if(index==-1){
    //     imgSelected.value.push(selectedImg)
    //   }
    //   console.log("imageLayout click div imgSelected",imgSelected)
    //   this.$forceUpdate()
    // }
    // return {
    //   imgSelected,addImg
    // }
  },
  props: ["layoutH", "layoutW","imgNames","testNum"],
  emits:["update:imgNames"],
  methods: {
    clickImgUnion(event) {
      let selectedImg = event.target.getAttribute("img")
      let index = this.imgSelected.indexOf(selectedImg,0)
      if(index==-1){
        this.imgSelected.push(selectedImg)
      }
      // console.log("imageLayout click div imgSelected",this.imgSelected)
    }
  },
  created() {
    let h_temp = parseInt(this.layoutH)
    let w_temp = parseInt(this.layoutW)
    console.log("cal h", h_temp)
    console.log("cal w", w_temp)
    var that = this
    let axisData = {
      "imgFile": 'D:\\codeTest\\parameterExp\\data\\case1\\img',
      "containerH": h_temp,
      "containerW": w_temp,
      "noImg": false
    }
    axis.defaults.baseURL = "http://localhost:4999"
    axis.post('/imgLayout', axisData, {
      headers: {"Content-Type": "application/json"}
    })
        .then(function (response) {
          console.log(response);
          that.imgInfo = response.data.locations
          that.h = response.data.h + "" + "px"
          that.w = response.data.w + "" + "px"
        })
        .catch(function (error) {
          console.log(error);
        });

  },
  updated(){
    console.log("imageLayout update imgNames",this.imgSelected)
  }
}
</script>

<style scoped>
.imgLayout {
  display: flex;
  flex-wrap: wrap;

}
</style>