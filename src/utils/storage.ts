const STORAGE_PREFIX = 'recipe_'

export const storage = {
  get<T>(key: string): T | null {
    try {
      const raw = uni.getStorageSync(STORAGE_PREFIX + key)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  },

  set<T>(key: string, value: T): void {
    try {
      uni.setStorageSync(STORAGE_PREFIX + key, JSON.stringify(value))
    } catch (e) {
      console.error('Storage set error:', e)
    }
  },

  remove(key: string): void {
    try {
      uni.removeStorageSync(STORAGE_PREFIX + key)
    } catch (e) {
      console.error('Storage remove error:', e)
    }
  }
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8)
}

export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${month}-${day}`
}

export function isExpired(dateStr: string): boolean {
  return new Date(dateStr) < new Date()
}

export function getDaysUntilExpiry(dateStr: string): number {
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}