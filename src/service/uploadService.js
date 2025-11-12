// src/service/uploadService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js"; // make sure this path matches your project

const handleImageUpload = async (file) => {
  if (!file) throw new Error("No file provided for upload");

  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`${BASE_API}/gms/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Expect response like { url: 'https://...' } or { data: { url: '...' } }
  return response.data?.url || response.data;
};

export default { handleImageUpload };
