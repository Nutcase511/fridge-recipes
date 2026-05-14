<template>
  <view class="page">
    <!-- 头部：头像 + 鲜食记 + 通知铃铛 -->
    <view class="header">
      <view class="header-left" @click="handleAvatarClick">
        <image
          class="avatar"
          :src="userData.avatarUrl"
          mode="aspectFill"
        />
        <view class="header-text">
          <text class="app-name">鲜食记</text>
          <text class="tagline">{{ userData.isLoggedIn ? '你好，' + userData.nickName : '点击头像登录' }}</text>
        </view>
      </view>
      <view class="notif-btn">
        <text class="notif-icon">🔔</text>
        <text class="notif-dot"></text>
      </view>
    </view>

    <!-- 搜索栏 -->
    <view class="search-bar" @click="goSearch">
      <text class="search-icon">🔍</text>
      <text class="search-placeholder">搜索冰箱内的食材...</text>
    </view>

    <!-- 分类标签 -->
    <scroll-view scroll-x class="cat-scroll" show-scrollbar="false">
      <view
        v-for="cat in categories"
        :key="cat.key"
        class="cat-chip"
        :class="{ active: selectedCat === cat.key }"
        @click="selectedCat = cat.key"
      >
        {{ cat.label }}
      </view>
    </scroll-view>

    <!-- 食材网格: 2列 -->
    <view v-if="displayList.length === 0" class="empty-state">
      <text class="empty-icon">🧊</text>
      <text class="empty-title">冰箱空空如也</text>
      <text class="empty-desc">快去添加食材吧</text>
      <view class="empty-btn" @click="goAddFood">+ 添加食材</view>
    </view>

    <view v-else class="food-grid">
      <view
        v-for="item in displayList"
        :key="item.id"
        class="food-card"
        @click="goFoodDetail(item.id)"
      >
        <view class="card-img-wrap">
          <image
            class="card-img"
            :src="getIngredientImage(item.name)"
            mode="aspectFill"
          />
          <text class="status-badge" :class="getStatusClass(item)">{{ getStatusText(item) }}</text>
        </view>
        <text class="card-name">{{ item.name }}</text>
        <view class="card-bottom">
          <text class="card-qty">{{ item.quantity }}{{ item.unit }}</text>
          <text class="card-days" :class="getDaysClass(item)">{{ getDaysText(item) }}</text>
        </view>
      </view>
    </view>

    <!-- 悬浮添加按钮 -->
    <view class="fab" @click="goAddFood">
      <text class="fab-icon">+</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useIngredientStore } from '@/stores/ingredient'
import { useSeasoningStore } from '@/stores/seasoning'
import { useUser } from '@/utils/user'
import { useShare } from '@/utils/share'

const { enableShareMenu } = useShare()
const ingredientStore = useIngredientStore()
const seasoningStore = useSeasoningStore()
const userUtils = useUser()

const defaultAvatar = 'https://modao.cc/agent-py/media/generated_images/2026-05-13/e96cf79685f6430eb9230062d5f3bbaf.jpg'

const userData = reactive({
  avatarUrl: userUtils.getUser()?.avatarUrl || defaultAvatar,
  nickName: userUtils.getUser()?.nickName || '',
  isLoggedIn: userUtils.isLoggedIn()
})

const selectedCat = ref('all')

const categories = [
  { key: 'all', label: '全部' },
  { key: '蔬菜', label: '蔬菜' },
  { key: '水果', label: '水果' },
  { key: '肉类', label: '肉类' },
  { key: '海鲜', label: '海鲜' },
  { key: '蛋奶', label: '蛋奶' }
]

const displayList = computed(() => {
  const list = ingredientStore.ingredients
  if (selectedCat.value === 'all') return list
  return list.filter(i => i.category === selectedCat.value)
})

// 设计稿中的图片素材URL
const imageMap: Record<string, string> = {
  '西红柿': 'https://modao.cc/agent-py/media/generated_images/2026-05-13/bf00a2beeda44fb9827f2273e42a804d.jpg',
  '番茄': 'https://modao.cc/agent-py/media/generated_images/2026-05-13/bf00a2beeda44fb9827f2273e42a804d.jpg',
  '西兰花': 'https://modao.cc/agent-py/media/generated_images/2026-05-13/aa81a155493d41fca6c9242283868b49.jpg',
  '花椰菜': 'https://modao.cc/agent-py/media/generated_images/2026-05-13/aa81a155493d41fca6c9242283868b49.jpg',
  '牛奶': 'https://modao.cc/agent-py/media/generated_images/2026-05-13/167a037f39c84f348edcaf76b52663e7.jpg',
  '鸡蛋': 'https://modao.cc/agent-py/media/generated_images/2026-05-13/167a037f39c84f348edcaf76b52663e7.jpg',
}

function getIngredientImage(name: string): string {
  for (const [key, url] of Object.entries(imageMap)) {
    if (name.includes(key) || key.includes(name)) return url
  }
  // 使用设计稿中的默认图片
  return 'https://modao.cc/agent-py/media/generated_images/2026-05-13/bf00a2beeda44fb9827f2273e42a804d.jpg'
}

function calcDaysLeft(item: any): number {
  if (!item.expiryDate) return 999
  return Math.ceil((new Date(item.expiryDate).getTime() - Date.now()) / 86400000)
}

