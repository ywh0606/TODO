<template>
  <div class="habit-input">
    <div v-if="!expanded" class="add-trigger" @click="expanded = true">
      <span class="plus">+</span> 添加习惯
    </div>
    <div v-else class="form">
      <input v-model="name" type="text" placeholder="习惯名称..." class="name-input" @keydown.enter="handleAdd" ref="nameRef" />
      <div class="form-row">
        <label>图标</label>
        <div class="icon-grid">
          <button
            v-for="emoji in icons"
            :key="emoji"
            :class="['icon-btn', { active: selectedIcon === emoji }]"
            @click="selectedIcon = emoji"
          >{{ emoji }}</button>
        </div>
      </div>
      <div class="form-row">
        <label>颜色</label>
        <div class="color-row">
          <button
            v-for="c in colors"
            :key="c"
            :class="['color-btn', { active: selectedColor === c }]"
            :style="{ background: c }"
            @click="selectedColor = c"
          ></button>
        </div>
      </div>
      <div class="form-row">
        <label>频率</label>
        <div class="frequency-row">
          <select v-model="freqType" class="freq-select">
            <option value="daily">每天</option>
            <option value="weekly">每周</option>
          </select>
          <div v-if="freqType === 'weekly'" class="times-row">
            <input v-model.number="timesPerWeek" type="number" min="1" max="7" class="times-input" />
            <span>次/周</span>
          </div>
        </div>
      </div>
      <div class="form-row">
        <label>提醒</label>
        <input v-model="reminderTime" type="time" class="time-input" />
      </div>
      <div class="form-actions">
        <button @click="handleAdd" class="save-btn" :disabled="!name.trim()">添加</button>
        <button @click="cancel" class="cancel-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useHabitStore } from '../../stores/habitStore'

const store = useHabitStore()

const expanded = ref(false)
const name = ref('')
const selectedIcon = ref('📖')
const selectedColor = ref('#3B82F6')
const freqType = ref('daily')
const timesPerWeek = ref(3)
const reminderTime = ref('')
const nameRef = ref(null)

const icons = ['📖', '🏃', '💪', '🧘', '🎵', '✍️', '🍎', '💧', '😴', '🧹', '💰', '🎯']
const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

async function handleAdd() {
  if (!name.value.trim()) return
  const frequency = freqType.value === 'daily'
    ? { type: 'daily' }
    : { type: 'weekly', timesPerWeek: timesPerWeek.value }
  await store.addHabit(
    name.value.trim(),
    selectedIcon.value,
    selectedColor.value,
    frequency,
    reminderTime.value || null
  )
  resetForm()
}

function cancel() {
  resetForm()
}

function resetForm() {
  name.value = ''
  selectedIcon.value = '📖'
  selectedColor.value = '#3B82F6'
  freqType.value = 'daily'
  timesPerWeek.value = 3
  reminderTime.value = ''
  expanded.value = false
}
</script>

<style scoped>
.habit-input {
  margin-bottom: 16px;
}

.add-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  cursor: pointer;
  font-size: 14px;
  transition: border-color 0.2s, color 0.2s;
}

.add-trigger:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.plus {
  font-size: 18px;
  font-weight: 600;
}

.form {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: var(--shadow-sm);
}

.name-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}

.name-input:focus {
  border-color: var(--color-primary);
}

.form-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.form-row label {
  font-size: 13px;
  color: var(--color-text-secondary);
  min-width: 36px;
  flex-shrink: 0;
}

.icon-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  background: none;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.2s;
}

.icon-btn.active {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.color-row {
  display: flex;
  gap: 6px;
}

.color-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 3px solid transparent;
  cursor: pointer;
  transition: border-color 0.2s, transform 0.2s;
}

.color-btn.active {
  border-color: var(--color-text);
  transform: scale(1.15);
}

.frequency-row {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.freq-select {
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: inherit;
  background: var(--color-surface);
  outline: none;
}

.times-row {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.times-input {
  width: 48px;
  padding: 4px 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  text-align: center;
  outline: none;
}

.time-input {
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-family: inherit;
  outline: none;
}

.form-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

.save-btn {
  padding: 8px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.save-btn:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cancel-btn {
  padding: 8px 20px;
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--color-text-secondary);
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.cancel-btn:hover {
  background: var(--color-bg);
}
</style>
