<template>
  <div id="projection"></div>
</template>

<script>
import projection from "../js/projection.js"
import * as d3 from "d3";
import axis from "axios"

export default {
  name: "projection",
  data() {
    return {}
  },
  methods: {
    projection,
  },
  created() {
    axis.defaults.baseURL="http://localhost:4999"
    axis.post('/projection', {			//官方格式
      imgFile: 'D:\\codeTest\\parameterExp\\data\\case1\\img',
      parameterFile: 'D:\\codeTest\\parameterExp\\data\\case1\\parameter',
      projectionMethod: "isomap"
    },{
      headers:{"Content-Type":"application/json"}
    })
        .then(function (response) {
          console.log(response);
        })
        .catch(function (error) {
          console.log(error);
        });

    this.projection()
  }
}
</script>

<style scoped>

</style>