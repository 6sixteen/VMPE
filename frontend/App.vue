<template>
  <div class="container">
    <div class="main-up">
      <div class="main-view1">
        <view4
            :id="view4Info.id"
            :img_names="view4Info.img_names"
            :img_address="view4Info.img_address"
        />
      </div>
      <div class="main-view2">
        <border>
          <view1b
              :id="view1Info.id"
              :img_names="view1Info.img_names"
              :img_address="view1Info.img_address"
              :cluster_method="view1Info.cluster_method"
              :filter_config="view1Info.filter_config"
              :edge="view1Info.edge"
              :process_method="view1Info.process_method"
              :p="view1Info.p"
              :n_clusters="view1Info.n_clusters"
              :matrix_name="view1Info.matrix_name"
              :showZero="showZero"
              v-on:brush_img_info="brushImgInfo"
              @getClusterForceData="getClusterForceData"
          ></view1b>
        </border>
      </div>
      <div class="main-view3">
        <border>
          <view3
              :id="view3Info.id"
              :h="view3Info.h"
              :w="view3Info.w"
              :filter_config="view3Info.filter_config"
              :img_indices="view3Info.img_indices"
              :method="view3Info.method"
              :p_value="view3Info.p_value"
              :request_number="view3Info.request_number"
              :parameter_order="view3Info.parameter_order"
              :order="view3Info.order"
              v-on:order_change="orderChange"
          ></view3>
        </border>
      </div>
    </div>
    <div class="main-down">
      <div class="main-view4">
        <border>
          <div class="tree-1">
            <OrderTree
                :id="orderTree.id"
                :combine="orderTree.combine"
                :re_combine="orderTree.re_combine"
                :canTwoCluster="orderTree.canTwoCluster"
                :newCluster="orderTree.newCluster"
            ></OrderTree>
          </div>
          <div class="tree-2">
            <OrderTree
                :id="orderTree1.id"
                :combine="orderTree1.combine"
                :re_combine="orderTree1.re_combine"
                :canTwoCluster="orderTree.canTwoCluster"
                :newCluster="orderTree.newCluster"
            ></OrderTree>
          </div>
        </border>
      </div>
      <div class="main-view5">
        <border>
          <view2
              :id="view2Info.id"
              :id_1="view2Info.id_1"
              :filter_config="view2Info.filter_config"
              :img_indices="view2Info.img_indices"
              :method="view2Info.method"
              :request_number="view2Info.request_number"
              v-on:compare_img="compareImg"
              :graph="view2Info.graph"
              v-on:delete_img="deleteImg"
              :combine_type="combineType"
              v-on:draw_tree="drawTree"
          >
          </view2>
        </border>
      </div>
    </div>
    <drawer
        :view1Info="view1Info"
        :cluster_force_data="cluster_force_data"
        :combineType="combineType"
        :combineTypeList="combineTypeList"
        @changeCombineType="changeCombineType"
        :changeShowZero="changeShowZero"
        :showZero="showZero"
    ></drawer>
    <div class="label1">
      &nbsp;&nbsp;<span class="iconfont">&#xe6df;</span>&nbsp;Information View
    </div>
    <div class="label2">
      &nbsp;<span class="iconfont">&#xe6e3;</span>&nbsp;Class View
    </div>
    <div class="label3">
      &nbsp;<span class="iconfont">&#xe6e1;</span>&nbsp;Parameter View
    </div>
    <div class="label4">
      &nbsp;&nbsp;<span class="iconfont">&#xe6e2;</span>&nbsp;Order View
    </div>
    <div class="label5">
      &nbsp;<span class="iconfont">&#xe6e0;</span>&nbsp;Intersection View
    </div>
  </div>
</template>

