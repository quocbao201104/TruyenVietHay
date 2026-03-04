<template>
  <div class="chart-container">
    <div v-if="loading" class="chart-loading">
      <div class="spinner"></div>
      <span>Đang tải biểu đồ...</span>
    </div>
    <VueApexCharts
      v-else
      type="area"
      height="320"
      :options="chartOptions"
      :series="chartSeries"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import VueApexCharts from "vue3-apexcharts";

const props = withDefaults(
  defineProps<{
    labels?: string[];
    series?: { name: string; data: number[] }[];
    loading?: boolean;
  }>(),
  {
    labels: () => [],
    series: () => [],
    loading: false,
  }
);

// Đảm bảo có labels (tối thiểu 7 ngày) và series hợp lệ cho ApexCharts
const defaultLabels = ["—", "—", "—", "—", "—", "—", "—"];
const effectiveLabels = computed(() =>
  props.labels && props.labels.length > 0 ? props.labels : defaultLabels
);

const chartSeries = computed(() => {
  if (props.series && props.series.length > 0) {
    return props.series;
  }
  return [
    { name: "Lượt xem", data: [0, 0, 0, 0, 0, 0, 0] },
    { name: "Bình luận", data: [0, 0, 0, 0, 0, 0, 0] },
  ];
});

const chartOptions = computed(() => ({
  chart: {
    type: "area",
    toolbar: { show: false },
    zoom: { enabled: false },
    fontFamily: "'Manrope', sans-serif",
    background: "transparent",
    animations: {
      enabled: true,
      easing: "easeinout",
      speed: 800,
    },
  },
  colors: ["#10b981", "#3b82f6"],
  stroke: {
    curve: "smooth",
    width: 2,
  },
  fill: {
    type: "gradient",
    gradient: {
      shadeIntensity: 0.5,
      opacityFrom: 0.4,
      opacityTo: 0.05,
    },
  },
  dataLabels: { enabled: false },
  grid: {
    borderColor: "rgba(255,255,255,0.08)",
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    categories: effectiveLabels.value,
    labels: {
      style: { colors: "#9ca3af", fontSize: "12px" },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { colors: "#9ca3af", fontSize: "12px" },
    },
    axisBorder: { show: false },
    crosshairs: { show: false },
  },
  legend: {
    position: "top",
    horizontalAlign: "right",
    labels: { colors: "#e0e0e0" },
    markers: { width: 10, height: 10, radius: 3 },
  },
  tooltip: {
    theme: "dark",
    x: { format: "dd/MM" },
  },
}));
</script>

<style scoped>
.chart-container {
  background: rgba(36, 40, 52, 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.06);
  min-height: 360px;
  width: 100%;
  position: relative;
}

.chart-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  color: #9ca3af;
  font-size: 0.95rem;
  z-index: 5;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #10b981;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 640px) {
  .chart-container {
    padding: 1rem;
    min-height: 300px;
  }
}
</style>
