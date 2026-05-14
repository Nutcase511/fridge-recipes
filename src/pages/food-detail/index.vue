<template>
  <view class="page">
    <view v-if="!ingredient" class="empty-state">
      <text class="empty-icon">😅</text>
      <text class="empty-text">食材不存在</text>
    </view>

    <view v-else class="detail">
      <view class="hero-section">
        <image
          class="hero-img"
          :src="getHeroImage(ingredient.name)"
          mode="aspectFill"
        />
        <view class="hero-back" @click="goBack">
          <text class="back-icon">←</text>
        </view>
      </view>

      <view class="body-section">
        <view class="info-top">
          <view>
            <text class="food-name">{{ ingredient.name }}</text>
            <text class="food-cat" :class="catBadgeClass">{{ statusText }} · {{ ingredient.category }}</text>
          </view>
          <view class="info-right">
            <text class="food-qty">{{ ingredient.quantity }}{{ ingredient.unit }}</text>
            <text class="food-qty-label">当前剩余</text>
          </view>
        </view>

        <view class="date-grid">
          <view class="date-card">
            <text class="date-label">购入日期</text>
            <text class="date-value">{{ fmtDate(ingredient.createTime) }}</text>
          </view>
          <view class="date-card">
            <text class="date-label">保质期至</text>
            <text class="date-value">{{ ingredient.expiryDate || '无' }}</text>
          </view>
        </view>

        <view class="freshness-section">
          <view class="freshness-header">
            <text class="freshness-label">新鲜度</text>
            <text class="freshness-pct" :class="pctTextClass">{{ freshnessPct }}% - {{ freshnessLabel }}</text>
          </view>
          <view class="progress-track">
            <view class="progress-fill" :class="pctClass" :style="{ width: freshnessPct + '%' }"></view>
          </view>
        </view>

        <text class="section-title">推荐菜谱</text>
        <view class="recipe-list">
          <view
            v-for="r in matchingRecipes.slice(0, 5)"
            :key="r.id"
            class="recipe-row"
            @click="goDetail(r.id)"
          >
            <image
              class="recipe-thumb"
              :src="getRecipeImage()"
              mode="aspectFill"
            />
            <view class="recipe-info">
              <text class="recipe-name">{{ r.name }}</text>
              <text class="recipe-meta">食材匹配度 {{ getMatchPct(r) }}% · {{ r.cookingTime }}分钟</text>
            </view>
            <text class="recipe-arrow">›</text>
          </view>
          <view v-if="matchingRecipes.length === 0" class="empty-recipes">
            <text>暂无可用菜谱</text>
          </view>
        </view>

        <view class="action-row">
          <view class="action-btn outline" @click="editIngredient">
            编辑
          </view>
          <view class="action-btn primary" @click="addToList">
            加入清单
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useIngredientStore } from '@/stores/ingredient'
import { recipeDatabase } from '@/data/recipes'

const ingredientStore = useIngredientStore()
const ingredient = ref<any>(null)

const imageMap: Record<string, string> = {
  '西红柿': 'https://modao.cc/agent-py/media/generated_images/2026-05-13/bf00a2beeda44fb9827f2273e42a804d.jpg',
  '番茄': 'https://modao.cc/agent-py/media/generated_images/2026-05-13/bf00a2beeda44fb9827f2273e42a804d.jpg',
  '西兰花': 'https://modao.cc/agent-py/media/generated_images/2026-05-13/aa81a155493d41fca6c9242283868b49.jpg',
  '牛奶': 'https://modao.cc/agent-py/media/generated_images/2026-05-13/167a037f39c84f348edcaf76b52663e7.jpg',
}

onMounted(() => {
  const pages = getCurrentPages()
  const cp = pages[pages.length - 1] as any
  const id = cp.$page?.options?.id
  if (id) {
    const found = ingredientStore.ingredients.find(i => i.id === id)
    if (found) ingredient.value = found
  }
})

function getHeroImage(name: string): string {
  for (const [key, url] of Object.entries(imageMap)) {
    if (name.includes(key) || key.includes(name)) return url
  }
  return 'https://modao.cc/agent-py/media/generated_images/2026-05-13/895d9cbe3f0748f2906b92e4f222dfc2.jpg'
}

const matchingRecipes = computed(() => {
  if (!ingredient.value) return []
  const name = ingredient.value.name
  return recipeDatabase.filter(r =>
    r.ingredients.some(i => i.name.includes(name) || name.includes(i.name))
  )
})

const daysLeft = computed(() => {
  if (!ingredient.value?.expiryDate) return 999
  return Math.ceil((new Date(ingredient.value.expiryDate).getTime() - Date.now()) / 86400000)
})

const isExpired = computed(() => daysLeft.value <= 0)
const isExpiring = computed(() => daysLeft.value > 0 && daysLeft.value <= 3)

const freshnessPct = computed(() => {
  if (!ingredient.value?.expiryDate) return 95
  if (isExpired.value) return 5
  const maxDays = 14
  const pct = Math.round((daysLeft.value / maxDays) * 100)
  return Math.min(Math.max(pct, 5), 98)
})

const freshnessLabel = computed(() => {
  if (isExpired.value) return '已过期'
  if (freshnessPct.value >= 70) return '状态极佳'
  if (freshnessPct.value >= 40) return '状态良好'
  return '尽快食用'
})

const statusText = computed(() => {
  if (isExpired.value) return '过期'
  if (isExpiring.value) return '临期'
  return '新鲜'
})

