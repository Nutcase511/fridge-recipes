import { recipeDatabase } from '@/data/recipes'
import { Ingredient, Seasoning, GeneratedRecipe } from '@/data/types'

interface AvailableItems {
  ingredients: string[]
  seasonings: string[]
}

export function matchRecipes(
  userIngredients: Ingredient[],
  userSeasonings: Seasoning[],
  count: number
): GeneratedRecipe[] {
  const available: AvailableItems = {
    ingredients: userIngredients.map(i => i.name),
    seasonings: userSeasonings.map(s => s.name)
  }

  const scored = recipeDatabase.map(recipe => {
    const result = calculateMatchScore(recipe.ingredients, available)
    return {
      ...recipe,
      matchScore: result.score,
      missingIngredients: result.missingIngredients,
      missingSeasonings: result.missingSeasonings
    }
  })

  const filtered = scored.filter(r => r.matchScore >= 50)

  filtered.sort((a, b) => b.matchScore - a.matchScore)

  if (filtered.length === 0) {
    const partial = scored.slice(0, Math.min(count, scored.length))
    partial.sort((a, b) => b.matchScore - a.matchScore)
    return partial
  }

  return filtered.slice(0, count)
}

function calculateMatchScore(
  recipeIngredients: { name: string; required: boolean; type: 'ingredient' | 'seasoning' }[],
  available: AvailableItems
): { score: number; missingIngredients: string[]; missingSeasonings: string[] } {
  let totalWeight = 0
  let matchedWeight = 0
  const missingIngredients: string[] = []
  const missingSeasonings: string[] = []

  for (const ri of recipeIngredients) {
    const weight = ri.required ? 2 : 1
    totalWeight += weight

    const availableList = ri.type === 'ingredient' ? available.ingredients : available.seasonings
    const isAvailable = availableList.some(a => a.includes(ri.name) || ri.name.includes(a))

    if (isAvailable) {
      if (ri.required) {
        matchedWeight += 2
      } else {
        matchedWeight += 1
      }
    } else {
      if (ri.type === 'ingredient') {
        missingIngredients.push(ri.name)
      } else {
        missingSeasonings.push(ri.name)
      }
    }
  }

  const score = Math.round((matchedWeight / totalWeight) * 100)

  return { score, missingIngredients, missingSeasonings }
}

export function getRecipeById(id: string) {
  return recipeDatabase.find(r => r.id === id)
}

export function searchRecipes(keyword: string) {
  const kw = keyword.toLowerCase()
  return recipeDatabase.filter(
    r =>
      r.name.includes(kw) ||
      r.ingredients.some(i => i.name.includes(kw)) ||
      r.cuisine.includes(kw)
  )
}