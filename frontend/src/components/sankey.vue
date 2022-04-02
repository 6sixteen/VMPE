<template>
  <div>
    <!--  <svg :id="svgId" :style="{width: svgH,height: svgW}"></svg>-->
    <ul>
      <li @click="drawSankey('A-B')">A-B(G)</li>
      <li @click="drawSankey('A∩B')">A∩B</li>
      <li @click="drawSankey('B-A')">B-A(Q)</li>
    </ul>
    <svg :id="id" :style="{width: h,height: w}"></svg>
  </div>
</template>

<script>
import sankeyData1 from "../assets/snakeyData.json"
import {sankey} from "../js/sankey.js"
import axis from "axios";
import combinationRing from "../js/combination2";

export default {
  name: "sankey",
  data() {
    return {
      draw: 1,
      sankeyDataI: "",
      sankeyDataQ: "",
      sankeyDataG: ""
    }
  },
  props: ["id", "h", "w"],
  methods:{
    drawSankey(tag){
      if(tag==="A-B"){
        sankey(this.sankeyDataG,this)//
      }
      else if(tag==="A∩B"){
        sankey(this.sankeyDataI,this)
      }
      else if(tag==="B-A"){
        sankey(this.sankeyDataQ,this)
      }
      else{
        console.log("sankey error")
      }
    }
  },
  created() {
    console.log("sankey.vue created")
    // sankey(sankeyData, this)
    axis.defaults.baseURL = "http://localhost:4999"
    let that = this
    let axis_data = {
      "imgQuery": [
         "Image_20210812150340363.bmp",
      ],
      "imgGalley": [
        "Image_20210812150343338.bmp",
      ],
      "filterConfig": {
        "minValue": 18000,
        "maxValue": 25000
      }
    }
    axis.post('/getParameterComparison', axis_data
        , {
          headers: {"Content-Type": "application/json"}
        })
        .then(function (response) {
          that.sankeyDataI = response.data.I
          that.sankeyDataQ = response.data.Q
          that.sankeyDataG = response.data.G
          that.$forceUpdate()
        })
        .catch(function (error) {
          console.log(error);
        });
  },
  updated() {
    console.log("sankey.vue updated")
    sankey(this.sankeyDataI, this)
  }
}
</script>

<style scoped>

</style>