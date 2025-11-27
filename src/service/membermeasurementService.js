// src/service/membermeasurementService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // adjust if path differs

// Backend base URL for membermeasurement routes
const API_URL = `${BASE_API}/gms/member/membermeasurement`;

const buildHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const membermeasurementService = {
  /**
   * ✅ Create a new Member Measurement
   */
  async createMemberMeasurement(payload) {
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
   * ✅ Get all measurements (with optional filters & pagination)
   */
  async getAllMemberMeasurements(options = {}) {
    try {
      const res = await axios.get(API_URL, {
        params: { ...options },
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get measurement by ID
   */
  async getMemberMeasurementById(id) {
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
   * ✅ Get all measurements for a specific member
   */
  async getMeasurementsByMemberId(memberId) {
    try {
      const res = await axios.get(
        `${API_URL}/member/${encodeURIComponent(memberId)}`,
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
   * ✅ Update measurement by ID
   */
  async updateMemberMeasurement(id, payload) {
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
   * ✅ Soft delete measurement
   */
  async deleteMemberMeasurement(id) {
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
   * ✅ Restore soft deleted measurement
   */
  async restoreMemberMeasurement(id) {
    try {
      const res = await axios.patch(
        `${API_URL}/${encodeURIComponent(id)}/restore`,
        {},
        { headers: { ...buildHeaders() } }
      );
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },
};

export default membermeasurementService;
