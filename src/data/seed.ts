import { Ingredient, Seasoning } from './types'

export const seedIngredients: Omit<Ingredient, 'id' | 'createTime'>[] = [
  { name: '鸡蛋', category: '蛋奶', quantity: 10, unit: '个', expiryDate: '2026-05-25' },
  { name: '鸡胸肉', category: '肉类', quantity: 2, unit: '块', expiryDate: '2026-05-18' },
  { name: '五花肉', category: '肉类', quantity: 1, unit: '块', expiryDate: '2026-05-20' },
  { name: '牛腩', category: '肉类', quantity: 300, unit: 'g', expiryDate: '2026-05-19' },
  { name: '排骨', category: '肉类', quantity: 400, unit: 'g', expiryDate: '2026-05-21' },
  { name: '鲫鱼', category: '海鲜', quantity: 1, unit: '条', expiryDate: '2026-05-16' },
  { name: '虾', category: '海鲜', quantity: 200, unit: 'g', expiryDate: '2026-05-17' },
  { name: '鸡翅', category: '肉类', quantity: 8, unit: '个', expiryDate: '2026-05-22' },
  { name: '羊肉', category: '肉类', quantity: 300, unit: 'g', expiryDate: '2026-05-23' },
  { name: '猪肉末', category: '肉类', quantity: 200, unit: 'g', expiryDate: '2026-05-18' }
]

export const seedSeasonings: Omit<Seasoning, 'id' | 'createTime'>[] = [
  { name: '盐', category: '基础调料', quantity: 1, unit: '袋' },
  { name: '糖', category: '基础调料', quantity: 1, unit: '袋' },
  { name: '生抽', category: '酱料', quantity: 1, unit: '瓶' },
  { name: '老抽', category: '酱料', quantity: 1, unit: '瓶' },
  { name: '醋', category: '料酒醋类', quantity: 1, unit: '瓶' },
  { name: '料酒', category: '料酒醋类', quantity: 1, unit: '瓶' },
  { name: '食用油', category: '油类', quantity: 1, unit: '桶' },
  { name: '香油', category: '油类', quantity: 1, unit: '瓶' },
  { name: '蚝油', category: '酱料', quantity: 1, unit: '瓶' },
  { name: '豆瓣酱', category: '酱料', quantity: 1, unit: '瓶' },
  { name: '番茄酱', category: '酱料', quantity: 1, unit: '瓶' },
  { name: '辣椒油', category: '油类', quantity: 1, unit: '瓶' },
  { name: '孜然粉', category: '香料', quantity: 1, unit: '瓶' },
  { name: '花椒粉', category: '香料', quantity: 1, unit: '瓶' },
  { name: '白胡椒粉', category: '香料', quantity: 1, unit: '瓶' },
  { name: '淀粉', category: '基础调料', quantity: 1, unit: '袋' },
  { name: '干辣椒', category: '香料', quantity: 1, unit: '袋' },
  { name: '花椒', category: '香料', quantity: 1, unit: '袋' },
  { name: '冰糖', category: '基础调料', quantity: 1, unit: '袋' },
  { name: '可乐', category: '其他', quantity: 1, unit: '罐' }
]