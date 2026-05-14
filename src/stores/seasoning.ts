import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Seasoning } from '@/data/types'
import { storage, generateId } from '@/utils/storage'
import { seedSeasonings } from '@/data/seed'

export const useSeasoningStore = defineStore('seasoning', () => {
  const seasonings = ref<Seasoning[]>([])

  const seasoningCount = computed(() => seasonings.value.length)

  const categorySummary = computed(() => {
    const summary: Record<string, number> = {}
    seasonings.value.forEach(s => {
      summary[s.category] = (summary[s.category] || 0) + 1
    })
    return summary
  })

  function load() {
    const data = storage.get<Seasoning[]>('seasonings')
    if (data && data.length > 0) {
      seasonings.value = data
    } else {
      seedSeasonings.forEach(item => addSeasoning(item))
    }
  }

  function save() {
    storage.set('seasonings', seasonings.value)
  }

  function addSeasoning(seasoning: Omit<Seasoning, 'id' | 'createTime'>) {
    const newSeasoning: Seasoning = {
      ...seasoning,
      id: generateId(),
      createTime: new Date().toISOString()
    }
    seasonings.value.push(newSeasoning)
    save()
    return newSeasoning
  }

  function updateSeasoning(id: string, data: Partial<Seasoning>) {
    const index = seasonings.value.findIndex(s => s.id === id)
    if (index !== -1) {
      seasonings.value[index] = { ...seasonings.value[index], ...data }
      save()
    }
  }

  function removeSeasoning(id: string) {
    seasonings.value = seasonings.value.filter(s => s.id === id)
    save()
  }

  function clearAll() {
    seasonings.value = []
    save()
  }

  function getSeasoningNames(): string[] {
    return seasonings.value.map(s => s.name)
  }

  load()

  return {
    seasonings,
    seasoningCount,
    categorySummary,
    load,
    save,
    addSeasoning,
    updateSeasoning,
    removeSeasoning,
    clearAll,
    getSeasoningNames
  }
})