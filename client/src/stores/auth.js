import { defineStore } from "pinia";
import { ref } from "vue";
import api, { getToken, setToken, clearToken } from "../api";

// Pinia store holding the logged-in user and auth actions.
export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const loading = ref(true);

  // On app load, if we have a token, fetch the current user.
  async function fetchMe() {
    if (!getToken()) {
      loading.value = false;
      return;
    }
    try {
      const { data } = await api.get("/me");
      user.value = data;
    } catch {
      clearToken();
    } finally {
      loading.value = false;
    }
  }

  async function login(email, password) {
    const { data } = await api.post("/auth/login", { email, password });
    setToken(data.token);
    user.value = data.user;
  }

  async function signup(email, password) {
    const { data } = await api.post("/auth/signup", { email, password });
    setToken(data.token);
    user.value = data.user;
  }

  function logout() {
    clearToken();
    user.value = null;
  }

  async function updateProfile(name, email) {
    const { data } = await api.put("/auth/profile", { name, email });
    user.value = { ...user.value, name: data.name, email: data.email };
  }

  async function changePassword(currentPassword, newPassword) {
    await api.put("/auth/password", { currentPassword, newPassword });
  }

  return { user, loading, fetchMe, login, signup, logout, updateProfile, changePassword };
});
