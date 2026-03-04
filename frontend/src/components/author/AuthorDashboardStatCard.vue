<template>
  <div
    class="stat-card"
    :class="glowClass"
    :style="{ '--glow-color': glowColor }"
  >
    <div class="icon-wrapper">
      <i :class="iconClass"></i>
    </div>
    <div class="stat-content">
      <span class="stat-value">{{ formattedValue }}</span>
      <span class="stat-label">{{ label }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = withDefaults(
  defineProps<{
    value: number | string;
    label: string;
    icon?: string;
    glowColor?: string;
  }>(),
  {
    icon: "fas fa-eye",
    glowColor: "#10b981",
  }
);

const formattedValue = computed(() => {
  const v = props.value;
  if (typeof v === "number") return v.toLocaleString("vi-VN");
  return v;
});

const glowClass = computed(() => {
  if (props.glowColor === "#3b82f6") return "glow-blue";
  if (props.glowColor === "#a78bfa") return "glow-purple";
  return "glow-emerald";
});

const iconClass = computed(() => props.icon);
</script>

<style scoped>
.stat-card {
  --glow-color: #10b981;
  background: rgba(36, 40, 52, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  position: relative;
  overflow: hidden;
}

.stat-card::before {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: linear-gradient(
    135deg,
    color-mix(in srgb, var(--glow-color) 50%, transparent),
    transparent,
    color-mix(in srgb, var(--glow-color) 30%, transparent)
  );
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0.6;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 0 20px color-mix(in srgb, var(--glow-color) 25%, transparent),
    0 8px 24px rgba(0, 0, 0, 0.4);
}

.stat-card.glow-emerald {
  --glow-color: #10b981;
}

.stat-card.glow-blue {
  --glow-color: #3b82f6;
}

.stat-card.glow-purple {
  --glow-color: #a78bfa;
}

.icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.glow-emerald .icon-wrapper {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.3);
}

.glow-blue .icon-wrapper {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.3);
}

.glow-purple .icon-wrapper {
  background: rgba(167, 139, 250, 0.15);
  color: #c4b5fd;
  box-shadow: 0 0 12px rgba(167, 139, 250, 0.3);
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #fff;
  letter-spacing: -0.02em;
}

.stat-label {
  font-size: 0.9rem;
  color: #9ca3af;
}

@media (max-width: 640px) {
  .stat-card {
    padding: 1.25rem;
  }
  .stat-value {
    font-size: 1.5rem;
  }
}
</style>
