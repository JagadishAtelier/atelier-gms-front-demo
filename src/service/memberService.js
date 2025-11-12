// src/service/memberService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/gms/member/member`;

const buildHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const memberService = {
  /**
   * ✅ Create Member
   */
  async createMember(payload) {
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
   * ✅ Get All Members (with filters, pagination, search)
   */
  async getMembers(options = {}) {
    try {
      const params = { ...options }; // axios skips undefined values automatically
      const res = await axios.get(API_URL, {
        params,
        headers: { ...buildHeaders() },
      });
      return res.data; // expected: { total, currentPage, totalPages, data }
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get Member by ID
   */
  async getMemberById(id) {
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
   * ✅ Update Member
   */
  async updateMember(id, payload) {
    try {
      const res = await axios.put(`${API_URL}/${encodeURIComponent(id)}`, payload, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Soft Delete Member
   */
  async deleteMember(id) {
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
   * ✅ Restore Soft Deleted Member
   */
  async restoreMember(id) {
    try {
      const res = await axios.patch(`${API_URL}/${encodeURIComponent(id)}/restore`, {}, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

};

export default memberService;