<script>
import HelloWorld from "./components/HelloWorld.vue";
import projection from "./components/projection.vue";
import combination from "./components/combination.vue";
import combination2 from "./components/combination2.vue";
import snapshot from "./components/snapshot.vue";
import imgUnion from "./components/imgUnion.vue";
import imageLayout from "./components/imageLayout.vue";
import sankey from "./components/sankey.vue";
import picCompare from "./components/picCompare.vue";
import greedyMatrix from "./components/greedyMatrix.vue";
import view1 from "./components/view1.vue";
import view1a from "./components/view1a.vue";
import view1b from "./components/view1b.vue";
import view2 from "./components/view2.vue";
import view3 from "./components/view3.vue";
import view4 from "./components/view4.vue";
import drawer from "./components/drawer.vue";
import border from "./components/border.vue";
import OrderTree from "./components/orderTree.vue";
import {deepCopy} from "./js/forceLayout2";

import {ref} from "vue";
// import $ from "jquery";

export default {
  name: "App",
  components: {
    imgUnion,
    HelloWorld,
    projection,
    combination,
    combination2,
    snapshot,
    imageLayout,
    sankey,
    picCompare,
    greedyMatrix,
    view1,
    view1a,
    view1b,
    view2,
    view3,
    view4,
    drawer,
    border,
    OrderTree,
  },
  data() {
    return {
      brush_start_time: "",
      brush_flag: true,
      brush_img_before: [],
      filter_config_total: {minValue: 34000, maxValue: 36000},
      caseFile: "D:\\codeTest\\parameterExp\\data\\case1\\img",
      combSvgInfo: {
        id: "combination",
        h: "300px",
        w: "300px",
      },
      userSearchTree: {
        nodes: {
          "7_0": {
            group: [0, 1, 2, 3, 4, 5, 6],
            imgNames: [
              "Image_20210812150340363.bmp",
              "Image_20210812150343338.bmp",
              "Image_20210812150345651.bmp",
              "Image_20210812150348106.bmp",
              "Image_20210812150439515.bmp",
              "Image_20210812150442099.bmp",
              "Image_20210812150446018.bmp",
            ],
          },
        },
        links: [],
        centerNode: {
          id: "7_0",
          group: [0, 1, 2, 3, 4, 5, 6],
          imgNames: [
            "Image_20210812150340363.bmp",
            "Image_20210812150343338.bmp",
            "Image_20210812150345651.bmp",
            "Image_20210812150348106.bmp",
            "Image_20210812150439515.bmp",
            "Image_20210812150442099.bmp",
            "Image_20210812150446018.bmp",
          ],
        },
      },
      // imgNames: ["Image_20210812150340363.bmp",
      //   "Image_20210812150343338.bmp",
      //   "Image_20210812150345651.bmp",
      //   "Image_20210812150348106.bmp",
      //   "Image_20210812150439515.bmp",
      //   "Image_20210812150442099.bmp",
      //   "Image_20210812150446018.bmp"],
      imgNames: [],
      filter_config: {
        minValue: 0,
        maxValue: 0,
      },
      index: 0,
      imgLayout_info: {
        w: "1344px",
        h: "585px",
        img_border: "2px",
        button_h: "28px",
        button_w: "150px",
      },
      imgCompare_info: {
        id: "img_compare",
        w: "576px",
        h: "585px",
        img_border: "2px",
      },
      pic_compare_img: ["noImg", "noImg"],
      pic_compare_selected_index: 0,
      sankeySvgId: "snakey",
      sankeySvgH: "300px",
      sankeySvgW: "350px",
      testnum: 123,

      greedyMatrix_info: {
        id: "greedy_matrix",
        w: "500px",
        h: "380px",
      },

      img_names_greedy: [
        "Image_20210812150340363.bmp",
        "Image_20210812150343338.bmp",
        "Image_20210812150345651.bmp",
        "Image_20210812150348106.bmp",
        "Image_20210812150439515.bmp",
        "Image_20210812150507378.bmp",
        "Image_20210812150735634.bmp",
        "Image_20210812150738139.bmp",
        "Image_20210812150742075.bmp",
      ],
      filter_config_greedy: {
        minValue: 24500,
        maxValue: 25000,
      },
      res_greedy: {
        0: [0, 4, 2, 9, 1, 3, 11, 8, 10],
        1: [0, 4, [2, 9], 1, 3, 11, 8, 10],
        2: [0, 4, [2, 9], 1, 3, 11, [8, 10]],
        3: [[0, 4], [2, 9], 1, 3, 11, [8, 10]],
        4: [[0, 4], [2, 9], 1, 3, [11, [8, 10]]],
        5: [[0, 4], [2, 9], 1, [3, [11, [8, 10]]]],
        6: [
          [0, 4],
          [2, 9],
          [1, [3, [11, [8, 10]]]],
        ],
        7: [
          [0, 4],
          [
            [2, 9],
            [1, [3, [11, [8, 10]]]],
          ],
        ],
        8: [
          [
            [0, 4],
            [
              [2, 9],
              [1, [3, [11, [8, 10]]]],
            ],
          ],
        ],
      },
      view1Info: {
        id: "view1",
        h: "400px",
        w: "400px",
        img_names: [
          "Image_20210812150340363.bmp",
          "Image_20210812150343338.bmp",
          "Image_20210812150345651.bmp",
          "Image_20210812150348106.bmp",
          "Image_20210812150439515.bmp",
          "Image_20210812150442099.bmp",
          "Image_20210812150446018.bmp",
          "Image_20210812150449667.bmp",
          "Image_20210812150507378.bmp",
          "Image_20210812150735634.bmp",
          "Image_20210812150738139.bmp",
          "Image_20210812150742075.bmp",
          "Image_20210812150745340.bmp",
          "Image_20210812150748010.bmp",
          "Image_20210812150752110.bmp",
          "Image_20210812150754923.bmp",
          "Image_20210812150757138.bmp",
          "Image_20210812150800770.bmp",
          "Image_20210812150954922.bmp",
          "Image_20210812151017347.bmp",
          "Image_20210812151053418.bmp",
          "Image_20210812151121185.bmp",
        ],
        img_address: [
          "https://note.youdao.com/yws/api/personal/file/WEB6934969b1bc5da14e661ac447e933bcb?method=download&shareKey=9f2d775f96299f6adf8c00b51fe75bb9",
          "https://note.youdao.com/yws/api/personal/file/WEB0bd74106a36426944160f0b61793b0ac?method=download&shareKey=30d9d79acaf3b0f83555765c15881d0d",
          "https://note.youdao.com/yws/api/personal/file/WEBd136d456c243960d344620b3827a0fba?method=download&shareKey=4cf105b9a77f00c2efcb63c8b435d25c",
          "https://note.youdao.com/yws/api/personal/file/WEBe108fdf37d3269298a7bbedfc27ebc19?method=download&shareKey=f31c1ab80201fc313888fc7ccb10c9a4",
          "https://note.youdao.com/yws/api/personal/file/WEBae5e118f7e5116b84d8470dfcb064bff?method=download&shareKey=614420ea12f0852fc535a771650035a1",
          "https://note.youdao.com/yws/api/personal/file/WEB6590fdd63edc73c3bdfef3d51c3c7700?method=download&shareKey=45560fba622f977ad1c286c2817f9ed2",
          "https://note.youdao.com/yws/api/personal/file/WEB31b8676e9696ce8e9f7cb93d9bdf01de?method=download&shareKey=3ec8f918f4aa9d231aa42278280c3c9f",
          "https://note.youdao.com/yws/api/personal/file/WEB45a51f0e94d2562359a32460993a4fb2?method=download&shareKey=11eba76b26f4098eb39bb4d96973909e",
          "https://note.youdao.com/yws/api/personal/file/WEBd2f52518fc69d3b4f08f8f1b51c64256?method=download&shareKey=4b26ba39305df444a91898682ab41894",
          "https://note.youdao.com/yws/api/personal/file/WEB8c4c2ea92b78848777786b0ba3998744?method=download&shareKey=109f16b81818943780b597ff9aae8e0e",
          "https://note.youdao.com/yws/api/personal/file/WEB5680b1cf95e7b6b8f4e126ea10f4661a?method=download&shareKey=3c349376650234b52831d23eff836eca",
          "https://note.youdao.com/yws/api/personal/file/WEBcfc0cd56c9d283ec9bcae93df9d36508?method=download&shareKey=c3f2653ea2a75de5eb4499ca15312de7",
          "https://note.youdao.com/yws/api/personal/file/WEBbe66fdc58fefc55b880f5331cafb6e1d?method=download&shareKey=ceb62b83eb2b94dc615cdd2f846dbacd",
          "https://note.youdao.com/yws/api/personal/file/WEB98bcbba2d386a786f41b8b7c8abe2e99?method=download&shareKey=154b49e0fea5672c91be3c885f6d4650",
          "https://note.youdao.com/yws/api/personal/file/WEB74a779f9e4941c2e4cd197413b31f6b4?method=download&shareKey=c8e1ebea7ae469b669acc6868fe719d9",
          "https://note.youdao.com/yws/api/personal/file/WEBabcdd4a29ef4b1c18dae78f297037b23?method=download&shareKey=1525d98640c23a3ab6b61d5ab119faa2",
          "https://note.youdao.com/yws/api/personal/file/WEB800da79d49112b89860c45ff771e5d37?method=download&shareKey=a869d84c9d9c140e753f7ebbc04baa48",
          "https://note.youdao.com/yws/api/personal/file/WEBc03fa7ba76f394bca937bf95bfab9cd4?method=download&shareKey=6b93d890eb8e4a960032156bf5f4f6a8",
          "https://note.youdao.com/yws/api/personal/file/WEB02f75fbd7cecd35c56bd07b0450aba99?method=download&shareKey=9e10eba553527f7500043dcb1dd74c94",
          "https://note.youdao.com/yws/api/personal/file/WEB4acb66ef9c49ca455a0f1c5d759fbd39?method=download&shareKey=445d434f8b585a65ef29acd907d0427c",
          "https://note.youdao.com/yws/api/personal/file/WEBc0bd9ca0c33888f8ed6d053a2af815fc?method=download&shareKey=918d0a2d4b8b11bade8200d008289ad3",
          "https://note.youdao.com/yws/api/personal/file/WEBc77bf83f9b0e15f18c25fe91409b0e98?method=download&shareKey=d7cd525f57a2a0f30fd80078b41d437c",
        ],
        cluster_method: "spectralClustering",
        filter_config: {
          minValue: 34000,
          maxValue: 36000,
          group_number: 5,
          threshold: 1000,
        },
        edge: "jac", //边权重的选择方式
        process_method: "1", // 边的省略方式
        p: 0.3, // 边的省略方式 参数
        n_clusters: 3,
        matrix_name: "BetheHessian",
      },
      view2Info: {
        id: "view2",
        id_1: "view2_1",
        h: "400px",
        w: "2000px",
        img_indices: [],
        graph: {},
        request_number: 0,
        // img_indices: ["2",
        //   "6",
        //   "9",
        //   "11",
        //   "12",
        //   "13",
        //   "14",
        //   "15",
        //   "16",
        //   "21"],
        method: "default",
        filter_config: {
          minValue: 34000,
          maxValue: 36000,
        },
      },
      view3Info: {
        request_number: 0,
        id: "view3",
        h: "400px",
        w: "600px",
        img_indices: {0: ["14"], 1: ["15"]},
        method: "default",
        filter_config: {
          minValue: 34000,
          maxValue: 36000,
        },
        p_value: 0,
        parameter_order: "default",
        order: [],
      },
      view4Info: {
        id: "view3",
        h: "400px",
        w: "600px",
        img_names: [
          "Image_20210812150340363.bmp",
          "Image_20210812150343338.bmp",
          "Image_20210812150345651.bmp",
          "Image_20210812150348106.bmp",
          "Image_20210812150439515.bmp",
          "Image_20210812150442099.bmp",
          "Image_20210812150446018.bmp",
          "Image_20210812150449667.bmp",
          "Image_20210812150507378.bmp",
          "Image_20210812150735634.bmp",
          "Image_20210812150738139.bmp",
          "Image_20210812150742075.bmp",
          "Image_20210812150745340.bmp",
          "Image_20210812150748010.bmp",
          "Image_20210812150752110.bmp",
          "Image_20210812150754923.bmp",
          "Image_20210812150757138.bmp",
          "Image_20210812150800770.bmp",
          "Image_20210812150954922.bmp",
          "Image_20210812151017347.bmp",
          "Image_20210812151053418.bmp",
          "Image_20210812151121185.bmp",
        ],
        img_address: [
          "https://note.youdao.com/yws/api/personal/file/WEB6934969b1bc5da14e661ac447e933bcb?method=download&shareKey=9f2d775f96299f6adf8c00b51fe75bb9",
          "https://note.youdao.com/yws/api/personal/file/WEB0bd74106a36426944160f0b61793b0ac?method=download&shareKey=30d9d79acaf3b0f83555765c15881d0d",
          "https://note.youdao.com/yws/api/personal/file/WEBd136d456c243960d344620b3827a0fba?method=download&shareKey=4cf105b9a77f00c2efcb63c8b435d25c",
          "https://note.youdao.com/yws/api/personal/file/WEBe108fdf37d3269298a7bbedfc27ebc19?method=download&shareKey=f31c1ab80201fc313888fc7ccb10c9a4",
          "https://note.youdao.com/yws/api/personal/file/WEBae5e118f7e5116b84d8470dfcb064bff?method=download&shareKey=614420ea12f0852fc535a771650035a1",
          "https://note.youdao.com/yws/api/personal/file/WEB6590fdd63edc73c3bdfef3d51c3c7700?method=download&shareKey=45560fba622f977ad1c286c2817f9ed2",
          "https://note.youdao.com/yws/api/personal/file/WEB31b8676e9696ce8e9f7cb93d9bdf01de?method=download&shareKey=3ec8f918f4aa9d231aa42278280c3c9f",
          "https://note.youdao.com/yws/api/personal/file/WEB45a51f0e94d2562359a32460993a4fb2?method=download&shareKey=11eba76b26f4098eb39bb4d96973909e",
          "https://note.youdao.com/yws/api/personal/file/WEBd2f52518fc69d3b4f08f8f1b51c64256?method=download&shareKey=4b26ba39305df444a91898682ab41894",
          "https://note.youdao.com/yws/api/personal/file/WEB8c4c2ea92b78848777786b0ba3998744?method=download&shareKey=109f16b81818943780b597ff9aae8e0e",
          "https://note.youdao.com/yws/api/personal/file/WEB5680b1cf95e7b6b8f4e126ea10f4661a?method=download&shareKey=3c349376650234b52831d23eff836eca",
          "https://note.youdao.com/yws/api/personal/file/WEBcfc0cd56c9d283ec9bcae93df9d36508?method=download&shareKey=c3f2653ea2a75de5eb4499ca15312de7",
          "https://note.youdao.com/yws/api/personal/file/WEBbe66fdc58fefc55b880f5331cafb6e1d?method=download&shareKey=ceb62b83eb2b94dc615cdd2f846dbacd",
          "https://note.youdao.com/yws/api/personal/file/WEB98bcbba2d386a786f41b8b7c8abe2e99?method=download&shareKey=154b49e0fea5672c91be3c885f6d4650",
          "https://note.youdao.com/yws/api/personal/file/WEB74a779f9e4941c2e4cd197413b31f6b4?method=download&shareKey=c8e1ebea7ae469b669acc6868fe719d9",
          "https://note.youdao.com/yws/api/personal/file/WEBabcdd4a29ef4b1c18dae78f297037b23?method=download&shareKey=1525d98640c23a3ab6b61d5ab119faa2",
          "https://note.youdao.com/yws/api/personal/file/WEB800da79d49112b89860c45ff771e5d37?method=download&shareKey=a869d84c9d9c140e753f7ebbc04baa48",
          "https://note.youdao.com/yws/api/personal/file/WEBc03fa7ba76f394bca937bf95bfab9cd4?method=download&shareKey=6b93d890eb8e4a960032156bf5f4f6a8",
          "https://note.youdao.com/yws/api/personal/file/WEB02f75fbd7cecd35c56bd07b0450aba99?method=download&shareKey=9e10eba553527f7500043dcb1dd74c94",
          "https://note.youdao.com/yws/api/personal/file/WEB4acb66ef9c49ca455a0f1c5d759fbd39?method=download&shareKey=445d434f8b585a65ef29acd907d0427c",
          "https://note.youdao.com/yws/api/personal/file/WEBc0bd9ca0c33888f8ed6d053a2af815fc?method=download&shareKey=918d0a2d4b8b11bade8200d008289ad3",
          "https://note.youdao.com/yws/api/personal/file/WEBc77bf83f9b0e15f18c25fe91409b0e98?method=download&shareKey=d7cd525f57a2a0f30fd80078b41d437c",
        ],
      },
      cluster_force_data: {
        links: [],
        nodes: [
          {
            id: 0,
            cluster_matrix: [],
            unionNum: 40,
          },
        ],
      },
      combineType: 0,
      combineTypeList: [
        {
          label: "the Jaccard Index (A)",
          value: 0,
        },
        {
          label: "the Jaccard Index (D)",
          value: 1,
        },
        {
          label: "the weighted Jaccard Index (A)",
          value: 2,
        },
        {
          label: "the weighted Jaccard Index (D)",
          value: 3,
        },
        {
          label: "|P1∩P2| / min(|P1|,|P2|) (A)",
          value: 4,
        },
        {
          label: "|P1∩P2| / min(|P1|,|P2|) (D)",
          value: 5,
        },
        {
          label: "max",
          value: 6,
        },
        {
          label: "min",
          value: 7,
        },
      ],
      showZero: false,
      orderTree: {
        id: "orderTree",
        re_combine: "",
        combine: "",
        canTwoCluster: false,
        newCluster: {}
      },
      orderTree1: {
        id: "orderTree1",
        re_combine: "",
        combine: "",
      },
    };
  },
  methods: {
    deepCopy(obj) {
      // 只拷贝对象
      if (typeof obj !== "object") return obj;
      // 根据obj的类型判断是新建一个数组还是一个对象
      var newObj = obj instanceof Array ? [] : {};
      for (var key in obj) {
        // 遍历obj,并且判断是obj的属性才拷贝
        if (obj.hasOwnProperty(key)) {
          // 判断属性值的类型，如果是对象递归调用深拷贝
          newObj[key] =
              typeof obj[key] === "object" ? this.deepCopy(obj[key]) : obj[key];
        }
      }
      return newObj;
    },

    test1(a, b) {
      console.log(a);
      console.log(b);
    },
    changeFilter() {
      this.view1Info.filter_config.minValue = this.filter_config_total.minValue;
      this.view1Info.filter_config.maxValue = this.filter_config_total.maxValue;
      console.log(
          "this.view1Info.filter_config.minValue",
          this.view1Info.filter_config.minValue
      );
      console.log(
          "this.view1Info.filter_config.maxValue",
          this.view1Info.filter_config.maxValue
      );
    },
    brushImgInfo(brush_img_info) {
      this.view2Info.img_indices = this.deepCopy(brush_img_info["brush_img"]);
      this.view2Info.request_number = this.view2Info.request_number + 1;
      this.view2Info.graph = this.deepCopy(brush_img_info["graph"]);
    },
    compareImg(compareImg) {
      let temp = {}
      temp["0"] = [...compareImg[0].split("_")];
      temp["1"] = [...compareImg[1].split("_")];
      this.view3Info.img_indices = temp;
      this.view3Info.request_number = this.view3Info.request_number + 1;
    },
    deleteImg(combine_0_delete) {
      this.view2Info.img_indices = combine_0_delete;
      this.view2Info.request_number = this.view2Info.request_number + 1;
    },
    orderChange(order_change) {
      //view3 修改参数结合顺序
      this.view3Info.order = order_change["order"];
      this.view3Info.parameter_order = order_change["parameter_order"];
      this.view3Info.request_number = this.view3Info.request_number + 1;
    },
    getClusterForceData(data) {
      let data2 = deepCopy(data);
      data2.nodes.splice(-1, 1);
      this.cluster_force_data = data2;
    },
    changeCombineType(val) {
      this.combineType = val;
    },
    changeShowZero() {
      this.showZero = !this.showZero;
      console.log("this.view1Info.showZero", this.showZero);
    },
    drawTree(data) {
      console.log("data", data)
      this.orderTree.combine = data.combine;
      this.orderTree.re_combine = data.re_combine;
      this.orderTree.canTwoCluster = data.canTwoCluster;
      this.orderTree.newCluster = data.newCluster;
      this.orderTree1.combine = data.combine_1;
      this.orderTree1.re_combine = data.re_combine_1;
    },
  },
  computed: {
    getH() {
      console.log("app computed");
      let id = "containerLULId";
      // let h = $(id).attr("height")
      // console.log("h",h)
      let ele = document.getElementById(id);
      // debugger
      // if (ele != null) {
      //   let h = ele.width
      //   console.log("ele h", h)
      //
      // }
      console.log("ele", ele);
      return 1;
    },
  },
  created() {
  },
  mounted() {
  },
  updated() {
    // console.log("App update imgNames", this.imgNames);
    // console.log("App update filter_config", this.filter_config);
    // console.log("this.cluster_force_data", this.cluster_force_data)
  },
};
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  background-color: #e4e7ed;
}

