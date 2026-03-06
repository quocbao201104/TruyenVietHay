<template>
  <div class="top-stories-table-xianxia">
    <div v-if="loading" class="spirit-loading-overlay">
      <i class="fas fa-yin-yang fa-spin text-4xl mb-3"></i>
      <span>Đang cảm ứng Thiên Bảng...</span>
    </div>

    <div v-else-if="!loading && stories.length === 0" class="no-spirit-data">
      <i class="fas fa-scroll"></i>
      <p>Thiên Bảng hiện tại đang trống rỗng.</p>
    </div>

    <div v-else class="spirit-table-wrapper scrollbar-magic">
      <table class="xianxia-table">
        <thead>
          <tr>
            <th class="rank-col text-center">Hạng</th>
            <th>Linh Vật</th>
            <th>Bí Tịch</th>
            <th>Đạo Hữu Sáng Tác</th>
            <th class="text-right">Tụ Khí (Lượt Xem)</th>
            <th class="text-center">Pháp Quyết</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(story, idx) in stories" :key="story.id" class="spirit-row">
            <td class="rank-col">
              <div class="rank-orb-container">
                <div class="rank-orb" :class="`top-${idx + 1}`">{{ idx + 1 }}</div>
              </div>
            </td>
            
            <td class="cover-cell">
              <div class="cover-glow-wrap">
                <img
                  v-if="story.anh_bia"
                  :src="getImageUrl(story.anh_bia)"
                  @error="handleImageError"
                  alt="Cover"
                  class="story-cover-img"
                  crossorigin="anonymous"
                />
                <div v-else class="no-cover-spirit"><i class="fas fa-image"></i></div>
              </div>
            </td>
            
            <td class="title-cell">
              <router-link :to="`/truyen-chu/${story.slug}`" class="story-title-link">
                {{ story.ten_truyen }}
              </router-link>
            </td>
            
            <td class="author-cell">
              <i class="fas fa-feather-pointed mr-1 opacity-50"></i> 
              {{ story.tac_gia || "Ẩn Danh" }}
            </td>
            
            <td class="text-right views-cell">
              <span class="view-count-badge">
                <i class="fas fa-eye mr-1"></i>
                {{ (story.luot_xem || 0).toLocaleString("vi-VN") }}
              </span>
            </td>
            
            <td class="text-center">
              <router-link :to="`/truyen-chu/${story.slug}`" class="btn-spirit-view" title="Lĩnh Hội Bí Tịch">
                <i class="fas fa-book-open"></i>
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getImageUrl } from "@/config/constants";

interface TopStory {
  id: number;
  ten_truyen: string;
  slug: string;
  luot_xem: number;
  tac_gia?: string;
  anh_bia?: string | null;
}

defineProps<{
  stories: TopStory[];
  loading?: boolean;
}>();

const handleImageError = (e: Event) => {
  const target = e.target as HTMLImageElement;
  const parent = target.parentElement;
  if (parent) {
    parent.innerHTML = '<div class="no-cover-spirit"><i class="fas fa-image"></i></div>';
  }
};
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap");

.top-stories-table-xianxia {
  background: rgba(11, 15, 25, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(168, 85, 247, 0.2); /* Viền Aura Tím */
  position: relative;
  font-family: 'Be Vietnam Pro', sans-serif;
  color: #e2e8f0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

/* --- TRẠNG THÁI LOADING & TRỐNG --- */
.spirit-loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(5, 8, 15, 0.8);
  backdrop-filter: blur(5px);
  z-index: 10;
  color: #a855f7;
  font-weight: 700;
  letter-spacing: 1px;
}

.no-spirit-data {
  padding: 4rem 2rem;
  text-align: center;
  color: #64748b;
  font-weight: 600;
}
.no-spirit-data i { font-size: 3rem; margin-bottom: 1rem; opacity: 0.4; color: #a855f7; }

/* --- BẢNG THIÊN BẢNG (TABLE) --- */
.spirit-table-wrapper {
  overflow-x: auto;
}

/* Custom Scrollbar */
.scrollbar-magic::-webkit-scrollbar { height: 6px; }
.scrollbar-magic::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
.scrollbar-magic::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.3); border-radius: 10px; }
.scrollbar-magic::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.6); }

.xianxia-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
}

th {
  background: rgba(168, 85, 247, 0.05);
  padding: 1rem;
  text-align: left;
  font-weight: 800;
  color: #a855f7;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.8rem;
  border-bottom: 1px solid rgba(168, 85, 247, 0.2);
  white-space: nowrap;
}

td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  vertical-align: middle;
}

.spirit-row { transition: all 0.3s ease; }
.spirit-row:hover { background: rgba(168, 85, 247, 0.08); }
.spirit-row:hover td { border-color: rgba(168, 85, 247, 0.1); }

/* --- LỆNH BÀI (RANK ORB) --- */
.rank-col { width: 60px; }
.rank-orb-container { display: flex; justify-content: center; }
.rank-orb {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 900; font-size: 0.9rem; color: #94a3b8; 
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
}

.rank-orb.top-1 { background: linear-gradient(135deg, #fbbf24, #d97706); color: #fff; border: none; box-shadow: 0 0 15px rgba(251, 191, 36, 0.4); text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
.rank-orb.top-2 { background: linear-gradient(135deg, #cbd5e1, #94a3b8); color: #0f172a; border: none; box-shadow: 0 0 15px rgba(203, 213, 225, 0.2); }
.rank-orb.top-3 { background: linear-gradient(135deg, #b45309, #78350f); color: #fff; border: none; box-shadow: 0 0 15px rgba(180, 83, 9, 0.3); }

/* --- ẢNH BÌA --- */
.cover-cell { width: 60px; }
.cover-glow-wrap {
  width: 45px; height: 60px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
  position: relative;
}
.story-cover-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
.spirit-row:hover .story-cover-img { transform: scale(1.1); }

.no-cover-spirit { width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; color: #475569; }

/* --- TEXT INFO --- */
.title-cell { max-width: 250px; }
.story-title-link {
  font-weight: 700;
  color: #f1f5f9;
  text-decoration: none;
  font-size: 0.95rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.2s;
}
.story-title-link:hover { color: #a855f7; text-shadow: 0 0 10px rgba(168, 85, 247, 0.3); }

.author-cell { color: #94a3b8; font-size: 0.85rem; font-weight: 500; }

.views-cell { font-weight: 700; color: #cbd5e1; }
.view-count-badge {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399; /* Xanh ngọc lục bảo cho Lượt xem */
  padding: 4px 10px;
  border-radius: 50px;
  font-size: 0.8rem;
  border: 1px solid rgba(52, 211, 153, 0.2);
}

/* --- NÚT HÀNH ĐỘNG --- */
.text-right { text-align: right; }
.text-center { text-align: center; }

.btn-spirit-view {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  color: #a855f7;
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.2);
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.btn-spirit-view:hover {
  background: linear-gradient(135deg, #a855f7, #d946ef);
  color: #fff;
  border-color: transparent;
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 5px 15px rgba(168, 85, 247, 0.4);
}
</style>