<template>
  <el-container direction="horizontal" class="containerT">
      <el-container direction="vertical" class="containerL">
        <el-container class="containerLU">
          <el-main
            id="containerLULId"
            class="containerLUL projection"
            style="padding: 0px"
          >
            <!--                        <img-union></img-union>-->
            <!--            <image-layout :layout_info="imgLayout_info" :img-names="imgNames" :case_file="caseFile"-->
            <!--                          :filter_config="filter_config"-->
            <!--                          @update:imgNames="imgNames=$event" :test-num="testNum"-->
            <!--                          @update:test-num="testNum=$event" @update:filter_config="filter_config=$event"-->
            <!--                          @update:pic_compare_img="pic_compare_img=$event"-->
            <!--                          :pic_compare_selected="pic_compare_selected_index"></image-layout>-->

            <!--            <view1 :id="view1Info.id" :h="view1Info.h" :w="view1Info.w" :img_names="view1Info.img_names" :method="view1Info.cluster_method" :filter_config="view1Info.filter_config"-->
            <!--            :edge="view1Info.edge" :process_method="view1Info.process_method" :p="view1Info.p"    ></view1>-->
            <el-row>
              <view1b
                :id="view1Info.id"
                :h="view1Info.h"
                :w="view1Info.w"
                :img_names="view1Info.img_names"
                :img_address="view1Info.img_address"
                :cluster_method="view1Info.cluster_method"
                :filter_config="view1Info.filter_config"
                :edge="view1Info.edge"
                :process_method="view1Info.process_method"
                :p="view1Info.p"
                :n_clusters="view1Info.n_clusters"
                :matrix_name="view1Info.matrix_name"
                v-on:brush_img_info="brushImgInfo"
                @getClusterForceData="getClusterForceData"
              ></view1b>
              <!-- <view1a :id="view1Info.id" :h="view1Info.h" :w="view1Info.w" :img_names="view1Info.img_names"
                      :cluster_method="view1Info.cluster_method" :filter_config="view1Info.filter_config"
                      :edge="view1Info.edge" :process_method="view1Info.process_method" :p="view1Info.p"
                      :n_cluster="view1Info.n_cluster" :matrix_name="view1Info.matrix_name"
                      v-on:brush_img_info="brushImgInfo"></view1a> -->
            </el-row>
          </el-main>
          <el-main class="containerLUR" style="padding: 0px">
            <!--                                    <combination2 :svg-id="combSvgInfo.id" :svg-h="combSvgInfo.h" :svg-w="combSvgInfo.w"-->
            <!--                                                  :userSearchTree="userSearchTree" :index="index"-->
            <!--                                                  @update:userSearchTree="userSearchTree=$event" :img-names="imgNames"-->
            <!--                                                  :filter-config="filter_config" @update:imgNames="imgNames=$event;console.log($event)" :testnum="testnum" @update:testnum="testnum=$event;console.log($event)"></combination2>-->

            <!--            <pic-compare :id="imgCompare_info.id" :h="imgCompare_info.h" :w="imgCompare_info.w"-->
            <!--                         :border="imgCompare_info.img_border" @update:selected_index="pic_compare_selected_index=$event"-->
            <!--                         :img_names="pic_compare_img"></pic-compare>-->

            <!-- <view3 :id="view3Info.id" :h="view3Info.h" :w="view3Info.w" :filter_config="view3Info.filter_config"
                   :img_indices="view3Info.img_indices"
                   :method="view3Info.method" :p_value="view3Info.p_value" :request_number="view3Info.request_number" :parameter_order="view3Info.parameter_order"
            :order="view3Info.order" v-on:order_change="orderChange"></view3> -->
            <view4
              :id="view4Info.id"
              :h="view4Info.h"
              :w="view4Info.w"
              :img_names="view4Info.img_names"
              :img_address="view4Info.img_address"
            />
          </el-main>
        </el-container>
        <el-container class="containerLD" style="overflow: unset; padding: 0px">
          <el-main class="snapshot" style="overflow: unset; padding: 0px">
            <!--            <snapshot v-model:user-search-tree="userSearchTree" :filter-config="filter_config"></snapshot>-->
            <!--                        <sankey :id="sankeySvgId" :h="sankeySvgH" :w="sankeySvgW"></sankey>-->
            <!--            <greedy-matrix :id="greedyMatrix_info.id" :h="greedyMatrix_info.h" :w="greedyMatrix_info.w"-->
            <!--                           :filter_config="filter_config_greedy" :img_names="img_names_greedy"-->
            <!--                           :res="res_greedy"></greedy-matrix>-->

            <view2
              :id="view2Info.id"
              :h="view2Info.h"
              :w="view2Info.w"
              :filter_config="view2Info.filter_config"
              :img_indices="view2Info.img_indices"
              :method="view2Info.method"
              :request_number="view2Info.request_number"
              v-on:compare_img="compareImg"
              :graph="view2Info.graph"
              v-on:delete_img="deleteImg"
            >
            </view2>

            <!--            <view3 :id="view3Info.id" :h="view3Info.h" :w="view3Info.w" :filter_config="view3Info.filter_config"-->
            <!--                   :img_indices="view3Info.img_indices"-->
            <!--                   :method="view3Info.method" :p_value="view3Info.p_value"></view3>-->
          </el-main>
        </el-container>
      </el-container>
    </el-container>
</template>

<script>
import {forceLayout} from "../js/forceLayout";
import {getView1,getView1Simple} from "../js/dataRequest"
import axis from "axios";

export default {
  name: "view1",
  data() {
    return {
      flag: "",
      graph_force_data: ""
    }
  },
  props: {
    id: String,
    w: String,
    h: String,
    img_names: {},
    filter_config: {},
    method: String,
    edge:String //边权重的选择方式
    ,process_method:String // 边的省略方式
    ,p:Number // 边的省略方式 参数
  },
  emits: [],
  methods: {},
  created() {
    // 请求绘制view1的数据
    console.log("view1.vue created")

    axis.defaults.baseURL = "http://localhost:4999"
    let that = this
    let axis_data = {
      "img_names": that.img_names,
      "filter_config": that.filter_config,
      "method": that.method,
      "edge": that.edge,
      "process_method": that.process_method,
      "p":that.p
    }

    //key(response) value(data)
    let correspond = {
      "flag": "flag", "graph_force_data": "graph_force_data"
    }
    getView1Simple(axis_data, that, correspond, true)

  },
  updated() {
    console.log("view1 updated")
    forceLayout(this)

    // 绘制view1
  }
}
</script>

<style scoped>

</style>