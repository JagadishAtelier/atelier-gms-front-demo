// src/service/membershipService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // adjust path if your authService is elsewhere

const API_URL = `${BASE_API}/gms/membership/membership`;

const buildHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const membershipService = {
  async createMembership(payload) {
    try {
      const res = await axios.post(API_URL, payload, {
        headers: {
          ...buildHeaders(),
        },
      });
      return res.data;
    } catch (err) {
      // normalize error
      throw err.response?.data || err;
    }
  },


  async getMemberships(options = {}) {
    try {
      const params = { ...options }; // axios will skip undefined values
      const res = await axios.get(API_URL, {
        params,
        headers: { ...buildHeaders() },
      });
      return res.data; // expected: { total, currentPage, totalPages, data }
    } catch (err) {
      throw err.response?.data || err;
    }
  },


  async getMembershipById(id) {
    try {
      const res = await axios.get(`${API_URL}/${encodeURIComponent(id)}`, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },


  async updateMembership(id, payload) {
    try {
      const res = await axios.put(`${API_URL}/${encodeURIComponent(id)}`, payload, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },


  async deleteMembership(id) {
    try {
      const res = await axios.delete(`${API_URL}/${encodeURIComponent(id)}`, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },


  async restoreMembership(id) {
    try {
      const res = await axios.patch(`${API_URL}/${encodeURIComponent(id)}/restore`, {}, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },


  async checkNameExists(name) {
    try {
      const res = await axios.get(`${API_URL}/exists`, {
        params: { name },
        headers: { ...buildHeaders() },
      });
      return res.data.exists;
    } catch (err) {
      throw err.response?.data || err;
    }
  },
};

export default membershipService;
