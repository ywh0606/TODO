<template>
  <canvas ref="canvasRef"></canvas>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Chart, registerables } from 'chart.js'
import dayjs from 'dayjs'

Chart.register(...registerables)

const props = defineProps({
  labels: { type: Array, required: true },
  data: { type: Array, required: true },
  dates: { type: Array, required: true }
})

const canvasRef = ref(null)
let chart = null

function createChart() {
  if (chart) {
    chart.destroy()
  }
  if (!canvasRef.value) return

  chart = new Chart(canvasRef.value, {
    type: 'bar',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.data,
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1,
        borderRadius: 4,
        maxBarThickness: 24
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          titleFont: { size: 12 },
          bodyFont: { size: 12 },
          padding: 8,
          cornerRadius: 6,
          callbacks: {
            title(items) {
              const idx = items[0].dataIndex
              return dayjs(props.dates[idx]).format('M月D日')
            },
            label(item) {
              return `${item.raw} 个番茄`
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { size: 10 },
            color: '#94A3B8',
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 7
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(226, 232, 240, 0.5)' },
          ticks: {
            font: { size: 10 },
            color: '#94A3B8',
            stepSize: 1
          }
        }
      }
    }
  })
}

watch(() => [props.labels, props.data], () => {
  createChart()
}, { deep: true })

onMounted(() => {
  createChart()
})

onUnmounted(() => {
  if (chart) {
    chart.destroy()
  }
})
</script>
