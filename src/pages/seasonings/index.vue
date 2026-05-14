<template>
  <view class="page">
    <view class="stats-bar card">
      <text class="stats-text">共 {{ store.seasonings.length }} 种调料</text>
    </view>

    <view class="toolbar">
      <view class="search-box">
        <text class="search-icon">🔍</text>
        <input
          class="search-input"
          v-model="searchQuery"
          placeholder="搜索调料..."
        />
      </view>
      <view class="btn-add" @click="showAddDialog = true">
        <text class="btn-add-icon">+</text>
        <text>添加</text>
      </view>
    </view>

    <view v-if="filteredSeasonings.length === 0" class="empty-state">
      <text class="empty-icon">🧂</text>
      <text class="empty-text">还没有调料，点击右上角添加</text>
    </view>

    <view v-else class="seasoning-list">
      <view
        v-for="item in filteredSeasonings"
        :key="item.id"
        class="list-item card"
        @click="editSeasoning(item)"
      >
        <view class="item-left">
          <text class="item-emoji">{{ getCategoryEmoji(item.category) }}</text>
          <view class="item-info">
            <text class="item-name">{{ item.name }}</text>
            <text class="item-detail">{{ item.quantity }}{{ item.unit }}</text>
          </view>
        </view>
        <view class="item-right">
          <text class="tag" :class="getCategoryTagClass(item.category)">{{ item.category }}</text>
          <text class="btn-delete" @click.stop="confirmDelete(item)">删除</text>
        </view>
      </view>
    </view>

    <!-- 添加/编辑对话框 -->
    <view v-if="showAddDialog || editingItem" class="modal-overlay" @click="closeDialog">
      <view class="modal-content" @click.stop>
        <text class="modal-title">{{ editingItem ? '编辑调料' : '添加调料' }}</text>

        <view class="form-group">
          <text class="form-label">调料名称</text>
          <input class="input-field" v-model="form.name" placeholder="如：生抽、盐" />
        </view>

        <view class="form-group">
          <text class="form-label">分类</text>
          <view class="category-select">
            <text
              v-for="cat in categories"
              :key="cat"
              class="category-option"
              :class="{ active: form.category === cat }"
              @click="form.category = cat"
            >{{ cat }}</text>
          </view>
        </view>

        <view class="form-row">
          <view class="form-group flex-1">
            <text class="form-label">数量</text>
            <input class="input-field" v-model="form.quantity" type="number" placeholder="数量" />
          </view>
          <view class="form-group flex-1">
            <text class="form-label">单位</text>
            <input class="input-field" v-model="form.unit" placeholder="瓶/袋/克" />
          </view>
        </view>

        <view class="modal-actions">
          <view class="btn-cancel" @click="closeDialog">取消</view>
          <view class="btn-confirm" @click="saveSeasoning">保存</view>
        </view>
      </view>
    </view>

    <!-- 删除确认 -->
    <view v-if="deleteTarget" class="modal-overlay" @click="deleteTarget = null">
      <view class="modal-content modal-sm" @click.stop>
        <text class="modal-title">确认删除</text>
        <text class="modal-desc">确定要删除「{{ deleteTarget.name }}」吗？</text>
        <view class="modal-actions">
          <view class="btn-cancel" @click="deleteTarget = null">取消</view>
          <view class="btn-danger" @click="doDelete">删除</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSeasoningStore } from '@/stores/seasoning'
import { useShare } from '@/utils/share'
import { SeasoningCategory, Seasoning } from '@/data/types'

const { enableShareMenu } = useShare()

const store = useSeasoningStore()

const SEASONING_CATEGORIES = ['基础调料', '酱料', '香料', '油类', '料酒醋类', '其他'] as const

const searchQuery = ref('')
const showAddDialog = ref(false)
const editingItem = ref<Seasoning | null>(null)
const deleteTarget = ref<Seasoning | null>(null)
const categories = SEASONING_CATEGORIES as unknown as SeasoningCategory[]

const form = ref({
  name: '',
  category: '基础调料' as SeasoningCategory,
  quantity: 1,
  unit: '瓶'
})

const filteredSeasonings = computed(() => {
  if (!searchQuery.value) return store.seasonings
  const q = searchQuery.value.toLowerCase()
  return store.seasonings.filter(s =>
    s.name.toLowerCase().includes(q) || s.category.includes(q)
  )
})

function getCategoryEmoji(category: string): string {
  const map: Record<string, string> = {
    '基础调料': '🧂', '酱料': '🥫', '香料': '🌿',
    '油类': '🫒', '料酒醋类': '🍶', '其他': '📦'
  }
  return map[category] || '📦'
}

function getCategoryTagClass(category: string): string {
  const map: Record<string, string> = {
    '基础调料': 'tag-green', '酱料': 'tag-red',
    '香料': 'tag-orange', '油类': 'tag-blue', '料酒醋类': 'tag-blue'
  }
  return map[category] || 'tag-blue'
}

