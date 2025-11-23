<template>
  <div class="sidebar">
    <FolderNode
      v-for="folder in tree"
      :key="folder.id"
      :folder="folder"
      @selectFolder="$emit('selectFolder', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import FolderNode from "./FolderNode.vue";
import { defineProps } from "vue";

interface Folder {
  id: string;
  parentId: string | null;
  name: string;
  children?: Folder[];
}

const props = defineProps<{
  tree: Folder[];
}>();
</script>

<style scoped>
.sidebar {
  width: 250px;
  border-right: 1px solid #ccc;
  overflow-y: auto;
  background: #f0f0f0;
  padding: 10px;
}
</style>
