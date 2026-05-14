import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Ingredient } from '@/data/types'
import { storage, generateId } from '@/utils/storage'
import { seedIngredients } from '@/data/seed'

export const useIngredientStore = defineStore('ingredient', () => {
  const ingredients = ref<Ingredient[]>([])

  const ingredientCount = computed(() => ingredients.value.length)

  const expiredIngredients = computed(() =>
    ingredients.value.filter(i => i.expiryDate && new Date(i.expiryDate) < new Date())
  )

  const expiringSoonIngredients = computed(() =>
    ingredients.value.filter(i => {
      if (!i.expiryDate) return false
      const days = (new Date(i.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      return days > 0 && days <= 3
    })
  )

  const categorySummary = computed(() => {
    const summary: Record<string, number> = {}
    ingredients.value.forEach(i => {
      summary[i.category] = (summary[i.category] || 0) + 1
    })
    return summary
  })

  function load() {
    const data = storage.get<Ingredient[]>('ingredients')
    if (data && data.length > 0) {
      ingredients.value = data
    } else {
      seedIngredients.forEach(item => addIngredient(item))
    }
  }

  function save() {
    storage.set('ingredients', ingredients.value)
  }

  function addIngredient(ingredient: Omit<Ingredient, 'id' | 'createTime'>) {
    const newIngredient: Ingredient = {
      ...ingredient,
      id: generateId(),
      createTime: new Date().toISOString()
    }
    ingredients.value.push(newIngredient)
    save()
    return newIngredient
  }

  function updateIngredient(id: string, data: Partial<Ingredient>) {
    const index = ingredients.value.findIndex(i => i.id === id)
    if (index !== -1) {
      ingredients.value[index] = { ...ingredients.value[index], ...data }
      save()
    }
  }

  function removeIngredient(id: string) {
    ingredients.value = ingredients.value.filter(i => i.id !== id)
    save()
  }

  function clearAll() {
    ingredients.value = []
    save()
  }

  function getIngredientNames(): string[] {
    return ingredients.value.map(i => i.name)
  }

  load()

  return {
    ingredients,
    ingredientCount,
    expiredIngredients,
    expiringSoonIngredients,
    categorySummary,
    load,
    save,
    addIngredient,
    updateIngredient,
    removeIngredient,
    clearAll,
    getIngredientNames
  }
})