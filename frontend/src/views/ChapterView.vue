<template>
  <div class="chapter-view" :class="{ 'light-mode': !isDarkMode }">

    <!-- Reading Progress -->
    <div class="fixed top-0 left-0 w-full z-[1000]">
      <div
        class="h-[2px] bg-emerald-400 transition-all"
        :style="{ width: scrollProgress + '%' }"
      />
    </div>

    <main class="reading-wrapper">
      <!-- Header -->
      <header class="chapter-header">
        <router-link
          :to="`/truyen-chu/${$route.params.storySlug}?tab=chapters`"
          class="story-name"
        >
          {{ chapter?.truyen?.ten_truyen }}
        </router-link>

        <h1 class="chapter-title">
          {{ chapterTitle }}
        </h1>
      </header>

      <!-- Control Bar -->
      <div class="control-bar">
        <div class="control-group">
          <button @click="prevChapter" :disabled="!hasPrev">
            <i class="fas fa-angle-left"></i>
          </button>

          <select @change="handleSelectChapter" :value="chapter?.slug">
            <option
              v-for="c in chapterList"
              :key="c.id"
              :value="c.slug"
            >
              {{ c.tieu_de || `Chương ${c.so_chuong}` }}
            </option>
          </select>

          <button @click="nextChapter" :disabled="!hasNext">
            <i class="fas fa-angle-right"></i>
          </button>
        </div>

        <div class="control-group">
          <button @click="decreaseFontSize">
            <i class="fas fa-minus"></i>
          </button>

          <span class="font-size">{{ fontSize }}</span>

          <button @click="increaseFontSize">
            <i class="fas fa-plus"></i>
          </button>

          <select v-model="fontFamily">
            <option value="font-serif">Serif</option>
            <option value="font-sans">Sans</option>
            <option value="font-mono">Mono</option>
          </select>

          <button @click="toggleTheme" class="theme-toggle-btn" :title="isDarkMode ? 'Chế độ sáng' : 'Chế độ tối'">
            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
        </div>
      </div>

      <!-- Content -->
      <article
        class="reading-content"
        :class="fontFamily"
        :style="{ fontSize: fontSize + 'px' }"
        v-html="formattedContent"
      />

      <!-- Footer Nav -->
      <div class="chapter-footer">
        <button @click="prevChapter" :disabled="!hasPrev">
          <i class="fas fa-arrow-left"></i> Chương trước
        </button>

        <button @click="nextChapter" :disabled="!hasNext">
          Chương tiếp <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </main>

    <!-- Scroll to top -->
    <button v-show="isScrolled" class="fab" @click="scrollToTop">
      <i class="fas fa-chevron-up"></i>
    </button>
  </div>
</template>


<script setup lang="ts">
import { onMounted, computed, watch, ref, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useChapterStore } from "@/modules/storyText/chapter/chapter.store";
import { saveReadingHistory } from "@/modules/history/history.service"; // Giả định path
import { incrementViewCount } from "@/modules/storyText/story.service"; // Giả định path

const route = useRoute();
const router = useRouter();
const store = useChapterStore();

// --- Data ---
const chapter = computed(() => store.currentChapter);
const chapterList = computed(() => store.chapterList);
const loading = computed(() => store.loading);
const error = computed(() => store.error);

// --- User Preferences ---
const fontSize = ref(Number(localStorage.getItem('reading-font-size')) || 22);
const fontFamily = ref(localStorage.getItem('reading-font-family') || "font-serif");
const isDarkMode = ref(localStorage.getItem('reading-theme') !== 'light'); // Default to dark

// --- UI State ---
const scrollProgress = ref(0);
const isScrolled = ref(false);
const lastScrollTop = ref(0);
const isScrollingDown = ref(false);
const showControls = ref(true);

// --- Watchers ---
watch([fontSize, fontFamily], () => {
  localStorage.setItem('reading-font-size', fontSize.value.toString());
  localStorage.setItem('reading-font-family', fontFamily.value);
});

watch(isDarkMode, (newValue) => {
  localStorage.setItem('reading-theme', newValue ? 'dark' : 'light');
});

