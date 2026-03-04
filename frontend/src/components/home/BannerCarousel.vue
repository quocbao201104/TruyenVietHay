<template>
  <div class="banner-carousel" @mouseenter="pauseAutoSlide" @mouseleave="resumeAutoSlide">
    <div class="track" :class="{ 'no-transition': !isTransitioning }" :style="trackStyle" @transitionend="onTransitionEnd" @mousedown="startDrag" @touchstart="startDrag" @mousemove="onDrag" @touchmove="onDrag" @mouseup="endDrag" @touchend="endDrag" @mouseleave="endDrag">
      <BannerSlide v-for="(story, idx) in displayedStories" :key="story.id + '-' + idx" :story="story" :is-active="idx === currentIndex" />
    </div>
    <div class="indicators">
      <span v-for="(dot, i) in realCount" :key="i" class="dot" :class="{ active: i + 1 === currentIndex }" @click="goTo(i + 1)" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useStoryStore } from '@/modules/storyText/story.store';
import BannerSlide from './BannerSlide.vue';

const store = useStoryStore();
// Load stories on mount
onMounted(() => {
  store.fetchStories({ limit: 100 });
});

// Filter stories with status "Đề xuất" (checking both possible values)
const filteredStories = computed(() => {
  if (!store.stories || !Array.isArray(store.stories)) return [];
  return store.stories.filter((s: any) => {
    const status = s.status || s.trang_thai || '';
    return status.toLowerCase() === 'đề xuất' || status.toLowerCase() === 'suggested';
  })
});

// Clone first & last for infinite loop
const displayedStories = computed(() => {
  const arr = filteredStories.value;
  if (arr.length === 0) return [];
  const first = arr[0];
  const last = arr[arr.length - 1];
  return [last, ...arr, first];
});

const realCount = computed(() => filteredStories.value.length);

// Carousel state
const currentIndex = ref(1); // starts at first real slide
const isTransitioning = ref(true);
const slideWidth = ref(0);
const autoTimer = ref<number | null>(null);
const isPaused = ref(false);

const trackStyle = computed(() => {
  const translate = -currentIndex.value * slideWidth.value;
  return {
    transform: `translateX(${translate}px)`,
    transition: isTransitioning.value ? 'transform 0.5s ease' : 'none',
  };
});

// Set slide width after DOM is ready
const setSlideWidth = () => {
  const el = document.querySelector('.banner-carousel') as HTMLElement;
  if (el) slideWidth.value = el.getBoundingClientRect().width;
};

onMounted(() => {
  nextTick(setSlideWidth);
  window.addEventListener('resize', setSlideWidth);
  startAutoSlide();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', setSlideWidth);
  stopAutoSlide();
});

// Navigation
const nextSlide = () => {
  if (realCount.value === 0) return;
  currentIndex.value += 1;
  isTransitioning.value = true;
};

const prevSlide = () => {
  if (realCount.value === 0) return;
  currentIndex.value -= 1;
  isTransitioning.value = true;
};

const goTo = (index: number) => {
  currentIndex.value = index;
  isTransitioning.value = true;
};

const onTransitionEnd = (e: TransitionEvent) => {
  // Only handle transform transition of the track itself
  if (e.propertyName !== 'transform') return;

  // When we reach cloned edges, jump without transition
  if (currentIndex.value === 0) {
    // jumped to clone of last, reset to real last
    isTransitioning.value = false;
    currentIndex.value = realCount.value;
  } else if (currentIndex.value === realCount.value + 1) {
    // jumped to clone of first, reset to real first
    isTransitioning.value = false;
    currentIndex.value = 1;
  }
};

// Auto slide
const startAutoSlide = () => {
  if (autoTimer.value) return;
  autoTimer.value = window.setInterval(() => {
    if (!isPaused.value) nextSlide();
  }, 4000); // 4 seconds, can be adjusted
};

const stopAutoSlide = () => {
  if (autoTimer.value) {
    clearInterval(autoTimer.value);
    autoTimer.value = null;
  }
};

const pauseAutoSlide = () => {
  isPaused.value = true;
};

const resumeAutoSlide = () => {
  isPaused.value = false;
};

// Drag / swipe handling
let startX = 0;
let isDragging = false;

const startDrag = (e: MouseEvent | TouchEvent) => {
  if (e instanceof MouseEvent) startX = e.pageX;
  else startX = e.touches[0].pageX;
  isDragging = true;
  isTransitioning.value = false; // disable transition while dragging
};

const onDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging) return;
  const currentX = e instanceof MouseEvent ? e.pageX : e.touches[0].pageX;
  const delta = currentX - startX;
  const el = document.querySelector('.track') as HTMLElement;
  if (el) {
    const baseTranslate = -currentIndex.value * slideWidth.value;
    el.style.transform = `translateX(${baseTranslate + delta}px)`;
  }
};

const endDrag = (e: MouseEvent | TouchEvent) => {
  if (!isDragging) return;
  const endX = e instanceof MouseEvent ? e.pageX : e.changedTouches[0].pageX;
  const delta = endX - startX;
  const threshold = slideWidth.value * 0.2; // 20% swipe to change slide
  if (Math.abs(delta) > threshold) {
    if (delta < 0) nextSlide();
    else prevSlide();
  } else {
    // snap back to current slide
    isTransitioning.value = true;
  }
  isDragging = false;
};
</script>

<style scoped>
.banner-carousel {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 450px;
}

@media (max-width: 768px) {
  .banner-carousel {
    height: 380px; /* Taller poster aspect ratio for mobile */
  }
}
.track {
  display: flex;
  height: 100%;
  will-change: transform;
}
/* Disable internal transitions when resetting */
.track.no-transition :deep(.banner-slide) {
  transition: none !important;
}

/* Each slide takes full width */
.track > * {
  flex: 0 0 100%;
}
.indicators {
  position: absolute;
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}
.dot.active {
  background: #4ade80; /* active color */
}
@media (max-width: 768px) {
  /* Tắt thanh trượt ngang trên mobile vì giờ đã thành banner tĩnh */
  .track {
    display: block; /* Bỏ Flexbox */
    overflow: hidden;
    transform: none !important;
  }
  
  /* Ẩn các linh châu (dấu chấm tròn) */
  .indicators {
    display: none;
  }
  
  /* Chỉnh lại chiều cao container cho khớp với Banner tĩnh (60vh) */
  .banner-carousel {
    height: 60vh;
    padding-bottom: 0;
  }
}
</style>
