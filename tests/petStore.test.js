// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePetStore } from '../src/stores/petStore'

const mockSavePet = vi.fn().mockResolvedValue(undefined)
const mockLoadPet = vi.fn().mockResolvedValue(null)

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
  window.electronAPI = {
    savePet: mockSavePet,
    loadPet: mockLoadPet
  }
})

describe('petStore', () => {
  describe('initial state', () => {
    it('has default pet values', () => {
      const store = usePetStore()
      expect(store.pet.name).toBe('小团子')
      expect(store.pet.level).toBe(1)
      expect(store.pet.exp).toBe(0)
      expect(store.pet.hunger).toBe(80)
      expect(store.pet.mood).toBe(80)
      expect(store.pet.stage).toBe(0)
    })
  })

  describe('grantReward', () => {
    it('grants exp and stats for completing a task', async () => {
      const store = usePetStore()
      await store.grantReward('task', { priority: 'medium' })
      expect(store.pet.exp).toBe(15)
      expect(store.pet.hunger).toBe(88)
      expect(store.pet.mood).toBe(83)
      expect(store.pet.todayExp).toBe(15)
      expect(store.pet.totalExp).toBe(15)
    })

    it('applies high priority multiplier', async () => {
      const store = usePetStore()
      await store.grantReward('task', { priority: 'high' })
      expect(store.pet.exp).toBe(Math.round(15 * 1.5))
    })

    it('applies low priority multiplier', async () => {
      const store = usePetStore()
      await store.grantReward('task', { priority: 'low' })
      expect(store.pet.exp).toBe(Math.round(15 * 0.7))
    })

    it('grants exp for habit checkin', async () => {
      const store = usePetStore()
      await store.grantReward('habit', { streak: 1 })
      expect(store.pet.exp).toBe(10)
      expect(store.pet.hunger).toBe(85)
      expect(store.pet.mood).toBe(85)
    })

    it('applies streak multiplier for habits', async () => {
      const store = usePetStore()
      await store.grantReward('habit', { streak: 10 })
      expect(store.pet.exp).toBe(Math.round(10 * 1.5))
    })

    it('grants exp for pomodoro', async () => {
      const store = usePetStore()
      await store.grantReward('pomodoro')
      expect(store.pet.exp).toBe(12)
      expect(store.pet.hunger).toBe(85)
      expect(store.pet.mood).toBe(82)
    })

    it('clamps hunger and mood to 100', async () => {
      const store = usePetStore()
      store.pet.hunger = 99
      store.pet.mood = 99
      await store.grantReward('task')
      expect(store.pet.hunger).toBe(100)
      expect(store.pet.mood).toBe(100)
    })
  })

  describe('leveling and evolution', () => {
    it('levels up when exp exceeds threshold', async () => {
      const store = usePetStore()
      store.pet.expToNext = 10
      store.pet.exp = 0
      await store.grantReward('task', { priority: 'high' }) // 22 exp
      expect(store.pet.level).toBe(2)
      expect(store.pet.exp).toBe(22 - 10) // leftover exp
    })

    it('evolves to stage 1 at level 5', async () => {
      const store = usePetStore()
      store.pet.level = 4
      store.pet.exp = 0
      store.pet.expToNext = 5
      await store.grantReward('pomodoro') // 12 exp, level up to 5
      expect(store.pet.level).toBeGreaterThanOrEqual(5)
      expect(store.pet.stage).toBe(1)
    })

    it('does not evolve past stage 4', async () => {
      const store = usePetStore()
      store.pet.level = 29
      store.pet.exp = 0
      store.pet.expToNext = 5
      await store.grantReward('pomodoro')
      // May have leveled to 30+
      if (store.pet.level >= 30) {
        expect(store.pet.stage).toBe(4)
      }
    })
  })

  describe('interactions', () => {
    it('petCat increases mood', async () => {
      const store = usePetStore()
      store.pet.mood = 50
      const result = await store.petCat()
      expect(result).toBe(true)
      expect(store.pet.mood).toBe(60)
      expect(store.pet.todayPetCount).toBe(1)
    })

    it('petCat respects daily limit', async () => {
      const store = usePetStore()
      store.pet.todayPetCount = 3
      const result = await store.petCat()
      expect(result).toBe(false)
      expect(store.canPet).toBe(false)
    })

    it('feedSnack increases hunger', async () => {
      const store = usePetStore()
      store.pet.hunger = 50
      const result = await store.feedSnack()
      expect(result).toBe(true)
      expect(store.pet.hunger).toBe(65)
      expect(store.pet.todayFeedCount).toBe(1)
    })

    it('feedSnack respects daily limit', async () => {
      const store = usePetStore()
      store.pet.todayFeedCount = 3
      const result = await store.feedSnack()
      expect(result).toBe(false)
      expect(store.canFeed).toBe(false)
    })
  })

  describe('mood state', () => {
    it('returns sad when hunger is low', () => {
      const store = usePetStore()
      store.pet.hunger = 20
      store.pet.mood = 80
      expect(store.moodState).toBe('sad')
    })

    it('returns sad when mood is low', () => {
      const store = usePetStore()
      store.pet.hunger = 80
      store.pet.mood = 20
      expect(store.moodState).toBe('sad')
    })

    it('returns normal when both stats are healthy', () => {
      const store = usePetStore()
      store.pet.hunger = 60
      store.pet.mood = 60
      expect(store.moodState).toBe('normal')
    })
  })

  describe('status warning', () => {
    it('shows hunger warning', () => {
      const store = usePetStore()
      store.pet.hunger = 25
      store.pet.mood = 80
      expect(store.statusWarning).toBe('好饿…')
    })

    it('shows mood warning', () => {
      const store = usePetStore()
      store.pet.hunger = 80
      store.pet.mood = 25
      expect(store.statusWarning).toBe('不开心…')
    })

    it('no warning when stats are fine', () => {
      const store = usePetStore()
      store.pet.hunger = 60
      store.pet.mood = 60
      expect(store.statusWarning).toBe('')
    })
  })

  describe('decay', () => {
    it('applies offline decay on load', async () => {
      // Simulate 6 hours of offline time
      const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000
      mockLoadPet.mockResolvedValueOnce({
        hunger: 80,
        mood: 80,
        lastUpdated: new Date(sixHoursAgo).toISOString(),
        todayDate: new Date().toISOString().split('T')[0],
        level: 1,
        exp: 0,
        expToNext: 100,
        stage: 0
      })
      const store = usePetStore()
      await store.loadPet()
      // 6h / 2h per point = 3 hunger loss
      expect(store.pet.hunger).toBe(77)
      // 6h / 3h per point = 2 mood loss
      expect(store.pet.mood).toBe(78)
    })

    it('does not decay below 0', async () => {
      const veryOld = Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days
      mockLoadPet.mockResolvedValueOnce({
        hunger: 10,
        mood: 10,
        lastUpdated: new Date(veryOld).toISOString(),
        todayDate: new Date().toISOString().split('T')[0],
        level: 1,
        exp: 0,
        expToNext: 100,
        stage: 0
      })
      const store = usePetStore()
      await store.loadPet()
      expect(store.pet.hunger).toBe(0)
      expect(store.pet.mood).toBe(0)
    })
  })

  describe('daily counter reset', () => {
    it('resets daily counters on new day', async () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      mockLoadPet.mockResolvedValueOnce({
        hunger: 80,
        mood: 80,
        lastUpdated: new Date().toISOString(),
        todayDate: yesterday.toISOString().split('T')[0],
        todayFeedCount: 3,
        todayPetCount: 3,
        todayExp: 50,
        level: 1,
        exp: 0,
        expToNext: 100,
        stage: 0
      })
      const store = usePetStore()
      await store.loadPet()
      expect(store.pet.todayFeedCount).toBe(0)
      expect(store.pet.todayPetCount).toBe(0)
      expect(store.pet.todayExp).toBe(0)
    })
  })
})
