<template>
  <view class="page">
    <!-- 概述 -->
    <view class="summary-section card">
      <view class="summary-row">
        <text class="summary-label">🥬 食材</text>
        <text class="summary-value">{{ ingredientStore.ingredients.length }} 种</text>
      </view>
      <view class="summary-row">
        <text class="summary-label">🧂 调料</text>
        <text class="summary-value">{{ seasoningStore.seasonings.length }} 种</text>
      </view>
      <view class="summary-row">
        <text class="summary-label">📖 可匹配菜谱</text>
        <text class="summary-value">{{ totalRecipes }} 道</text>
      </view>
    </view>

    <!-- 选择生成数量 -->
    <view class="count-selector card">
      <text class="selector-title">今天想做几道菜？</text>
      <view class="count-options">
        <text
          v-for="n in [1, 2, 3, 4, 5]"
          :key="n"
          class="count-option"
          :class="{ active: selectedCount === n }"
          @click="selectedCount = n"
        >{{ n }}道</text>
      </view>
    </view>

    <!-- 生成按钮 -->
    <view class="generate-section">
      <view
        class="generate-btn"
        :class="{ disabled: !canGenerate }"
        @click="generateRecipes"
      >
        <text class="generate-icon">🍳</text>
        <text class="generate-text">智能生成菜谱</text>
      </view>
      <text v-if="!canGenerate" class="generate-hint">
        {{ ingredientStore.ingredients.length === 0 ? '请先添加食材' : '请先添加调料' }}
      </text>
    </view>

    <!-- 生成结果 -->
    <view v-if="recipeStore.generatedRecipes.length > 0" class="results-section">
      <view class="results-header">
        <text class="results-title">📋 为你推荐以下菜谱</text>
        <text class="results-count">共 {{ recipeStore.generatedRecipes.length }} 道</text>
      </view>

      <view
        v-for="(recipe, index) in recipeStore.generatedRecipes"
        :key="recipe.id"
        class="recipe-result card"
        @click="viewDetail(recipe.id)"
      >
        <view class="result-top">
          <image
            class="result-cover"
            :src="recipe.coverImage || getCuisineEmoji(recipe.cuisine)"
            mode="aspectFill"
          />
          <view class="result-info">
            <text class="result-name">{{ recipe.name }}</text>
            <text class="result-desc">{{ recipe.description }}</text>
            <view class="result-meta">
              <text class="meta-item">⏱ {{ recipe.cookingTime }}分钟</text>
              <text class="meta-item">{{ getDifficultyEmoji(recipe.difficulty) }} {{ recipe.difficulty }}</text>
              <text class="meta-item">{{ getCuisineEmoji(recipe.cuisine) }} {{ recipe.cuisine }}</text>
            </view>
          </view>
          <view class="result-score">
            <text class="score-value">{{ recipe.matchScore }}%</text>
            <text class="score-label">匹配度</text>
          </view>
        </view>

        <view v-if="recipe.missingIngredients.length > 0" class="missing-section">
          <text class="missing-label">缺少食材：</text>
          <text class="missing-tags">
            <text v-for="(m, i) in recipe.missingIngredients.slice(0, 3)" :key="i" class="missing-tag">
              {{ m }}{{ i < recipe.missingIngredients.slice(0, 3).length - 1 ? '、' : '' }}
            </text>
            <text v-if="recipe.missingIngredients.length > 3">等{{ recipe.missingIngredients.length }}种</text>
          </text>
        </view>

        <view v-if="recipe.missingSeasonings.length > 0" class="missing-section">
          <text class="missing-label">缺少调料：</text>
          <text class="missing-tags">
            <text v-for="(m, i) in recipe.missingSeasonings.slice(0, 3)" :key="i" class="missing-tag">
              {{ m }}{{ i < recipe.missingSeasonings.slice(0, 3).length - 1 ? '、' : '' }}
            </text>
            <text v-if="recipe.missingSeasonings.length > 3">等{{ recipe.missingSeasonings.length }}种</text>
          </text>
        </view>

        <view class="view-detail">
          <text>查看详情 →</text>
        </view>
      </view>
    </view>

    <!-- 无结果 -->
    <view v-if="hasGenerated && recipeStore.generatedRecipes.length === 0" class="empty-state">
      <text class="empty-icon">😅</text>
      <text class="empty-text">没有匹配到合适的菜谱</text>
      <text class="empty-hint">试试添加更多食材和调料</text>
    </view>

    <!-- 加载状态 -->
    <view v-if="recipeStore.isLoading" class="loading-overlay">
      <view class="loading-content">
        <text class="loading-icon">👨‍🍳</text>
        <text class="loading-text">正在匹配菜谱...</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useIngredientStore } from '@/stores/ingredient'
