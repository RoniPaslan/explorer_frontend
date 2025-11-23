<template>
  <div class="app-container" @click="closeContextMenu">
    <aside class="sidebar">
      <FolderTree
        :tree="folderTree"
        :selected="selectedFolder"
        @selectFolder="onFolderSelect"
        @contextmenuFolder="openContextMenuSidebar"
      />
    </aside>

    <main class="main-panel">
      <Breadcrumb :items="breadcrumb" />

      <FolderContent
        :folders="folders"
        :files="files"
        :selected-folder="selectedFolder"
        :selected-file="selectedFile"
        @select="onFolderSelect"
        @contextmenu="openContextMenuBody"
      />
    </main>

    <!-- Context Menu -->
    <div
      v-if="contextMenu.visible"
      class="context-menu"
      :style="{ top: contextMenu.y + 'px', left: contextMenu.x + 'px' }"
      @mousedown.stop.prevent
    >
      <!-- Menu Folder -->
      <template v-if="contextMenu.isFolder">
        <div class="menu-item" @click.stop="showInput('addFolder')">
          Tambah Folder
        </div>
        <div class="menu-item" @click.stop="showInput('addFile')">
          Tambah File
        </div>
        <div class="menu-item" @click.stop="showInput('rename')">Rename</div>
        <div class="menu-item" @click.stop="handleDelete">Delete</div>
      </template>

      <!-- Menu File -->
      <template v-else>
        <div class="menu-item" @click.stop="showInput('rename')">Rename</div>
        <div class="menu-item" @click.stop="handleDelete">Delete</div>
      </template>
    </div>

    <!-- Input Popup -->
    <div
      v-if="inputPopup.visible"
      class="input-popup"
      :style="{ top: inputPopup.y + 'px', left: inputPopup.x + 'px' }"
      @click.stop
    >
      <input
        v-model="inputPopup.value"
        :placeholder="inputPopup.placeholder"
        ref="miniInput"
        @keyup.enter="confirmInput"
        @keyup.esc="cancelInput"
        @blur="cancelInput"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { ref, onMounted, nextTick } from "vue";
import Swal from "sweetalert2";

import FolderTree from "./components/FolderTree.vue";
import FolderContent from "./components/FolderContent.vue";
import Breadcrumb from "./components/Breadcrumb.vue";

interface Folder {
  id: string;
  name: string;
  children?: Folder[];
}
interface File {
  id: string;
  name: string;
  folderId: string;
  size: string;
  mime: string;
}

