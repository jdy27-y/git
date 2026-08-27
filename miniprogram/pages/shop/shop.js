// pages/shop/shop.js
Page({
  data: {
    shop: {},
    products: [],
    filteredProducts: [],
    categories: [],
    currentCategory: '',
    loading: true,
    totalCount: 0,
    totalPrice: 0
  },

  onLoad(options) {
    this.shopId = options.id;
    this.cart = {}; // 购物车 {productId: quantity}
    this.loadShopInfo();
    this.loadProducts();
  },

  // 加载商家信息
  loadShopInfo() {
    const db = wx.cloud.database();
    db.collection('shops').doc(this.shopId).get().then(res => {
      this.setData({ shop: res.data });
    });
  },

  // 加载商品列表
  loadProducts() {
    this.setData({ loading: true });

    wx.cloud.callFunction({
      name: 'getShopProducts',
      data: { shopId: this.shopId },
      success: res => {
        const products = (res.result.products || []).map(item => ({
          ...item,
          quantity: 0
        }));

        // 提取分类
        const categorySet = new Set(products.map(p => p.category));
        const categories = Array.from(categorySet);

        this.setData({
          products,
          filteredProducts: products,
          categories,
          loading: false
        });
      },
      fail: err => {
        console.error('获取商品失败', err);
        this.setData({ loading: false });
      }
    });
  },

  // 按分类筛选
  filterCategory(e) {
    const category = e.currentTarget.dataset.category;
    const filtered = category
      ? this.data.products.filter(p => p.category === category)
      : this.data.products;

    this.setData({
      currentCategory: category,
      filteredProducts: filtered
    });
  },

  // 增加数量
  plusItem(e) {
    const id = e.currentTarget.dataset.id;
    const products = this.data.products;
    const product = products.find(p => p._id === id);
    if (!product) return;

    product.quantity = (product.quantity || 0) + 1;
    this.cart[id] = product.quantity;

    this.updateFilteredProducts(products);
    this.calcTotal();
  },

  // 减少数量
  minusItem(e) {
    const id = e.currentTarget.dataset.id;
    const products = this.data.products;
    const product = products.find(p => p._id === id);
    if (!product || product.quantity <= 0) return;

    product.quantity -= 1;
    if (product.quantity === 0) {
      delete this.cart[id];
    } else {
      this.cart[id] = product.quantity;
    }

    this.updateFilteredProducts(products);
    this.calcTotal();
  },

  // 更新筛选后的商品列表
  updateFilteredProducts(products) {
    const { currentCategory } = this.data;
    const filtered = currentCategory
      ? products.filter(p => p.category === currentCategory)
      : products;
    this.setData({ products, filteredProducts: filtered });
  },

  // 计算总价
  calcTotal() {
    let totalCount = 0;
    let totalPrice = 0;

    this.data.products.forEach(p => {
      if (p.quantity > 0) {
        totalCount += p.quantity;
        totalPrice += p.quantity * p.price;
      }
    });

    this.setData({
      totalCount,
      totalPrice: totalPrice.toFixed(2)
    });
  },

  // 去结算
  goCheckout() {
    if (this.data.totalCount === 0) {
      wx.showToast({ title: '请选择商品', icon: 'none' });
      return;
    }

    // 将购物车数据存到全局，供订单确认页使用
    const app = getApp();
    app.globalData.cartItems = this.data.products.filter(p => p.quantity > 0);
    app.globalData.shopId = this.shopId;
    app.globalData.shopName = this.data.shop.name;

    wx.navigateTo({
      url: '/pages/order/confirm'
    });
  }
});
