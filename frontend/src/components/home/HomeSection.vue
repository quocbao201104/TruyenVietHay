<template>
  <section class="home-section">
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <router-link v-if="viewAllLink" :to="viewAllLink" class="view-all-link">
        Xem toàn bộ <i class="fas fa-chevron-right"></i>
      </router-link>
    </div>
    
    <div class="scroll-container-wrapper">
      <button 
        v-if="showNavigation" 
        @click="scrollLeft" 
        class="nav-arrow nav-arrow-left"
        :class="{ 'hidden': !canScrollLeft }"
        aria-label="Scroll left"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <div
  ref="scrollContainer"
  class="scroll-container"
  @mousedown="startDragging"
  @mousemove="drag"
  @mouseup="stopDragging"
  @mouseleave="stopDragging"
  @click="blockClick"
>

        <slot></slot>
      </div>
      
      <button 
        v-if="showNavigation" 
        @click="scrollRight" 
        class="nav-arrow nav-arrow-right"
        :class="{ 'hidden': !canScrollRight }"
        aria-label="Scroll right"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
const hasMoved = ref(false)
const blockClick = (e: MouseEvent) => {
  if (hasMoved.value) {
    e.preventDefault()
    e.stopPropagation()
    hasMoved.value = false
  }
}

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  viewAllLink: {
    type: String,
    default: ''
  },
  showNavigation: {
    type: Boolean,
    default: true
  }
});

const scrollContainer = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
const isDown = ref(false);
const isDragging = ref(false); // Track if a drag operation is occurring
const startX = ref(0);
const scrollLeftPos = ref(0);

const updateScrollState = () => {
  if (!scrollContainer.value) return;
  
  const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
  canScrollLeft.value = scrollLeft > 0;
  canScrollRight.value = scrollLeft < scrollWidth - clientWidth - 10; // 10px threshold
};

const scrollLeft = () => {
  if (!scrollContainer.value) return;
  scrollContainer.value.scrollBy({ left: -400, behavior: 'smooth' });
};

const scrollRight = () => {
  if (!scrollContainer.value) return;
  scrollContainer.value.scrollBy({ left: 400, behavior: 'smooth' });
};

// Drag to scroll logic
const startDragging = (e: MouseEvent) => {
  if (!scrollContainer.value) return

  e.preventDefault() // 🔥 CỰC KỲ QUAN TRỌNG

  isDown.value = true
  hasMoved.value = false
  isDragging.value = false // Reset drag state
  scrollContainer.value.classList.add('active'); // Enable instant scrolling

  startX.value = e.pageX
  scrollLeftPos.value = scrollContainer.value.scrollLeft
}



const stopDragging = () => {
  if (!scrollContainer.value) return;
  isDown.value = false;
  scrollContainer.value.classList.remove('active');
  // Note: isDragging is NOT reset here to allow click handler to check it
};

const drag = (e: MouseEvent) => {
  if (!isDown.value || !scrollContainer.value) return

  const walk = e.pageX - startX.value

  if (Math.abs(walk) > 5) {
    hasMoved.value = true
    isDragging.value = true
    e.preventDefault() // 🔥 QUAN TRỌNG
  }

  scrollContainer.value.scrollLeft = scrollLeftPos.value - walk
}


// Intercept click events if dragging occurred
const handleClick = (e: MouseEvent) => {
  if (isDragging.value) {
    e.preventDefault();
    e.stopPropagation();
    isDragging.value = false; // Reset after handling
  }
};

onMounted(() => {
  updateScrollState();
  window.addEventListener('resize', updateScrollState);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScrollState);
});
</script>

<style scoped>
.home-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.view-all-link {
  font-size: 0.9rem;
  color: #9ca3af;
  text-decoration: none;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.view-all-link:hover {
  color: #4ade80;
}

.scroll-container-wrapper {
  position: relative;
}

.scroll-container {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  padding: 0 1rem 1rem 1rem;
  cursor: grab; /* Show grab cursor */
  
  /* Hide scrollbar */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  user-select: none; /* Prevent text selection while dragging */
}

.scroll-container.active {
  cursor: grabbing; /* Show grabbing cursor when active */
  scroll-behavior: auto;
   /* Remove smooth scroll for direct 1:1 movement */
}

.scroll-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Opera */
}

.nav-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  opacity: 1;
}

.nav-arrow:hover {
  background: rgba(34, 197, 94, 0.8);
  border-color: #4ade80;
  transform: translateY(-50%) scale(1.1);
}

.nav-arrow.hidden {
  opacity: 0;
  pointer-events: none;
}

.nav-arrow-left {
  left: 0;
}

.nav-arrow-right {
  right: 0;
}

/* Hide navigation arrows on mobile */
@media (max-width: 768px) {
  .nav-arrow {
    display: none;
  }
  
  .section-header {
    padding: 0 0.5rem;
  }
  
  .scroll-container {
    padding: 0 0.5rem 1rem 0.5rem;
    gap: 0.75rem;
  }
  
  .section-title {
    font-size: 1.25rem;
  }
}
</style>
