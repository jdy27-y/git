<template>
  <view class="container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <input class="search-input" placeholder="搜索商家" v-model="searchText" @input="onSearch" />
    </view>

    <!-- 商家列表 -->
    <view class="shop-list">
      <view class="shop-card" v-for="shop in filteredShops" :key="shop._id" @tap="goShop(shop._id)">
        <!-- 商家头像 -->
        <view class="shop-avatar">
          <image :src="shop.imageUrl || '/static/images/default-shop.png'" mode="aspectFill"></image>
        </view>

        <!-- 商家信息 -->
        <view class="shop-info">
          <view class="shop-name">
            <text>{{ shop.name }}</text>
            <text class="tag" :class="shop.status === 'open' ? 'tag-open' : 'tag-closed'">
              {{ shop.status === 'open' ? '营业中' : '已休息' }}
            </text>
          </view>
          <view class="shop-meta">
            <text class="distance">📍 {{ shop.distance || '未知' }}</text>
            <text class="rating">⭐ {{ shop.rating || 5.0 }}</text>
          </view>
          <view class="shop-notice" v-if="shop.notice">
            <text>{{ shop.notice }}</text>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-state" v-if="filteredShops.length === 0">
        <text class="empty-icon">🔍</text>
        <text class="empty-text">附近暂无营业商家</text>
      </view>
    </view>
  </view>
</template>

<script>
import { mockAPI } from '@/mock/mockData.js';

export default {
  data() {
    return {
      shops: [],
      filteredShops: [],
      searchText: '',
      latitude: 39.9042,
      longitude: 116.4074
    };
  },
  onLoad() {
    this.loadShops();
  },
  methods: {
    loadShops() {
      this.shops = mockAPI.getShopList(this.latitude, this.longitude);
      this.filteredShops = [...this.shops];
    },
    onSearch() {
      if (!this.searchText) {
        this.filteredShops = [...this.shops];
        return;
      }
      this.filteredShops = this.shops.filter(s =>
        s.name.includes(this.searchText) || s.address.includes(this.searchText)
      );
    },
    goShop(shopId) {
      uni.navigateTo({
        url: `/pages/shop/shop?id=${shopId}`
      });
    }
  }
};
</script>

<style scoped>
.search-bar {
  background: #fff;
  border-radius: 32rpx;
  padding: 16rpx 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.search-input {
  font-size: 28rpx;
}

.shop-card {
  display: flex;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.08);
}

.shop-avatar {
  width: 140rpx;
  height: 140rpx;
  border-radius: 12rpx;
  overflow: hidden;
  flex-shrink: 0;
  margin-right: 20rpx;
  background: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 60rpx;
}

.shop-avatar image {
  width: 100%;
  height: 100%;
}

.shop-info {
  flex: 1;
}

.shop-name {
  display: flex;
  align-items: center;
  font-size: 32rpx;
  font-weight: 500;
  margin-bottom: 8rpx;
}

.shop-name .tag {
  margin-left: 12rpx;
}

.shop-meta {
  display: flex;
  font-size: 24rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.shop-meta .distance {
  margin-right: 24rpx;
}

.shop-notice {
  font-size: 22rpx;
  color: #ff8c00;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon {
  font-size: 80rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  color: #999;
  font-size: 28rpx;
}
</style>
