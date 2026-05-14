<template>
  <view class="page">
    <text class="page-title">健康周报</text>

    <view class="section-card">
      <text class="card-title">本周营养摄入</text>
      <view class="chart-area">
        <text class="chart-placeholder">🥧</text>
      </view>
      <view class="nutri-grid">
        <view class="nutri-item">
          <text class="nutri-value nutri-blue">65%</text>
          <text class="nutri-label">蛋白质</text>
        </view>
        <view class="nutri-item border-x">
          <text class="nutri-value nutri-orange">42%</text>
          <text class="nutri-label">碳水</text>
        </view>
        <view class="nutri-item">
          <text class="nutri-value nutri-green">28%</text>
          <text class="nutri-label">脂肪</text>
        </view>
      </view>
    </view>

    <view class="section-card">
      <text class="card-title">食材消耗统计</text>
      <view class="consume-list">
        <view class="consume-row">
          <view class="consume-left">
            <view class="consume-icon icon-orange">
              <text>🍗</text>
            </view>
            <text class="consume-label">肉类消耗</text>
          </view>
          <text class="consume-value">1.2 kg</text>
        </view>
        <view class="consume-row">
          <view class="consume-left">
            <view class="consume-icon icon-green">
              <text>🥬</text>
            </view>
            <text class="consume-label">蔬菜消耗</text>
          </view>
          <text class="consume-value">3.5 kg</text>
        </view>
      </view>
    </view>

    <view class="suggest-card">
      <view class="suggest-header">
        <text class="suggest-icon">💡</text>
        <text class="suggest-title">饮食建议</text>
      </view>
      <text class="suggest-text">
        基于您冰箱里的时令食材，建议今晚尝试"香煎三文鱼配西兰花"，不仅能及时消耗食材，还能补充优质 Omega-3。
      </text>
    </view>

    <view class="waste-card">
      <view class="waste-top">
        <text class="waste-title">浪费预警</text>
        <text class="waste-badge">高风险</text>
      </view>
      <text class="waste-desc">以下食材将在 24 小时内过期，请尽快处理：</text>
      <view class="waste-items">
        <view v-for="item in ingredientStore.expiringSoonIngredients.slice(0, 3)" :key="item.id" class="waste-item">
          <text class="waste-emoji">🥩</text>
          <text class="waste-name">{{ item.name }}</text>
        </view>
        <text v-if="ingredientStore.expiringSoonIngredients.length === 0" class="waste-safe">✅ 暂无临期食材</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useIngredientStore } from '@/stores/ingredient'
import { useShare } from '@/utils/share'

const { enableShareMenu } = useShare()
const ingredientStore = useIngredientStore()

onMounted(() => {
  ingredientStore.load()
  enableShareMenu()
})
</script>

<script lang="ts">
export default {
  onShareAppMessage() {
    return { title: '鲜食记 - 健康周报', path: '/pages/health/index' }
  }
}
</script>

<style scoped>
.page {
  background: #F5F5F7;
  min-height: 100vh;
  padding: 30rpx 40rpx 140rpx;
}

.page-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1F2937;
  display: block;
  margin-bottom: 36rpx;
}

.section-card {
  background: white;
  padding: 36rpx;
  border-radius: 48rpx;
  border: 2rpx solid #F3F4F6;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.03);
  margin-bottom: 28rpx;
}

.card-title {
  font-size: 30rpx;
  font-weight: 700;
  color: #1F2937;
  display: block;
  margin-bottom: 24rpx;
}

.chart-area {
  width: 100%;
  height: 384rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F9FAFB;
  border-radius: 24rpx;
  margin-bottom: 24rpx;
}

.chart-placeholder {
  font-size: 80rpx;
  opacity: 0.5;
}

.nutri-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
}

.nutri-item {
  text-align: center;
}

.border-x {
  border-left: 2rpx solid #F3F4F6;
  border-right: 2rpx solid #F3F4F6;
}

.nutri-value {
  font-size: 28rpx;
  font-weight: 700;
  display: block;
}

.nutri-blue { color: #3B82F6; }
.nutri-orange { color: #F97316; }
.nutri-green { color: #22C55E; }

.nutri-label {
  font-size: 22rpx;
  color: #9CA3AF;
  margin-top: 4rpx;
  display: block;
}

.consume-list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.consume-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.consume-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.consume-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
}

.icon-orange { background: #FFF7F0; }
.icon-green { background: #F0FDF4; }

.consume-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #374151;
}

.consume-value {
  font-size: 26rpx;
  font-weight: 700;
  color: #1F2937;
}

.suggest-card {
  background: linear-gradient(135deg, #FB923C, #EA580C);
  padding: 36rpx;
  border-radius: 48rpx;
  margin-bottom: 28rpx;
}

.suggest-header {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin-bottom: 12rpx;
}

.suggest-icon { font-size: 32rpx; }
.suggest-title { font-size: 28rpx; font-weight: 700; color: white; }
.suggest-text { font-size: 24rpx; color: rgba(255,255,255,0.9); line-height: 1.8; }

.waste-card {
  background: #FEF2F2;
  padding: 36rpx;
  border-radius: 48rpx;
  border: 2rpx solid #FECACA;
}

.waste-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.waste-title { font-size: 28rpx; font-weight: 700; color: #991B1B; }
.waste-badge { padding: 8rpx 20rpx; background: #EF4444; color: white; border-radius: 999rpx; font-size: 20rpx; font-weight: 600; }

.waste-desc { font-size: 22rpx; color: #DC2626; margin-bottom: 24rpx; }

.waste-items {
  display: flex;
  gap: 20rpx;
}

.waste-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
}

.waste-emoji { font-size: 48rpx; width: 96rpx; height: 96rpx; display: flex; align-items: center; justify-content: center; background: white; border-radius: 16rpx; border: 4rpx solid #FECACA; }
.waste-name { font-size: 20rpx; color: #991B1B; font-weight: 600; }

.waste-safe { font-size: 22rpx; color: #059669; }
</style>