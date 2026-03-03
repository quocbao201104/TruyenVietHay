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
    <img
      :src="badge.icon_url"
      :alt="badge.badge_name"
      class="badge-icon"
      @error="onImgError"
    />
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
}

/* ── Sizes ──────────────────────────────────────────────────────────────────── */
.badge-icon {
  display: block;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--badge-color, #888);
  box-shadow: 0 0 6px color-mix(in srgb, var(--badge-color, #888) 60%, transparent);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  flex-shrink: 0;
}

.size-xs .badge-icon { width: 18px; height: 18px; border-width: 1px; }
.size-sm .badge-icon { width: 24px; height: 24px; border-width: 2px; }
.size-md .badge-icon { width: 36px; height: 36px; border-width: 2px; }
.size-lg .badge-icon { width: 52px; height: 52px; border-width: 3px; }

.badge-name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--badge-color, #888);
  letter-spacing: 0.03em;
  white-space: nowrap;
}

/* ── Rarity glow ────────────────────────────────────────────────────────────── */
.rarity-uncommon .badge-icon {
  box-shadow: 0 0 8px color-mix(in srgb, var(--badge-color, #888) 70%, transparent);
}
.rarity-rare .badge-icon {
  box-shadow: 0 0 12px color-mix(in srgb, var(--badge-color, #888) 80%, transparent);
}
.rarity-epic .badge-icon {
  box-shadow: 0 0 16px color-mix(in srgb, var(--badge-color, #888) 90%, transparent);
}
.rarity-legendary .badge-icon {
  box-shadow:
    0 0 10px var(--badge-color, #FFD700),
    0 0 25px color-mix(in srgb, var(--badge-color, #FFD700) 60%, transparent);
}

/* ── Animations ─────────────────────────────────────────────────────────────── */

/* pulse */
.anim-pulse .badge-icon {
  animation: badge-pulse 2.4s ease-in-out infinite;
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50%       { transform: scale(1.12); }
}

/* glow — color shifts */
.anim-glow .badge-icon {
  animation: badge-glow 2s ease-in-out infinite alternate;
}

@keyframes badge-glow {
  from { box-shadow: 0 0 8px  var(--badge-color, #888); }
  to   { box-shadow: 0 0 20px var(--badge-color, #888), 0 0 6px #fff4; }
}

/* sparkle — shimmer effect */
.anim-sparkle .badge-icon {
  animation: badge-sparkle 1.8s ease-in-out infinite;
}

@keyframes badge-sparkle {
  0%, 100% { filter: brightness(1) saturate(1); transform: scale(1) rotate(0deg); }
  25%       { filter: brightness(1.4) saturate(1.5); }
  50%       { transform: scale(1.08) rotate(3deg); }
  75%       { filter: brightness(1.2) saturate(1.3); }
}

/* flame — legendary */
.anim-flame .badge-icon {
  animation: badge-flame 1.5s ease-in-out infinite;
}

@keyframes badge-flame {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 10px var(--badge-color, #FFD700), 0 0 25px #ff6a0080;
  }
  50% {
    transform: scale(1.1);
    box-shadow: 0 0 18px var(--badge-color, #FFD700), 0 0 40px #ff6a0099;
    filter: brightness(1.15);
  }
}

/* hover lift for all badges */
.user-badge:hover .badge-icon {
  transform: scale(1.18) translateY(-2px);
}
</style>
