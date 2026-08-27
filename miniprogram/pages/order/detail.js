// pages/order/detail.js
Page({
  data: {
    order: {},
    shop: {},
    statusIcon: '',
    statusText: '',
    pickupTimeText: '',
    createdAtText: ''
  },

  onLoad(options) {
    this.orderId = options.id;
    this.loadOrder();
  },

  // 加载订单详情
  loadOrder() {
    const db = wx.cloud.database();

    db.collection('orders').doc(this.orderId).get().then(res => {
      const order = res.data;

      // 加载商家信息
      db.collection('shops').doc(order.shopId).get().then(shopRes => {
        this.setData({
          order,
          shop: shopRes.data,
          statusIcon: this.getStatusIcon(order.status),
          statusText: this.getStatusText(order.status),
          pickupTimeText: this.formatDate(order.pickupTime),
          createdAtText: this.formatDate(order.createdAt)
        });
      });
    });
  },

  // 状态图标
  getStatusIcon(status) {
    const map = {
      pending: '⏳',
      preparing: '👨‍🍳',
      ready: '✅',
      completed: '🎉',
      cancelled: '❌'
    };
    return map[status] || '📋';
  },

  // 状态文字
  getStatusText(status) {
    const map = {
      pending: '等待商家接单',
      preparing: '商家正在备餐',
      ready: '请尽快取餐',
      completed: '订单已完成',
      cancelled: '订单已取消'
    };
    return map[status] || status;
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 拨打商家电话
  callShop() {
    if (this.data.shop.phone) {
      wx.makePhoneCall({
        phoneNumber: this.data.shop.phone
      });
    }
  },

  // 取消订单
  cancelOrder() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个订单吗？',
      success: res => {
        if (res.confirm) {
          wx.showLoading({ title: '取消中...' });

          wx.cloud.callFunction({
            name: 'cancelOrder',
            data: { orderId: this.orderId },
            success: res => {
              wx.hideLoading();

              if (res.result.success) {
                wx.showToast({ title: '取消成功', icon: 'success' });
                this.loadOrder(); // 刷新订单状态
              } else {
                wx.showToast({ title: res.result.message || '取消失败', icon: 'error' });
              }
            },
            fail: err => {
              wx.hideLoading();
              console.error('取消订单失败', err);
              wx.showToast({ title: '取消失败', icon: 'error' });
            }
          });
        }
      }
    });
  }
});
