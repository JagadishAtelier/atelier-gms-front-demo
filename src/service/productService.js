// src/service/productService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/gms/product`;

const buildHeaders = (extra = {}) => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}`, ...extra } : { ...extra };
};

const productService = {
  /**
   * ✅ Create Product
   * Accepts either:
   *  - payload: plain object -> sent as JSON
   *  - payload: FormData -> sent as multipart/form-data (do NOT set Content-Type manually)
   */
  async createProduct(payload) {
    try {
      const isForm = typeof FormData !== "undefined" && payload instanceof FormData;

      const headers = buildHeaders(isForm ? {} : { "Content-Type": "application/json" });

      const res = await axios.post(`${API_URL}/product`, payload, {
        headers,
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Bulk Upload Products (CSV / Excel)
   * file: File instance (browser) or Buffer (node)
   */
  async bulkUpload(file) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      // Let browser/axios set Content-Type including boundary
      const res = await axios.post(`${API_URL}/product-bulk-upload`, formData, {
        headers: {
          ...buildHeaders(), // don't set Content-Type explicitly
        },
      });

      return res.data; // { success: [...], failed: [...] }
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get All Products (filters, pagination, search)
   */
  async getProducts(options = {}) {
    try {
      const params = { ...options };
      const res = await axios.get(`${API_URL}/product`, {
        params,
        headers: { ...buildHeaders() },
      });
      return res.data; // { total, currentPage, totalPages, data }
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get Product by ID
   */
  async getProductById(id) {
    try {
      const res = await axios.get(`${API_URL}/product/${encodeURIComponent(id)}`, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Update Product
   * id: product id
   * payload: either plain object (JSON) or FormData (multipart)
   */
  async updateProduct(id, payload) {
    try {
      const isForm = typeof FormData !== "undefined" && payload instanceof FormData;
      const headers = buildHeaders(isForm ? {} : { "Content-Type": "application/json" });

      const res = await axios.put(`${API_URL}/product/${encodeURIComponent(id)}`, payload, {
        headers,
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Soft Delete Product
   */
  async deleteProduct(id) {
    try {
      const res = await axios.delete(`${API_URL}/product/${encodeURIComponent(id)}`, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Restore Soft Deleted Product
   */
  async restoreProduct(id) {
    try {
      const res = await axios.patch(`${API_URL}/product/${encodeURIComponent(id)}/restore`, {}, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },
};

export default productService;
