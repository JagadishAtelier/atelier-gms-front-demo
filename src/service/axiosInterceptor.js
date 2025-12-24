import axios from "axios";

// ✅ Global response interceptor
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 403) {
      // 🔥 Clear everything
      localStorage.clear();

      // 🔁 Redirect to login page
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default axios;
