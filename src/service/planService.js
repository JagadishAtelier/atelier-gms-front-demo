// src/service/planService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/gms/plan/plan`;

const buildHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Robust FormData builder:
 * - Appends File objects directly
 * - Serializes arrays/objects with JSON.stringify
 * - Appends primitives as strings
 */
const buildFormData = (payload) => {
  const formData = new FormData();

  if (!payload) return formData;

  Object.keys(payload).forEach((key) => {
    const value = payload[key];

    if (value === undefined || value === null) return;

    // If value is a File or Blob, append directly
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value, value.name || "file");
      return;
    }

    // If value is an array -> stringify (server can parse JSON string)
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // If value is a plain object -> stringify
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // primitives (string/number/boolean)
    formData.append(key, String(value));
  });

  return formData;
};

const planService = {
  /**
   * Create Plan (supports FormData or plain payload)
   * Pass in a FormData instance (recommended) or a plain object.
   */
  async createPlan(payload) {
    try {
      // If caller passed FormData -> send as-is
      const body = payload instanceof FormData ? payload : buildFormData(payload);

      // Do NOT set Content-Type here; browser/axios will set proper boundary
      const res = await axios.post(API_URL, body, {
        headers: {
          ...buildHeaders(),
          // DO NOT set "Content-Type": "multipart/form-data" manually
        },
      });

      return res.data;
    } catch (err) {
      // Normalize server error
      throw err.response?.data || err;
    }
  },

  /**
   * Get All Plans
   */
  async getPlans(options = {}) {
    try {
      const params = { ...options };
      const res = await axios.get(API_URL, {
        params,
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * Get Plan by ID
   */
  async getPlanById(id) {
    try {
      const res = await axios.get(`${API_URL}/${encodeURIComponent(id)}`, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * Update Plan (supports file upload)
   */
  async updatePlan(id, payload) {
    try {
      const body = payload instanceof FormData ? payload : buildFormData(payload);
      const res = await axios.put(`${API_URL}/${encodeURIComponent(id)}`, body, {
        headers: {
          ...buildHeaders(),
          // DO NOT set Content-Type manually
        },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * Soft Delete Plan
   */
  async deletePlan(id) {
    try {
      const res = await axios.delete(`${API_URL}/${encodeURIComponent(id)}`, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * Restore Soft Deleted Plan
   */
  async restorePlan(id) {
    try {
      const res = await axios.patch(
        `${API_URL}/${encodeURIComponent(id)}/restore`,
        {},
        {
          headers: { ...buildHeaders() },
        }
      );
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },
};

export default planService;
