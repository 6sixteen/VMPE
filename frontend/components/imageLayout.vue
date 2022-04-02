<template>
  <div class="imgLayout" :style="{width: layout_info.w, height: layout_info.h}">
    <img-union :id="item[0]+'_'+item[1]" :img_name="item[2]" :h="h" :w="w" :border="layout_info.img_border" :direction="direction" :bar_width="bar_width" :key="item[2]" :filter_config="filter_config" :redraw="redraw" :pic_selected="pic_compare_selected"  @update:update:pic_selected="pic_compare_selected=$event"
               v-for="(item,index) in imgInfo"
               @click="clickImgUnion"></img-union>
    <el-tag :style="{height:layout_info.button_h}">Min</el-tag>
    <el-input v-model="filter_config.minValue" placeholder="min value" size="mini" :style="{width:layout_info.button_w}"></el-input>
    <el-tag :style="{height:layout_info.button_h}">Max</el-tag>
    <el-input v-model="filter_config.maxValue" size="mini" :style="{width:layout_info.button_w}" placeholder="max value" ></el-input>
<!--    :style="{width:'150px',height:'25px',line_height:'25px'}"-->
    <el-button  size="mini" :style="{width:layout_info.button_w,height:layout_info.button_h}" @click="changeFilter">确定范围</el-button>
    <el-button size="mini" round :style="{width:layout_info.button_w,height:layout_info.button_h}" @click="$emit('update:imgNames',this.imgSelected)">关系分析</el-button>
    <el-button size="mini" round :style="{width:layout_info.button_w,height:layout_info.button_h}">图片合并</el-button>
  </div>
</template>

<script>
import axis from "axios";
import imgUnion from "./imgUnion.vue";
import {ref, reactive} from "vue";
import {getImgLayout} from "../js/dataRequest.js"

export default {
  name: "imageLayout",
  components: {imgUnion},
  data() {
    return {
      h: "",
      w: "",
      imgInfo: "",
      imgSelected: [],
      redraw:false,
      direction:"vertical",
      bar_width:"20px",
      pic_compare_img:["noImg","noImg"],
    }
  },
  setup() {
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
  props: ["layout_info", "imgNames", "testNum", "case_file", "filter_config","pic_compare_selected"],
  emits: ["update:imgNames", "update:filter_config", "update:pic_compare_img","update:testNum"],
  methods: {
    clickImgUnion(event) {
      let selectedImg = event.target.getAttribute("img")

      let index = this.imgSelected.indexOf(selectedImg, 0)
      if (index == -1) {
        this.imgSelected.push(selectedImg)
      }
      console.log("imageLayout",selectedImg)
      // debugger
      this.pic_compare_img[this.pic_compare_selected] = selectedImg
      console.log("imageLayout",this.pic_compare_img)
      this.$emit('update:pic_compare_img',this.pic_compare_img)


    },
    changeFilter() {
      this.redraw = !this.redraw
      this.$emit('update:filter_config', this.filter_config)
    }
  },
  created() {
    console.log("imageLayout created")
    let h_total = parseInt(this.layout_info.h) - parseInt(this.layout_info.button_h)
    let w_total = parseInt(this.layout_info.w)
    var that = this
    let axisData = {
      "img_file": this.case_file,
      "container_h": h_total,
      "container_w": w_total,
      "no_img": false,
      "re_cal":false
    }
    let correspond = {
      "locations": "imgInfo",
      "h": "h",
      "w": "w"
    }
    getImgLayout(axisData,that,correspond)

  },
  updated() {
    console.log("imageLayout update imgNames", this.filter_config)
  }
}
</script>

<style scoped>
.imgLayout {
  display: flex;
  flex-wrap: wrap;

}
</style>