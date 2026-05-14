<template>
  <view class="page">
    <view class="hero">
      <text class="hero-title">今日推荐</text>
      <text class="hero-sub">
        冰箱有 <text class="hero-count">{{ ingredientStore.ingredientCount }}</text> 种食材，为您智能匹配：
      </text>
    </view>

    <view v-if="recipeStore.isLoading" class="loading-state">
      <text class="loading-icon">👨‍🍳</text>
      <text class="loading-text">正在分析你的食材...</text>
    </view>

    <view v-else-if="recipeStore.generatedRecipes.length === 0" class="empty-state">
      <text class="empty-icon">🍳</text>
      <text class="empty-title">暂无匹配菜谱</text>
      <text class="empty-desc">添加更多食材和调料试试</text>
      <view class="empty-btn" @click="goAddFood">➕ 去添加食材</view>
    </view>

    <view v-else class="recipe-list">
      <view
        v-for="recipe in recipeStore.generatedRecipes"
        :key="recipe.id"
        class="recipe-card"
        @click="goDetail(recipe.id)"
      >
        <view class="card-cover">
          <image
            class="cover-img"
            :src="recipeImage"
            mode="aspectFill"
          />
          <view class="match-tag">{{ recipe.matchScore }}% 匹配</view>
        </view>
        <view class="card-body">
          <view class="card-top">
            <text class="card-name">{{ recipe.name }}</text>
            <view class="rating" v-if="['清蒸鲈鱼','经典西红柿炒鸡蛋','麻婆豆腐','回锅肉'].includes(recipe.name)">
              <text class="star">⭐</text>
              <text class="rating-num">{{ getRating(recipe) }}</text>
            </view>
          </view>
          <view class="card-meta">
            <text class="meta-item">⏱ {{ recipe.cookingTime }}分钟</text>
            <text class="meta-item">🔥 {{ recipe.difficulty }}</text>
          </view>
          <view class="ing-tags">
            <template v-for="ing in recipe.ingredients.filter(i => i.type === 'ingredient').slice(0, 4)" :key="ing.name">
              <text
                v-if="isIngredientAvailable(ing.name)"
                class="tag-have"
              >
                已有 {{ ing.name }}✓
              </text>
              <text
                v-else
                class="tag-miss"
              >
                缺少 {{ ing.name }}
              </text>
            </template>
          </view>
        </view>
      </view>
    </view>

    <view class="bottom-bar">
      <view class="bar-btn" @click="doMatch">
        重新匹配
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIngredientStore } from '@/stores/ingredient'
import { useSeasoningStore } from '@/stores/seasoning'
import { useRecipeStore } from '@/stores/recipe'
import { useShare } from '@/utils/share'

const { enableShareMenu } = useShare()
const ingredientStore = useIngredientStore()
const seasoningStore = useSeasoningStore()
const recipeStore = useRecipeStore()

const recipeImage = 'https://modao.cc/agent-py/media/generated_images/2026-05-13/50b83da29f9a440aba8c352c5dc4afcf.jpg'

function isIngredientAvailable(name: string): boolean {
  const names = ingredientStore.getIngredientNames()
  return names.some(n => n.includes(name) || name.includes(n))
}

function getRating(recipe: any): string {
  const base = 4.0
  const bonus = Math.min(recipe.matchScore / 100, 1) * 0.9
  return (base + bonus).toFixed(1)
}

function doMatch() {
  recipeStore.generate(10)
}

function goDetail(id: string) {
  uni.navigateTo({ url: `/pages/recipe-detail/index?id=${id}` })
}

function goAddFood() {
  uni.navigateTo({ url: '/pages/add-food/index' })
}

onMounted(() => {
  ingredientStore.load()
  seasoningStore.load()
  recipeStore.generate(10)
  enableShareMenu()
})
</script>

<script lang="ts">
export default {
  onShareAppMessage() {
    return {
      title: '鲜食记 - 今日推荐菜谱',
      path: '/pages/recipes/index'
    }
  }
}
</script>

<style scoped>
.page {
  background: #F5F5F7;
  min-height: 100vh;
  padding-bottom: 160rpx;
}

.hero {
  padding: 30rpx 40rpx 10rpx;
}

.hero-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1F2937;
  display: block;
  margin-bottom: 8rpx;
}

.hero-sub {
  font-size: 26rpx;
  color: #9CA3AF;
}

.hero-count {
  color: #F97316;
  font-weight: 700;
}

.loading-state { display: flex; flex-direction: column; align-items: center; padding: 120rpx 0; }
.loading-icon { font-size: 80rpx; animation: bounce 1s ease-in-out infinite; margin-bottom: 20rpx; }
@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20rpx)} }
.loading-text { font-size: 28rpx; color: #9CA3AF; }

.empty-state { display: flex; flex-direction: column; align-items: center; padding: 80rpx 40rpx; }
.empty-icon { font-size: 100rpx; margin-bottom: 16rpx; }
.empty-title { font-size: 32rpx; font-weight: 700; color: #1F2937; margin-bottom: 8rpx; }
.empty-desc { font-size: 26rpx; color: #9CA3AF; margin-bottom: 30rpx; }
.empty-btn { padding: 20rpx 50rpx; background: #F97316; color: white; border-radius: 999rpx; font-size: 28rpx; font-weight: 600; box-shadow: 0 8rpx 24rpx rgba(249, 115, 22, 0.3); }

.recipe-list {
  padding: 0 40rpx;
  display: flex;
  flex-direction: column;
  gap: 36rpx;
}

.recipe-card {
  background: white;
  border-radius: 48rpx;
  overflow: hidden;
  border: 2rpx solid #F3F4F6;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.04);
}

.card-cover {
  position: relative;
  width: 100%;
  height: 384rpx;
}

.cover-img {
  width: 100%;
  height: 100%;
}

.match-tag {
  position: absolute;
  top: 28rpx;
  left: 28rpx;
  padding: 12rpx 28rpx;
  background: #F97316;
  color: white;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 700;
}

.card-body {
  padding: 32rpx;
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12rpx;
}

.card-name {
  font-size: 32rpx;
  font-weight: 700;
  color: #1F2937;
}

.rating {
  display: flex;
  align-items: center;
  gap: 4rpx;
}

.star { font-size: 24rpx; }
.rating-num { font-size: 26rpx; font-weight: 700; color: #F97316; }

.card-meta {
  display: flex;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.meta-item {
  font-size: 24rpx;
  color: #9CA3AF;
}

.ing-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.tag-have {
  padding: 8rpx 18rpx;
  background: #D1FAE5;
  color: #059669;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.tag-miss {
  padding: 8rpx 18rpx;
  background: #F3F4F6;
  color: #9CA3AF;
  border-radius: 12rpx;
  font-size: 22rpx;
  font-weight: 600;
}

.bottom-bar {
  position: fixed;
  bottom: 140rpx;
  left: 40rpx;
  right: 40rpx;
  z-index: 100;
}

.bar-btn {
  text-align: center;
  padding: 28rpx 0;
  background: #F97316;
  color: white;
  border-radius: 28rpx;
  font-size: 28rpx;
  font-weight: 700;
  box-shadow: 0 16rpx 32rpx rgba(249, 115, 22, 0.3);
}
</style>