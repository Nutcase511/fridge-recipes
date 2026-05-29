<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + 10) + 'px' }">
    <view class="profile-header">
      <view class="avatar-wrap" @click="chooseAvatar">
        <image
          class="avatar"
          :src="userData.avatarUrl || defaultAvatar"
          mode="aspectFill"
        />
        <view class="camera-btn">
          <text class="camera-icon">📷</text>
        </view>
      </view>
      <button class="avatar-btn-hidden" open-type="chooseAvatar" @chooseavatar="onChooseAvatar"></button>

      <view v-if="!editingName" class="name-area" @click="startEditName">
        <text class="user-name">{{ userData.nickName || '点击设置昵称' }}</text>
        <text class="edit-hint">✏️</text>
      </view>
      <input
        v-else
        class="name-input"
        type="nickname"
        v-model="nicknameInput"
        placeholder="请输入昵称"
        @blur="onNameBlur"
        @confirm="onNameBlur"
        focus
      />
      <text class="user-level">{{ userData.isLoggedIn ? 'Lv.5 资深管理达人' : '设置头像和昵称后享受更多功能' }}</text>
    </view>

    <view class="stats-grid">
      <view class="stat-item">
        <text class="stat-num">{{ ingredientStore.ingredients.length }}</text>
        <text class="stat-label">已记录食材</text>
      </view>
      <view class="stat-item stat-border">
        <text class="stat-num">{{ recipeCount }}</text>
        <text class="stat-label">已生成菜谱</text>
      </view>
      <view class="stat-item">
        <text class="stat-num">2.5kg</text>
        <text class="stat-label">累计节约</text>
      </view>
    </view>

    <view class="menu-card">
      <view class="menu-item" @click="showToast('收藏')">
        <view class="menu-left">
          <text class="menu-icon menu-red">❤️</text>
          <text class="menu-text">我的收藏</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="showToast('购物清单')">
        <view class="menu-left">
          <text class="menu-icon menu-orange">🛍️</text>
          <text class="menu-text">购物清单</text>
        </view>
        <view class="menu-right">
          <text class="menu-badge">3件待买</text>
          <text class="menu-arrow">›</text>
        </view>
      </view>
      <view class="menu-item" @click="showToast('预警设置')">
        <view class="menu-left">
          <text class="menu-icon menu-yellow">🔔</text>
          <text class="menu-text">食材预警设置</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="showToast('家庭共享')">
        <view class="menu-left">
          <text class="menu-icon menu-blue">👥</text>
          <text class="menu-text">家庭共享中心</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @click="showToast('偏好设置')">
        <view class="menu-left">
          <text class="menu-icon menu-purple">✨</text>
          <text class="menu-text">饮食习惯偏好</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item no-border" @click="showToast('关于')">
        <view class="menu-left">
          <text class="menu-icon menu-gray">ℹ️</text>
          <text class="menu-text">关于鲜食记</text>
        </view>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <view class="logout-btn" @click="userUtils.logout(); syncData(); uni.showToast({title:'已退出',icon:'success'})">
      退出登录
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useIngredientStore } from '@/stores/ingredient'
import { useUser } from '@/utils/user'
import { useShare } from '@/utils/share'

const { enableShareMenu } = useShare()
const ingredientStore = useIngredientStore()
const userUtils = useUser()

const statusBarHeight = ref(0)

onLoad(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 0
  ingredientStore.load()
  syncData()
  enableShareMenu()
})

const defaultAvatar = 'https://modao.cc/agent-py/media/generated_images/2026-05-13/e96cf79685f6430eb9230062d5f3bbaf.jpg'

const userData = reactive({
  avatarUrl: '',
  nickName: '',
  isLoggedIn: false
})

const editingName = ref(false)
const nicknameInput = ref('')

function syncData() {
  const u = userUtils.getUser()
  userData.avatarUrl = u?.avatarUrl || ''
  userData.nickName = u?.nickName || ''
  userData.isLoggedIn = !!u
}

function chooseAvatar() {
  const btn = document.querySelector('.avatar-btn-hidden') as HTMLElement
  if (btn) btn.click()
}

function onChooseAvatar(e: any) {
  const url = e.detail?.avatarUrl
  if (url) {
    userUtils.updateAvatar(url)
    syncData()
  }
}

function startEditName() {
  editingName.value = true
  nicknameInput.value = userData.nickName
}

function onNameBlur() {
  editingName.value = false
  const name = nicknameInput.value?.trim()
  if (name) {
    userUtils.updateNickname(name)
    syncData()
  }
}

const recipeCount = computed(() => Math.max(ingredientStore.ingredients.length * 3, 10))

function showToast(msg: string) {
  uni.showToast({ title: msg + ' 开发中', icon: 'none' })
}

</script>

<script lang="ts">
export default {
  onShareAppMessage() {
    return { title: '鲜食记 - 个人中心', path: '/pages/profile/index' }
  }
}
</script>

<style scoped>
.page {
  background: #F5F5F7;
  min-height: 100vh;
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 160rpx;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60rpx;
}

.avatar-wrap {
  position: relative;
  margin-bottom: 24rpx;
}

.avatar {
  width: 192rpx;
  height: 192rpx;
  border-radius: 50%;
  border: 8rpx solid white;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.1);
}

.camera-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 64rpx;
  height: 64rpx;
  background: #F97316;
  border-radius: 50%;
  border: 4rpx solid white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-icon {
  font-size: 28rpx;
}

.avatar-btn-hidden {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  overflow: hidden;
  z-index: -1;
}

.name-area {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 8rpx;
}

.user-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #1F2937;
}

.edit-hint {
  font-size: 28rpx;
  color: #9CA3AF;
}

.name-input {
  font-size: 36rpx;
  font-weight: 700;
  color: #1F2937;
  text-align: center;
  margin-bottom: 8rpx;
  padding: 8rpx 24rpx;
  background: #F9FAFB;
  border: 2rpx solid #E5E7EB;
  border-radius: 16rpx;
  width: 60%;
}

.user-level {
  font-size: 24rpx;
  color: #9CA3AF;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  margin-bottom: 36rpx;
  background: white;
  border-radius: 48rpx;
  padding: 32rpx 0;
  border: 2rpx solid #F3F4F6;
}

.stat-item {
  text-align: center;
}

.stat-border {
  border-left: 2rpx solid #F3F4F6;
  border-right: 2rpx solid #F3F4F6;
}

.stat-num {
  font-size: 36rpx;
  font-weight: 700;
  color: #1F2937;
  display: block;
  margin-bottom: 4rpx;
}

.stat-label {
  font-size: 20rpx;
  color: #9CA3AF;
}

.menu-card {
  background: white;
  border-radius: 48rpx;
  border: 2rpx solid #F3F4F6;
  overflow: hidden;
  margin-bottom: 36rpx;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx 36rpx;
  border-bottom: 2rpx solid #F9FAFB;
}

.no-border {
  border-bottom: none;
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.menu-icon {
  font-size: 32rpx;
  width: 48rpx;
  text-align: center;
}

.menu-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #374151;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.menu-badge {
  padding: 6rpx 16rpx;
  background: #FFF7F0;
  color: #EA580C;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 600;
}

.menu-arrow {
  font-size: 32rpx;
  color: #D1D5DB;
}

.logout-btn {
  text-align: center;
  padding: 32rpx 0;
  background: white;
  color: #EF4444;
  font-size: 28rpx;
  font-weight: 700;
  border-radius: 28rpx;
  border: 2rpx solid #FECACA;
}
</style>