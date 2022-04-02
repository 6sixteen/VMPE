<template>
  <el-card class="box-card" shadow="never" :body-style="{'padding': '0px'}">
    <div class="card-header">
      <el-table :data="tableData" border size="small">
        <el-table-column
          prop="image_number"
          label="Image Number"
          style="width: 30%"
        />
        <el-table-column
          prop="parameterNum"
          label="Parameter Number"
          style="width: 30%"
        />
        <el-table-column
          prop="combination_number"
          label="Parameter Set Size"
          style="width: 40%"
        />
      </el-table>
    </div>
    <div class="card-body">
      <div id="image">
        <el-scrollbar>
          <div>
            <p v-for="(item, index) in img_address" :key="index" class="scrollbar-demo-item">
              <img :src="item" style="width: 100%" />
              <div class="img-name">{{index + " | " + img_names[index].split('.')[0].split('_')[1]}}</div>
            </p>
          </div>
        </el-scrollbar>
      </div>
      <div id="container"></div>
    </div>
  </el-card>
</template>

<script>
import { flowChart } from "../js/flowChart";
import { getRequest } from "../js/dataRequest";
import axis from "axios";

export default {
  name: "view4",
  data() {
    return {
      combination_number: {
        // 参数组合总数
        type: Number,
        default: 0,
      },
      image_number: {
        // 图片总数
        type: Number,
        default: 0,
      },
      operation: {
        // 函数相关信息
        type: Object,
        default: {},
      },
      parameter: {
        // 参数相关信息
        type: Object,
        default: {
          parameterNum: 0,
        },
      }
    };
  },
  props: {
    id: String,
    img_names: Array,
    img_address: Array
  },
  computed: {
    tableData: function () {
      return [
        {
          image_number: this.image_number,
          parameterNum: this.parameter.parameterNum,
          combination_number: this.combination_number,
        },
      ];
    },
  },
  emits: [],
  methods: {},
  mounted() {
    // 请求绘制view4的数据
    console.log("view4.vue mounted");

    axis.defaults.baseURL = "http://localhost:4999";
    let that = this;

    //key(response) value(data)
    let correspond = {
      combination_number: "combination_number",
      image_number: "image_number",
      operation: "operation",
      parameter: "parameter",
    };
    let url = "/getView4";
    getRequest(url, null, that, correspond, true);
  },
  updated() {
    console.log("view4 updated");
    // 绘制view4
    flowChart(this);
  },
};
</script>

<style scoped>
.box-card {
  width: 98%;
  height: 95%;
  margin: 0;
  padding: 3.5% 1% 1% 1%;
}

.card-header {
  display: block;
  width: 100%;
  height: 25%;
}
.card-body {
  display: block;
  height: 75%;
}

.type-suss {
  background: white;
}

#image {
  float: left;
  width: 50%;
}

#container {
  float: left;
  width: 50%;
}

.img-name {
    font-size: 5%;
}
</style>