.main-up {
  display: flex;
  flex-basis: 1;
  height: 49.5%;
  margin-top: 0.5%;
}

.main-view1 {
  width: 29.5%;
  padding-left: 0.5%;
}

.main-view2 {
  width: 39%;
  padding-left: 0.5%;
  padding-right: 0.5%;
}

.main-view3 {
  width: 29.5%;
  padding-right: 0.5%;
}

.main-down {
  display: flex;
  flex-basis: 1;
  height: 48%;
  width: 99%;
  margin: 0.5%;
}

.main-view4 {
  width: 20%;
  padding-left: 0%;
}

.main-view5 {
  width: 79.5%;
  padding-left: 0.5%;
  padding-right: 0%;
}

.snapshot {
  background-color: lightskyblue;
}

.edgeParallel {
  background-color: #fff;
}

.form-card {
  width: 97%;
  height: auto;
  padding: 5px;
}

.form-card div {
  width: auto;
  height: auto;
}

.drawer-collapse {
  width: 100%;
  height: auto;
}

.el-select__popper {
  height: auto;
  width: auto;
}

.label1 {
  position: absolute;
  left: 0.1%;
  top: 0.5%;
  width: 6.5%;
  height: 2%;
  padding-bottom: 0.2%;
  font-size: 10px;
  font-weight: bold;
  color: #909399;
  border: none;
  border-radius: 0 0 50px 10px;
  background-color: #e4e7ed;
  text-align: left;
}

