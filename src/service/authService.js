// src/services/authService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";

const API_URL = `${BASE_API}/user`;

// ✅ Helper to set token in headers
const authHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const authService = {
  /**
   * ✅ Login (email or phone + password)
   */
  async login(identifier, password) {
    const res = await axios.post(`${API_URL}/login`, { identifier, password });
    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    }
    return res.data;
  },

  /**
   * ✅ Logout (clear localStorage + notify backend)
   */
  async logout() {
    try {
      await axios.post(`${API_URL}/logout`, {}, { headers: authHeader() });
    } catch (err) {
      console.warn("Logout request failed (ignoring):", err.message);
    }
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * ✅ Get currently logged-in user (profile)
   */
  async getProfile() {
    const res = await axios.get(`${API_URL}/me/profile`, {
      headers: authHeader(),
    });
    return res.data;
  },

  /**
   * ✅ Refresh token
   */
  async refreshToken() {
    const res = await axios.post(`${API_URL}/refresh-token`, {}, { headers: authHeader() });
    if (res.data?.token) {
      localStorage.setItem("token", res.data.token);
    }
    return res.data;
  },

  /**
   * ✅ Change password
   */
  async changePassword(oldPassword, newPassword) {
    const res = await axios.post(
      `${API_URL}/change-password`,
      { oldPassword, newPassword },
      { headers: authHeader() }
    );
    return res.data;
  },

  /**
   * ✅ Send OTP (mock)
   */
  async sendOtp(identifier) {
    const res = await axios.post(`${API_URL}/send-otp`, { identifier });
    return res.data;
  },

  /**
   * ✅ Check if user already exists
   */
  async checkUserExists(email) {
    const res = await axios.get(`${API_URL}/exists?email=${email}`);
    return res.data.exists;
  },

  /**
   * ✅ Get stored user/token
   */
  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  getToken() {
    return localStorage.getItem("token");
  },
};

export default authService;