// --- Actions ---
const increaseFontSize = () => { if (fontSize.value < 40) fontSize.value += 2; };
const decreaseFontSize = () => { if (fontSize.value > 14) fontSize.value -= 2; };
const toggleTheme = () => { isDarkMode.value = !isDarkMode.value; };

// --- Computed Content ---
const chapterTitle = computed(() => {
  if (!chapter.value?.tieu_de) return "";
  return chapter.value.tieu_de.replace(/<\/?[^>]+(>|$)/g, "").trim();
});

const calculateReadingTime = computed(() => {
    if (!chapter.value?.noi_dung) return 0;
    const words = chapter.value.noi_dung.split(/\s+/).length;
    return Math.ceil(words / 200); // Tốc độ đọc trung bình 200 từ/phút
});

// Xử lý nội dung văn bản để hiển thị đẹp hơn
const formattedContent = computed(() => {
  if (!chapter.value?.noi_dung) return "";
  let content = chapter.value.noi_dung
    .replace(/\r\n/g, "\n")
    .replace(/\n\n+/g, "</p><p>") // Tạo đoạn văn mới khi xuống dòng kép
    .replace(/\n/g, "<br>"); // Xuống dòng đơn

  // Wrap content in paragraphs if not present
  if (!content.startsWith("<p")) content = `<p>${content}`;
  if (!content.endsWith("</p>")) content = `${content}</p>`;
  
  return content;
});

