<template>
  <!-- 
    UserBadge Component
    Displays the cultivation realm badge next to a username.
    
    Usage:
      <UserBadge :badge="comment.author_badge" size="sm" />
      <UserBadge :badge="user.badge" size="md" show-name />
  -->
  <span
    v-if="badge && badge.icon_url"
    class="user-badge"
    :class="[`rarity-${badge.rarity}`, `anim-${badge.animation_type}`, `size-${size}`]"
    :style="{ '--badge-color': badge.color }"
    :title="badge.badge_name"
  >
    <!-- Wrapper controls proportional sizing via em units -->
    <span class="badge-img-wrap">
      <img
        :src="badge.icon_url"
        :alt="badge.badge_name"
        class="badge-icon"
        @error="onImgError"
      />
    </span>
    <span v-if="showName" class="badge-name">{{ badge.badge_name }}</span>
  </span>
</template>

<script setup lang="ts">
import type { Badge } from '@/types/badge';

withDefaults(
  defineProps<{
    badge?: Badge | null;
    size?: 'xs' | 'sm' | 'md' | 'lg';
    showName?: boolean;
  }>(),
  {
    badge: null,
    size: 'sm',
    showName: false,
  }
);

const onImgError = (e: Event) => {
  // Hide broken badge image gracefully
  (e.target as HTMLImageElement).style.display = 'none';
};
</script>

<style scoped>
/* ── Base ───────────────────────────────────────────────────────────────────── */
.user-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  vertical-align: middle;
  position: relative;
  line-height: 1;
}

/* ── Image wrapper: em-based sizing (proportional to parent font-size) ──────── */
/* height ≈ 75% of font-size so badge rides neatly beside the username */
.badge-img-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.size-xs .badge-img-wrap { width: 1.1em;  height: 1.1em; }
.size-sm .badge-img-wrap { width: 1.4em;  height: 1.4em; }
.size-md .badge-img-wrap { width: 1.9em;  height: 1.9em; }
.size-lg .badge-img-wrap { width: 2.6em;  height: 2.6em; }

/* ── Badge icon: fills wrapper, no border/clip ──────────────────────────────── */
/* NOTE: no border-radius or border — badge is a transparent-bg WebP/PNG.       */
/* Glow is applied via filter:drop-shadow which follows the alpha outline.      */
.badge-icon {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
  transition: transform 0.2s ease, filter 0.2s ease;
}

/* ── Badge name ──────────────────────────────────────────────────────────────── */
.badge-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--badge-color, #888);
  letter-spacing: 0.03em;
  white-space: nowrap;
}

/* ── Rarity glow via drop-shadow (follows alpha channel outline) ─────────────── */
/* Common: subtle */
.rarity-common .badge-icon {
  filter: drop-shadow(0 0 3px color-mix(in srgb, var(--badge-color, #888) 50%, transparent));
}

/* Uncommon: mild glow */
.rarity-uncommon .badge-icon {
  filter: drop-shadow(0 0 5px color-mix(in srgb, var(--badge-color, #888) 70%, transparent));
}

/* Rare: noticeable glow */
.rarity-rare .badge-icon {
  filter: drop-shadow(0 0 7px color-mix(in srgb, var(--badge-color, #888) 85%, transparent));
}

/* Epic: strong glow */
.rarity-epic .badge-icon {
  filter: drop-shadow(0 0 9px var(--badge-color, #888))
    drop-shadow(0 0 3px color-mix(in srgb, var(--badge-color, #888) 40%, #fff));
}

/* Legendary: intense double glow */
.rarity-legendary .badge-icon {
  filter:
    drop-shadow(0 0 6px var(--badge-color, #FFD700))
    drop-shadow(0 0 14px color-mix(in srgb, var(--badge-color, #FFD700) 60%, transparent))
    drop-shadow(0 0 2px #fff6);
}

/* ── Animations ──────────────────────────────────────────────────────────────── */

/* pulse — gentle scale */
.anim-pulse .badge-icon {
  animation: badge-pulse 2.4s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1) translateY(0); }
  50% { transform: scale(1.03) translateY(-1px); filter: drop-shadow(0 0 5px var(--badge-color)); }
}

/* glow — drop-shadow intensity oscillation */
.anim-glow .badge-icon {
  animation: badge-glow 2s ease-in-out infinite alternate;
}

@keyframes badge-glow {
  from {
    transform: scale(1) translateY(0);
    filter: drop-shadow(0 0 4px var(--badge-color, #888));
  }
  to {
    transform: scale(1.02) translateY(-1px);
    filter:
      drop-shadow(0 0 10px var(--badge-color, #888))
      drop-shadow(0 0 4px color-mix(in srgb, var(--badge-color, #888) 50%, #fff));
  }
}

/* sparkle — shimmer with brightness + slight rotate */
.anim-sparkle .badge-icon {
  animation: badge-sparkle 1.8s ease-in-out infinite;
}

@keyframes badge-sparkle {
  0%, 100% {
    filter: drop-shadow(0 0 4px var(--badge-color, #888)) brightness(1) saturate(1);
    transform: scale(1) translateY(0) rotate(0deg);
  }
  25% {
    filter: drop-shadow(0 0 8px var(--badge-color, #888)) brightness(1.4) saturate(1.5);
    transform: scale(1.02) translateY(-0.5px) rotate(1deg);
  }
  50% {
    transform: scale(1.04) translateY(-1.5px) rotate(3deg);
  }
  75% {
    filter: drop-shadow(0 0 6px var(--badge-color, #888)) brightness(1.2) saturate(1.3);
    transform: scale(1.02) translateY(-0.5px) rotate(1deg);
  }
}

/* flame — legendary pulsing fire glow */
.anim-flame .badge-icon {
  animation: badge-flame 1.5s ease-in-out infinite;
}

@keyframes badge-flame {
  0%, 100% {
    transform: scale(1) translateY(0);
    filter:
      drop-shadow(0 0 6px var(--badge-color, #FFD700))
      drop-shadow(0 0 12px rgba(255, 106, 0, 0.5));
  }
  50% {
    transform: scale(1.04) translateY(-2px);
    filter:
      drop-shadow(0 0 10px var(--badge-color, #FFD700))
      drop-shadow(0 0 22px rgba(255, 106, 0, 0.7))
      brightness(1.15);
  }
}

/* hover lift for all badges */
.user-badge:hover .badge-icon {
  transform: scale(1.18) translateY(-2px);
}
</style>