function getStatusText(item: any): string {
  const d = calcDaysLeft(item)
  if (d <= 0) return '过期'
  if (d <= 3) return '临期'
  return '新鲜'
}

function getStatusClass(item: any): string {
  const d = calcDaysLeft(item)
  if (d <= 0) return 'badge-overdue'
  if (d <= 3) return 'badge-expiring'
  return 'badge-fresh'
}

function getDaysText(item: any): string {
  const d = calcDaysLeft(item)
  if (d <= 0) return '已过期'
  if (d === 1) return '剩 1 天'
  return `剩 ${d} 天`
}

function getDaysClass(item: any): string {
  const d = calcDaysLeft(item)
  if (d <= 0) return 'days-overdue'
  if (d <= 3) return 'days-expiring'
  return 'days-ok'
}

function handleAvatarClick() {
    uni.navigateTo({ url: '/pages/profile/index' })
  }

  function goSearch() {
  uni.navigateTo({ url: '/pages/ingredients/index' })
}

function goAddFood() {
  uni.navigateTo({ url: '/pages/add-food/index' })
}

function goFoodDetail(id: string) {
  uni.navigateTo({ url: `/pages/food-detail/index?id=${id}` })
}

onMounted(() => {
  ingredientStore.load()
  seasoningStore.load()
  enableShareMenu()
})
</script>

<script lang="ts">
export default {
  onShareAppMessage() {
    return {
      title: '鲜食记 - 让每一口都新鲜',
      path: '/pages/index/index'
    }
  }
}
</script>

<style scoped>
.page {
  background: #F5F5F7;
  min-height: 100vh;
  padding-bottom: 140rpx;
}

/* 头部 */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 100rpx 40rpx 20rpx;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  border: 4rpx solid #FFEDD5;
}

.header-text {
  display: flex;
  flex-direction: column;
}

.app-name {
  font-size: 36rpx;
  font-weight: 700;
  color: #1F2937;
  line-height: 1.2;
}

.tagline {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 2rpx;
}

.notif-btn {
  position: relative;
  width: 72rpx;
  height: 72rpx;
  background: #F3F4F6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notif-icon {
  font-size: 32rpx;
}

.notif-dot {
  position: absolute;
  top: 16rpx;
  right: 18rpx;
  width: 14rpx;
  height: 14rpx;
  background: #EF4444;
  border-radius: 50%;
  border: 3rpx solid #F5F5F7;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  align-items: center;
  margin: 8rpx 40rpx 24rpx;
  padding: 22rpx 30rpx;
  background: #F3F4F6;
  border-radius: 24rpx;
}

.search-icon {
  font-size: 28rpx;
  color: #9CA3AF;
  margin-right: 12rpx;
}

.search-placeholder {
  font-size: 26rpx;
  color: #9CA3AF;
}

/* 分类标签 */
.cat-scroll {
  white-space: nowrap;
  padding: 0 40rpx 24rpx;
}

.cat-chip {
  display: inline-block;
  padding: 12rpx 32rpx;
  margin-right: 16rpx;
  border-radius: 999rpx;
  font-size: 26rpx;
  color: #6B7280;
  background: white;
  border: 2rpx solid #E5E7EB;
  font-weight: 500;
}

.cat-chip.active {
  background: #F97316;
  color: white;
  border-color: #F97316;
  font-weight: 700;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 0;
}

.empty-icon { font-size: 120rpx; margin-bottom: 20rpx; opacity: 0.4; }
.empty-title { font-size: 32rpx; font-weight: 700; color: #1F2937; }
.empty-desc { font-size: 26rpx; color: #9CA3AF; margin: 8rpx 0 30rpx; }

.empty-btn {
  padding: 20rpx 60rpx;
  background: #F97316;
  color: white;
  border-radius: 999rpx;
  font-size: 28rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(249, 115, 22, 0.3);
}

/* 食材网格 */
.food-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28rpx;
  padding: 0 40rpx;
}

.food-card {
  background: white;
  padding: 20rpx;
  border-radius: 28rpx;
  border: 2rpx solid #F3F4F6;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
}

.card-img-wrap {
  position: relative;
  width: 100%;
  height: 192rpx;
  border-radius: 20rpx;
  overflow: hidden;
  margin-bottom: 16rpx;
  background: #FFF7F0;
}

.card-img {
  width: 100%;
  height: 100%;
}

.status-badge {
  position: absolute;
  top: 12rpx;
  right: 12rpx;
  padding: 6rpx 16rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 600;
  line-height: 1.4;
}

.badge-fresh { background: #10B981; color: white; }
.badge-expiring { background: #F59E0B; color: white; }
.badge-overdue { background: #EF4444; color: white; }

.card-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2937;
  display: block;
  margin-bottom: 8rpx;
}

.card-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-qty {
  font-size: 24rpx;
  color: #9CA3AF;
}

.card-days {
  font-size: 24rpx;
  font-weight: 600;
}

.days-ok { color: #059669; }
.days-expiring { color: #D97706; }
.days-overdue { color: #DC2626; }

/* FAB */
.fab {
  position: fixed;
  right: 40rpx;
  bottom: 180rpx;
  width: 112rpx;
  height: 112rpx;
  border-radius: 50%;
  background: #F97316;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8rpx 32rpx rgba(249, 115, 22, 0.4);
  z-index: 100;
}

.fab-icon {
  font-size: 56rpx;
  color: white;
  font-weight: 300;
  line-height: 1;
}
</style>