export default {
  components: { FolderTree, FolderContent, Breadcrumb },

  setup() {
    const folderTree = ref<Folder[]>([]);
    const selectedFolder = ref<string | null>(null);
    const selectedFile = ref<string | null>(null);

    const folders = ref<Folder[]>([]);
    const files = ref<File[]>([]);
    const breadcrumb = ref<{ id: string; name: string }[]>([]);

    /* ───────────────────────────────────────────── */
    /* CONTEXT MENU STATE */
    /* ───────────────────────────────────────────── */
    const contextMenu = ref({
      visible: false,
      x: 0,
      y: 0,
      targetId: "",
      parentId: "",
      itemName: "",
      isFolder: true,
    });

    /* POPUP INPUT */
    const inputPopup = ref({
      visible: false,
      x: 0,
      y: 0,
      action: "" as "addFolder" | "addFile" | "rename",
      targetId: "",
      value: "",
      isFolder: true,
      placeholder: "",
    });

    const miniInput = ref<HTMLInputElement>();

    /* LOAD TREE */
    const fetchTree = async () => {
      const res = await fetch("http://localhost:7001/folders/tree");
      folderTree.value = await res.json();
    };

    const fetchFolder = async (id: string) => {
      selectedFolder.value = id;

      const res = await fetch(`http://localhost:7001/folders/${id}`);
      const data = await res.json();

      folders.value = data.folders;
      files.value = data.files;
      breadcrumb.value = data.breadcrumb;
    };

    /* SELECT HANDLER */
    const onFolderSelect = (data: any) => {
      if (data.fileId) {
        selectedFile.value = data.fileId;
      } else {
        selectedFile.value = null;
      }

      fetchFolder(data.id);
    };

    /* CONTEXT MENU (SIDEBAR) */
    const openContextMenuSidebar = (event: MouseEvent, folder: Folder) => {
      contextMenu.value = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        targetId: folder.id,
        parentId: folder.id,
        itemName: folder.name,
        isFolder: true,
      };
    };

    /* CONTEXT MENU (BODY PANEL) */
    const openContextMenuBody = (
      event: MouseEvent,
      id: string,
      parentId: string,
      name: string,
      isFolder: boolean
    ) => {
      contextMenu.value = {
        visible: true,
        x: event.clientX,
        y: event.clientY,
        targetId: id,
        parentId,
        itemName: name,
        isFolder,
      };
    };

    const closeContextMenu = () => {
      contextMenu.value.visible = false;
    };

    /* SHOW INPUT */
    const showInput = (action: "addFolder" | "addFile" | "rename") => {
      const ctx = contextMenu.value;

      inputPopup.value = {
        visible: true,
        x: ctx.x,
        y: ctx.y,
        action,
        targetId: ctx.targetId,
        value: action === "rename" ? ctx.itemName : "",
        isFolder: ctx.isFolder,
        placeholder:
          action === "addFolder"
            ? "Nama folder baru"
            : action === "addFile"
            ? "Pilih file..."
            : "Nama baru",
      };

      closeContextMenu();

      nextTick(() => {
        if (action === "addFile") {
          const input = document.createElement("input");
          input.type = "file";
          input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (!file) return;

            const form = new FormData();
            form.append("folderId", ctx.targetId);
            form.append("file", file);

            await fetch("http://localhost:7001/files", {
              method: "POST",
              body: form,
            });

            if (selectedFolder.value) fetchFolder(selectedFolder.value);
            fetchTree();
          };

          input.click();
          cancelInput();
        } else {
          miniInput.value?.focus();
        }
      });
    };

    const cancelInput = () => {
      inputPopup.value.visible = false;
      inputPopup.value.value = "";
    };

    const confirmInput = async () => {
      const p = inputPopup.value;
      const val = p.value.trim();
      if (!val) return cancelInput();

      if (p.action === "addFolder") {
        await fetch(`http://localhost:7001/folders`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: val, parentId: p.targetId }),
        });
      }

      if (p.action === "rename") {
        const url = p.isFolder
          ? `http://localhost:7001/folders/${p.targetId}/rename`
          : `http://localhost:7001/files/${p.targetId}/rename`;

        await fetch(url, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: val }),
        });
      }

      cancelInput();
      if (selectedFolder.value) fetchFolder(selectedFolder.value);
      fetchTree();
    };

    /* DELETE */
    const handleDelete = async () => {
      const c = contextMenu.value;

      const confirm = await Swal.fire({
        title: `Hapus ${c.isFolder ? "Folder" : "File"}?`,
        text: `Yakin ingin menghapus "${c.itemName}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Hapus",
        cancelButtonText: "Batal",
      });

      if (!confirm.isConfirmed) return;

      const url = c.isFolder
        ? `http://localhost:7001/folders/${c.targetId}`
        : `http://localhost:7001/files/${c.targetId}`;

      await fetch(url, { method: "DELETE" });

      if (selectedFolder.value) fetchFolder(selectedFolder.value);
      fetchTree();

      Swal.fire({
        icon: "success",
        title: "Berhasil dihapus",
        timer: 1000,
        showConfirmButton: false,
      });

      closeContextMenu();
    };

    onMounted(fetchTree);

    return {
      folderTree,
      selectedFolder,
      selectedFile,
      folders,
      files,
      breadcrumb,

      onFolderSelect,
      openContextMenuSidebar,
      openContextMenuBody,
      contextMenu,
      closeContextMenu,

      inputPopup,
      miniInput,
      showInput,
      confirmInput,
      cancelInput,

      handleDelete,
    };
  },
};
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  background: #f3f3f3;
  position: relative;
}

.sidebar {
  width: 280px;
  border-right: 1px solid #ccc;
  background: #fff;
  overflow-y: auto;
}

.main-panel {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
}

/* Context Menu */
.context-menu {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  z-index: 999;
  width: 160px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.menu-item {
  padding: 8px 14px;
  cursor: pointer;
}
.menu-item:hover {
  background: #0078d7;
  color: white;
}

/* Input Popup */
.input-popup {
  position: fixed;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  z-index: 1000;
  padding: 4px;
}

.input-popup input {
  border: none;
  outline: none;
  padding: 6px 8px;
  width: 200px;
}
</style>
