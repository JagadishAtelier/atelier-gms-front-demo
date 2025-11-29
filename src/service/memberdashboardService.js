// src/service/memberdashboardService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/gms/memberdashboard`;

const buildHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const memberdashboardService = {
  /**
   * ✅ Get Member Dashboard (member ID auto-detected from token)
   * Expected response shape: { status, message, data:{ total,currentPage,totalPages,data:[...] } }
   */
  async getMemberDashboard() {
    try {
      const user = await authService.getProfile().catch(() => authService.getCurrentUser());
      const memberId = user?.memberId || user?.member_id || user?.id || null;

      const res = await axios.get(`${API_URL}/dashboard`, {
        params: { memberId }, // backend will filter by token-detected memberId
        headers: { ...buildHeaders() },
      });

      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * ✅ Get all assigned plans filtered by Member ID (auto from token/profile)
   */
  async getAllAssignPlans(options = {}) {
    try {
      const user = await authService.getProfile().catch(() => authService.getCurrentUser());
      const memberId = user?.memberId || user?.member_id || user?.id || null;

      const res = await axios.get(`${API_URL}/dashboard/assignplans`, {
        params: { memberId, ...options }, // extra pagination/filter params optional
        headers: { ...buildHeaders() },
      });

      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * If you later want to refresh dashboard manually
   */
  async refreshDashboard() {
    return this.getMemberDashboard();
  }
};

export default memberdashboardService;