const catBadgeClass = computed(() => {
  if (isExpired.value) return 'cat-expired'
  if (isExpiring.value) return 'cat-expiring'
  return 'cat-fresh'
})

const pctTextClass = computed(() => {
  if (isExpired.value) return 'pct-danger-text'
  if (freshnessPct.value >= 70) return 'pct-success-text'
  if (freshnessPct.value >= 40) return 'pct-warning-text'
  return 'pct-danger-text'
})

const pctClass = computed(() => {
  if (isExpired.value) return 'pct-danger'
  if (freshnessPct.value >= 70) return 'pct-success'
  if (freshnessPct.value >= 40) return 'pct-warning'
  return 'pct-danger'
})

function getRecipeImage(): string {
  return 'https://modao.cc/agent-py/media/generated_images/2026-05-13/50b83da29f9a440aba8c352c5dc4afcf.jpg'
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString('zh-CN')
}

function getMatchPct(r: any): number {
  if (!ingredient.value) return 0
  const name = ingredient.value.name
  const ings = r.ingredients.filter((i: any) => i.type === 'ingredient').map((i: any) => i.name)
  const matched = ings.filter((n: string) => n.includes(name) || name.includes(n)).length
  return Math.round((matched / ings.length) * 100)
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/recipe-detail/index?id=${id}` })
}

function goBack() {
  uni.navigateBack()
}

function editIngredient() {
  uni.showToast({ title: '编辑功能开发中', icon: 'none' })
}

function addToList() {
  uni.showToast({ title: '已加入购物清单', icon: 'success' })
}
</script>

<style scoped>
.page {
  background: #F5F5F7;
  min-height: 100vh;
  padding-bottom: 60rpx;
}

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 200rpx 0; }
.empty-icon { font-size: 100rpx; margin-bottom: 16rpx; }
.empty-text { font-size: 28rpx; color: #9CA3AF; }

.hero-section {
  position: relative;
  width: 100%;
  height: 512rpx;
}

.hero-img {
  width: 100%;
  height: 100%;
}

.hero-back {
  position: absolute;
  top: 60rpx;
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

.back-icon { font-size: 32rpx; color: #374151; }

.body-section {
  background: white;
  border-radius: 48rpx 48rpx 0 0;
  margin-top: -48rpx;
  padding: 40rpx 40rpx 30rpx;
  position: relative;
  z-index: 10;
}

.info-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 36rpx;
}

.food-name {
  font-size: 40rpx;
  font-weight: 700;
  color: #1F2937;
  display: block;
  margin-bottom: 12rpx;
}

.food-cat {
  display: inline-block;
  padding: 8rpx 20rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 600;
}
.cat-fresh { background: #D1FAE5; color: #059669; }
.cat-expiring { background: #FEF3C7; color: #D97706; }
.cat-expired { background: #FEE2E2; color: #DC2626; }

.info-right { text-align: right; }
.food-qty { font-size: 44rpx; font-weight: 700; color: #F97316; display: block; line-height: 1; }
.food-qty-label { font-size: 22rpx; color: #9CA3AF; display: block; margin-top: 4rpx; }

.date-grid {
  display: flex;
  gap: 24rpx;
  margin-bottom: 36rpx;
}

.date-card {
  flex: 1;
  padding: 24rpx;
  background: #F9FAFB;
  border-radius: 28rpx;
}

.date-label {
  font-size: 22rpx;
  color: #9CA3AF;
  display: block;
  margin-bottom: 8rpx;
}

.date-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #374151;
}

.freshness-section {
  margin-bottom: 40rpx;
}

.freshness-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.freshness-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #374151;
}

.freshness-pct { font-size: 24rpx; font-weight: 600; }
.pct-success-text { color: #059669; }
.pct-warning-text { color: #D97706; }
.pct-danger-text { color: #DC2626; }

.progress-track {
  width: 100%;
  height: 16rpx;
  background: #F3F4F6;
  border-radius: 8rpx;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 8rpx;
}
.pct-success { background: #10B981; }
.pct-warning { background: #F59E0B; }
.pct-danger { background: #EF4444; }

.section-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1F2937;
  display: block;
  margin-bottom: 24rpx;
}

.recipe-list {
  margin-bottom: 40rpx;
}

.recipe-row {
  display: flex;
  align-items: center;
  padding: 16rpx;
  border: 2rpx solid #F3F4F6;
  border-radius: 20rpx;
  margin-bottom: 16rpx;
}

.recipe-thumb {
  width: 128rpx;
  height: 128rpx;
  border-radius: 16rpx;
  margin-right: 20rpx;
  flex-shrink: 0;
  background: #F3F4F6;
}

.recipe-info { flex: 1; }
.recipe-name { font-size: 26rpx; font-weight: 700; color: #1F2937; display: block; }
.recipe-meta { font-size: 20rpx; color: #9CA3AF; display: block; margin-top: 8rpx; }

.recipe-arrow {
  font-size: 32rpx;
  color: #D1D5DB;
  margin-left: 12rpx;
}

.empty-recipes {
  text-align: center;
  padding: 40rpx 0;
  font-size: 24rpx;
  color: #D1D5DB;
}

.action-row {
  display: flex;
  gap: 16rpx;
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
  border: 2rpx solid #E5E7EB;
  color: #6B7280;
  background: white;
}

.action-btn.primary {
  background: #F97316;
  color: white;
  box-shadow: 0 8rpx 24rpx rgba(249, 115, 22, 0.25);
}
</style>