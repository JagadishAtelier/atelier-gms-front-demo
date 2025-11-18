// src/service/assignplanService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/gms/plan/assignplan`;

const buildHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const assignplanService = {
  /**
   * ✅ Create an Assigned Plan
   */
  async createAssignPlan(payload) {
    try {
      const res = await axios.post(API_URL, payload, {
        headers: {
          ...buildHeaders(),
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get All Assigned Plans (search, pagination, filtering)
   */
  async getAssignedPlans(options = {}) {
    try {
      const res = await axios.get(API_URL, {
        params: options,
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get Assigned Plan By ID
   */
  async getAssignedPlanById(id) {
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
   * ✅ Update Assigned Plan
   */
  async updateAssignedPlan(id, payload) {
    try {
      const res = await axios.put(
        `${API_URL}/${encodeURIComponent(id)}`,
        payload,
        {
          headers: {
            ...buildHeaders(),
            "Content-Type": "application/json",
          },
        }
      );
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ❌ Soft Delete Assigned Plan
   */
  async deleteAssignedPlan(id) {
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
   * ♻ Restore Soft Deleted Assigned Plan
   */
  async restoreAssignedPlan(id) {
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

export default assignplanService;
