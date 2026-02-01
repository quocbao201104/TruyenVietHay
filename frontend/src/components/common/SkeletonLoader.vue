<template>
  <div 
    class="skeleton-loader" 
    :style="{ 
      width: width, 
      height: height, 
      borderRadius: borderRadius 
    }"
  ></div>
</template>

<script setup>
defineProps({
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "20px",
  },
  borderRadius: {
    type: String,
    default: "4px",
  },
});
</script>

<style scoped>
.skeleton-loader {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
