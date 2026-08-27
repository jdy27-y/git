// 云函数：updateOrderStatus
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { orderId, newStatus } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 1. 查询订单
    const orderRes = await db.collection('orders').doc(orderId).get();
    const order = orderRes.data;

    // 2. 校验商家权限（只有商家可以更新状态）
    const shopRes = await db.collection('shops')
      .where({ _id: order.shopId })
      .get();

    if (shopRes.data.length === 0) {
      return { success: false, message: '商家不存在' };
    }

    // 3. 校验状态流转
    const validTransitions = {
      pending: ['preparing', 'cancelled'],
      preparing: ['ready', 'cancelled'],
      ready: ['completed']
    };

    if (!validTransitions[order.status] || !validTransitions[order.status].includes(newStatus)) {
      return { success: false, message: '状态流转不合法' };
    }

    // 4. 更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: newStatus,
        updatedAt: new Date()
      }
    });

    // 5. 如果状态变为ready，发送订阅消息给用户
    if (newStatus === 'ready') {
      try {
        // 发送订阅消息提醒用户取餐
        await cloud.openapi.subscribeMessage.send({
          touser: order.userId,
          templateId: 'your-template-id', // 替换为实际模板ID
          page: `/pages/order/detail?id=${orderId}`,
          data: {
            // 根据模板字段填写
            thing1: { value: order.pickupCode },
            time2: { value: formatDate(order.pickupTime) }
          }
        });
      } catch (msgErr) {
        console.log('发送订阅消息失败，可能用户未订阅', msgErr);
      }
    }

    return { success: true };
  } catch (err) {
    console.error('更新订单状态失败', err);
    return { success: false, message: '更新失败，请重试' };
  }
};

function formatDate(date) {
  const d = new Date(date);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${month}-${day} ${hours}:${minutes}`;
}
