<template>
  <view class="container">
    <!-- 商家信息 -->
    <view class="shop-info card">
      <text class="shop-name">🏪 {{ shopName }}</text>
    </view>

    <!-- 商品列表 -->
    <view class="goods-list card">
      <view class="goods-item" v-for="item in cartItems" :key="item._id">
        <text class="goods-name">{{ item.name }}</text>
        <view class="goods-right">
          <text class="goods-price">¥{{ item.price }}</text>
          <text class="goods-qty">×{{ item.quantity }}</text>
        </view>
      </view>
      <view class="divider"></view>
      <view class="total-row">
        <text>合计</text>
        <text class="price">¥{{ totalPrice }}</text>
      </view>
    </view>

    <!-- 取餐时间 -->
    <view class="pickup-section card">
      <view class="section-title">取餐时间</view>
      <view class="time-list">
        <view class="time-item" :class="{ active: selectedTime === time }" v-for="time in timeSlots" :key="time" @tap="selectTime(time)">{{ time }}</view>
      </view>
    </view>

    <!-- 联系方式 -->
    <view class="contact-section card">
      <view class="section-title">联系方式</view>
      <view class="input-row">
        <text class="label">手机号后四位</text>
        <input class="input" type="number" maxlength="4" placeholder="请输入手机号后四位" v-model="contactLast4" />
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-area">
      <button class="btn-primary" @tap="submitOrder">提交订单</button>
    </view>
  </view>
</template>

<script>
import { mockAPI } from '@/mock/mockData.js';

export default {
  data() {
    return {
      cartItems: [],
      shopName: '',
      shopId: '',
      totalPrice: '0.00',
      contactLast4: '',
      selectedTime: '',
      timeSlots: []
    };
  },
  onLoad() {
    this.cartItems = uni.getStorageSync('cartItems') || [];
    this.shopId = uni.getStorageSync('shopId') || '';
    this.shopName = uni.getStorageSync('shopName') || '';
    this.timeSlots = this.generateTimeSlots();

    let total = 0;
    this.cartItems.forEach(item => { total += item.price * item.quantity; });
    this.totalPrice = total.toFixed(2);
  },
  methods: {
    generateTimeSlots() {
      const slots = [];
      for (let h = 7; h < 9; h++) {
        slots.push(`${String(h).padStart(2, '0')}:00`);
        slots.push(`${String(h).padStart(2, '0')}:30`);
      }
      return slots;
    },
    selectTime(time) {
      this.selectedTime = time;
    },
    submitOrder() {
      if (!this.selectedTime) {
        uni.showToast({ title: '请选择取餐时间', icon: 'none' });
        return;
      }
      if (!this.contactLast4 || this.contactLast4.length !== 4) {
        uni.showToast({ title: '请输入手机号后四位', icon: 'none' });
        return;
      }

      const items = this.cartItems.map(item => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }));

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const [h, m] = this.selectedTime.split(':');
      tomorrow.setHours(parseInt(h), parseInt(m), 0, 0);

      const result = mockAPI.createOrder(this.shopId, items, tomorrow, this.contactLast4);

      if (result.success) {
        uni.showToast({ title: '下单成功', icon: 'success' });
        setTimeout(() => {
          uni.redirectTo({ url: `/pages/order/detail?id=${result.orderId}` });
        }, 1500);
      } else {
        uni.showToast({ title: result.message || '下单失败', icon: 'error' });
      }
    }
  }
};
</script>

<style scoped>
.shop-info .shop-name {
  font-size: 30rpx;
  font-weight: 500;
}

.goods-item {
  display: flex;
  justify-content: space-between;
  padding: 16rpx 0;
}

.goods-name { font-size: 28rpx; flex: 1; }
.goods-price { color: #ff4500; margin-right: 20rpx; }
.goods-qty { color: #999; }

.total-row {
  display: flex;
  justify-content: space-between;
  font-size: 30rpx;
  font-weight: 500;
  padding-top: 16rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 500;
  margin-bottom: 20rpx;
}

.time-list {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.time-item {
  padding: 16rpx 24rpx;
  background: #f5f5f5;
  border-radius: 12rpx;
  font-size: 26rpx;
}

.time-item.active {
  background: #FF8C00;
  color: #fff;
}

.input-row {
  display: flex;
  align-items: center;
}

.input-row .label {
  width: 240rpx;
  font-size: 28rpx;
}

.input-row .input {
  flex: 1;
  height: 72rpx;
  border: 1rpx solid #eee;
  border-radius: 8rpx;
  padding: 0 20rpx;
}

.submit-area {
  padding: 40rpx 30rpx;
}
</style>
