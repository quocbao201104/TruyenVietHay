<template>
  <div class="admin-dashboard-page-xianxia">
    <main class="dashboard-container-aura">
      
      <!-- TIÊU ĐỀ TỐI CAO -->
      <div class="page-header-spirit animate-fadeIn">
        <h1 class="page-title-glow-admin">Thiên Cơ Lệnh</h1>
        <p class="page-subtitle">Linh đài chưởng quản - Điều phối vạn vật trong cõi TruyenVietHay</p>
        <div class="header-divider-spirit admin">
          <div class="dot"></div>
        </div>
      </div>

      <!-- PHẦN 1: LINH ĐÀI TỔNG QUAN (3 CARDS) -->
      <section class="stats-aura-section">
        <div class="stats-spirit-grid-admin">
          <AuthorDashboardStatCard
            :value="overview.total_views"
            label="Vạn Giới Linh Khí (Tổng lượt xem)"
            icon="fas fa-eye"
            glow-color="#10b981"
          />
          <AuthorDashboardStatCard
            :value="overview.total_novels"
            label="Càn Khôn Bí Tịch (Tổng số truyện)"
            icon="fas fa-book"
            glow-color="#a78bfa"
          />
          <AuthorDashboardStatCard
            :value="overview.total_users"
            label="Chúng Sinh Đạo Hữu (Người dùng)"
            icon="fas fa-users"
            glow-color="#3b82f6"
          />
        </div>
      </section>

      <!-- PHẦN 2: THIÊN ĐỊA BIẾN ĐỘNG (CHART) -->
      <section class="chart-aura-section-admin animate-fadeIn">
        <div class="section-title-aura admin">
          <i class="fas fa-chart-line text-purple-400"></i>
          <h2>Thiên Địa Biến Động (7 ngày toàn hệ thống)</h2>
        </div>
        <div class="spirit-chart-wrapper-admin">
          <AuthorDashboardChart
            :key="chartKey"
            :labels="chartData.labels"
            :series="chartData.series"
            :loading="loading"
          />
        </div>
      </section>

      <!-- PHẦN 3: THIÊN BẢNG LINH THƯ (TOP 10) -->
      <section class="top-stories-section-admin">
        <div class="section-title-aura admin">
          <i class="fas fa-crown text-yellow-500"></i>
          <h2>Thiên Bảng Linh Thư (Top 10 Lượt Xem)</h2>
        </div>
        <div class="spirit-top-list-container">
          <AdminDashboardTopStories :stories="topStories" :loading="loading" />
        </div>
      </section>

      <!-- PHẦN 4: CHƯỞNG QUẢN LỆNH (QUICK LINKS) -->
      <section class="quick-links-aura">
        <div class="section-title-aura admin">
           <i class="fas fa-bolt-lightning text-purple-400"></i>
           <h2>Chưởng Quản Lệnh</h2>
        </div>
        <div class="quick-links-grid">
          <router-link to="/admin/quan-ly-truyen" class="quick-link-pill">
            <div class="pill-icon-box"><i class="fas fa-list-check"></i></div>
            <div class="pill-text">
               <span class="main">Chưởng Quản Bí Tịch</span>
               <span class="sub">Quản lý toàn bộ kho tàng truyện</span>
            </div>
          </router-link>

          <router-link to="/admin/quan-ly-nguoi-dung" class="quick-link-pill">
            <div class="pill-icon-box blue"><i class="fas fa-users-gear"></i></div>
            <div class="pill-text">
               <span class="main">Khống Chế Chúng Sinh</span>
               <span class="sub">Quản lý đạo hữu & tu vi</span>
            </div>
          </router-link>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getAdminDashboard } from "@/modules/admin/admin.api";
import AuthorDashboardStatCard from "@/components/author/AuthorDashboardStatCard.vue";
import AuthorDashboardChart from "@/components/author/AuthorDashboardChart.vue";
import AdminDashboardTopStories from "@/components/admin/AdminDashboardTopStories.vue";
import { useAppToast } from "@/composables/useAppToast";

const { showErrorToast } = useAppToast();

const loading = ref(true);
const overview = ref({
  total_views: 0,
  total_novels: 0,
  total_users: 0,
});
const topStories = ref<
  { id: number; ten_truyen: string; slug: string; luot_xem: number; tac_gia?: string; anh_bia?: string | null }[]
