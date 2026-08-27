// pages/index/index.js
Page({
  data: {
    shops: [],
    loading: true,
    latitude: null,
    longitude: null
  },

  onLoad() {
    this.getLocation();
  },

  onShow() {
    if (this.data.latitude) {
      this.getShops();
    }
  },

  // 获取当前位置
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: res => {
        this.setData({
          latitude: res.latitude,
          longitude: res.longitude
        });
        this.getShops();
      },
      fail: () => {
        // 定位失败，仍然加载列表（不按距离排序）
        this.getShops();
      }
    });
  },

  // 获取商家列表
  getShops() {
    this.setData({ loading: true });

    wx.cloud.callFunction({
      name: 'getShopList',
      data: {
        latitude: this.data.latitude,
        longitude: this.data.longitude
      },
      success: res => {
        this.setData({
          shops: res.result.shops || [],
          loading: false
        });
      },
      fail: err => {
        console.error('获取商家列表失败', err);
        this.setData({ loading: false });
        wx.showToast({ title: '加载失败', icon: 'error' });
      }
    });
  },

  // 跳转商家详情
  goShop(e) {
    const shopId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/shop/shop?id=${shopId}`
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.getShops();
    wx.stopPullDownRefresh();
  }
});