import { useSeasoningStore } from '@/stores/seasoning'
import { useRecipeStore } from '@/stores/recipe'
import { recipeDatabase } from '@/data/recipes'
import { useShare } from '@/utils/share'

const { enableShareMenu } = useShare()

const ingredientStore = useIngredientStore()
const seasoningStore = useSeasoningStore()
const recipeStore = useRecipeStore()

const selectedCount = ref(2)
const hasGenerated = ref(false)

const totalRecipes = computed(() => recipeDatabase.length)

const canGenerate = computed(() =>
  ingredientStore.ingredients.length > 0 && seasoningStore.seasonings.length > 0
)

function generateRecipes() {
  if (!canGenerate.value) return
  hasGenerated.value = true
  recipeStore.generate(selectedCount.value)
}

function viewDetail(id: string) {
  uni.navigateTo({ url: `/pages/recipe-detail/index?id=${id}` })
}

function getDifficultyEmoji(difficulty: string): string {
  const map: Record<string, string> = { '简单': '🟢', '中等': '🟡', '困难': '🔴' }
  return map[difficulty] || '🟢'
}

function getCuisineEmoji(cuisine: string): string {
  const map: Record<string, string> = { '川菜': '🌶️', '中餐': '🥟', '湘菜': '🌶️' }
  return map[cuisine] || '🍳'
}

onMounted(() => {
  enableShareMenu()
})
</script>

<script lang="ts">
export default {
  onShareAppMessage(): { title: string; path: string } {
    return {
      title: '智能菜谱 - 为你匹配了超多美味菜谱',
      path: '/pages/generate/index'
    }
  }
}
</script>

<style scoped>
.page {
  padding-bottom: 60rpx;
}

.summary-section {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  margin: 30rpx 30rpx 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 28rpx;
  color: #666;
}

.summary-value {
  font-size: 28rpx;
  font-weight: 600;
  color: #F97316;
}

.count-selector {
  margin: 20rpx 30rpx;
}

.selector-title {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
  display: block;
  margin-bottom: 20rpx;
}

.count-options {
  display: flex;
  gap: 16rpx;
}

.count-option {
  flex: 1;
  text-align: center;
  padding: 20rpx 0;
  border-radius: 12rpx;
  background: #f5f5f5;
  font-size: 28rpx;
  color: #666;
  font-weight: 500;
}

.count-option.active {
  background: #F97316;
  color: white;
}

.generate-section {
  padding: 0 30rpx;
  margin: 20rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.generate-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16rpx;
  width: 100%;
  padding: 32rpx 0;
  border-radius: 20rpx;
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: white;
  font-size: 34rpx;
  font-weight: 600;
  box-shadow: 0 8rpx 24rpx rgba(255, 152, 0, 0.3);
}

.generate-btn.disabled {
  background: #ccc;
  box-shadow: none;
}

.generate-icon {
  font-size: 44rpx;
}

.generate-text {
  font-size: 34rpx;
}

.generate-hint {
  font-size: 24rpx;
  color: #999;
  margin-top: 12rpx;
}

.results-section {
  padding: 0 30rpx;
}

.results-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.results-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.results-count {
  font-size: 24rpx;
  color: #999;
}

.recipe-result {
  margin-bottom: 20rpx;
  padding: 24rpx;
}

.result-top {
  display: flex;
  gap: 16rpx;
}

.result-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  flex-shrink: 0;
}

.result-info {
  flex: 1;
  min-width: 0;
}

.result-name {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-desc {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 4rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-score {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-value {
  font-size: 32rpx;
  font-weight: 700;
  color: #F97316;
}

.score-label {
  font-size: 20rpx;
  color: #999;
}

.result-meta {
  display: flex;
  gap: 10rpx;
  flex-wrap: wrap;
  margin-top: 8rpx;
}

.meta-item {
  font-size: 22rpx;
  color: #999;
  background: #f5f5f5;
  padding: 4rpx 12rpx;
  border-radius: 10rpx;
}

.missing-section {
  margin-top: 12rpx;
  display: flex;
  align-items: flex-start;
  gap: 8rpx;
}

.missing-label {
  font-size: 24rpx;
  color: #F44336;
  white-space: nowrap;
}

.missing-tags {
  font-size: 24rpx;
  color: #F44336;
}

.missing-tag {
  display: inline;
}

.view-detail {
  margin-top: 16rpx;
  text-align: right;
  font-size: 24rpx;
  color: #F97316;
}

.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-icon {
  font-size: 100rpx;
  animation: bounce 0.6s infinite alternate;
}

.loading-text {
  font-size: 30rpx;
  color: #666;
  margin-top: 20rpx;
}

@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-20rpx); }
}
</style>