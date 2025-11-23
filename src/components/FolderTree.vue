<template>
  <div class="folder-tree">
    <!-- SEARCH BOX -->
    <div class="search-wrapper">
      <input
        v-model="searchQuery"
        class="search-box"
        placeholder="Search folder..."
        @input="onSearch"
      />
      <span class="search-icon">🔍</span>
    </div>

    <ul class="tree-list">
      <FolderNode
        v-for="folder in filteredTree"
        :key="folder.id"
        :node="folder"
        :selected="selected"
        :search="searchQuery"
        :force-expand="autoExpandIds"
        @select="$emit('selectFolder', $event)"
        @contextmenu="onContextMenu"
      />
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from "vue";
import FolderNode from "./FolderNode.vue";

export default defineComponent({
  name: "FolderTree",
  props: {
    tree: { type: Array, required: true },
    selected: { type: String, default: "" },
  },
  emits: ["selectFolder", "contextmenuFolder"],

  setup(props, { emit }) {
    const searchQuery = ref("");
    const autoExpandIds = ref<string[]>([]);

    /* ───────────────────────── */
    /* Context Menu */
    /* ───────────────────────── */
    const onContextMenu = (event: MouseEvent, node: any) => {
      emit("contextmenuFolder", event, node);
    };

    /* ───────────────────────── */
    /* Collect all matches + path */
    /* ───────────────────────── */
    const collectMatches = (nodes: any[], parentPath: string[] = []) => {
      let result: string[] = [];

      for (const n of nodes) {
        const path = [...parentPath, n.id];

        if (n.name.toLowerCase().includes(searchQuery.value.toLowerCase())) {
          result.push(...path);
        }

        if (n.children) {
          result.push(...collectMatches(n.children, path));
        }
      }

      return result;
    };

    /* ───────────────────────── */
    /* Filter tree */
    /* ───────────────────────── */
    const filterTree = (nodes: any[]) => {
      return nodes
        .map((node) => {
          const match = node.name.toLowerCase().includes(searchQuery.value.toLowerCase());
          const children = node.children ? filterTree(node.children) : [];

          if (match || children.length) {
            return { ...node, children };
          }
          return null;
        })
        .filter(Boolean);
    };

    const filteredTree = computed(() => {
      if (!searchQuery.value) {
        autoExpandIds.value = [];
        return props.tree;
      }

      autoExpandIds.value = collectMatches(props.tree);

      return filterTree(props.tree);
    });

    const onSearch = () => {};

    return {
      searchQuery,
      filteredTree,
      onSearch,
      onContextMenu,
      autoExpandIds,
    };
  },

  components: { FolderNode },
});
</script>

<style scoped>
/* Container */
.folder-tree {
  padding: 10px;
  background: #f9fafb;
  border-right: 1px solid #e5e7eb;
  height: 100%;
  overflow-y: auto;
  font-family: Inter, sans-serif;
}

/* Search */
.search-wrapper {
  position: relative;
  width: 60%; /* FIX width - not too wide */
  margin: 0 auto 12px;
}

.search-box {
  width: 100%;
  padding: 7px 32px 7px 10px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  transition: 0.2s;
}

.search-box:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgb(59 130 246 / 25%);
}

.search-icon {
  position: absolute;
  right: 10px;
  top: 7px;
  font-size: 14px;
  pointer-events: none;
  opacity: 0.7;
}

/* Tree list */
.tree-list {
  list-style: none;
  margin: 0;
  padding-left: 6px;
}
</style>
