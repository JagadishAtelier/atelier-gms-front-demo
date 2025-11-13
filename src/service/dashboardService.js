// src/service/dashboardService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/gms/dashboard/dashboard`;

const buildHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const dashboardService = {
  /**
   * ✅ Fetch Dashboard Statistics
   * Returns summarized data (e.g. totalMembers, activeMembers, totalRevenue, etc.)
   */
  async getDashboard() {
    try {
      const res = await axios.get(API_URL, {
        headers: { ...buildHeaders() },
      });
      return res.data; // expected: { data: {...}, message: "Dashboard fetched successfully" }
    } catch (err) {
      throw err.response?.data || err;
    }
  },
};

export default dashboardService;
