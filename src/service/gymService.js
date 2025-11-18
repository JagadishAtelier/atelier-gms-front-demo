// src/service/gymService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/gms/gym/gym`;

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

    // If file
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value, value.name || "file");
      return;
    }

    // Arrays → JSON
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // Objects → JSON
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // Primitives
    formData.append(key, String(value));
  });

  return formData;
};

const gymService = {
  /**
   * Create Gym (supports file upload)
   */
  async createGym(payload) {
    try {
      const body = payload instanceof FormData ? payload : buildFormData(payload);

      const res = await axios.post(API_URL, body, {
        headers: {
          ...buildHeaders(),
          // Let browser set multipart boundary
        },
      });

      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * Get All Gyms
   */
  async getGyms(options = {}) {
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
   * Get Gym by ID
   */
  async getGymById(id) {
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
   * Update Gym
   */
  async updateGym(id, payload) {
    try {
      const body = payload instanceof FormData ? payload : buildFormData(payload);

      const res = await axios.put(`${API_URL}/${encodeURIComponent(id)}`, body, {
        headers: {
          ...buildHeaders(),
        },
      });

      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * Soft Delete Gym
   */
  async deleteGym(id) {
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
   * Restore Soft Deleted Gym
   */
  async restoreGym(id) {
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

export default gymService;
