<template>
  <view class="container">
    <!-- 商家信息 -->
    <view class="shop-header card">
      <view class="shop-name">{{ shop.name }}</view>
      <view class="shop-status">
        <text class="tag" :class="shop.status === 'open' ? 'tag-open' : 'tag-closed'">
          {{ shop.status === 'open' ? '营业中' : '已休息' }}
        </text>
        <text class="rating">⭐ {{ shop.rating || 5.0 }}</text>
      </view>
      <view class="shop-addr">📍 {{ shop.address }}</view>
      <view class="shop-hours">🕐 {{ shop.businessHours.start }}-{{ shop.businessHours.end }}</view>
      <view class="shop-notice" v-if="shop.notice">📢 {{ shop.notice }}</view>
    </view>

    <!-- 分类导航 -->
    <scroll-view class="category-nav" scroll-x>
      <view class="category-item" :class="{ active: currentCategory === '' }" @tap="filterCategory('')">全部</view>
      <view class="category-item" :class="{ active: currentCategory === cat }" v-for="cat in categories" :key="cat" @tap="filterCategory(cat)">{{ cat }}</view>
    </scroll-view>

    <!-- 商品列表 -->
    <view class="product-list">
      <view class="product-item" v-for="product in filteredProducts" :key="product._id">
        <view class="product-img">
          <image :src="product.imageUrl || '/static/images/default-product.png'" mode="aspectFill"></image>
        </view>
        <view class="product-info">
          <view class="product-name">{{ product.name }}</view>
          <view class="product-category">{{ product.category }}</view>
          <view class="product-bottom">
            <text class="product-price price">¥{{ product.price }}</text>
            <view class="quantity-control" v-if="product.stock > 0">
              <view class="btn-minus" v-if="product.quantity > 0" @tap="minusItem(product._id)">-</view>
              <text class="quantity" v-if="product.quantity > 0">{{ product.quantity }}</text>
              <view class="btn-plus" @tap="plusItem(product._id)">+</view>
            </view>
            <text class="sold-out" v-else>已售罄</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 底部结算栏 -->
    <view class="settle-bar" v-if="totalCount > 0">
      <view class="settle-left">
        <view class="cart-icon">🛒
          <view class="cart-badge">{{ totalCount }}</view>
        </view>
        <view class="total-price">
          <text>合计：</text>
          <text class="price">¥{{ totalPrice }}</text>
        </view>
      </view>
      <view class="settle-btn" @tap="goCheckout">去结算</view>
    </view>
  </view>
</template>

<script>
import { mockAPI } from '@/mock/mockData.js';

export default {
  data() {
    return {
      shop: {},
      products: [],
      filteredProducts: [],
      categories: [],
      currentCategory: '',
      totalCount: 0,
      totalPrice: '0.00'
    };
  },
  onLoad(options) {
    this.shopId = options.id;
    this.loadShop();
    this.loadProducts();
  },
  methods: {
    loadShop() {
      this.shop = mockAPI.getShop(this.shopId);
    },
    loadProducts() {
      this.products = mockAPI.getShopProducts(this.shopId).map(p => ({ ...p, quantity: 0 }));
      const cats = new Set(this.products.map(p => p.category));
      this.categories = Array.from(cats);
      this.filteredProducts = [...this.products];
    },
    filterCategory(cat) {
      this.currentCategory = cat;
      this.filteredProducts = cat ? this.products.filter(p => p.category === cat) : [...this.products];
    },
    plusItem(id) {
      const product = this.products.find(p => p._id === id);
      if (product) {
        product.quantity = (product.quantity || 0) + 1;
        this.updateFiltered();
        this.calcTotal();
      }
    },
    minusItem(id) {
      const product = this.products.find(p => p._id === id);
      if (product && product.quantity > 0) {
        product.quantity--;
        this.updateFiltered();
        this.calcTotal();
      }
    },
    updateFiltered() {
      this.filteredProducts = this.currentCategory
        ? this.products.filter(p => p.category === this.currentCategory)
        : [...this.products];
    },
    calcTotal() {
      let total = 0;
      let price = 0;
      this.products.forEach(p => {
        if (p.quantity > 0) {
          total += p.quantity;
          price += p.quantity * p.price;
        }
      });
      this.totalCount = total;
      this.totalPrice = price.toFixed(2);
    },
    goCheckout() {
      if (this.totalCount === 0) {
        uni.showToast({ title: '请选择商品', icon: 'none' });
        return;
      }
      const cartItems = this.products.filter(p => p.quantity > 0);
      uni.setStorageSync('cartItems', cartItems);
      uni.setStorageSync('shopId', this.shopId);
      uni.setStorageSync('shopName', this.shop.name);
      uni.navigateTo({ url: '/pages/order/confirm' });
    }
  }
};
</script>

<style scoped>
.shop-header {
  margin-bottom: 20rpx;
}

.shop-name {
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 12rpx;
}

.shop-status {
  display: flex;
  align-items: center;
  margin-bottom: 12rpx;
}

.shop-status .rating {
  margin-left: 20rpx;
  color: #666;
  font-size: 24rpx;
}

.shop-addr, .shop-hours, .shop-notice {
  font-size: 26rpx;
  color: #666;
  margin-bottom: 8rpx;
}

.shop-notice {
  color: #ff8c00;
}

.category-nav {
  white-space: nowrap;
  padding: 20rpx 0;
}

.category-item {
  display: inline-block;
  padding: 12rpx 28rpx;
  margin-right: 16rpx;
  background: #f0f0f0;
  border-radius: 30rpx;
  font-size: 26rpx;
  color: #666;
}

.category-item.active {
  background: #FF8C00;
  color: #fff;
}

.product-item {
  display: flex;
  background: #fff;
  border-radius: 12rpx;
  padding: 20rpx;
  margin-bottom: 16rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.06);
}

.product-img {
  width: 160rpx;
  height: 160rpx;
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

.product-img image {
  width: 100%;
  height: 100%;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 30rpx;
  font-weight: 500;
}

.product-category {
  font-size: 24rpx;
  color: #999;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 34rpx;
}

.quantity-control {
  display: flex;
  align-items: center;
}

.btn-minus, .btn-plus {
  width: 48rpx;
  height: 48rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  font-weight: bold;
}

.btn-minus {
  background: #f0f0f0;
  color: #666;
}

.btn-plus {
  background: #FF8C00;
  color: #fff;
}

.quantity {
  min-width: 50rpx;
  text-align: center;
  font-size: 28rpx;
}

.sold-out {
  color: #999;
  font-size: 24rpx;
}

.settle-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110rpx;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30rpx;
  box-shadow: 0 -2rpx 12rpx rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.settle-left {
  display: flex;
  align-items: center;
}

.cart-icon {
  position: relative;
  font-size: 48rpx;
  margin-right: 20rpx;
}

.cart-badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  background: #ff4500;
  color: #fff;
  font-size: 20rpx;
  min-width: 32rpx;
  height: 32rpx;
  border-radius: 16rpx;
  text-align: center;
  line-height: 32rpx;
}

.settle-btn {
  background: #FF8C00;
  color: #fff;
  padding: 16rpx 48rpx;
  border-radius: 40rpx;
  font-size: 30rpx;
  font-weight: 500;
}
</style>