// --- Scroll Logic ---
const handleScroll = () => {
  const winScroll = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  
  // Calculate progress
  scrollProgress.value = (winScroll / height) * 100;
  
  // Toggle FAB visibility
  isScrolled.value = winScroll > 600;

  // Smart Hide Control Bar
  if (winScroll > lastScrollTop.value && winScroll > 100) {
      isScrollingDown.value = true; // Kéo xuống -> Ẩn
  } else {
      isScrollingDown.value = false; // Kéo lên -> Hiện
  }
  lastScrollTop.value = winScroll <= 0 ? 0 : winScroll;
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

// --- Navigation Logic ---
const currentIndex = computed(() => {
    if (!chapter.value || chapterList.value.length === 0) return -1;
    return chapterList.value.findIndex(c => c.id === chapter.value?.id);
});
const hasPrev = computed(() => currentIndex.value > 0);
const hasNext = computed(() => currentIndex.value >= 0 && currentIndex.value < chapterList.value.length - 1);

const navigateToChapter = (chapterSlug: string) => {
    router.push(`/truyen-chu/${route.params.storySlug}/${chapterSlug}`);
};

const prevChapter = () => hasPrev.value && navigateToChapter(chapterList.value[currentIndex.value - 1].slug);
const nextChapter = () => hasNext.value && navigateToChapter(chapterList.value[currentIndex.value + 1].slug);
const handleSelectChapter = (event: Event) => navigateToChapter((event.target as HTMLSelectElement).value);

// --- Lifecycle ---
const loadData = async () => {
  const chapterSlug = route.params.chapterSlug as string;
  const storySlug = route.params.storySlug as string; // Get story slug from route
  if (chapterSlug && storySlug) {
    await store.fetchChapter(chapterSlug, storySlug);
    
    // Load chapter list if needed
    if (chapter.value && (chapterList.value.length === 0 || chapterList.value[0].truyen_id !== chapter.value.truyen_id)) {
      await store.fetchChapterList(chapter.value.truyen_id);
    }
    
    // Analytics & History (Silent)
    if (chapter.value) {
        saveReadingHistory(chapter.value.truyen_id, chapter.value.id).catch(console.error);
        incrementViewCount(chapter.value.truyen_id).catch(console.error);
        
        // Smart Preload Next Chapter
        if (hasNext.value) {
            const nextCh = chapterList.value[currentIndex.value + 1];
            if (nextCh) {
                store.preloadChapter(nextCh.slug, storySlug);
            }
        }
    }
  }
};

onMounted(() => {
  loadData();
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});

watch(() => [route.params.chapterSlug, route.params.storySlug], async ([newSlug, newStorySlug]) => {
  if (newSlug && newStorySlug) {
      await loadData();
  }
});
</script>

<style scoped>
/* Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400&display=swap');

/* Typography Styles */
.font-serif { font-family: 'Merriweather', serif; }
.font-sans { font-family: 'Be Vietnam Pro', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

.chapter-view {
  background: #0f1220;
  color: #e5e7eb;
  min-height: 100vh;
}

.reading-wrapper {
  max-width: 900px; /* Wider for more comfortable reading */
  margin: auto;
  padding: 6rem 2rem 4rem; /* Increased horizontal padding */
}

.chapter-header {
  text-align: center;
  margin-bottom: 4rem;
}

.story-name {
  font-size: 0.75rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #6ee7b7;
}

.chapter-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-top: 1rem;
  line-height: 1.3;
  color: #f9fafb; /* Bright white for better visibility */
}

.control-bar {
  position: sticky;
  top: 1rem;
  z-index: 20;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  background: rgba(30, 33, 58, 0.85);
  backdrop-filter: blur(12px);
  border-radius: 1rem;
  margin-bottom: 3rem;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-group button {
  width: 36px;
  height: 36px;
  border-radius: 0.75rem;
  background: rgba(255,255,255,0.05);
}

.control-group button:hover {
  background: #34d399;
  color: #000;
}

.reading-content {
  line-height: 2;
  letter-spacing: 0.02em;
}

.reading-content :deep(p) {
  margin-bottom: 2.2rem;
  text-indent: 2em; /* First line indent maintained */
  text-align: justify;
}

/* Remove indent from first paragraph */
.reading-content :deep(p:first-of-type) {
  text-indent: 0;
}

.chapter-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 5rem;
  padding-top: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.chapter-footer button {
  padding: 1rem 2rem;
  border-radius: 1rem;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  border: none;
  cursor: pointer;
}

/* Previous Chapter Button */
.chapter-footer button:first-child {
  background: rgba(255, 255, 255, 0.05);
  color: #e5e7eb;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.chapter-footer button:first-child:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  border-color: #6ee7b7;
  color: #6ee7b7;
  transform: translateX(-4px);
}

/* Next Chapter Button - Beautiful Gradient */
.chapter-footer button:last-child {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  color: #000;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(52, 211, 153, 0.3);
}

.chapter-footer button:last-child:hover:not(:disabled) {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 8px 30px rgba(52, 211, 153, 0.5);
  transform: translateY(-2px) translateX(4px);
}

.chapter-footer button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
  transform: none !important;
}

.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 52px;
  height: 52px;
  border-radius: 1rem;
  background: rgba(30,33,58,0.9);
  color: #6ee7b7;
  border: none;
  cursor: pointer;
}

.fab:hover {
  background: rgba(52, 211, 153, 0.2);
  transform: translateY(-4px);
}

/* === LIGHT MODE === */
.chapter-view.light-mode {
  background: #fafafa;
  color: #1f2937;
}

.chapter-view.light-mode .chapter-title {
  color: #111827;
}

.chapter-view.light-mode .story-name {
  color: #059669;
}

.chapter-view.light-mode .control-bar {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.chapter-view.light-mode .control-group button {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.chapter-view.light-mode .control-group button:hover {
  background: #34d399;
  color: #fff;
}

.chapter-view.light-mode .control-group select {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
}

.chapter-view.light-mode .reading-content {
  color: #1f2937;
}

.chapter-view.light-mode .chapter-footer button:first-child {
  background: rgba(0, 0, 0, 0.05);
  color: #374151;
  border-color: rgba(0, 0, 0, 0.1);
}

.chapter-view.light-mode .chapter-footer button:first-child:hover:not(:disabled) {
  background: rgba(0, 0, 0, 0.1);
  border-color: #10b981;
  color: #059669;
}

.chapter-view.light-mode .fab {
  background: rgba(255, 255, 255, 0.95);
  color: #059669;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.chapter-view.light-mode .fab:hover {
  background: #f3f4f6;
}

</style>