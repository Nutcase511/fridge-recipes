import { storage } from './storage'

const USER_KEY = 'fresh_food_user_info'

export interface UserInfo {
  nickName: string
  avatarUrl: string
}

let cached: UserInfo | null = storage.get<UserInfo>(USER_KEY)
let listeners: Array<() => void> = []

export function useUser() {
  function getUser(): UserInfo | null {
    return cached
  }

  function isLoggedIn(): boolean {
    return !!cached
  }

  function save(info: UserInfo) {
    cached = info
    storage.set(USER_KEY, info)
    listeners.forEach(fn => fn())
  }

  function updateNickname(nickName: string) {
    if (!cached) {
      save({ nickName, avatarUrl: '' })
    } else {
      save({ ...cached, nickName })
    }
  }

  function updateAvatar(avatarUrl: string) {
    if (!cached) {
      save({ nickName: '', avatarUrl })
    } else {
      save({ ...cached, avatarUrl })
    }
  }

  function logout() {
    cached = null
    storage.remove(USER_KEY)
    listeners.forEach(fn => fn())
  }

  function onChange(fn: () => void) {
    listeners.push(fn)
    return () => {
      listeners = listeners.filter(f => f !== fn)
    }
  }

  return { getUser, isLoggedIn, save, updateNickname, updateAvatar, logout, onChange }
}