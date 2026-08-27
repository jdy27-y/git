// pages/order/confirm.js
Page({
  data: {
    cartItems: [],
    shopName: '',
    shopId: '',
    totalPrice: '0.00',
    contactLast4: '',
    selectedTime: '',
    timeSlots: []
  },

  onLoad() {
    const app = getApp();
    const cartItems = app.globalData.cartItems || [];
    const shopId = app.globalData.shopId || '';
    const shopName = app.globalData.shopName || '';

    // 生成可选时段（明天 7:00-9:00，每30分钟）
    const timeSlots = this.generateTimeSlots();

    // 计算总价
    let totalPrice = 0;
    cartItems.forEach(item => {
      totalPrice += item.price * item.quantity;
    });

    this.setData({
      cartItems,
      shopId,
      shopName,
      totalPrice: totalPrice.toFixed(2),
      timeSlots
    });
  },

  // 生成可选时段
  generateTimeSlots() {
    const slots = [];
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // 7:00 到 9:00，每30分钟
    for (let hour = 7; hour < 9; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }

    return slots;
  },

  // 选择时段
  selectTime(e) {
    this.setData({ selectedTime: e.currentTarget.dataset.time });
  },

  // 输入手机号后四位
  inputPhone(e) {
    this.setData({ contactLast4: e.detail.value });
  },

  // 提交订单
  submitOrder() {
    const { selectedTime, contactLast4, cartItems, shopId, shopName } = this.data;

    // 校验
    if (!selectedTime) {
      wx.showToast({ title: '请选择取餐时间', icon: 'none' });
      return;
    }

    if (!contactLast4 || contactLast4.length !== 4) {
      wx.showToast({ title: '请输入手机号后四位', icon: 'none' });
      return;
    }

    if (cartItems.length === 0) {
      wx.showToast({ title: '购物车为空', icon: 'none' });
      return;
    }

    // 准备商品数据
    const items = cartItems.map(item => ({
      productId: item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity
    }));

    // 构建取餐时间（明天的指定时段）
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const [hours, minutes] = selectedTime.split(':');
    tomorrow.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    wx.showLoading({ title: '提交中...' });

    wx.cloud.callFunction({
      name: 'createOrder',
      data: {
        shopId,
        items,
        pickupTime: tomorrow,
        contactLast4
      },
      success: res => {
        wx.hideLoading();

        if (res.result.success) {
          wx.showToast({ title: '下单成功', icon: 'success' });

          // 跳转到订单详情
          setTimeout(() => {
            wx.redirectTo({
              url: `/pages/order/detail?id=${res.result.orderId}`
            });
          }, 1500);
        } else {
          wx.showToast({ title: res.result.message || '下单失败', icon: 'error' });
        }
      },
      fail: err => {
        wx.hideLoading();
        console.error('下单失败', err);
        wx.showToast({ title: '下单失败', icon: 'error' });
      }
    });
  }
});
