<template>
  <div :class="id" style="width: 100%; height: 100%">
    <svg :id="id" style="width: 100%, height: 100%"></svg>
  </div>
</template>

<script>
import { draw_tree } from "../js/orderTree";
import axis from "axios";

export default {
  name: "orderTree",
  data() {
    return {
      w: "200",
      h: "200"
    };
  },
  props: {
    id: String,
    request_number: Number,
    re_combine: Object,
    combine: Object,
    canTwoCluster: Boolean,
    newCluster: Object
  },
  emits: [],
  methods: {},
  created() {
    // 请求绘制view1的数据
    // console.log("orderTree.vue created")
  },
  updated() {
    console.log("orderTree.vue updated");
    this.w = document.querySelector('.' + this.id).clientWidth;
    this.h = document.querySelector('.' + this.id).clientHeight;
    draw_tree(this);
  },
};
</script>

<style scoped>
</style>