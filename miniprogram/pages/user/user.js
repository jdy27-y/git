// pages/user/user.js
Page({
  data: {
    userInfo: {}
  },

  onLoad() {
    this.loadUserInfo();
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp();
    const openid = app.globalData.openid;

    if (!openid) return;

    const db = wx.cloud.database();
    db.collection('users')
      .where({ openid })
      .get()
      .then(res => {
        if (res.data.length > 0) {
          this.setData({ userInfo: res.data[0] });
        }
      });
  },

  // 获取用户头像昵称
  getUserProfile() {
    wx.getUserProfile({
      desc: '用于完善用户资料',
      success: res => {
        const userInfo = res.userInfo;

        // 更新或创建用户记录
        const app = getApp();
        const openid = app.globalData.openid;

        const db = wx.cloud.database();
        db.collection('users')
          .where({ openid })
          .get()
          .then(result => {
            if (result.data.length > 0) {
              // 更新
              db.collection('users').doc(result.data[0]._id).update({
                data: {
                  nickName: userInfo.nickName,
                  avatarUrl: userInfo.avatarUrl
                }
              });
            } else {
              // 创建
              db.collection('users').add({
                data: {
                  openid,
                  nickName: userInfo.nickName,
                  avatarUrl: userInfo.avatarUrl,
                  phone: '',
                  createdAt: new Date(),
                  isMember: false
                }
              });
            }

            this.setData({ userInfo: { ...this.data.userInfo, ...userInfo } });
          });
      }
    });
  },

  // 跳转订单列表
  goOrderList() {
    wx.switchTab({
      url: '/pages/order/list'
    });
  },

  // 跳转订阅消息授权
  goSubscribe() {
    wx.navigateTo({
      url: '/pages/auth/subscribe'
    });
  }
});
