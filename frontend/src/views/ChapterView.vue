<template>
  <div class="chapter-view-xianxia" :class="{ 'light-aura': !isDarkMode }">
    <div class="fixed top-0 left-0 w-full z-[1000]">
      <div
        class="h-[3px] bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 shadow-[0_0_10px_#34d399] transition-all duration-300"
        :style="{ width: scrollProgress + '%' }"
      />
    </div>

    <button 
      class="mobile-bubble-btn" 
      :class="{ 'hide-bubble': isScrollingDown && !isMobileControlOpen }"
      @click="isMobileControlOpen = !isMobileControlOpen"
    >
      <i class="fas" :class="isMobileControlOpen ? 'fa-xmark' : 'fa-wand-magic-sparkles'"></i>
    </button>

    <main class="reading-spirit-wrapper">
      <header class="chapter-spirit-header animate-fadeIn">
        <router-link
          :to="`/truyen-chu/${$route.params.storySlug}?tab=chapters`"
          class="story-name-link"
        >
          <i class="fas fa-book-journal-whills mr-2"></i>
          {{ chapter?.truyen?.ten_truyen }}
        </router-link>

        <h1 class="chapter-title-glow">
          {{ chapterTitle }}
        </h1>
        
        <div class="header-divider-spirit">
          <div class="dot"></div>
        </div>
      </header>

      <div 
        class="spirit-control-bar" 
        :class="{ 
          'hide-bar': isScrollingDown && !isMobileControlOpen,
          'mobile-active': isMobileControlOpen 
        }"
      >
        <div class="control-section">
          <button @click="prevChapter" :disabled="!hasPrev" title="Tầng trước">
            <i class="fas fa-chevron-left"></i>
          </button>

          <div class="chapter-select-wrapper">
            <select @change="handleSelectChapter" :value="chapter?.slug" class="spirit-select xianxia-dropdown">
              <option
                v-for="c in chapterList"
                :key="c.id"
                :value="c.slug"
                class="spirit-option"
              >
                {{ c.tieu_de || `Chương ${c.so_chuong}` }}
              </option>
            </select>
          </div>

          <button @click="nextChapter" :disabled="!hasNext" title="Tầng tiếp">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>

        <div class="control-section settings">
          <div class="font-tools">
            <button @click="decreaseFontSize"><i class="fas fa-minus text-[10px]"></i></button>
            <span class="size-val">{{ fontSize }}</span>
            <button @click="increaseFontSize"><i class="fas fa-plus text-[10px]"></i></button>
          </div>

          <select v-model="fontFamily" class="spirit-select-small xianxia-dropdown">
            <option value="font-serif">Cổ Điển</option>
            <option value="font-sans">Hiện Đại</option>
            <option value="font-mono">Mật Pháp</option>
          </select>

          <button @click="toggleTheme" class="aura-toggle" :title="isDarkMode ? 'Hào quang sáng' : 'U minh tối'">
            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button>
        </div>
      </div>

      <article
        class="spirit-content-body animate-fadeIn"
        :class="fontFamily"
        :style="{ fontSize: fontSize + 'px' }"
        v-html="formattedContent"
      />

      <div class="chapter-spirit-footer">
        <button @click="prevChapter" :disabled="!hasPrev" class="btn-nav-spirit prev">
          <i class="fas fa-leaf rotate-180"></i>
          <span>Cấp trước</span>
        </button>

        <button @click="nextChapter" :disabled="!hasNext" class="btn-nav-spirit next">
          <span>Đột phá tiếp</span>
          <i class="fas fa-leaf"></i>
        </button>
      </div>
    </main>

    <button v-show="isScrolled" class="spirit-fab" @click="scrollToTop">
      <i class="fas fa-yin-yang animate-spin-slow"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, watch, ref, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useChapterStore } from "@/modules/storyText/chapter/chapter.store";
import { saveReadingHistory } from "@/modules/history/history.service";
import { useAuthStore } from "@/modules/auth/auth.store";

