import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import StoryListView from "@/modules/storyText/views/StoryListView.vue";
import CategoryView from "@/views/CategoryView.vue";
import ProfileView from "@/views/ProfileView.vue";
import ProfileSettingsView from "@/views/ProfileSettingsView.vue";
import AdminUserManagementView from "@/views/admin/AdminUserManagementView.vue";
import AdminStoryManagementView from "@/views/admin/AdminStoryManagementView.vue"; // Import this
import SubmitStoryView from "@/views/SubmitStoryView.vue"; 
import FavoritesView from "@/views/FavoritesView.vue"; 
import HistoryView from "@/views/HistoryView.vue"; 
import TopView from "@/views/TopView.vue";
import SearchView from "@/views/SearchView.vue"; 
import RankingView from "@/views/RankingView.vue";
import TasksView from "@/views/TasksView.vue";

import { useAuthStore } from "@/modules/auth/auth.store";
import StoryDetailView from "@/views/StoryDetailView.vue";
import ChapterView from "@/views/ChapterView.vue";
import AuthorChapterManagementView from "@/views/Author/AuthorChapterManagementView.vue";
import AuthorChapterEditor from "@/views/Author/AuthorChapterEditor.vue";
import AuthorStoryManagementView from "@/views/Author/AuthorStoryManagementView.vue";
import AuthorDashboardView from "@/views/AuthorDashboardView.vue";
const routes: Array<RouteRecordRaw> = [
    { path: "/", name: "Home", component: HomeView },
    { path: "/dang-nhap", name: "Login", component: LoginView },
    {
        path: "/dang-ky",
        name: "Register",
        component: RegisterView,
    },
    {
        path: "/truyen-chu",
        name: "StoryList",
        component: StoryListView,
    },
    {
        path: "/the-loai",
        name: "Categories",
        component: CategoryView,
    },
    {
        path: "/the_loai/:id",
        name: "StoriesByCategory",
        component: StoryListView,
        props: true,
    },
    {
        path: "/truyen-chu/:slug",
        name: "StoryDetail",
        component: StoryDetailView,
    },
    {
        path: "/truyen-chu/:storySlug/:chapterSlug",
        name: "ChapterRead",
        component: ChapterView,
    },
    {
        path: "/user/thong-tin-ca-nhan",
        name: "Profile",
        component: ProfileView,
        meta: { requiresAuth: true },
    },
    {
        path: "/user/cai-dat-thong-tin",
        name: "ProfileSettings",
        component: ProfileSettingsView,
        meta: { requiresAuth: true },
    },
    {
        path: "/user/truyen-theo-doi",
        name: "Favorites",
        component: FavoritesView,
        meta: { requiresAuth: true },
    },
    {
        path: "/nhiem-vu",
        name: "Tasks",
        component: TasksView,
        meta: { requiresAuth: true },
    },
    {
        path: "/user/lich-su-doc",
        name: "History",
        component: HistoryView,
        meta: { requiresAuth: true },
    },
    {
        path: "/truyen-hot",
        name: "TopView",
        component: TopView,
    },
    {
        path: "/xep-hang",
        name: "Ranking",
        component: RankingView,
    },
    {
        path: "/tim-kiem",
        name: "SearchView",
        component: SearchView,
    },
    {
        path: "/admin/quan-ly-nguoi-dung",
        name: "AdminManageUsers",
        component: AdminUserManagementView,
        meta: { requiresAuth: true, requiredRole: ["admin"] },
    },
    {
        path: "/user/quan-ly-truyen",
        name: "AuthorStoryManagement",
        component: AuthorStoryManagementView,
        meta: { requiresAuth: true, role: "author" },
    },
    {
        path: "/user/dashboard",
        name: "AuthorDashboard",
        component: AuthorDashboardView,
        meta: { requiresAuth: true, role: "author" },
    },
    {
        path: "/admin/quan-ly-truyen", // New route for Admin Story Management
        name: "AdminManageStories",
        component: AdminStoryManagementView,
        meta: { requiresAuth: true, requiredRole: ["admin"] },
    },
    {
        path: "/dang-truyen/:id?",
        name: "SubmitStory",
        component: SubmitStoryView, 
        meta: { requiresAuth: true, requiredRole: ['author', 'admin'] }, 
    },
    {
        path: "/author/story/:storyId/chapters",
        name: "AuthorChapterManagement",
        component: AuthorChapterManagementView,
        meta: { requiresAuth: true, role: "author" },
    },
    {
        path: "/author/story/:storyId/chapter/add",
        name: "AuthorAddChapter",
        component: AuthorChapterEditor,
        meta: { requiresAuth: true, role: "author" },
    },
     {
        path: "/author/story/:storyId/chapter/:chapterId/edit",
        name: "AuthorEditChapter",
        component: AuthorChapterEditor,
        meta: { requiresAuth: true, role: "author" },
    },
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@/views/NotFoundView.vue"), 
    },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition;

    if (to.name === 'story-detail') {
      return { top: 0 };
    }

    return false; // giữ scroll cho list
  },
});

router.afterEach((to, from) => {
  const attemptScrollToTop = () => {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
      document.documentElement.scrollTop = 0;
      const app = document.getElementById('app');
      if (app) app.scrollTop = 0;
  };

  // Immediate
  attemptScrollToTop();

  // Frame 1
  requestAnimationFrame(() => {
    attemptScrollToTop();
    // Frame 2
    requestAnimationFrame(() => {
      attemptScrollToTop();
    });
  });
});

router.beforeEach(async (to, from, next) => {
    // FIX: Blur active element (button/link) before navigation to prevent
    // browser from restoring scroll position to that element on the new page.
    if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
    }

    const authStore = useAuthStore();
    if (!authStore.isInitialized) {
        try {
            await authStore.initialize();
        } catch (error) {
            console.error("Auth store initialization failed:", error);
            authStore.clearAuth(); 
            return next({ name: "Login", query: { toast: "session_expired" } });
        }
    }

    const isAuthPage = to.name === "Login" || to.name === "Register";
    if (isAuthPage && authStore.isLoggedIn) {
        return next({ 
            name: from.fullPath === "/truyen-chu" ? "StoryList" : "Home", 
            query: { toast: "already_logged_in" } 
        });
    }

    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiredRoles = to.meta.requiredRole as string[] | undefined;

    if (requiresAuth && !authStore.isLoggedIn) {
        next({ name: "Login", query: { toast: "session_expired" } });
    } else if (requiresAuth && authStore.isLoggedIn && requiredRoles) {
        if (!authStore.user || !requiredRoles.includes(authStore.user.role)) {
            next({ name: "Home", query: { toast: "unauthorized" } });
        } else {
            next(); 
        }
    } else {
        next();
    }
});

export default router;