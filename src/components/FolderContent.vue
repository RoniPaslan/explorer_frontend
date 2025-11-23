<template>
  <div class="content-area" @click.stop>
    <!-- FOLDERS -->
    <div
      v-for="f in folders"
      :key="f.id"
      class="item folder"
      :class="{ active: selectedFolder === f.id }"
      @click.stop="selectFolder(f)"
      @contextmenu.prevent.stop="openContextMenuFolder($event, f)"
    >
      📁 {{ f.name }}
    </div>

    <!-- FILES -->
    <div
      v-for="file in files"
      :key="file.id"
      class="item file"
      :class="{ active: selectedFile === file.id }"
      @click.stop="selectFile(file)"
      @contextmenu.prevent.stop="openContextMenuFile($event, file)"
    >
      📄 {{ file.name }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "FolderContent",
  props: {
    folders: Array,
    files: Array,
    selectedFolder: String,
    selectedFile: String,
  },
  emits: ["select", "contextmenu"],

  setup(props, { emit }) {
    const selectFolder = (folder: any) => {
      emit("select", { id: folder.id });
    };

    const selectFile = (file: any) => {
      emit("select", { id: file.folderId, fileId: file.id });
    };

    const openContextMenuFolder = (event: MouseEvent, folder: any) => {
      emit("contextmenu", event, folder.id, folder.parentId, folder.name, true);
    };

    const openContextMenuFile = (event: MouseEvent, file: any) => {
      emit("contextmenu", event, file.id, file.folderId, file.name, false);
    };

    return {
      selectFolder,
      selectFile,
      openContextMenuFolder,
      openContextMenuFile,
    };
  },
});
</script>

<style scoped>
.content-area {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.item {
  width: 140px;
  padding: 10px;
  border-radius: 6px;
  border: 1px solid #ddd;
  background: white;
  cursor: pointer;
  text-align: center;
}

.item.active {
  background: #0078d7;
  color: white;
  border-color: #005bb5;
}
</style>
