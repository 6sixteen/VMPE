<template>
  <div>
    <svg id="combination" style="width:1000px; height:1000px"></svg>
  </div>
</template>

<script>
import combination from "../js/combination";
import axis from "axios";
import combinationData from "../assets/combination.json"
export default {
  name: "combination",
  data() {
    return {}
  },
  methods: {},
  created() {
    const data = {
      "imgNames": [
        "Image_20210812150340363.bmp",
        "Image_20210812150343338.bmp",
        "Image_20210812150345651.bmp"
      ],
      "filterConfig": {
        "minValue": 18000,
        "maxValue": 25000
      }
    }
    data["imgNames"] = combinationData["9"]["imgNames"]
    axis.defaults.baseURL = "http://localhost:4999"
    axis.post('/combination', data
        , {
          headers: {"Content-Type": "application/json"}
        })
        .then(function (response) {
          const data = response.data.res
          combination(data)
        })
        .catch(function (error) {
          console.log(error);
        });

  }
}
</script>

<style scoped>

</style>