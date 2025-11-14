// src/service/planService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/gms/plan/plan`;

const buildHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const planService = {
  /**
   * ✅ Create Plan
   */
  async createPlan(payload) {
    try {
      const res = await axios.post(API_URL, payload, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get All Plans (pagination, filters, search)
   */
  async getPlans(options = {}) {
    try {
      const params = { ...options };
      const res = await axios.get(API_URL, {
        params,
        headers: { ...buildHeaders() },
      });
      return res.data; // { total, currentPage, totalPages, data }
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get Plan by ID
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
   * ✅ Update Plan
   */
  async updatePlan(id, payload) {
    try {
      const res = await axios.put(
        `${API_URL}/${encodeURIComponent(id)}`,
        payload,
        {
          headers: { ...buildHeaders() },
        }
      );
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Soft Delete Plan
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
   * ✅ Restore Soft Deleted Plan
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
