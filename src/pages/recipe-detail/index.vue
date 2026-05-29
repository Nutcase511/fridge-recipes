<template>
  <view class="page">
    <view v-if="loading" class="loading-state">
      <text class="loading-icon">👨‍🍳</text>
      <text class="loading-text">加载中...</text>
    </view>

    <view v-else-if="!recipe" class="empty-state">
      <text class="empty-icon">😅</text>
      <text class="empty-text">菜谱不存在</text>
    </view>

    <view v-else class="detail">
      <view class="hero-section">
        <image
          class="hero-img"
          :src="recipeImage"
          mode="aspectFill"
        />
        <view class="hero-back" :style="{ top: (statusBarHeight + 10) + 'px' }" @click="goBack">
          <text class="back-icon">←</text>
        </view>
        <view class="hero-fav" :style="{ top: (statusBarHeight + 10) + 'px' }" @click="onShare">
          <text class="fav-icon">🤍</text>
        </view>
      </view>

      <view class="body-section">
        <view class="info-header">
          <view class="info-left">
            <text class="recipe-name">{{ recipe.name }}</text>
            <view class="recipe-rating">
              <text class="star">⭐</text>
              <text class="rating-num">{{ rating }}</text>
              <text class="rating-sep">|</text>
              <text class="rating-count">{{ ratingCount }} 人做过</text>
            </view>
          </view>
        </view>

        <view class="stats-row">
          <view class="stat-card stat-orange">
            <text class="stat-num">{{ recipe.cookingTime }}</text>
            <text class="stat-unit">分钟</text>
          </view>
          <view class="stat-card stat-green">
            <text class="stat-num">{{ recipe.difficulty }}</text>
            <text class="stat-unit">难度</text>
          </view>
          <view class="stat-card stat-blue">
            <text class="stat-num">{{ recipe.calories || '—' }}</text>
            <text class="stat-unit">千卡</text>
          </view>
        </view>

        <view v-if="recipe.videoUrl" class="video-card" @click="openVideo">
          <text class="video-icon">🎬</text>
          <view class="video-info">
            <text class="video-title">视频教程</text>
            <text class="video-hint">点击观看完整烹饪过程 →</text>
          </view>
        </view>

        <view class="section">
          <view class="section-header">
            <text class="section-title">食材清单</text>
            <text class="section-meta">2人份</text>
          </view>
          <view class="ing-list">
            <view
              v-for="item in foodIngredients"
              :key="item.name"
              class="ing-row"
            >
              <view class="ing-left">
                <text class="ing-dot" :class="isIngredientAvailable(item.name) ? 'dot-have' : 'dot-miss'"></text>
                <text class="ing-name">{{ item.name }}</text>
              </view>
              <text class="ing-qty">{{ item.quantity }}</text>
              <text class="ing-status" :class="isIngredientAvailable(item.name) ? 'status-have' : 'status-need'">
                {{ isIngredientAvailable(item.name) ? '(已有✓)' : '需采购' }}
              </text>
            </view>
          </view>
        </view>

        <view class="section">
          <view class="section-header">
            <text class="section-title">调料清单</text>
          </view>
          <view class="ing-list">
            <view
              v-for="item in seasoningIngredients"
              :key="item.name"
              class="ing-row"
            >
              <view class="ing-left">
                <text class="ing-dot" :class="isSeasoningAvailable(item.name) ? 'dot-have' : 'dot-miss'"></text>
                <text class="ing-name">{{ item.name }}</text>
              </view>
              <text class="ing-qty">{{ item.quantity }}</text>
              <text class="ing-status" :class="isSeasoningAvailable(item.name) ? 'status-have' : 'status-need'">
                {{ isSeasoningAvailable(item.name) ? '已有✓' : '需采购' }}
              </text>
            </view>
          </view>
        </view>

        <view class="section">
          <view class="section-header">
            <text class="section-title">烹饪步骤</text>
          </view>
          <view class="steps-list">
            <view
              v-for="(step, index) in recipe.steps"
              :key="index"
              class="step-row"
            >
              <view class="step-num">{{ index + 1 }}</view>
              <view class="step-content">
                <text class="step-text">{{ step.text }}</text>
                <image
                  v-if="step.image"
                  class="step-img"
                  :src="step.image"
                  mode="widthFix"
                  @click="previewImage(step.image!)"
                />
              </view>
            </view>
          </view>
        </view>

        <view v-if="recipe.tips" class="tips-card">
          <view class="tips-header">
            <text class="tips-icon">💡</text>
            <text class="tips-title">小贴士</text>
          </view>
          <text class="tips-text">{{ recipe.tips }}</text>
        </view>

        <view class="bottom-actions">
          <view class="action-btn outline" @click="onShare">
            <text>📋 加入购物清单</text>
          </view>
          <view class="action-btn primary" @click="startCooking">
            <text>🔥 开始烹饪</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useRecipeStore } from '@/stores/recipe'
