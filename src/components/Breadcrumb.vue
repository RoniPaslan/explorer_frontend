<template>
  <div class="breadcrumb">
    <span v-for="(item, index) in items" :key="item.id">
      {{ item.name }}
      <span v-if="index < items.length - 1"> / </span>
    </span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
export default defineComponent({
  name: "Breadcrumb",
  props: {
    items: Array,
  },
});
</script>

<style scoped>
.breadcrumb {
  font-size: 14px;
  margin-bottom: 8px;
}
</style>
