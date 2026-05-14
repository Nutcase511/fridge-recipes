export interface Ingredient {
  id: string
  name: string
  category: IngredientCategory
  quantity: number
  unit: string
  expiryDate?: string
  createTime: string
}

export type IngredientCategory = '蔬菜' | '肉类' | '海鲜' | '豆制品' | '蛋奶' | '水果' | '主食' | '其他'

export interface Seasoning {
  id: string
  name: string
  category: SeasoningCategory
  quantity: number
  unit: string
  createTime: string
}

export type SeasoningCategory = '基础调料' | '酱料' | '香料' | '油类' | '料酒醋类' | '其他'

export interface RecipeIngredient {
  name: string
  quantity: string
  required: boolean
  type: 'ingredient' | 'seasoning'
}

export interface RecipeStep {
  text: string
  image?: string
}

export const CUISINE_TYPES = ['川菜', '湘菜', '粤菜', '鲁菜', '苏菜', '浙菜', '闽菜', '徽菜', '东北菜', '西北菜', '云南菜', '湖北菜', '中餐'] as const
export const DIFFICULTY_LEVELS = ['简单', '中等', '困难'] as const
export const SPICINESS_LEVELS = ['不辣', '微辣', '中辣', '重辣'] as const
export const COOKING_METHODS = ['炒', '炖', '蒸', '煮', '炸', '烤', '煎', '卤', '凉拌', '焖', '烧', '煲', '熘', '煨'] as const
export const MEAL_TYPES = ['早餐', '午餐', '晚餐', '宵夜'] as const
export const SEASONS = ['春', '夏', '秋', '冬'] as const
export const MAIN_INGREDIENTS = ['猪肉', '鸡肉', '牛肉', '排骨', '鱼', '虾', '鸡蛋', '豆腐', '蔬菜', '菌菇', '豆制品', '羊肉', '内脏', '海鲜', '其他'] as const

export type CuisineType = typeof CUISINE_TYPES[number]
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number]
export type SpicinessLevel = typeof SPICINESS_LEVELS[number]
export type CookingMethod = typeof COOKING_METHODS[number]
export type MealType = typeof MEAL_TYPES[number]
export type Season = typeof SEASONS[number]
export type MainIngredient = typeof MAIN_INGREDIENTS[number]

export interface Recipe {
  id: string
  name: string
  description: string
  difficulty: DifficultyLevel
  cookingTime: number
  cuisine: CuisineType
  image?: string
  coverImage?: string
  videoUrl?: string
  ingredients: RecipeIngredient[]
  steps: RecipeStep[]
  tips?: string

  tags: string[]
  mealType: MealType[]
  cookingMethod: CookingMethod[]
  spiciness: SpicinessLevel
  mainIngredient: MainIngredient[]
  season: Season[]
  calories?: number
  servingSize?: number
}

export interface GeneratedRecipe extends Recipe {
  matchScore: number
  missingIngredients: string[]
  missingSeasonings: string[]
}

export const recipeEmojiMap: Record<string, string> = {
  '番茄炒蛋': '🍅',
  '青椒肉丝': '🫑',
  '麻婆豆腐': '🫘',
  '可乐鸡翅': '🥤',
  '蒜蓉西兰花': '🥦',
  '红烧排骨': '🍖',
  '凉拌黄瓜': '🥒',
  '紫菜蛋花汤': '🥣',
  '鱼香肉丝': '🐟',
  '西红柿鸡蛋面': '🍜',
  '土豆炖牛肉': '🥔',
  '清炒小白菜': '🥬',
  '宫保鸡丁': '🐔',
  '鸡蛋炒饭': '🍚',
  '酸辣汤': '🌶️',
  '蒜蓉粉丝蒸虾': '🦐',
  '醋溜白菜': '🥬',
  '玉米排骨汤': '🌽',
  '干煸四季豆': '🫘',
  '皮蛋豆腐': '🥟',
  '蚝油生菜': '🥬',
  '红烧茄子': '🍆',
  '番茄牛腩': '🐂',
  '葱花煎蛋': '🥚',
  '土豆丝': '🥔',
  '糖醋排骨': '🍖',
  '西葫芦炒鸡蛋': '🥒',
  '孜然牛肉': '🐂',
  '冬瓜排骨汤': '🍲',
  '葱爆羊肉': '🐑',
  '地三鲜': '🥔',
  '鲫鱼豆腐汤': '🐟',
  '回锅肉': '🥓',
  '清蒸鲈鱼': '🐟',
  '红烧肉': '🥩',
  '小炒肉': '🥓',
  '蒜蓉空心菜': '🥬',
  '冬瓜海带汤': '🍲',
  '苦瓜炒蛋': '🥚',
  '啤酒鸭': '🦆',
  '椒盐排骨': '🍖',
  '水煮肉片': '🌶️',
  '酸菜鱼': '🐟',
  '葱油饼': '🫓',
  '蛋炒饭': '🍚',
  '白灼虾': '🦐',
  '手撕包菜': '🥬',
  '香菇青菜': '🍄',
  '西红柿炒菜花': '🍅',
  '青椒土豆片': '🥔'
}