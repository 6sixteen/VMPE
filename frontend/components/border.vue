<template>
  <div class="border">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "border",
  data() {
    return {};
  },
  props: {},
  computed: {},
  emits: [],
  methods: {},
  mounted() {},
  updated() {},
};
</script>

<style scoped>
.border {
    width: 100%;
    height: 100%;
    border: 0.1px solid #e4e7ed;
    border-radius: 1%;
    background-color: white;
}
</style>