const route = useRoute();
const router = useRouter();
const store = useChapterStore();

const chapter = computed(() => store.currentChapter);
const chapterList = computed(() => store.chapterList);

const fontSize = ref(Number(localStorage.getItem('reading-font-size')) || 22);
const fontFamily = ref(localStorage.getItem('reading-font-family') || "font-serif");
const isDarkMode = ref(localStorage.getItem('reading-theme') !== 'light');

// Mobile Bubble State
const isMobileControlOpen = ref(false);

const scrollProgress = ref(0);
const isScrolled = ref(false);
const lastScrollTop = ref(0);
const isScrollingDown = ref(false);

watch([fontSize, fontFamily], () => {
  localStorage.setItem('reading-font-size', fontSize.value.toString());
  localStorage.setItem('reading-font-family', fontFamily.value);
});

watch(isDarkMode, (newValue) => {
  localStorage.setItem('reading-theme', newValue ? 'dark' : 'light');
});

// Tự động đóng bong bóng khi cuộn xuống
watch(isScrollingDown, (down) => {
  if (down) isMobileControlOpen.value = false;
});

const increaseFontSize = () => { if (fontSize.value < 40) fontSize.value += 2; };
const decreaseFontSize = () => { if (fontSize.value > 14) fontSize.value -= 2; };
const toggleTheme = () => { isDarkMode.value = !isDarkMode.value; };

const chapterTitle = computed(() => {
  if (!chapter.value?.tieu_de) return "";
  return chapter.value.tieu_de.replace(/<\/?[^>]+(>|$)/g, "").trim();
});

const formattedContent = computed(() => {
  if (!chapter.value?.noi_dung) return "";
  let content = chapter.value.noi_dung
    .replace(/\r\n/g, "\n")
    .replace(/\n\n+/g, "</p><p>")
    .replace(/\n/g, "<br>");
  if (!content.startsWith("<p")) content = `<p>${content}`;
  if (!content.endsWith("</p>")) content = `${content}</p>`;
  return content;
});

const handleScroll = () => {
  const winScroll = document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
  scrollProgress.value = (winScroll / height) * 100;
  isScrolled.value = winScroll > 600;

  if (winScroll > lastScrollTop.value && winScroll > 150) {
      isScrollingDown.value = true;
  } else {
      isScrollingDown.value = false;
  }
  lastScrollTop.value = winScroll <= 0 ? 0 : winScroll;
};

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const currentIndex = computed(() => {
    if (!chapter.value || chapterList.value.length === 0) return -1;
    return chapterList.value.findIndex(c => c.id === chapter.value?.id);
});

const hasPrev = computed(() => !!chapter.value?.navigation?.prev_slug || currentIndex.value > 0);
const hasNext = computed(() => !!chapter.value?.navigation?.next_slug || (currentIndex.value >= 0 && currentIndex.value < chapterList.value.length - 1));

const navigateToChapter = (chapterSlug: string) => {
    router.push(`/truyen-chu/${route.params.storySlug}/${chapterSlug}`);
    isMobileControlOpen.value = false; // Đóng menu sau khi chọn chương
};

const prevChapter = () => {
  if (chapter.value?.navigation?.prev_slug) navigateToChapter(chapter.value.navigation.prev_slug);
  else if (hasPrev.value) navigateToChapter(chapterList.value[currentIndex.value - 1].slug);
};

const nextChapter = () => {
  if (chapter.value?.navigation?.next_slug) navigateToChapter(chapter.value.navigation.next_slug);
  else if (hasNext.value) navigateToChapter(chapterList.value[currentIndex.value + 1].slug);
};

const handleSelectChapter = (event: Event) => navigateToChapter((event.target as HTMLSelectElement).value);

