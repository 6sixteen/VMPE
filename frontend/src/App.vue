<template>
  <div>
    <el-container direction="horizontal" class="containerT">
      <el-container direction="vertical" class="containerL">
        <el-container class="containerLU">
          <el-main id="containerLULId" class="containerLUL projection " style="overflow: unset;padding:0px">
            <!--                        <img-union></img-union>-->
            <image-layout :layout-h="imgLayoutH" :layout-w="imgLayoutW" :img-names="imgNames"
                          @update:imgNames="imgNames=$event" :test-num="testNum"
                          @update:test-num="testNum=$event"></image-layout>

          </el-main>
          <el-main class="containerLUR combination ">
                        <combination2 :svg-id="combSvgInfo.id" :svg-h="combSvgInfo.h" :svg-w="combSvgInfo.w"
                                      :userSearchTree="userSearchTree" :index="index"
                                      @update:userSearchTree="userSearchTree=$event" :img-names="imgNames"
                                      :filter-config="filterConfig" @update:imgNames="imgNames=$event;console.log($event)" :testnum="testnum" @update:testnum="testnum=$event;console.log($event)"></combination2>
          </el-main>
        </el-container>
        <el-container class="containerLD">
          <el-main class="snapshot">
            <!--            <snapshot v-model:user-search-tree="userSearchTree" :filter-config="filterConfig"></snapshot>-->
          </el-main>
        </el-container>
      </el-container>
      <el-container direction="vertical" class="containerR">
        <el-main class="edgeParallel">边捆绑平行坐标系</el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import projection from "./components/projection.vue";
import combination from "./components/combination.vue";
import combination2 from "./components/combination2.vue";
import snapshot from "./components/snapshot.vue";
import imgUnion from "./components/imgUnion.vue";
import imageLayout from "./components/imageLayout.vue"
// import $ from "jquery";

export default {
  name: 'App',
  components: {
    imgUnion,
    HelloWorld,
    projection,
    combination,
    combination2,
    snapshot,
    imageLayout
  },
  data() {
    return {
      combSvgInfo: {
        "id": "combination",
        "h": "300px",
        "w": "300px"
      },
      userSearchTree: {
        "nodes": {
          "7_0": {
            "group": [0, 1, 2, 3, 4, 5, 6],
            "imgNames": [
              "Image_20210812150340363.bmp",
              "Image_20210812150343338.bmp",
              "Image_20210812150345651.bmp",
              "Image_20210812150348106.bmp",
              "Image_20210812150439515.bmp",
              "Image_20210812150442099.bmp",
              "Image_20210812150446018.bmp"
            ]
          }
        },
        "links": [],
        "centerNode": {
          "id": "7_0",
          "group": [0, 1, 2, 3, 4, 5, 6],
          "imgNames": [
            "Image_20210812150340363.bmp",
            "Image_20210812150343338.bmp",
            "Image_20210812150345651.bmp",
            "Image_20210812150348106.bmp",
            "Image_20210812150439515.bmp",
            "Image_20210812150442099.bmp",
            "Image_20210812150446018.bmp"
          ]
        }
      },
      // imgNames: ["Image_20210812150340363.bmp",
      //   "Image_20210812150343338.bmp",
      //   "Image_20210812150345651.bmp",
      //   "Image_20210812150348106.bmp",
      //   "Image_20210812150439515.bmp",
      //   "Image_20210812150442099.bmp",
      //   "Image_20210812150446018.bmp"],
      imgNames: [],
      filterConfig: {
        "minValue": 18000,
        "maxValue": 25000
      },
      index: 0,
      imgLayoutW: "1254px",
      imgLayoutH: "695px",
      testnum: 123
    }
  },
  method: {
    test1(a, b) {
      console.log(a)
      console.log(b)
    }
  },
  computed: {
    getH() {
      console.log("app computed")
      let id = "containerLULId"
      // let h = $(id).attr("height")
      // console.log("h",h)
      let ele = document.getElementById(id)
      // debugger
      // if (ele != null) {
      //   let h = ele.width
      //   console.log("ele h", h)
      //
      // }
      console.log("ele", ele)
      return 1
    }
  },
  created() {
    console.log("app created")
    let id = "containerLULId"
    let ele = document.getElementById(id)
    console.log("app created ele", ele)
  },
  update() {
    console.log("App update imgNames", this.imgNames)
  }

}
</script>

<style>


.snapshot {
  background-color: lightskyblue;
}

.edgeParallel {
  background-color: #fadd87;
}
</style>