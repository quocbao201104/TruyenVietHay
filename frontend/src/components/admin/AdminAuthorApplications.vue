<template>
  <div class="admin-author-applications">
    <div class="section-header">
      <div class="section-title-aura admin">
        <i class="fas fa-feather-pointed text-amber-500"></i>
        <h2>Đơn Đăng Ký Tác Giả (Chờ Duyệt)</h2>
      </div>
      <button @click="fetchApplications" class="refresh-btn" :disabled="loading">
        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <span class="loader"></span>
      <p>Đang thỉnh nạp đơn từ Linh Đài...</p>
    </div>

    <div v-else-if="applications.length === 0" class="empty-state">
      <i class="fas fa-leaf text-emerald-400 opacity-30 text-4xl mb-3"></i>
      <p>Yên tĩnh như tờ, không có đơn nào cần xử lý.</p>
    </div>

    <div v-else class="applications-table-wrapper">
      <table class="spirit-table">
        <thead>
          <tr>
            <th>Đạo Hữu</th>
            <th>Bút Danh</th>
            <th>Ngày Gửi</th>
            <th>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="app in applications" :key="app.id" class="app-row">
            <td>
              <div class="user-info">
                <span class="username">@{{ app.username }}</span>
                <span class="full-name">{{ app.full_name }}</span>
              </div>
            </td>
            <td><span class="pen-name">{{ app.pen_name }}</span></td>
        
            
            <td><span class="date">{{ formatDate(app.created_at) }}</span></td>
            <td class="actions">
              <button @click="openDetail(app)" class="action-btn detail">
                <i class="fas fa-eye"></i> Chi tiết
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- MODAL CHI TIẾT -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-content spirit-aura-border">
            <button class="close-btn" @click="closeModal">
              <i class="fas fa-times"></i>
            </button>

            <div class="modal-header">
              <i class="fas fa-scroll icon-gold"></i>
              <h3>Thông Tin Đơn Đăng Ký</h3>
            </div>

            <div class="modal-body" v-if="selectedApp">
              <div class="info-grid">
                <div class="info-item">
                  <label>Đạo Hữu:</label>
                  <p>{{ selectedApp.full_name }} (@{{ selectedApp.username }})</p>
                </div>
                <div class="info-item">
                  <label>Bút Danh:</label>
                  <p class="highlight-text">{{ selectedApp.pen_name }}</p>
                </div>
                <div class="info-item full-width">
                  <label>Giới Thiệu Bản Thân:</label>
                  <div class="content-box">{{ selectedApp.bio || 'Không có giới thiệu.' }}</div>
                </div>
                <div class="info-item full-width">
                  <label>Kinh Nghiệm / Tác Phẩm Mẫu:</label>
                  <div class="content-box">{{ selectedApp.experience || 'Chưa cung cấp kinh nghiệm.' }}</div>
                </div>
                <div class="info-item">
                  <label>Thời Gian Gửi Đơn:</label>
                  <p>{{ formatDate(selectedApp.created_at) }}</p>
                </div>
              </div>

              <div class="modal-footer-actions">
                <button 
                  @click="handleApprove(selectedApp.id)" 
                  class="action-btn approve large" 
                  :disabled="processing === selectedApp.id"
                >
                  <i class="fas fa-check-circle"></i> Phê Duyệt Đạo Quả
                </button>
                <button 
                  @click="handleReject(selectedApp.id)" 
                  class="action-btn reject large" 
                  :disabled="processing === selectedApp.id"
                >
                  <i class="fas fa-times-circle"></i> Từ Chối Duyên Phận
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { getAuthorApplications, approveAuthorApplication, rejectAuthorApplication } from '@/modules/admin/admin.api';
import { useToast } from 'vue-toastification';

const applications = ref<any[]>([]);
const loading = ref(false);
const processing = ref<number | null>(null);
const showModal = ref(false);
const selectedApp = ref<any>(null);
const toast = useToast();

