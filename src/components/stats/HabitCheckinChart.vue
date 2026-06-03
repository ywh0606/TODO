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
    type: 'line',
    data: {
      labels: props.labels,
      datasets: [{
        data: props.data,
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointHoverRadius: 5,
        fill: true,
        tension: 0.3
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
              return `打卡率 ${item.raw}%`
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
          min: 0,
          max: 100,
          grid: { color: 'rgba(226, 232, 240, 0.5)' },
          ticks: {
            font: { size: 10 },
            color: '#94A3B8',
            stepSize: 25,
            callback(value) {
              return value + '%'
            }
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
