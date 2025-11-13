// src/service/membermembershipService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // adjust path if needed

// Backend base URL for membermembership routes
const API_URL = `${BASE_API}/gms/member/membermembership`;

const buildHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const membermembershipService = {
  /**
   * Create a new Member-Membership record
   */
  async createMemberMembership(payload) {
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
   * Get all Member-Membership records (with optional filters & pagination)
   */
  async getAllMemberMemberships(options = {}) {
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
   * Get single Member-Membership by ID
   */
  async getMemberMembershipById(id) {
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
   * Update Member-Membership by ID
   */
  async updateMemberMembership(id, payload) {
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
   * Soft delete Member-Membership by ID
   */
  async deleteMemberMembership(id) {
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
   * Restore soft-deleted Member-Membership
   */
  async restoreMemberMembership(id) {
    try {
      const res = await axios.patch(`${API_URL}/${encodeURIComponent(id)}/restore`, {}, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },
  async getActiveMembershipsByMemberId(memberId) {
    try {
      const res = await axios.get(`${API_URL}/member/${encodeURIComponent(memberId)}/active`, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get All Memberships by Member ID (active + expired + upcoming)
   */
  async getAllMembershipsByMemberId(memberId) {
    try {
      const res = await axios.get(`${API_URL}/member/${encodeURIComponent(memberId)}/all`, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },
};

export default membermembershipService;
