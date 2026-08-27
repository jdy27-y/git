<template>
  <view class="container">
    <!-- 用户信息 -->
    <view class="user-section card">
      <view class="user-avatar">👤</view>
      <view class="user-info">
        <view class="user-name">测试用户</view>
        <view class="user-phone">微信登录</view>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-section card">
      <view class="menu-item" @tap="goOrderList">
        <text class="menu-icon">📋</text>
        <text class="menu-text">我的订单</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">🔔</text>
        <text class="menu-text">消息通知</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">📞</text>
        <text class="menu-text">联系客服</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item">
        <text class="menu-icon">📍</text>
        <text class="menu-text">常用地址</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 关于 -->
    <view class="about-section card">
      <view class="menu-item">
        <text class="menu-icon">ℹ️</text>
        <text class="menu-text">关于我们</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  methods: {
    goOrderList() {
      uni.switchTab({ url: '/pages/order/list' });
    }
  }
};
</script>

<style scoped>
.user-section {
  display: flex;
  align-items: center;
  padding: 40rpx 24rpx;
}

.user-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
  margin-right: 24rpx;
}

.user-info { flex: 1; }
.user-name { font-size: 34rpx; font-weight: bold; margin-bottom: 8rpx; }
.user-phone { font-size: 26rpx; color: #999; }

.menu-section, .about-section { padding: 0; }

.menu-item {
  display: flex;
  align-items: center;
  padding: 28rpx 24rpx;
  border-bottom: 1rpx solid #f5f5f5;
}

.menu-item:last-child { border-bottom: none; }
.menu-icon { font-size: 36rpx; margin-right: 20rpx; }
.menu-text { flex: 1; font-size: 30rpx; }
.menu-arrow { font-size: 32rpx; color: #ccc; }
</style>
