<template>
  <li>
    <div
      class="folder-node"
      :class="{ selected: isSelected }"
      @click.stop="selectFolder"
      @contextmenu.prevent.stop="openContextMenu"
    >
      <span
        v-if="hasChildren"
        @click.stop="toggleExpand"
        class="arrow"
      >
        {{ expanded ? "▾" : "▸" }}
      </span>

      <img
        :src="hasChildren ? (expanded ? openIcon : folderIcon) : folderIcon"
        class="icon"
      />

      <span class="name" v-html="highlightName"></span>
    </div>

    <ul v-if="expanded && hasChildren">
      <FolderNode
        v-for="child in node.children"
        :key="child.id"
        :node="child"
        :selected="selected"
        :search="search"
        :force-expand="forceExpand"
        @select="$emit('select', $event)"
        @contextmenu="(e, n) => $emit('contextmenu', e, n)"
      />
    </ul>
  </li>
</template>

<script lang="ts">
import { defineComponent, ref, computed, watch } from "vue";
import folderIcon from "../assets/folder.svg";
import openIcon from "../assets/folder-open.svg";

export default defineComponent({
  name: "FolderNode",
  props: {
    node: { type: Object, required: true },
    selected: { type: String, default: "" },
    search: { type: String, default: "" },
    forceExpand: { type: Array, default: () => [] }, // ← NEW
  },
  emits: ["select", "contextmenu"],

  setup(props, { emit }) {
    const expanded = ref(false);

    const hasChildren = computed(() => props.node.children?.length > 0);
    const isSelected = computed(() => props.selected === props.node.id);

    const selectFolder = () => emit("select", props.node);
    const toggleExpand = () => (expanded.value = !expanded.value);
    const openContextMenu = (event: MouseEvent) => emit("contextmenu", event, props.node);

    /* ■■■ AUTO EXPAND PARENT PATH ■■■ */
    watch(
      () => props.forceExpand,
      () => {
        if (props.forceExpand.includes(props.node.id)) {
          if (hasChildren.value) expanded.value = true;
        }
      },
      { immediate: true }
    );

    /* Highlight */
    const highlightName = computed(() => {
      if (!props.search) return props.node.name;

      const escaped = props.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escaped})`, "gi");
      return props.node.name.replace(regex, `<mark>$1</mark>`);
    });

    return {
      expanded,
      hasChildren,
      isSelected,
      toggleExpand,
      selectFolder,
      openContextMenu,
      highlightName,
      folderIcon,
      openIcon,
    };
  },
});
</script>

<style scoped>
mark {
  background: yellow;
  padding: 0 2px;
}
</style>
