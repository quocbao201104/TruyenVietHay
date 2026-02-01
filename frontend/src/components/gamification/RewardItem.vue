<template>
  <div class="reward-item" :class="{ 'disabled': userPoints < reward.points_required }">
    <div class="reward-icon">
      <i class="fas fa-gift"></i>
    </div>
    <div class="reward-info">
      <h4 class="reward-name">{{ reward.reward_name }}</h4>
      <p class="reward-desc">{{ reward.description || 'Không có mô tả' }}</p>
      <div class="reward-cost" :class="{ 'affordable': userPoints >= reward.points_required }">
        <i class="fas fa-coins"></i> {{ reward.points_required }} điểm
      </div>
    </div>
    <button 
      class="btn-redeem" 
      @click="$emit('claim', reward.reward_id)"
      :disabled="userPoints < reward.points_required || loading"
    >
      <span v-if="loading"><i class="fas fa-spinner fa-spin"></i></span>
      <span v-else>Đổi quà</span>
    </button>
  </div>
</template>

<script>
export default {
  name: 'RewardItem',
  props: {
    reward: {
      type: Object,
      required: true
    },
    userPoints: {
      type: Number,
      default: 0
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['claim']
}
</script>

<style scoped>
.reward-item {
  display: flex;
  align-items: center;
  padding: 15px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  gap: 15px;
  transition: all 0.3s ease;
}

.reward-item:hover {
  border-color: #4caf50;
  transform: translateY(-2px);
  background: rgba(76, 175, 80, 0.05);
}

.reward-item.disabled {
  opacity: 0.6;
  filter: grayscale(0.5);
}

.reward-icon {
  width: 50px;
  height: 50px;
  background: rgba(76, 175, 80, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: #4caf50;
  flex-shrink: 0;
}

.reward-info {
  flex: 1;
}

.reward-name {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 5px 0;
}

.reward-desc {
  font-size: 0.85rem;
  color: #aaa;
  margin: 0 0 8px 0;
}

.reward-cost {
  font-size: 0.9rem;
  color: #f44336; /* Default red for expensive */
  font-weight: bold;
}

.reward-cost.affordable {
  color: #4caf50; /* Green if affordable */
}

.btn-redeem {
  background: linear-gradient(135deg, #FFD700, #FFA000);
  color: #000;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
  transition: all 0.2s;
  min-width: 90px;
}

.btn-redeem:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
}

.btn-redeem:disabled {
  background: #555;
  color: #aaa;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

@media (max-width: 600px) {
    .reward-item {
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
    }
    
    .reward-icon {
        margin-bottom: 5px;
    }
    
    .btn-redeem {
        width: 100%;
    }
}
</style>
