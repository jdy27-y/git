<template>
  <view class="container" v-if="order">
    <!-- 订单状态 -->
    <view class="status-section card">
      <view class="status-icon">{{ statusIcon }}</view>
      <view class="status-text">{{ statusText }}</view>
      <view class="pickup-code" v-if="order.status === 'ready'">取餐码：{{ order.pickupCode }}</view>
    </view>

    <!-- 商家信息 -->
    <view class="shop-section card">
      <view class="section-title">商家信息</view>
      <view class="shop-name">🏪 {{ shop.name }}</view>
      <view class="shop-addr">📍 {{ shop.address }}</view>
      <view class="shop-phone" @tap="callShop">📞 {{ shop.phone }}</view>
    </view>

    <!-- 商品明细 -->
    <view class="goods-section card">
      <view class="section-title">商品明细</view>
      <view class="goods-item" v-for="item in order.items" :key="item.productId">
        <text class="goods-name">{{ item.name }}</text>
        <view class="goods-right">
          <text class="goods-price">¥{{ item.price }}</text>
          <text class="goods-qty">×{{ item.quantity }}</text>
        </view>
      </view>
      <view class="divider"></view>
      <view class="total-row">
        <text>合计</text>
        <text class="price">¥{{ order.totalPrice.toFixed(2) }}</text>
      </view>
    </view>

    <!-- 订单信息 -->
    <view class="info-section card">
      <view class="info-row">
        <text class="label">取餐时间</text>
        <text class="value">{{ formatDate(order.pickupTime) }}</text>
      </view>
      <view class="info-row">
        <text class="label">联系方式</text>
        <text class="value">手机号后四位 {{ order.contactLast4 }}</text>
      </view>
      <view class="info-row">
        <text class="label">下单时间</text>
        <text class="value">{{ formatDate(order.createdAt) }}</text>
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="action-area" v-if="order.status === 'pending' || order.status === 'preparing'">
      <button class="btn-cancel" @tap="cancelOrder">取消订单</button>
    </view>
  </view>
</template>

<script>
import { mockAPI } from '@/mock/mockData.js';

export default {
  data() {
    return {
      order: null,
      shop: {}
    };
  },
  computed: {
    statusIcon() {
      const map = { pending: '⏳', preparing: '👨‍🍳', ready: '✅', completed: '🎉', cancelled: '❌' };
      return map[this.order?.status] || '📋';
    },
    statusText() {
      const map = { pending: '等待商家接单', preparing: '商家正在备餐', ready: '请尽快取餐', completed: '订单已完成', cancelled: '订单已取消' };
      return map[this.order?.status] || '';
    }
  },
  onLoad(options) {
    this.orderId = options.id;
    this.loadOrder();
  },
  methods: {
    loadOrder() {
      this.order = mockAPI.getOrder(this.orderId);
      if (this.order) {
        this.shop = mockAPI.getShop(this.order.shopId) || {};
      }
    },
    formatDate(date) {
      if (!date) return '';
      const d = new Date(date);
      return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    },
    callShop() {
      if (this.shop.phone) {
        uni.makePhoneCall({ phoneNumber: this.shop.phone });
      }
    },
    cancelOrder() {
      uni.showModal({
        title: '确认取消',
        content: '确定要取消这个订单吗？',
        success: (res) => {
          if (res.confirm) {
            const result = mockAPI.cancelOrder(this.orderId);
            if (result.success) {
              uni.showToast({ title: '取消成功', icon: 'success' });
              this.loadOrder();
            } else {
              uni.showToast({ title: result.message, icon: 'error' });
            }
          }
        }
      });
    }
  }
};
</script>

<style scoped>
.status-section { text-align: center; padding: 40rpx; }
.status-icon { font-size: 80rpx; margin-bottom: 16rpx; }
.status-text { font-size: 36rpx; font-weight: bold; margin-bottom: 12rpx; }
.pickup-code { font-size: 48rpx; font-weight: bold; color: #ff4500; margin-top: 20rpx; }

.section-title { font-size: 30rpx; font-weight: 500; margin-bottom: 16rpx; }
.shop-name, .shop-addr, .shop-phone { font-size: 28rpx; margin-bottom: 12rpx; }
.shop-phone { color: #1890ff; }

.goods-item { display: flex; justify-content: space-between; padding: 12rpx 0; }
.goods-name { font-size: 28rpx; }
.goods-price { color: #ff4500; margin-right: 20rpx; }
.goods-qty { color: #999; }

.total-row { display: flex; justify-content: space-between; font-size: 30rpx; font-weight: 500; padding-top: 12rpx; }

.info-row { display: flex; justify-content: space-between; padding: 12rpx 0; font-size: 28rpx; }
.info-row .label { color: #999; }

.action-area { padding: 40rpx 30rpx; }
.btn-cancel {
  background: #fff;
  color: #ff4d4f;
  border: 1rpx solid #ff4d4f;
  border-radius: 44rpx;
  height: 88rpx;
  line-height: 88rpx;
  font-size: 32rpx;
}
</style>
