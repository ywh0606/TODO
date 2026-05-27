<template>
  <div class="app">
    <h1>我的清单</h1>
    <TaskInput />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTaskStore } from './stores/taskStore'
import TaskInput from './components/TaskInput.vue'

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