function resetForm() {
  form.value = {
    name: '',
    category: '基础调料',
    quantity: 1,
    unit: '瓶'
  }
}

function editSeasoning(item: Seasoning) {
  editingItem.value = item
  form.value = {
    name: item.name,
    category: item.category,
    quantity: item.quantity,
    unit: item.unit
  }
  showAddDialog.value = true
}

function closeDialog() {
  showAddDialog.value = false
  editingItem.value = null
  resetForm()
}

function saveSeasoning() {
  if (!form.value.name.trim()) {
    uni.showToast({ title: '请输入调料名称', icon: 'none' })
    return
  }

  if (editingItem.value) {
    store.updateSeasoning(editingItem.value.id, {
      name: form.value.name,
      category: form.value.category,
      quantity: Number(form.value.quantity) || 1,
      unit: form.value.unit
    })
    uni.showToast({ title: '修改成功', icon: 'success' })
  } else {
    store.addSeasoning({
      name: form.value.name,
      category: form.value.category,
      quantity: Number(form.value.quantity) || 1,
      unit: form.value.unit
    })
    uni.showToast({ title: '添加成功', icon: 'success' })
  }

  closeDialog()
}

function confirmDelete(item: Seasoning) {
  deleteTarget.value = item
}

function doDelete() {
  if (deleteTarget.value) {
    store.removeSeasoning(deleteTarget.value.id)
    uni.showToast({ title: '已删除', icon: 'success' })
    deleteTarget.value = null
  }
}

onMounted(() => {
  store.load()
  enableShareMenu()
})
</script>

<script lang="ts">
export default {
  onShareAppMessage(): { title: string; path: string } {
    return {
      title: '我的调料清单 - 智能菜谱',
      path: '/pages/seasonings/index'
    }
  }
}
</script>

<style scoped>
.page {
  padding-bottom: 40rpx;
  min-height: 100vh;
}

.stats-bar {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 20rpx 30rpx;
  margin: 20rpx 30rpx;
}

.stats-text {
  font-size: 28rpx;
  color: #333;
  font-weight: 500;
}

.toolbar {
  display: flex;
  align-items: center;
  gap: 20rpx;
  padding: 0 30rpx;
  margin-bottom: 20rpx;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  background: white;
  border-radius: 40rpx;
  padding: 16rpx 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);
}

.search-icon {
  font-size: 28rpx;
  margin-right: 12rpx;
}

.search-input {
  flex: 1;
  font-size: 26rpx;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: #F97316;
  color: white;
  padding: 16rpx 32rpx;
  border-radius: 40rpx;
  font-size: 26rpx;
  white-space: nowrap;
}

.btn-add-icon {
  font-size: 32rpx;
  font-weight: bold;
}

.seasoning-list {
  padding: 0 30rpx;
}

.list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16rpx;
  padding: 24rpx 30rpx;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 20rpx;
  flex: 1;
}

.item-emoji {
  font-size: 40rpx;
  width: 60rpx;
  text-align: center;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 30rpx;
  font-weight: 500;
  color: #333;
}

.item-detail {
  font-size: 24rpx;
  color: #999;
  display: block;
  margin-top: 6rpx;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.btn-delete {
  font-size: 24rpx;
  color: #F44336;
  padding: 8rpx 16rpx;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background: white;
  border-radius: 24rpx;
  padding: 40rpx;
  width: 85%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-sm {
  width: 65%;
}

.modal-title {
  font-size: 34rpx;
  font-weight: 600;
  color: #333;
  display: block;
  margin-bottom: 30rpx;
  text-align: center;
}

.modal-desc {
  font-size: 28rpx;
  color: #666;
  display: block;
  text-align: center;
  margin-bottom: 30rpx;
}

.form-group {
  margin-bottom: 24rpx;
}

.form-label {
  font-size: 26rpx;
  color: #666;
  display: block;
  margin-bottom: 10rpx;
}

.form-row {
  display: flex;
  gap: 20rpx;
}

.flex-1 {
  flex: 1;
}

.category-select {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
}

.category-option {
  padding: 12rpx 24rpx;
  border-radius: 30rpx;
  font-size: 24rpx;
  background: #f5f5f5;
  color: #666;
}

.category-option.active {
  background: #FFEDD5;
  color: #F97316;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.btn-cancel {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #f5f5f5;
  color: #666;
  font-size: 28rpx;
}

.btn-confirm {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #F97316;
  color: white;
  font-size: 28rpx;
}

.btn-danger {
  flex: 1;
  text-align: center;
  padding: 20rpx;
  border-radius: 16rpx;
  background: #F44336;
  color: white;
  font-size: 28rpx;
}
</style>