<template>
  <view class="page">
    <web-view
      v-if="videoUrl"
      :src="videoUrl"
      @error="onError"
    />
    <view v-else class="empty-state">
      <text class="empty-icon">😅</text>
      <text class="empty-text">视频加载失败</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useShare } from '@/utils/share'

const { enableShareMenu } = useShare()
const videoUrl = ref('')

function convertBilibiliUrl(url: string): string {
  if (!url) return ''
  const bvidMatch = url.match(/BV\w+/)
  if (bvidMatch) {
    return `https://player.bilibili.com/player.html?bvid=${bvidMatch[0]}&autoplay=1`
  }
  return url
}

function onError(e: any) {
  uni.showToast({ title: '视频加载失败，请重试', icon: 'none' })
}

onLoad((options) => {
  const url = options?.url
  if (url) {
    videoUrl.value = convertBilibiliUrl(decodeURIComponent(url))
  }
  enableShareMenu()
})
</script>

<script lang="ts">
export default {
  onShareAppMessage(): { title: string; path: string } {
    return {
      title: '跟着视频学做菜 - 智能菜谱',
      path: '/pages/video-player/index'
    }
  }
}
</script>

<style>
.page {
  height: 100vh;
  overflow: hidden;
}

web-view {
  width: 100%;
  height: 100%;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.empty-icon {
  font-size: 80rpx;
}

.empty-text {
  font-size: 28rpx;
  color: #999;
  margin-top: 16rpx;
}
</style>