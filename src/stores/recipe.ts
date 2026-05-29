import { defineStore } from 'pinia'
import { ref } from 'vue'
import { GeneratedRecipe } from '@/data/types'
import { matchRecipes, getRecipeById } from '@/utils/recipeEngine'
import { useIngredientStore } from './ingredient'
import { useSeasoningStore } from './seasoning'

export const useRecipeStore = defineStore('recipe', () => {
  const generatedRecipes = ref<GeneratedRecipe[]>([])
  const isLoading = ref(false)
  const lastGenerateCount = ref(0)

  function generate(count: number) {
    isLoading.value = true
    lastGenerateCount.value = count

    const ingredientStore = useIngredientStore()
    const seasoningStore = useSeasoningStore()

    const results = matchRecipes(
      ingredientStore.ingredients,
      seasoningStore.seasonings,
      count
    )

    generatedRecipes.value = results
    isLoading.value = false
    return results
  }

  function getRecipeDetail(id: string) {
    return getRecipeById(id)
  }

  function clearResults() {
    generatedRecipes.value = []
  }

  return {
    generatedRecipes,
    isLoading,
    lastGenerateCount,
    generate,
    getRecipeDetail,
    clearResults
  }
})