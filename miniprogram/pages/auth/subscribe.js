// pages/auth/subscribe.js
Page({
  data: {},

  // 订阅消息
  subscribeMessage() {
    // 订阅消息模板ID需要在微信公众平台配置
    // 这里使用示例模板ID，实际使用时需要替换
    const templateIds = [
      'your-template-id-1', // 订单状态变更
      'your-template-id-2'  // 备餐完成
    ];

    wx.requestSubscribeMessage({
      tmplIds: templateIds,
      success: res => {
        console.log('订阅消息结果', res);

        // 检查每个模板的订阅结果
        templateIds.forEach(id => {
          if (res[id] === 'accept') {
            console.log(`模板 ${id} 订阅成功`);
          } else {
            console.log(`模板 ${id} 订阅失败或拒绝`);
          }
        });

        wx.showToast({ title: '设置成功', icon: 'success' });

        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      },
      fail: err => {
        console.error('订阅消息失败', err);
        wx.showToast({ title: '设置失败', icon: 'error' });
      }
    });
  },

  // 返回
  goBack() {
    wx.navigateBack();
  }
});