const loadData = async () => {
  const chapterSlug = route.params.chapterSlug as string;
  const storySlug = route.params.storySlug as string;
  if (chapterSlug && storySlug) {
    await store.fetchChapter(chapterSlug, storySlug);
    if (chapter.value && (chapterList.value.length === 0 || chapterList.value[0].truyen_id !== chapter.value.truyen_id)) {
      await store.fetchChapterList(chapter.value.truyen_id);
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

watch(() => [route.params.chapterSlug, route.params.storySlug], () => loadData());
</script>

<style scoped>
/* Typography */
.font-serif { font-family: 'Merriweather', serif; }
.font-sans { font-family: 'Be Vietnam Pro', sans-serif; }
.font-mono { font-family: 'JetBrains Mono', monospace; }

.chapter-view-xianxia {
  background: #0b0f19;
  color: #94a3b8;
  min-height: 100vh;
  transition: all 0.5s ease;
}

.reading-spirit-wrapper {
  max-width: 800px;
  margin: auto;
  padding: 80px 25px 60px;
}

/* Header Spirit */
.chapter-spirit-header {
  text-align: center;
  margin-bottom: 50px;
}

.story-name-link {
  font-size: 0.8rem;
  letter-spacing: 4px;
  text-transform: uppercase;
  color: #34d399;
  font-weight: 800;
  text-decoration: none;
  opacity: 0.7;
}

.chapter-title-glow {
  font-size: 2.2rem;
  font-weight: 900;
  margin-top: 15px;
  line-height: 1.3;
  color: #fff;
  filter: drop-shadow(0 0 10px rgba(255,255,255,0.1));
}

.header-divider-spirit {
  height: 1px; width: 150px; background: linear-gradient(90deg, transparent, #34d399, transparent);
  margin: 25px auto; position: relative;
}
.header-divider-spirit .dot {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(45deg);
  width: 6px; height: 6px; background: #34d399; box-shadow: 0 0 8px #34d399;
}

/* CONTROL BAR - DESKTOP FIX */
.spirit-control-bar {
  position: sticky;
  top: 70px; /* Đẩy xuống để không bị Header chính đè */
  z-index: 900;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background: rgba(19, 27, 44, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(52, 211, 153, 0.2);
  border-radius: 50px;
  margin-bottom: 50px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
}

.spirit-control-bar.hide-bar {
  transform: translateY(-120px);
  opacity: 0;
}

.control-section { display: flex; align-items: center; gap: 10px; }
.control-section button {
  width: 36px; height: 36px; border-radius: 50%;
  background: #0b0f19; border: 1px solid #1e293b; color: #64748b;
  display: flex; align-items: center; justify-content: center;
}
.control-section button:hover:not(:disabled) { border-color: #34d399; color: #34d399; }
.control-section button:disabled { opacity: 0.2; }

.spirit-select {
  background: transparent; color: #f8fafc; font-size: 0.85rem; font-weight: 700;
  border: none; max-width: 150px; outline: none; cursor: pointer;
}

.xianxia-dropdown option { background-color: #131b2c !important; color: #cbd5e1 !important; padding: 10px; }

.font-tools {
  display: flex; align-items: center; gap: 8px;
  background: #0b0f19; padding: 2px 10px; border-radius: 50px; border: 1px solid #1e293b;
}
.size-val { font-size: 0.75rem; font-weight: 800; color: #34d399; min-width: 20px; text-align: center; }

.spirit-select-small {
  background: #0b0f19; border: 1px solid #1e293b; border-radius: 50px;
  padding: 5px 12px; color: #94a3b8; font-size: 0.7rem; font-weight: 700;
}

/* MOBILE RESPONSIVE - THANH BAR BONG BÓNG */
.mobile-bubble-btn {
  display: none; /* Ẩn trên desktop */
}

@media (max-width: 640px) {
  /* Bong bóng rút gọn */
  .mobile-bubble-btn {
    display: flex; position: fixed; bottom: 30px; right: 20px;
    width: 48px; height: 48px; border-radius: 50%;
    background: #131b2c; border: 2px solid #34d399; color: #34d399;
    z-index: 1001; align-items: center; justify-content: center;
    box-shadow: 0 0 15px rgba(52, 211, 153, 0.3);
    transition: all 0.3s ease;
  }
  
  .mobile-bubble-btn.hide-bubble { transform: scale(0); opacity: 0; }

  /* Thanh Bar ngang nổi khi bấm vào bong bóng */
  .spirit-control-bar {
    position: fixed; top: auto; bottom: 90px;
    left: 50%; /* Căn giữa màn hình */
    width: 92%; max-width: 400px;
    flex-direction: column; /* Chia làm 2 dòng */
    padding: 12px 15px; border-radius: 24px; gap: 0;
    
    /* Hiệu ứng ẩn */
    transform: translateX(-50%) translateY(30px) scale(0.9);
    transform-origin: bottom right;
    opacity: 0; pointer-events: none;
    
    background: rgba(13, 18, 32, 0.95);
    border: 1px solid rgba(52, 211, 153, 0.2);
    box-shadow: 0 15px 35px rgba(0,0,0,0.6);
  }

  /* Trạng thái mở */
  .spirit-control-bar.mobile-active {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 1; pointer-events: auto;
  }

  .spirit-control-bar.hide-bar { transform: translateX(-50%) translateY(50px); opacity: 0; }

  /* Dòng 1: Chuyển chương */
  .control-section {
    width: 100%; justify-content: space-between;
  }

  /* Rút gọn chữ chương bị dài */
  .chapter-select-wrapper {
    flex: 1; margin: 0 10px; overflow: hidden; display: flex; justify-content: center;
  }
  .spirit-select {
    width: 100%; max-width: 100%; text-align: center;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Dòng 2: Cài đặt (Chia đều hàng ngang) */
  .settings {
    display: flex !important; flex-direction: row;
    width: 100%; justify-content: space-between;
    margin-top: 12px; padding-top: 12px;
    border-top: 1px solid rgba(255, 255, 255, 0.05);
  }

  .font-tools { width: auto; justify-content: center; }
  .spirit-select-small { width: auto; text-align: center; }
}

/* Content Body */
.spirit-content-body { line-height: 1.8; color: #cbd5e1; text-align: justify; }
.spirit-content-body :deep(p) { margin-bottom: 2.5rem; text-indent: 1.5em; }
.spirit-content-body :deep(p:first-of-type) { text-indent: 0; }

/* Footer Nav */
.chapter-spirit-footer {
  display: flex; justify-content: space-between; margin-top: 80px;
  padding-top: 40px; border-top: 1px dashed #1e293b;
}

.btn-nav-spirit {
  display: flex; align-items: center; gap: 8px; padding: 12px 20px;
  border-radius: 50px; font-weight: 800; font-size: 0.8rem;
  text-transform: uppercase; transition: all 0.3s; border: none; cursor: pointer;
}
.btn-nav-spirit.prev { background: #131b2c; border: 1px solid #1e293b; color: #64748b; }
.btn-nav-spirit.next { background: linear-gradient(135deg, #10b981, #059669); color: #0b0f19; }

/* FAB */
.spirit-fab {
  position: fixed; bottom: 30px; right: 25px;
  width: 50px; height: 50px; border-radius: 50%;
  background: #131b2c; border: 2px solid #34d399; color: #34d399;
  font-size: 1.5rem; display: flex; align-items: center; justify-content: center;
  z-index: 1000;
}

/* LIGHT MODE */
.light-aura { background: #f8fafc; color: #334155; }
.light-aura .chapter-title-glow { color: #0f172a; }
.light-aura .spirit-control-bar { background: rgba(255,255,255,0.95); border-color: #cbd5e1; }
.light-aura .spirit-content-body { color: #1e293b; }
.light-aura .spirit-select, .light-aura .spirit-select-small { color: #1e293b; background: #fff; }
.light-aura .mobile-bubble-btn { background: #fff; }

/* Animations */
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 1s ease-out; }
.animate-spin-slow { animation: spin 10s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>