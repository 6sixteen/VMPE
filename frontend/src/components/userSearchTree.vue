<template>
  <div>
  <svg :id="svgId" :style="{width: svgH,height: svgW}"></svg>
    {{userSearchTreeT(userSearchTree)}}
    <p v-show="show">{{userSearchTree}}</p>
  </div>
</template>

<script>
import {userSearchTree,drawUserSearchTree} from "../js/userSearchTree.js"
export default {
  name: "userSearchTree",
  props: ["svgId","svgH","svgW","userSearchTree"],
  data(){
    return{
      show: 0
    }
  },
  mounted() {
    // this.userSearchTreeT()
    //userSearchTree(this.userSearchTree)
  },
  methods:{
    userSearchTreeT(data){
      const that = this
      drawUserSearchTree(data,that)
    }
  }
}
</script>

<style scoped>

</style>