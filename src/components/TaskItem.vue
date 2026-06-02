<template>
  <div
    ref="taskItemRef"
    class="task-item"
    :class="{ completed: task.completed, editing: isEditing, 'drag-over': isDragOver, overdue: isOverdue }"
    :draggable="isDraggable"
    @dragstart="onDragStart"
    @mouseup="onMouseUp"
    @dragover.prevent="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @dragend="onDragEnd"
  >
    <div class="drag-handle" title="拖拽排序" @mousedown="onHandleMouseDown">⋮⋮</div>
    <input
      type="checkbox"
      :checked="task.completed"
      @change="store.toggleTask(task.id)"
      class="checkbox"
    />
    <div class="task-content" @click="startEdit" v-if="!isEditing">
      <div class="task-title">{{ task.title }}</div>
      <div class="task-meta">
        <span class="priority-tag" :class="task.priority">
          {{ priorityLabel }}
        </span>
        <span v-if="task.dueDate" class="due-date" :class="{ overdue: isOverdue }">
          截止: {{ formattedDate }}
        </span>
        <span v-if="reminderLabel" class="reminder-tag">{{ reminderLabel }}</span>
      </div>
    </div>
    <div class="task-edit" v-else ref="editContainerRef">
      <input
        ref="titleInput"
        v-model="editTitle"
        class="edit-title"
        @keydown.enter="saveEdit"
        @keydown.escape="cancelEdit"
        @blur="saveEdit"
        placeholder="任务标题"
      />
      <div class="edit-meta">
        <select v-model="editPriority" class="edit-priority" @mousedown.stop @blur="saveEdit">
          <option value="high">高</option>
          <option value="medium">中</option>
          <option value="low">低</option>
        </select>
        <input
          type="date"
          v-model="editDueDate"
          class="edit-date"
          @mousedown.stop
          @blur="saveEdit"
        />
        <input
          type="time"
          v-model="editDueTime"
          class="edit-time"
          @mousedown.stop
          @blur="saveEdit"
        />
        <select
          v-model="editReminder"
          class="edit-reminder"
          :disabled="!canEditReminder"
          @mousedown.stop
          @blur="saveEdit"
        >
          <option value="">不提醒</option>
          <option value="at-due-time">准时提醒</option>
          <option value="5m">提前 5 分钟</option>
          <option value="30m">提前 30 分钟</option>
          <option value="1h">提前 1 小时</option>
          <option value="1d">提前 1 天</option>
        </select>
      </div>
    </div>
    <button @click.stop="store.deleteTask(task.id)" class="delete-btn">
      &times;
    </button>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { formatDueDateTime, formatReminderLabel, isDisplayOverdue } from '../utils/taskDisplay'
import dayjs from 'dayjs'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['dragstart', 'dragover', 'drop'])

const store = useTaskStore()

const isEditing = ref(false)
const editTitle = ref('')
const editPriority = ref('medium')
const editDueDate = ref('')
const editDueTime = ref('')
const editReminder = ref('')
const titleInput = ref(null)
const taskItemRef = ref(null)
const editContainerRef = ref(null)
const isDragOver = ref(false)
const isDraggable = ref(false)

const priorityLabel = computed(() => {
  const labels = { high: '高', medium: '中', low: '低' }
  return labels[props.task.priority]
})

const formattedDate = computed(() => formatDueDateTime(props.task))

const reminderLabel = computed(() => formatReminderLabel(props.task.reminder))

const isOverdue = computed(() => isDisplayOverdue(props.task))

const canEditReminder = computed(() => Boolean(editDueDate.value && editDueTime.value))

function startEdit() {
  if (props.task.completed) return
  editTitle.value = props.task.title
  editPriority.value = props.task.priority
  editDueDate.value = props.task.dueDate ? dayjs(props.task.dueDate).format('YYYY-MM-DD') : ''
  editDueTime.value = props.task.dueTime || ''
  editReminder.value = props.task.reminder || ''
  isEditing.value = true
  nextTick(() => {
    titleInput.value?.focus()
    titleInput.value?.select()
  })
}