import { useIngredientStore } from '@/stores/ingredient'
import { useSeasoningStore } from '@/stores/seasoning'
import { Recipe } from '@/data/types'
import { useShare } from '@/utils/share'

const { enableShareMenu } = useShare()
const recipeStore = useRecipeStore()
const ingredientStore = useIngredientStore()
const seasoningStore = useSeasoningStore()

const recipe = ref<Recipe | null>(null)
const loading = ref(true)
const statusBarHeight = ref(0)
const recipeImage = 'https://modao.cc/agent-py/media/generated_images/2026-05-13/50b83da29f9a440aba8c352c5dc4afcf.jpg'

onLoad((options) => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 0
  const id = options?.id
  if (id) {
    recipe.value = recipeStore.getRecipeDetail(id)
  }
  ingredientStore.load()
  seasoningStore.load()
  loading.value = false
  enableShareMenu()
})

const foodIngredients = computed(() =>
  recipe.value?.ingredients.filter(i => i.type === 'ingredient') || []
)

const seasoningIngredients = computed(() =>
  recipe.value?.ingredients.filter(i => i.type === 'seasoning') || []
)

const rating = computed(() => {
  if (!recipe.value) return '4.0'
  const base = 4.0
  const bonus = Math.min(recipe.value.cookingTime / 60, 1) * 0.5 + Math.random() * 0.3
  return (base + bonus).toFixed(1)
})

const ratingCount = computed(() => {
  return Math.floor(800 + Math.random() * 2000)
})

function getRecipeEmoji(cuisine: string): string {
  const map: Record<string, string> = {
    '川菜': '🌶️', '湘菜': '🌶️', '粤菜': '🥟', '东北菜': '🍲',
    '鲁菜': '🦐', '苏菜': '🦀', '浙菜': '🐟', '闽菜': '🦪',
    '徽菜': '🥘', '西北菜': '🥩', '湖北菜': '🦆', '云南菜': '🍄',
    '中餐': '🍳'
  }
  return map[cuisine] || '🍳'
}

function isIngredientAvailable(name: string): boolean {
  const names = ingredientStore.getIngredientNames()
  return names.some(n => n.includes(name) || name.includes(n))
}

function isSeasoningAvailable(name: string): boolean {
  const names = seasoningStore.getSeasoningNames()
  return names.some(n => n.includes(name) || name.includes(n))
}

function openVideo() {
  if (recipe.value?.videoUrl) {
    uni.navigateTo({
      url: `/pages/video-player/index?url=${encodeURIComponent(recipe.value.videoUrl)}`
    })
  }
}

function previewImage(url: string) {
  uni.previewImage({ urls: [url] })
}

function goBack() {
  uni.navigateBack()
}

function onShare() {
  uni.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })
}

function startCooking() {
  uni.showToast({ title: '开始烹饪！加油💪', icon: 'none' })
}

</script>

<script lang="ts">
import { recipeDatabase } from '@/data/recipes'
export default {
  onShareAppMessage(): { title: string; path: string; imageUrl?: string } {
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    const id = (currentPage as any).$page?.options?.id
    const recipe = recipeDatabase.find(r => r.id === id)
    if (recipe) {
      return {
        title: `${recipe.name} - 鲜食记教你做这道菜`,
        path: `/pages/recipe-detail/index?id=${id}`,
        imageUrl: recipe.coverImage
      }
    }
    return {
      title: '鲜食记 - 美味菜谱分享',
      path: '/pages/recipe-detail/index'
    }
  }
}
</script>

<style scoped>
.page {
  background: #F5F5F7;
  min-height: 100vh;
  padding-bottom: 60rpx;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
}

.loading-icon {
  font-size: 80rpx;
  animation: bounce 1s ease-in-out infinite;
  margin-bottom: 20rpx;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20rpx); }
}

.loading-text { font-size: 28rpx; color: #9CA3AF; }

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 200rpx 0;
}

