import { createRouter, createWebHistory } from "vue-router";
import { getToken } from "../api";
import Login from "../pages/Login.vue";
import Signup from "../pages/Signup.vue";
import AppLayout from "../components/AppLayout.vue";
import Board from "../pages/Board.vue";
import Dashboard from "../pages/Dashboard.vue";
import Companies from "../pages/Companies.vue";
import Profile from "../pages/Profile.vue";

const routes = [
  { path: "/login", component: Login, meta: { public: true } },
  { path: "/signup", component: Signup, meta: { public: true } },
  {
    path: "/",
    component: AppLayout,
    children: [
      { path: "", component: Board },
      { path: "dashboard", component: Dashboard },
      { path: "companies", component: Companies },
      { path: "profile", component: Profile },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Redirect to /login if not authenticated; away from login if already in.
router.beforeEach((to) => {
  const hasToken = !!getToken();
  if (!to.meta.public && !hasToken) return "/login";
  if (to.meta.public && hasToken) return "/";
});

export default router;
