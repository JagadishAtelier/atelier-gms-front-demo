// src/service/remainderemailService.js

import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

// Backend base URL for remainder mail routes
const API_URL = `${BASE_API}/gms/mail/remaindermail`;

const buildHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const remainderemailService = {
  /**
   * 📩 Send Reminder Emails to ALL unpaid/expiring members
   */
  async sendAllRemainderEmails() {
    try {
      const res = await axios.post(
        `${API_URL}/send-all`,
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

  /**
   * 📩 Send Reminder Email to a single member
   * @param {string | number} id - member_membership_id
   */
  async sendSingleRemainderEmail(id) {
    try {
      const res = await axios.post(
        `${API_URL}/send/${encodeURIComponent(id)}`,
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

  /**
   * 📩 NEW — Send Next Payment Reminder by Member ID
   * @param {string | number} member_id
   */
  async sendNextPaymentReminder(member_id) {
    try {
      const res = await axios.post(
        `${API_URL}/member/${encodeURIComponent(member_id)}/next-payment`,
        {},
        {
          headers: { ...buildHeaders() },
        }
      );
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  }
};

export default remainderemailService;
