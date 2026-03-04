<template>
  <router-link 
    :to="`/the-loai?category=${category.id_theloai}`" 
    class="category-card"
    :class="categoryGradients[(index || 0) % categoryGradients.length]"
  >
    <div class="category-content">
      <h3 class="category-name">{{ category.ten_theloai }}</h3>
      <span class="view-detail">Xem chi tiết <i class="fas fa-chevron-right"></i></span>
    </div>
  </router-link>
</template>

<script setup lang="ts">
// import { defineProps } from 'vue'; 
import type { Category } from '@/types/category';

const props = defineProps<{
  category: Category;
  index?: number;
}>();

// Predefined gradient classes matching the screenshot colors
const categoryGradients = [
  'gradient-blue',
  'gradient-gray',
  'gradient-teal',
  'gradient-purple',
  'gradient-orange',
  'gradient-red',
  'gradient-dark'
];
</script>

<style scoped>
.category-card {
  position: relative;
  flex-shrink: 0;
  width: 140px;
  height: 90px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2);
}

.category-card:hover {
  transform: scale(1.05) translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3);
}

.category-content {
  position: relative;
  z-index: 1;
  text-align: center;
  padding: 1rem;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.category-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.25rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.view-detail {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.view-detail i {
  font-size: 0.6rem;
  transition: transform 0.3s ease;
}

.category-card:hover .view-detail i {
  transform: translateX(2px);
}

/* Gradient backgrounds matching the screenshot */
.gradient-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
}

.gradient-gray {
  background: linear-gradient(135deg, #6b7280 0%, #374151 100%);
}

.gradient-teal {
  background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%);
}

.gradient-purple {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
}

.gradient-orange {
  background: linear-gradient(135deg, #f97316 0%, #c2410c 100%);
}

.gradient-red {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
}

.gradient-dark {
  background: linear-gradient(135deg, #334155 0%, #1e293b 100%);
}

/* Mobile adjustments */
@media (max-width: 640px) {
  .category-card {
    width: 120px;
    height: 80px;
  }
  
  .category-name {
    font-size: 0.85rem;
  }
  
  .view-detail {
    font-size: 0.65rem;
  }
}
</style>