function saveEdit() {
  if (!isEditing.value) return
  // 延迟检查：如果焦点移到了编辑区域内的其他输入控件，不保存
  setTimeout(() => {
    if (!isEditing.value) return
    const active = document.activeElement
    if (editContainerRef.value?.contains(active)) return
    const title = editTitle.value.trim()
    // 空标题时回退为原标题，但仍保存优先级和日期的修改
    const dueTime = editDueDate.value && editDueTime.value ? editDueTime.value : null
    store.updateTask(props.task.id, {
      title: title || props.task.title,
      priority: editPriority.value,
      dueDate: editDueDate.value ? dayjs(editDueDate.value).toISOString() : null,
      dueTime,
      reminder: dueTime ? (editReminder.value || null) : null
    })
    isEditing.value = false
  }, 150)
}

function cancelEdit() {
  isEditing.value = false
}

function onHandleMouseDown() {
  isDraggable.value = true
}

function onMouseUp() {
  // 延迟重置，让 dragstart 有机会先触发（如果是真正的拖拽）
  setTimeout(() => {
    isDraggable.value = false
  }, 0)
}

function onDragStart(e) {
  e.dataTransfer.effectAllowed = 'move'
  e.dataTransfer.setData('text/plain', props.task.id)
  e.target.classList.add('dragging')
}

function onDragOver(e) {
  e.dataTransfer.dropEffect = 'move'
  isDragOver.value = true
}

function onDragLeave() {
  isDragOver.value = false
}

function onDrop(e) {
  isDragOver.value = false
  const draggedId = e.dataTransfer.getData('text/plain')
  emit('drop', draggedId)
}

function onDragEnd(e) {
  isDraggable.value = false
  e.target.classList.remove('dragging')
}
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  padding: 14px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
  position: relative;
}

.task-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--color-primary-light);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.overdue:not(.completed) {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.12), var(--shadow-sm);
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.task-item.editing {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.task-item.drag-over::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--color-primary);
  border-radius: 1px;
}

.task-item.dragging {
  opacity: 0.4;
}

.drag-handle {
  cursor: grab;
  color: var(--color-text-muted);
  font-size: 14px;
  margin-right: 8px;
  padding: 4px 2px;
  border-radius: 4px;
  user-select: none;
  letter-spacing: -2px;
  transition: color 0.2s;
}

.drag-handle:hover {
  color: var(--color-text);
}

.drag-handle:active {
  cursor: grabbing;
}

.checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  margin-right: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.checkbox:checked {
  animation: checkmark 0.3s ease;
}

@keyframes checkmark {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.task-content {
  flex: 1;
  cursor: pointer;
}

.task-title {
  font-size: 15px;
  color: var(--color-text);
  transition: color 0.2s;
}

.task-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.priority-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.priority-tag.high {
  background: #FEE2E2;
  color: var(--color-danger);
}

.priority-tag.medium {
  background: #FEF3C7;
  color: var(--color-warning);
}

.priority-tag.low {
  background: var(--color-bg);
  color: var(--color-text-muted);
}

.due-date {
  color: var(--color-text-muted);
  font-size: 12px;
}

.due-date.overdue {
  color: var(--color-danger);
  font-weight: 500;
}

.reminder-tag {
  padding: 2px 6px;
  border-radius: 999px;
  background: #DBEAFE;
  color: var(--color-primary);
  font-size: 11px;
  font-weight: 500;
}

.task-edit {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edit-title {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 15px;
  color: var(--color-text);
  background: var(--color-bg);
  outline: none;
  transition: border-color 0.2s;
}

.edit-title:focus {
  border-color: var(--color-primary);
}

.edit-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.edit-priority,
.edit-date,
.edit-time,
.edit-reminder {
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 12px;
  color: var(--color-text);
  background: var(--color-bg);
  outline: none;
}

.edit-time {
  width: 92px;
}

.edit-reminder {
  min-width: 112px;
}

.edit-reminder:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.edit-priority:focus,
.edit-date:focus,
.edit-time:focus,
.edit-reminder:focus {
  border-color: var(--color-primary);
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: all 0.2s ease;
}

.task-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--color-danger);
  background: #FEE2E2;
}
</style>
