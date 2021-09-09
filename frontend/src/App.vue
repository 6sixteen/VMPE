<template>
  <div>
    <el-container direction="horizontal">
      <el-container direction="vertical">
        <el-container>
          <el-main class="projection">projection</el-main>
          <el-main class="combination">
            <!--            <combination2 v-model="userSearchTree"></combination2>-->
            <combination2 :svg-id="combSvgInfo.id" :svg-h="combSvgInfo.h" :svg-w="combSvgInfo.w" :userSearchTree="userSearchTree" :index="index"
                          @update:userSearchTree="userSearchTree=$event" :img-names="imgNames" :filter-config="filterConfig"  @update:imgNames="imgNames=$event"></combination2>
          </el-main>
        </el-container>
        <el-container>
          <el-main class="snapshot">
            <snapshot v-model:user-search-tree="userSearchTree" :filter-config="filterConfig"></snapshot>
          </el-main>
        </el-container>
      </el-container>
      <el-container direction="vertical">
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

export default {
  name: 'App',
  components: {
    HelloWorld,
    projection,
    combination,
    combination2,
    snapshot
  },
  data() {
    return {
      combSvgInfo:{
        "id":"combination",
        "h":"300px",
        "w":"300px"
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
      imgNames: ["Image_20210812150340363.bmp",
        "Image_20210812150343338.bmp",
        "Image_20210812150345651.bmp",
        "Image_20210812150348106.bmp",
        "Image_20210812150439515.bmp",
        "Image_20210812150442099.bmp",
        "Image_20210812150446018.bmp"],
      filterConfig:{
        "minValue": 18000,
        "maxValue": 25000
      },
      index:0
    }
  },
  method: {
    test1(a, b) {
      console.log(a)
      console.log(b)
    }
  }

}
</script>

<style>
.projection {
  background-color: bisque;
  border: 10px black;
  font-size: large;
}

.snapshot {
  background-color: lightskyblue;
}

.edgeParallel {
  background-color: #fadd87;
}
</style>