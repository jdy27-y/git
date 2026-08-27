<template>
  <view class="container">
    <!-- 状态标签页 -->
    <view class="status-tabs">
      <view class="tab" :class="{ active: currentStatus === '' }" @tap="switchTab('')">全部</view>
      <view class="tab" :class="{ active: currentStatus === 'pending' }" @tap="switchTab('pending')">待接单</view>
      <view class="tab" :class="{ active: currentStatus === 'preparing' }" @tap="switchTab('preparing')">备餐中</view>
      <view class="tab" :class="{ active: currentStatus === 'ready' }" @tap="switchTab('ready')">待取餐</view>
      <view class="tab" :class="{ active: currentStatus === 'completed' }" @tap="switchTab('completed')">已完成</view>
    </view>

    <!-- 订单列表 -->
    <view class="order-list">
      <view class="order-card card" v-for="order in filteredOrders" :key="order._id" @tap="goDetail(order._id)">
        <view class="order-header">
          <text class="shop-name">🏪 {{ getShopName(order.shopId) }}</text>
          <text class="order-status" :class="'status-' + order.status">{{ getStatusText(order.status) }}</text>
        </view>
        <view class="order-items">
          <text v-for="(item, idx) in order.items" :key="idx">{{ item.name }} ×{{ item.quantity }}{{ idx < order.items.length - 1 ? '、' : '' }}</text>
        </view>
        <view class="order-footer">
          <view class="order-total">
            <text>合计：</text>
            <text class="price">¥{{ order.totalPrice.toFixed(2) }}</text>
          </view>
          <text class="order-time">{{ formatDate(order.createdAt) }}</text>
        </view>
        <view class="pickup-code" v-if="order.status === 'ready'">取餐码：{{ order.pickupCode }}</view>
      </view>

      <view class="empty-state" v-if="filteredOrders.length === 0">
        <text class="empty-icon">📋</text>
        <text class="empty-text">暂无订单</text>
      </view>
    </view>
  </view>
</template>

<script>
import { mockAPI } from '@/mock/mockData.js';

export default {
  data() {
    return {
      orders: [],
      filteredOrders: [],
      currentStatus: ''
    };
  },
  onShow() {
    this.loadOrders();
  },
  methods: {
    loadOrders() {
      this.orders = mockAPI.getUserOrders();
      this.filterOrders();
    },
    filterOrders() {
      this.filteredOrders = this.currentStatus
        ? this.orders.filter(o => o.status === this.currentStatus)
        : [...this.orders];
    },
    switchTab(status) {
      this.currentStatus = status;
      this.filterOrders();
    },
    getShopName(shopId) {
      const shop = mockAPI.getShop(shopId);
      return shop ? shop.name : '未知商家';
    },
    getStatusText(status) {
      const map = { pending: '待接单', preparing: '备餐中', ready: '待取餐', completed: '已完成', cancelled: '已取消' };
      return map[status] || status;
    },
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    },
    goDetail(id) {
      uni.navigateTo({ url: `/pages/order/detail?id=${id}` });
    }
  }
};
</script>

<style scoped>
.status-tabs {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  padding: 16rpx;
  margin-bottom: 24rpx;
}

.tab {
  flex: 1;
  text-align: center;
  padding: 16rpx 0;
  font-size: 26rpx;
  color: #666;
  border-radius: 8rpx;
}

.tab.active {
  background: #FF8C00;
  color: #fff;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;
}

.shop-name { font-size: 30rpx; font-weight: 500; }

.order-status {
  font-size: 24rpx;
  padding: 4rpx 16rpx;
  border-radius: 8rpx;
}

.status-pending { background: #fff7e6; color: #fa8c16; }
.status-preparing { background: #e6f7ff; color: #1890ff; }
.status-ready { background: #f6ffed; color: #52c41a; }
.status-completed { background: #f5f5f5; color: #999; }
.status-cancelled { background: #fff1f0; color: #ff4d4f; }

.order-items { font-size: 26rpx; color: #666; margin-bottom: 16rpx; }

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-time { font-size: 24rpx; color: #999; }

.pickup-code {
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f6ffed;
  border-radius: 8rpx;
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  color: #52c41a;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100rpx 0;
}

.empty-icon { font-size: 80rpx; margin-bottom: 20rpx; }
.empty-text { color: #999; font-size: 28rpx; }
</style>
