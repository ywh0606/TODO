<template>
  <div class="app">
    <h1>我的清单</h1>
    <p>任务总数: {{ store.stats.total }}</p>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTaskStore } from './stores/taskStore'

const store = useTaskStore()

onMounted(() => {
  store.loadTasks()
})
</script>

<style scoped>
.app {
  padding: 20px;
}
</style>
