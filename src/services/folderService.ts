import axios from "axios";

const API_URL = "http://localhost:7002";

export const getAllFolders = async () => {
  const res = await axios.get(`${API_URL}/folders/tree`);
  return res.data; // backend harus mengembalikan struktur tree: [{id, name, children:[...]}]
};

export const getSubfolders = async (folderId: number) => {
  const res = await axios.get(`${API_URL}/folders/${folderId}`);
  return res.data; // { folders: [...], files: [...], breadcrumb: [...] }
};