const fetchApplications = async () => {
  loading.value = true;
  try {
    const res = await getAuthorApplications('pending');
    applications.value = res.applications || [];
  } catch (error) {
    toast.error("Không thể tải danh sách đơn.");
  } finally {
    loading.value = false;
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('vi-VN', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const openDetail = (app: any) => {
  selectedApp.value = app;
  showModal.value = true;
};

const closeModal = () => {
  if (processing.value) return; // Không đóng khi đang xử lý
  showModal.value = false;
  selectedApp.value = null;
};

const handleApprove = async (id: number) => {
  if (!confirm("Xác nhận phê duyệt đạo hữu này trở thành Tác Giả?")) return;
  processing.value = id;
  try {
    await approveAuthorApplication(id);
    toast.success("Hợp đồng thành công! Đạo hữu đã trở thành Tác Giả.");
    applications.value = applications.value.filter(a => a.id !== id);
    closeModal();
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Phê duyệt thất bại.");
  } finally {
    processing.value = null;
  }
};

const handleReject = async (id: number) => {
  const note = prompt("Nhập lý do từ chối duyên phận (không bắt buộc):");
  if (note === null) return; // Cancelled
  
  processing.value = id;
  try {
    await rejectAuthorApplication(id, note);
    toast.success("Đã từ chối đơn đăng ký.");
    applications.value = applications.value.filter(a => a.id !== id);
    closeModal();
  } catch (error: any) {
    toast.error(error.response?.data?.message || "Từ chối thất bại.");
  } finally {
    processing.value = null;
  }
};

onMounted(fetchApplications);
</script>

<style scoped>
.admin-author-applications {
  background: #131b2c;
  border: 1px solid #1e293b;
  border-radius: 30px;
  padding: 30px;
  margin-bottom: 50px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
}

.section-title-aura {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 0;
}

.section-title-aura h2 {
  font-size: 1.4rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
}

.refresh-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #94a3b8;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s;
}

.refresh-btn:hover {
  background: rgba(52, 211, 153, 0.1);
  color: #34d399;
  border-color: #34d399;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #64748b;
  text-align: center;
}

.applications-table-wrapper {
  overflow-x: auto;
}

.spirit-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 10px;
}

.spirit-table th {
  text-align: left;
  padding: 10px 20px;
  color: #475569;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 800;
}

.app-row td {
  background: #0b0f19;
  padding: 20px;
  color: #cbd5e1;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
}

.app-row td:first-child { border-left: 1px solid rgba(255, 255, 255, 0.03); border-radius: 16px 0 0 16px; }
.app-row td:last-child { border-right: 1px solid rgba(255, 255, 255, 0.03); border-radius: 0 16px 16px 0; }

.user-info { display: flex; flex-direction: column; }
.user-info .username { color: #34d399; font-weight: 700; font-size: 0.95rem; }
.user-info .full-name { color: #64748b; font-size: 0.8rem; }

.pen-name { color: #fff; font-weight: 700; }
.date { font-size: 0.85rem; color: #64748b; }

.actions { display: flex; gap: 10px; }

.action-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn.detail { background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-color: rgba(59, 130, 246, 0.2); }
.action-btn.detail:hover { background: #3b82f6; color: #fff; }

.action-btn.approve { background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.2); }
.action-btn.approve:hover { background: #10b981; color: #fff; }

.action-btn.reject { background: rgba(244, 63, 94, 0.1); color: #f43f5e; border-color: rgba(244, 63, 100, 0.2); }
.action-btn.reject:hover { background: #f43f5e; color: #fff; }

.action-btn.large { padding: 12px 24px; font-size: 0.95rem; flex: 1; }

.action-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* MODAL STYLES */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-content {
  background: #131b2c;
  width: 100%;
  max-width: 700px;
  border-radius: 24px;
  position: relative;
  padding: 40px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.spirit-aura-border {
  border: 1px solid rgba(167, 139, 250, 0.3);
  position: relative;
}

.spirit-aura-border::before {
  content: '';
  position: absolute; inset: 0; 
  border-radius: 24px;
  padding: 1px;
  background: linear-gradient(135deg, transparent, rgba(167, 139, 250, 0.5), transparent);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s;
}

.close-btn:hover { color: #f43f5e; }

.modal-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.1);
  padding-bottom: 15px;
}

.icon-gold { color: #fbbf24; font-size: 1.8rem; filter: drop-shadow(0 0 5px rgba(251, 191, 36, 0.4)); }

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 900;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 2px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 25px;
  margin-bottom: 40px;
}

.info-item { display: flex; flex-direction: column; gap: 8px; }
.info-item.full-width { grid-column: span 2; }

.info-item label {
  font-size: 0.75rem;
  text-transform: uppercase;
  font-weight: 800;
  color: #475569;
  letter-spacing: 1px;
}

.info-item p { color: #cbd5e1; font-size: 1rem; font-weight: 600; }
.info-item .highlight-text { color: #34d399; font-size: 1.2rem; font-weight: 800; }

.content-box {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 15px;
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.6;
  max-height: 200px;
  overflow-y: auto;
}

.modal-footer-actions {
  display: flex;
  gap: 20px;
}

/* Transitions */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease; }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }

.loader {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(52, 211, 153, 0.2);
  border-bottom-color: #34d399;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
