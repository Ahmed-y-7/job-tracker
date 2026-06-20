import { defineStore } from "pinia";
import { ref } from "vue";

export const useThemeStore = defineStore("theme", () => {
  const isDark = ref(false);

  function apply() {
    document.documentElement.classList.toggle("dark", isDark.value);
  }

  // On load: use saved choice, else fall back to the OS preference.
  function init() {
    const saved = localStorage.getItem("theme");
    isDark.value = saved
      ? saved === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    apply();
  }

  function toggle() {
    isDark.value = !isDark.value;
    localStorage.setItem("theme", isDark.value ? "dark" : "light");
    apply();
  }

  return { isDark, init, toggle };
});