.label2 {
  position: absolute;
  left: 30.3%;
  top: 0.5%;
  width: 6%;
  height: 2%;
  padding-bottom: 0.2%;
  font-size: 10px;
  font-weight: bold;
  color: #909399;
  border: none;
  border-radius: 0 0 50px 10px;
  background-color: #e4e7ed;
  text-align: left;
}

.label3 {
  position: absolute;
  left: 69.8%;
  top: 0.5%;
  width: 6.5%;
  height: 2%;
  padding-bottom: 0.2%;
  font-size: 10px;
  font-weight: bold;
  color: #909399;
  border: none;
  border-radius: 0 0 50px 10px;
  background-color: #e4e7ed;
  text-align: left;
}

.label4 {
  position: absolute;
  left: 0.1%;
  top: 51%;
  width: 6.5%;
  height: 2%;
  padding-bottom: 0.2%;
  font-size: 10px;
  font-weight: bold;
  color: #909399;
  border: none;
  border-radius: 0 0 50px 10px;
  background-color: #e4e7ed;
  text-align: left;
}

.label5 {
  position: absolute;
  left: 20.6%;
  top: 51%;
  width: 8%;
  height: 2%;
  padding-bottom: 0.2%;
  font-size: 10px;
  font-weight: bold;
  color: #909399;
  border: none;
  border-radius: 0 0 50px 10px;
  background-color: #e4e7ed;
  text-align: left;
}

.tree-1 {
  width: 95%;
  height: 40%;
  padding: 10% 5% 10% 5%
}

.tree-2 {
  width: 95%;
  height: 40%;
  padding: 10% 5% 5% 5%
}
</style>