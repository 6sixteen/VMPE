<template>
  <div id="snapshot">
    <el-scrollbar>
      <div class="flxecontent">
        <user-search-tree :svg-id="svgInfo.userSTSvgId" :svg-w="svgInfo.userSTSvgW" :svg-h="svgInfo.userSTSvgH"
                          :user-search-tree="userSearchTree"></user-search-tree>
        <combination2 :svg-id="'com'+item" svg-h="300px" svg-w="300px" :img-names="node.imgNames" :index="getIndex(node.id)"
                      :filter-config="filterConfig" :test-num="item" v-for="(node,item) in getCombViews">
<!--          {{node}}-->
        </combination2>
      </div>
    </el-scrollbar>
  </div>
</template>

<script>
import userSearchTree from "./userSearchTree.vue";
import combination2 from "./combination2.vue";
import {getLeaf2Root} from "../js/userSearchTree.js";

export default {
  name: "snapshot",
  data() {
    return {
      svgInfo: {
        "userSTSvgId": "userSearchTree",
        "userSTSvgH": "300px",
        "userSTSvgW": "300px",

      }
    }
  },
  components: {userSearchTree, combination2},
  props: ["userSearchTree", "filterConfig"],
  methods:{
    getIndex(id){
      return id.split("_")[1]
    }
  },
  computed: {
    getCombViews() {
      const res = getLeaf2Root(this.userSearchTree)
      console.log("getCobViews",res)
      return res
    },

  }

}
</script>

<style scoped>
.flxecontent {
  display: flex
}
</style>