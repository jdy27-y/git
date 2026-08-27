// pages/order/list.js
Page({
  data: {
    orders: [],
    filteredOrders: [],
    currentStatus: '',
    loading: true
  },

  onLoad() {
    this.loadOrders();
  },

  onShow() {
    this.loadOrders();
  },

  // 加载订单列表
  loadOrders() {
    this.setData({ loading: true });

    const db = wx.cloud.database();
    const app = getApp();

    db.collection('orders')
      .where({ userId: app.globalData.openid })
      .orderBy('createdAt', 'desc')
      .get()
      .then(res => {
        const orders = res.data.map(order => ({
          ...order,
          statusText: this.getStatusText(order.status),
          totalPrice: order.totalPrice.toFixed(2),
          createdAtText: this.formatDate(order.createdAt)
        }));

        this.setData({
          orders,
          filteredOrders: orders,
          loading: false
        });
      })
      .catch(err => {
        console.error('加载订单失败', err);
        this.setData({ loading: false });
      });
  },

  // 状态文字
  getStatusText(status) {
    const map = {
      pending: '待接单',
      preparing: '备餐中',
      ready: '待取餐',
      completed: '已完成',
      cancelled: '已取消'
    };
    return map[status] || status;
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  },

  // 切换状态标签
  switchTab(e) {
    const status = e.currentTarget.dataset.status;
    const filtered = status
      ? this.data.orders.filter(o => o.status === status)
      : this.data.orders;

    this.setData({
      currentStatus: status,
      filteredOrders: filtered
    });
  },

  // 跳转订单详情
  goDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/detail?id=${orderId}`
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadOrders();
    wx.stopPullDownRefresh();
  }
});
