<template>
  <view class="page" :style="{ paddingTop: (statusBarHeight + 10) + 'px' }">
    <view class="header">
      <view class="back-btn" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <text class="header-title">添加食材</text>
    </view>

    <!-- 录入方式 -->
    <view class="method-grid">
      <view class="method-card method-orange" @click="switchMethod(0)">
        <text class="method-icon">✏️</text>
        <text class="method-label">手动输入</text>
      </view>
      <view class="method-card method-green" @click="switchMethod(1)">
        <text class="method-icon">📱</text>
        <text class="method-label">扫码录入</text>
      </view>
      <view class="method-card method-blue" @click="switchMethod(2)">
        <text class="method-icon">📷</text>
        <text class="method-label">拍照识别</text>
      </view>
    </view>

    <view class="form-section">
      <view class="form-group">
        <text class="form-label">食材名称</text>
        <input
          class="form-input"
          v-model="form.name"
          placeholder="例如：五花肉"
          placeholder-style="color: #D1D5DB"
        />
      </view>

      <view class="form-row">
        <view class="form-group form-half">
          <text class="form-label">分类</text>
          <picker class="form-picker" :range="categories" @change="onCategoryChange">
            <view class="form-input picker-value">{{ form.category || '请选择' }}</view>
          </picker>
        </view>
        <view class="form-group form-half">
          <text class="form-label">数量/单位</text>
          <input
            class="form-input"
            v-model="form.quantity"
            placeholder="500g"
            placeholder-style="color: #D1D5DB"
          />
        </view>
      </view>

      <view class="form-group">
        <text class="form-label">保质期至</text>
        <picker class="form-picker" mode="date" @change="onDateChange">
          <view class="form-input picker-value">{{ form.expiryDate || '请选择日期' }}</view>
        </picker>
      </view>

      <view class="form-group">
        <text class="form-label">存放位置</text>
        <view class="location-row">
          <view
            v-for="loc in locations"
            :key="loc.key"
            class="location-btn"
            :class="{ active: form.location === loc.key }"
            @click="form.location = loc.key"
          >
            {{ loc.label }}
          </view>
        </view>
      </view>
    </view>

    <view class="submit-btn" @click="submit">
      保存食材
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useIngredientStore } from '@/stores/ingredient'

const ingredientStore = useIngredientStore()
const statusBarHeight = ref(0)

onLoad(() => {
  const sysInfo = uni.getSystemInfoSync()
  statusBarHeight.value = sysInfo.statusBarHeight || 0
})

const categories = ['肉类', '蔬菜', '水果', '蛋奶', '海鲜', '豆制品', '主食', '其他']

const locations = [
  { key: 'fridge', label: '冷藏' },
  { key: 'freeze', label: '冷冻' },
  { key: 'normal', label: '常温' }
]

const currentMethod = ref(0)

const form = reactive({
  name: '',
  category: '蔬菜',
  quantity: '',
  unit: 'g',
  expiryDate: '',
  location: 'fridge'
})

function onCategoryChange(e: any) {
  form.category = categories[e.detail.value]
}

function onDateChange(e: any) {
  form.expiryDate = e.detail.value
}

function switchMethod(idx: number) {
  currentMethod.value = idx
  if (idx === 1) {
    uni.showToast({ title: '扫码录入开发中', icon: 'none' })
  } else if (idx === 2) {
    uni.showToast({ title: '拍照识别开发中', icon: 'none' })
  }
}

function submit() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请输入食材名称', icon: 'none' })
    return
  }
  if (!form.quantity.trim()) {
    uni.showToast({ title: '请输入数量', icon: 'none' })
    return
  }

  const qtyMatch = form.quantity.match(/^(\d+\.?\d*)([a-zA-Z]*)$/)
  let qty = parseFloat(form.quantity)
  let unit = 'g'
  if (qtyMatch) {
    qty = parseFloat(qtyMatch[1])
    unit = qtyMatch[2] || 'g'
  }

  ingredientStore.addIngredient({
    name: form.name.trim(),
    category: form.category,
    quantity: qty,
    unit: unit,
    expiryDate: form.expiryDate || undefined
  })

  uni.showToast({ title: '保存成功', icon: 'success' })
  setTimeout(() => uni.navigateBack(), 800)
}

function goBack() {
  uni.navigateBack()
}
</script>

<style scoped>
.page {
  background: white;
  min-height: 100vh;
  padding-left: 40rpx;
  padding-right: 40rpx;
  padding-bottom: 60rpx;
}

.header {
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 60rpx;
}

.back-btn {
  width: 72rpx;
  height: 72rpx;
  background: #F3F4F6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.back-icon {
  font-size: 32rpx;
  color: #374151;
}

.header-title {
  font-size: 40rpx;
  font-weight: 700;
  color: #1F2937;
}

.method-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20rpx;
  margin-bottom: 60rpx;
}

.method-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
  padding: 32rpx 16rpx;
  border-radius: 28rpx;
}

.method-orange { background: #FFF7F0; }
.method-green { background: #F0FDF4; }
.method-blue { background: #EFF6FF; }

.method-icon {
  font-size: 40rpx;
}

.method-label {
  font-size: 24rpx;
  font-weight: 600;
}

.method-orange .method-label { color: #EA580C; }
.method-green .method-label { color: #059669; }
.method-blue .method-label { color: #2563EB; }

.form-section {
  display: flex;
  flex-direction: column;
  gap: 36rpx;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.form-label {
  font-size: 26rpx;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 24rpx 30rpx;
  background: #F9FAFB;
  border: 2rpx solid #E5E7EB;
  border-radius: 20rpx;
  font-size: 26rpx;
  color: #1F2937;
}

.picker-value {
  color: #9CA3AF;
}

.form-row {
  display: flex;
  gap: 24rpx;
}

.form-half {
  flex: 1;
}

.location-row {
  display: flex;
  gap: 16rpx;
}

.location-btn {
  flex: 1;
  text-align: center;
  padding: 22rpx 0;
  border-radius: 20rpx;
  font-size: 26rpx;
  font-weight: 600;
  background: #F3F4F6;
  color: #9CA3AF;
}

.location-btn.active {
  background: #F97316;
  color: white;
}

.submit-btn {
  margin-top: 80rpx;
  text-align: center;
  padding: 32rpx 0;
  background: #F97316;
  color: white;
  border-radius: 28rpx;
  font-size: 32rpx;
  font-weight: 700;
  box-shadow: 0 16rpx 32rpx rgba(249, 115, 22, 0.25);
}
</style>