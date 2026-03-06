<template>
  <div class="notification-inbox-aura">
    <div class="inbox-header">
      <div class="header-left">
        <i class="fas fa-envelope-open-text text-emerald-400"></i>
        <h3>Hộp Thư Linh Đài</h3>
      </div>
      <div class="header-right">
        <button 
          v-if="store.unreadCount > 0" 
          @click="store.markAllAsRead()" 
          class="btn-mark-all"
        >
          <i class="fas fa-check-double mr-2"></i> Tịnh Hóa Tất Cả (Đọc hết)
        </button>
      </div>
    </div>

    <div v-if="store.loading && store.notifications.length === 0" class="spirit-loading">
      <div class="yin-yang-spinner"></div>
      <p>Đang cảm ứng linh tin...</p>
    </div>

    <div v-else-if="store.notifications.length === 0" class="empty-inbox">
      <i class="fas fa-wind text-4xl mb-3 opacity-30"></i>
      <p>Linh đài thanh tịnh, không có mật báo nào.</p>
    </div>

    <div v-else class="notification-list scrollbar-magic">
      <div 
        v-for="notif in store.notifications" 
        :key="notif.id" 
        :class="['notif-item', { 'unread': notif.is_read === 0 }]"
        @click="handleRead(notif)"
      >
        <div class="notif-icon-box" :class="getTypeClass(notif.type)">
          <i :class="getIcon(notif.type)"></i>
        </div>
        
        <div class="notif-content-wrapper">
          <div class="notif-header-row">
            <span class="notif-type-label">{{ getTypeName(notif.type) }}</span>
            <span class="notif-time">{{ formatDate(notif.created_at) }}</span>
          </div>
          <div class="notif-body">
            <p class="notif-text">{{ notif.content }}</p>
          </div>
        </div>

        <div v-if="notif.is_read === 0" class="unread-dot"></div>
      </div>

      <div v-if="store.hasMore" class="load-more-container">
        <button @click="store.fetchNotifications()" :disabled="store.loading" class="btn-load-more">
          <span v-if="store.loading">Đang tải...</span>
          <span v-else>Xem tin cũ hơn...</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useNotificationStore } from '@/modules/notification/notification.store';
import { NOTIF_TYPE } from '@/modules/notification/notification.api';

const store = useNotificationStore();

onMounted(() => {
  store.fetchNotifications(true);
});

const handleRead = (notif: any) => {
  if (notif.is_read === 0) {
    store.markAsRead(notif.id);
  }
};

const getIcon = (type: number) => {
  switch (type) {
    case NOTIF_TYPE.APPROVAL: return 'fas fa-gavel';
    case NOTIF_TYPE.NEW_CHAPTER: return 'fas fa-scroll';
    case NOTIF_TYPE.SYSTEM: return 'fas fa-bullhorn';
    default: return 'fas fa-envelope';
  }
};

const getTypeName = (type: number) => {
  switch (type) {
    case NOTIF_TYPE.APPROVAL: return 'Thiên Âm Phán Quyết';
    case NOTIF_TYPE.NEW_CHAPTER: return 'Linh Thư Biến Động';
    case NOTIF_TYPE.SYSTEM: return 'Hệ Thống Mật Báo';
    default: return 'Tin Nhắn';
  }
};

const getTypeClass = (type: number) => {
  switch (type) {
    case NOTIF_TYPE.APPROVAL: return 'type-approval';
    case NOTIF_TYPE.NEW_CHAPTER: return 'type-new';
    case NOTIF_TYPE.SYSTEM: return 'type-system';
    default: return '';
  }
};

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', { 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  });
};
</script>

<style scoped>
.notification-inbox-aura {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.inbox-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px dashed rgba(52, 211, 153, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h3 {
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.btn-mark-all {
  background: transparent;
  border: 1px solid rgba(52, 211, 153, 0.3);
  color: #34d399;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-mark-all:hover {
  background: rgba(52, 211, 153, 0.1);
  border-color: #34d399;
}

.notification-list {
  max-height: 600px;
  overflow-y: auto;
  padding-right: 10px;
}

.notif-item {
  display: flex;
  gap: 15px;
  padding: 16px;
  background: rgba(11, 15, 25, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
}

.notif-item:hover {
  background: rgba(11, 15, 25, 0.7);
  border-color: rgba(52, 211, 153, 0.2);
  transform: translateX(5px);
}

.notif-item.unread {
  background: rgba(16, 185, 129, 0.05);
  border-left: 3px solid #34d399;
}

.notif-icon-box {
  width: 45px;
  height: 45px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  flex-shrink: 0;
  background: #0b0f19;
  border: 1px solid #1e293b;
}

.notif-icon-box.type-approval { color: #f43f5e; border-color: rgba(244, 63, 94, 0.3); }
.notif-icon-box.type-new { color: #3b82f6; border-color: rgba(59, 130, 246, 0.3); }
.notif-icon-box.type-system { color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); }

.notif-content-wrapper {
  flex-grow: 1;
}

.notif-header-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.notif-type-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 1px;
}

.notif-time {
  font-size: 0.7rem;
  color: #475569;
}

.notif-text {
  font-size: 0.9rem;
  line-height: 1.6;
  color: #cbd5e1;
}

.unread-dot {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 8px;
  height: 8px;
  background: #34d399;
  border-radius: 50%;
  box-shadow: 0 0 8px #34d399;
}

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 10px 0;
}

.btn-load-more {
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
}

.btn-load-more:hover:not(:disabled) {
  color: #34d399;
  text-decoration: underline;
}

.spirit-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 0;
  color: #34d399;
}

.empty-inbox {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
  color: #475569;
}

.scrollbar-magic::-webkit-scrollbar { width: 5px; }
.scrollbar-magic::-webkit-scrollbar-track { background: transparent; }
.scrollbar-magic::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
.scrollbar-magic::-webkit-scrollbar-thumb:hover { background: #34d399; }
</style>
