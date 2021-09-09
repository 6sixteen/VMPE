<template>
  <div>
    <svg :id="svgId" :style="{width: svgH,height: svgW}"></svg>
    <!--    <p @click="$emit('update:userSearchTree', 'userSearchTreeChange')">{{ userSearchTree }}</p>-->

    <!--    <svg id="test" style="width:1000px; height:1000px">-->
    <!--      &lt;!&ndash;      测试$emit功能&ndash;&gt;-->
    <!--      &lt;!&ndash;      <circle cx="100" cy="50" r="40" stroke="black"&ndash;&gt;-->
    <!--      &lt;!&ndash;              stroke-width="2" fill="red" @click="$emit('update:userSearchTree', 'userSearchTreeChange')" />&ndash;&gt;-->
    <!--      &lt;!&ndash;      如何在emit中传变量&ndash;&gt;-->
    <!--      <circle cx="100" cy="50" r="40" stroke="black"-->
    <!--              stroke-width="2" fill="red" @click="$emit('update:userSearchTree', userSearchTreeChange)"/>-->
    <!--    </svg>-->

    <!--    <p if-show="show">{{ userSearchTree }}</p>-->
    <!--    {{ drawCombination() }}-->
    <!--    <p>{{imgNames}}</p>-->
    <slot></slot>
  </div>
</template>

<script>
import combinationData from "../assets/combination.json";
import axis from "axios";
import combination from "../js/combination";
import combinationRing from "../js/combination2";
import {drawCircle} from "../js/test.js"
import {reactive} from 'vue'
import * as d3 from "d3"
import {arrayEqual} from "../js/tool.js"

export default {
  name: "combination2",
  data() {
    return {
      show: 0,
      combData: "combData",
      imgNamesPrevious: []
    }
  },
  props: ["svgId", "svgH", "svgW", "userSearchTree", "imgNames", "filterConfig", "index", "testNum", "testObj"],
  emits: ["update:userSearchTree", "update:imgNames"],
  methods: {
    drawCircle() {
      drawCircle(this)
    },
    drawCombination() {
      console.log(this.svgId, "combination2 drawCombination comData", this.combData)
      console.log(this.svgId, "imgNames", this.imgNames)
      console.log(this.svgId, "index", this.index)

      combinationRing(this.combData, this)
    },
    requestData() {
      const data = {
        "imgNames": this.imgNames,
        "filterConfig": this.filterConfig,
        "index": this.index
      }
      // console.log("mounted svgId", this.svgId, "combination2", this.imgNames)
      console.log("requestData")
      axis.defaults.baseURL = "http://localhost:4999"
      let that = this
      axis.post('/combinationRing', data
          , {
            headers: {"Content-Type": "application/json"}
          })
          .then(function (response) {
            const data = response.data.res
            // combination(data)
            // console.log("data", data)
            that.combData = data
          })
          .catch(function (error) {
            console.log(error);
          });
    },
    test() {
      console.log("123")
    }
  },
  created() {
    this.imgNamesPrevious = this.imgNames
    const data = {
      "imgNames": this.imgNames,
      "filterConfig": this.filterConfig,
      "index": this.index
    }
    // console.log("mounted svgId", this.svgId, "combination2", this.imgNames)
    console.log(this.svgId, "mounted combnation2")
    console.log(this.svgId, "requestJson", data)
    console.log(this.svgId, "testNum", this.testNum)
    axis.defaults.baseURL = "http://localhost:4999"
    let that = this
    axis.post('/combinationRing', data
        , {
          headers: {"Content-Type": "application/json"}
        })
        .then(function (response) {
          const data = response.data.res
          // combination(data)
          // debugger
          console.log(that.svgId, "mounted combnation2 request data", data)
          that.combData = data
          combinationRing(data, that)
        })
        .catch(function (error) {
          console.log(error);
        });
  },
  // created() {
  //   console.log(this.svgId, "created, imgNames", this.imgNames)
  //   console.log(this.svgId, "created, index", this.index)
  // },
  beforeUpdate() {

  },
  updated() {

    console.log(this.svgId, "updated, imgNames", this.imgNames)
    console.log(this.svgId, "updated, index", this.index)

    if (!(arrayEqual(this.imgNamesPrevious, this.imgNames))) {
      this.imgNamesPrevious = this.imgNames
      const data = {
        "imgNames": this.imgNames,
        "filterConfig": this.filterConfig,
        "index": this.index
      }
      // console.log("mounted svgId", this.svgId, "combination2", this.imgNames)
      console.log(this.svgId, "updated combnation2")
      console.log(this.svgId, "requestJson", data)
      console.log(this.svgId, "testNum", this.testNum)
      axis.defaults.baseURL = "http://localhost:4999"
      let that = this
      axis.post('/combinationRing', data
          , {
            headers: {"Content-Type": "application/json"}
          })
          .then(function (response) {
            const data = response.data.res
            // combination(data)
            // debugger
            console.log(that.svgId, "updated combnation2 request data", data)
            that.combData = data
            combinationRing(data, that)
          })
          .catch(function (error) {
            console.log(error);
          });

    }

  }
}
</script>

<style scoped>

</style>