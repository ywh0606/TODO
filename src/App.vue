<template>
  <div class="app">
    <TasksView v-if="activeTab === 'tasks'" />
    <HabitsView v-else-if="activeTab === 'habits'" />
    <PomodoroView v-else-if="activeTab === 'pomodoro'" />
    <PetView v-else-if="activeTab === 'pet'" />
    <NavBar ref="navBar" @change="activeTab = $event" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import TasksView from './views/TasksView.vue'
import HabitsView from './views/HabitsView.vue'
import PomodoroView from './views/PomodoroView.vue'
import PetView from './views/PetView.vue'

const activeTab = ref('tasks')
const navBar = ref(null)
</script>

<style scoped>
.app {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
