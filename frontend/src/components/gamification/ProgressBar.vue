<template>
  <div class="progress-bar-container" :style="{ height: height + 'px' }">
    <div 
      class="progress-fill" 
      :style="{ width: percent + '%', backgroundColor: color }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'ProgressBar',
  props: {
    percent: {
      type: Number,
      required: true,
      validator: (value) => value >= 0 && value <= 100
    },
    color: {
      type: String,
      default: '#4caf50'
    },
    height: {
      type: Number,
      default: 8
    }
  }
}
</script>

<style scoped>
.progress-bar-container {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease-out;
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}
</style>
