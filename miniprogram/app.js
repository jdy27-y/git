App({
  onLaunch() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
    } else {
      wx.cloud.init({
        env: 'your-env-id', // 替换为你的云开发环境ID
        traceUser: true
      });
    }

    // 获取用户信息
    this.globalData = {
      userInfo: null,
      openid: null
    };

    // 获取openid
    this.getOpenid();
  },

  getOpenid() {
    wx.cloud.callFunction({
      name: 'getOpenid',
      success: res => {
        this.globalData.openid = res.result.openid;
      }
    });
  },

  globalData: {
    userInfo: null,
    openid: null
  }
});