>([]);
const chartData = ref<{
  labels: string[];
  series: { name: string; data: number[] }[];
}>({
  labels: [],
  series: [],
});
const chartKey = ref(0);

const fetchDashboard = async () => {
  loading.value = true;
  try {
    const res = await getAdminDashboard();
    overview.value = res.data.overview;
    topStories.value = res.data.top_stories || [];
    chartData.value = {
      labels: res.data.chart?.labels || [],
      series: res.data.chart?.series || [],
    };
    chartKey.value += 1;
  } catch (err) {
    showErrorToast("Không thể thỉnh dữ liệu Thiên Cơ Lệnh.");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDashboard();
});
</script>

<style scoped>
/* ===== CORE THEME ADMIN XIANXIA ===== */
.admin-dashboard-page-xianxia {
  min-height: 100vh;
  background: #0b0f19; /* Nền tối sâu đồng bộ */
  color: #cbd5e1;
  font-family: 'Be Vietnam Pro', sans-serif;
  padding-bottom: 80px;
}

.dashboard-container-aura {
  max-width: 1300px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* Page Header */
.page-header-spirit {
  text-align: center;
  margin-bottom: 60px;
}

.page-title-glow-admin {
  font-size: 3rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 6px;
  background: linear-gradient(to right, #a78bfa, #fff, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 15px rgba(167, 139, 250, 0.4));
}

.page-subtitle {
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.85rem;
  font-weight: 700;
  margin-top: 10px;
}

.header-divider-spirit {
  height: 1px;
  width: 300px;
  background: linear-gradient(90deg, transparent, #a78bfa, transparent);
  margin: 20px auto;
  position: relative;
}

.header-divider-spirit .dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);
  width: 10px; height: 10px; background: #a78bfa; box-shadow: 0 0 12px #a78bfa;
}

/* Section Titles */
.section-title-aura {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
}

.section-title-aura h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Stats Grid */
.stats-aura-section { margin-bottom: 50px; }
.stats-spirit-grid-admin {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 25px;
}

/* Chart Area */
.chart-aura-section-admin {
  background: #131b2c;
  border: 1px solid rgba(167, 139, 250, 0.2);
  border-radius: 30px;
  padding: 40px;
  margin-bottom: 50px;
  box-shadow: 0 15px 40px rgba(0,0,0,0.5);
}

.spirit-chart-wrapper-admin {
  background: #0b0f19;
  border-radius: 20px;
  padding: 25px;
  border: 1px solid rgba(255,255,255,0.03);
}

/* Top Stories Area */
.top-stories-section-admin { margin-bottom: 50px; }
.spirit-top-list-container {
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 30px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

/* Quick Links Area */
.quick-links-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.quick-link-pill {
  display: flex;
  align-items: center;
  padding: 20px 30px;
  background: #131b2c;
  border: 1px solid rgba(167, 139, 250, 0.1);
  border-radius: 100px; /* Pill style */
  text-decoration: none;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.quick-link-pill:hover {
  transform: translateX(15px);
  border-color: rgba(167, 139, 250, 0.5);
  background: #1a2436;
  box-shadow: 0 10px 25px rgba(167, 139, 250, 0.1);
}

.pill-icon-box {
  width: 50px; height: 50px;
  background: rgba(167, 139, 250, 0.1);
  border: 1px solid rgba(167, 139, 250, 0.3);
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.2rem; color: #a78bfa;
  margin-right: 20px; flex-shrink: 0;
}

.pill-icon-box.blue {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
  color: #3b82f6;
}

.pill-text { display: flex; flex-direction: column; }
.pill-text .main { color: #fff; font-weight: 800; font-size: 1.1rem; }
.pill-text .sub { color: #64748b; font-size: 0.8rem; font-weight: 600; }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.8s ease-out; }

/* Responsive */
@media (max-width: 1024px) {
  .stats-spirit-grid-admin { grid-template-columns: 1fr; }
  .quick-links-grid { grid-template-columns: 1fr; }
  .chart-aura-section-admin { padding: 25px 15px; }
  .page-title-glow-admin { font-size: 2.2rem; }
}
</style>