// src/services/attendanceService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js"; // adjust path if needed

// ✅ Safe base URL resolver for all environments (Vite, CRA, browser)
const API_BASE = BASE_API || "/api";

// Base URL for attendance routes
const API_URL = `${API_BASE}/gms/attendance/attendance`;

const buildHeaders = () => {
  const token = typeof authService.getToken === "function" ? authService.getToken() : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const attendanceService = {
  /**
   * ✅ Create Attendance Record
   */
  async createAttendance(payload) {
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
   * ✅ List Attendance records (supports filters & pagination)
   */
  async getAttendances(options = {}) {
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
   * ✅ Get Attendance by ID
   */
  async getAttendanceById(id) {
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
   * ✅ Update Attendance by ID
   */
  async updateAttendance(id, payload) {
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
   * ✅ Soft delete attendance by ID
   */
  async deleteAttendance(id) {
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
   * ✅ Restore soft-deleted attendance
   */
  async restoreAttendance(id) {
    try {
      const res = await axios.patch(`${API_URL}/${encodeURIComponent(id)}/restore`, {}, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Mark Sign In
   * body: { member_id, sign_in }
   */
  async signIn(payload) {
    try {
      const res = await axios.post(`${API_URL}/signin`, payload, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Mark Sign Out
   * body: { member_id, sign_out }
   */
  async signOut(payload) {
    try {
      const res = await axios.post(`${API_URL}/signout`, payload, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get Today Attendance by Member ID
   */
  async getTodayAttendance(memberId) {
    try {
      const res = await axios.get(`${API_URL}/member/${encodeURIComponent(memberId)}/today`, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get Attendance Summary by Member ID
   * options: { from_date, to_date, period, year, month, limit }
   */
  async getAttendanceSummary(memberId, options = {}) {
    try {
      const res = await axios.get(`${API_URL}/member/${encodeURIComponent(memberId)}/summary`, {
        params: { ...options },
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Bulk Import Attendance Records
   * body: [ { member_id, date, sign_in?, sign_out? }, ... ]
   */
  async bulkImport(records) {
    try {
      const res = await axios.post(`${API_URL}/bulk-import`, records, {
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },
};

export default attendanceService;
