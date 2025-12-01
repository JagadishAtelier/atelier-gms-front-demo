// src/service/planService.js
import axios from "axios";
import BASE_API from "../api/baseurl.js";
import authService from "./authService.js";

const API_URL = `${BASE_API}/gms/plan/plan`;

const buildHeaders = () => {
  const token = authService.getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Robust FormData builder:
 * - Appends File objects directly
 * - Serializes arrays/objects with JSON.stringify
 * - Appends primitives as strings
 */
const buildFormData = (payload) => {
  const formData = new FormData();

  if (!payload) return formData;

  Object.keys(payload).forEach((key) => {
    const value = payload[key];

    if (value === undefined || value === null) return;

    // If value is a File or Blob, append directly
    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value, value.name || "file");
      return;
    }

    // If value is an array -> stringify (server can parse JSON string)
    if (Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // If value is a plain object -> stringify
    if (typeof value === "object") {
      formData.append(key, JSON.stringify(value));
      return;
    }

    // primitives (string/number/boolean)
    formData.append(key, String(value));
  });

  return formData;
};

/**
 * Helper: convert FormData instance (or a FormData-like object) into a plain JSON object.
 * - Tries to parse JSON strings back into arrays/objects when possible.
 * - Throws if File/Blob values are encountered because JSON cannot carry binary files.
 */
const formDataToJson = (formData) => {
  const obj = {};
  // FormData supports for..of iteration of [key, value]
  for (const [key, val] of formData.entries()) {
    // If value is a File/Blob, we cannot convert to JSON safely
    if (val instanceof File || val instanceof Blob) {
      // You can either skip or throw — throwing to make the caller aware.
      throw new Error(`Cannot convert FormData to JSON: field "${key}" contains a File/Blob.`);
    }

    const value = typeof val === "string" ? val : String(val);

    // Try to detect JSON-encoded arrays/objects and parse them
    const trimmed = value.trim();
    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        obj[key] = JSON.parse(trimmed);
        continue;
      } catch (e) {
        // not valid JSON, fallthrough to store as string
      }
    }

    // For booleans/numbers encoded as strings, attempt basic conversion
    if (/^(true|false)$/i.test(trimmed)) {
      obj[key] = trimmed.toLowerCase() === "true";
      continue;
    }
    if (!Number.isNaN(Number(trimmed)) && trimmed !== "") {
      // treat numeric strings as numbers
      obj[key] = Number(trimmed);
      continue;
    }

    obj[key] = value;
  }
  return obj;
};

const planService = {
  /**
   * Create Plan (now sends JSON)
   * Accepts:
   * - plain object payload (recommended)
   * - FormData instance (will be converted to JSON; **files are not supported** and will throw)
   */
  async createPlan(payload) {
    try {
      let jsonBody;

      if (payload instanceof FormData) {
        // convert FormData -> JSON object (will throw if File/Blob present)
        jsonBody = formDataToJson(payload);
      } else if (payload && typeof payload === "object") {
        // clone to avoid mutating caller object
        jsonBody = { ...payload };

        // If caller passed nested objects/arrays, ensure they are plain JSON (they already are)
        // If caller passed FormData-like entries, user should pass a plain object instead.
      } else {
        // primitives or empty -> wrap
        jsonBody = {};
      }

      // Ensure goals if present and is a stringified array, keep as array
      if (typeof jsonBody.goals === "string") {
        const trimmed = jsonBody.goals.trim();
        if ((trimmed.startsWith("[") && trimmed.endsWith("]")) || trimmed.includes(",")) {
          try {
            jsonBody.goals = JSON.parse(trimmed);
          } catch {
            // fallback to comma-split
            jsonBody.goals = trimmed.split(",").map((g) => g.trim()).filter(Boolean);
          }
        } else {
          jsonBody.goals = trimmed.length ? [trimmed] : [];
        }
      }

      // POST JSON body
      const res = await axios.post(API_URL, jsonBody, {
        headers: {
          ...buildHeaders(),
          "Content-Type": "application/json",
        },
      });

      return res.data;
    } catch (err) {
      // Normalize server error
      throw err.response?.data || err;
    }
  },

  /**
   * Get All Plans
   */
  async getPlans(options = {}) {
    try {
      const params = { ...options };
      const res = await axios.get(API_URL, {
        params,
        headers: { ...buildHeaders() },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * Get Plan by ID
   */
  async getPlanById(id) {
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
   * Update Plan (supports file upload)
   * NOTE: This still uses the previous behavior (FormData allowed). You can change to JSON similarly if needed.
   */
  async updatePlan(id, payload) {
    try {
      const body = payload instanceof FormData ? payload : buildFormData(payload);
      const res = await axios.put(`${API_URL}/${encodeURIComponent(id)}`, body, {
        headers: {
          ...buildHeaders(),
          // DO NOT set Content-Type manually for multipart; axios/browser will handle it.
        },
      });
      return res.data;
    } catch (err) {
      throw err.response?.data || err;
    }
  },

  /**
   * Soft Delete Plan
   */
  async deletePlan(id) {
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
   * Restore Soft Deleted Plan
   */
  async restorePlan(id) {
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

export default planService;
