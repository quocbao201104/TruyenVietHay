<template>
  <div class="level-card">
    <div class="level-header">
      <div class="level-info">
        <div class="level-badge" :class="getBadgeClass(level?.level_id)">
          <i class="fas fa-chess-queen level-icon"></i>
          <span class="level-name">{{ level?.name || 'Chưa xếp hạng' }}</span>
        </div>
        <div class="level-level">Cấp {{ level?.level_id || 0 }}</div>
      </div>
      <router-link to="/nhiem-vu" class="view-task-btn">
        Xem Nhiệm Vụ <i class="fas fa-arrow-right"></i>
      </router-link>
    </div>

    <div class="points-section">
      <div class="points-row">
        <span class="points-label">Điểm tích lũy:</span>
        <span class="points-value">{{ points || 0 }}</span>
      </div>
      
      <div class="progress-wrapper">
        <ProgressBar :percent="progress" :height="10" />
        <div class="progress-text">
          <span>{{ points || 0 }} / {{ nextLevelPoints || 'MAX' }}</span>
          <span v-if="nextLevelName" class="next-level-name">Tiếp theo: {{ nextLevelName }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ProgressBar from './ProgressBar.vue';

export default {
  name: 'LevelCard',
  components: {
    ProgressBar
  },
  props: {
    level: {
      type: Object,
      default: null
    },
    points: {
      type: Number,
      default: 0
    },
    nextLevelPoints: {
      type: Number,
      default: 100
    },
    nextLevelName: {
      type: String,
      default: ''
    }
  },
  computed: {
    progress() {
      if (!this.nextLevelPoints) return 100;
      const p = (this.points / this.nextLevelPoints) * 100;
      return Math.min(Math.max(p, 0), 100);
    }
  },
  methods: {
    getBadgeClass(id) {
        if (!id) return '';
        if (id <= 5) return 'badge-bronze'; // 1-5
        if (id <= 10) return 'badge-silver'; // 6-10
        if (id <= 15) return 'badge-gold'; // 11-15
        if (id <= 20) return 'badge-platinum'; // 16-20
        return 'badge-diamond'; // > 20
    }
  }
}
</script>

<style scoped>
.level-card {
  background: rgba(76, 175, 80, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 25px;
  backdrop-filter: blur(5px);
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.level-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: bold;
    color: white;
    background: linear-gradient(135deg, #4caf50, #2e7d32);
    box-shadow: 0 4px 10px rgba(76, 175, 80, 0.3);
    text-transform: uppercase;
    font-size: 0.9rem;
}

.badge-bronze { background: linear-gradient(135deg, #cd7f32, #a05a2c); }
.badge-silver { background: linear-gradient(135deg, #C0C0C0, #808080); }
.badge-gold { background: linear-gradient(135deg, #FFD700, #B8860B); color: #000; text-shadow: none; }
.badge-platinum { background: linear-gradient(135deg, #E5E4E2, #708090); color: #000; }
.badge-diamond { background: linear-gradient(135deg, #b9f2ff, #00bfff); color: #000; }

.level-level {
    font-family: "Sora", sans-serif;
    font-weight: 600;
    color: #4caf50;
    font-size: 1.1rem;
}

.view-task-btn {
    font-size: 0.9rem;
    color: #4caf50;
    text-decoration: none;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 5px;
    transition: all 0.2s;
}

.view-task-btn:hover {
    color: #81c784;
    transform: translateX(3px);
}

.points-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-family: "Manrope", sans-serif;
}

.points-label {
    color: #a3a3a3;
}

.points-value {
    color: #fff;
    font-weight: bold;
    font-size: 1.1rem;
}

.progress-text {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
    font-size: 0.8rem;
    color: #888;
}

.next-level-name {
    color: #4caf50;
}

@media (max-width: 600px) {
    .level-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .view-task-btn {
        margin-left: auto;
    }
}
</style>