.empty-icon { font-size: 100rpx; margin-bottom: 16rpx; }
.empty-text { font-size: 28rpx; color: #9CA3AF; }

.hero-section {
  position: relative;
  width: 100%;
  height: 576rpx;
}

.hero-img {
  width: 100%;
  height: 100%;
}

.hero-back {
  position: absolute;
  left: 30rpx;
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.hero-fav {
  position: absolute;
  right: 30rpx;
  width: 72rpx;
  height: 72rpx;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.08);
}

.back-icon { font-size: 32rpx; color: #374151; }
.fav-icon { font-size: 32rpx; }

.body-section {
  background: white;
  border-radius: 48rpx 48rpx 0 0;
  margin-top: -48rpx;
  padding: 40rpx 30rpx 30rpx;
  position: relative;
  z-index: 10;
}

.info-header {
  margin-bottom: 28rpx;
}

.recipe-name {
  font-size: 40rpx;
  font-weight: 800;
  color: #1F2937;
  display: block;
  margin-bottom: 12rpx;
}

.recipe-rating {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.star { font-size: 28rpx; }
.rating-num { font-size: 28rpx; font-weight: 700; color: #F97316; }
.rating-sep { font-size: 22rpx; color: #E5E7EB; }
.rating-count { font-size: 24rpx; color: #9CA3AF; }

.stats-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 28rpx;
}

.stat-card {
  flex: 1;
  text-align: center;
  padding: 24rpx 12rpx;
  border-radius: 24rpx;
}

.stat-orange { background: #FFF7F0; }
.stat-green { background: #F0FDF4; }
.stat-blue { background: #EFF6FF; }

.stat-num {
  font-size: 32rpx;
  font-weight: 800;
  display: block;
}

.stat-orange .stat-num { color: #F97316; }
.stat-green .stat-num { color: #059669; }
.stat-blue .stat-num { color: #3B82F6; }

.stat-unit {
  font-size: 20rpx;
  display: block;
  margin-top: 4rpx;
}

.stat-orange .stat-unit { color: #FB923C; }
.stat-green .stat-unit { color: #34D399; }
.stat-blue .stat-unit { color: #60A5FA; }

.video-card {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 24rpx;
  background: linear-gradient(135deg, #FF6B6B, #ee5a24);
  border-radius: 24rpx;
  margin-bottom: 32rpx;
}

.video-icon { font-size: 52rpx; }

.video-info { flex: 1; }
.video-title { font-size: 30rpx; font-weight: 700; color: white; display: block; }
.video-hint { font-size: 24rpx; color: rgba(255,255,255,0.8); display: block; margin-top: 4rpx; }

.section {
  margin-bottom: 32rpx;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1F2937;
}

.section-meta {
  font-size: 22rpx;
  color: #9CA3AF;
}

.ing-list {
  display: flex;
  flex-direction: column;
}

.ing-row {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  border-bottom: 2rpx solid #F9FAFB;
}

.ing-row:last-child { border-bottom: none; }

.ing-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex: 1;
}

.ing-dot {
  width: 16rpx;
  height: 16rpx;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-have { background: #10B981; }
.dot-miss { background: #D1D5DB; }

.ing-name {
  font-size: 28rpx;
  color: #374151;
}

.ing-qty {
  font-size: 26rpx;
  color: #9CA3AF;
  margin-right: 20rpx;
}

.ing-status {
  font-size: 24rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.status-have {
  color: #059669;
}

.status-need {
  color: #F97316;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 28rpx;
}

.step-row {
  display: flex;
  gap: 20rpx;
}

.step-num {
  width: 48rpx;
  height: 48rpx;
  background: #FFEDD5;
  color: #EA580C;
  border-radius: 50%;
  text-align: center;
  line-height: 48rpx;
  font-size: 24rpx;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 2rpx;
}

.step-content {
  flex: 1;
}

.step-text {
  font-size: 28rpx;
  color: #6B7280;
  line-height: 1.8;
  display: block;
}

.step-img {
  width: 100%;
  border-radius: 16rpx;
  margin-top: 16rpx;
}

.tips-card {
  background: #FFF7F0;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 32rpx;
}

.tips-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.tips-icon { font-size: 32rpx; }
.tips-title { font-size: 28rpx; font-weight: 700; color: #EA580C; }
.tips-text { font-size: 26rpx; color: #9CA3AF; line-height: 1.7; }

.bottom-actions {
  display: flex;
  gap: 16rpx;
  padding-top: 10rpx;
}

.action-btn {
  flex: 1;
  text-align: center;
  padding: 28rpx 0;
  border-radius: 28rpx;
  font-size: 28rpx;
  font-weight: 700;
}

.action-btn.outline {
  border: 2rpx solid #F97316;
  color: #F97316;
  background: white;
}

.action-btn.primary {
  background: #F97316;
  color: white;
  box-shadow: 0 8rpx 24rpx rgba(249, 115, 22, 0.3);
}
</style>