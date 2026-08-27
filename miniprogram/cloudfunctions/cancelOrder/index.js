// 云函数：cancelOrder
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { orderId } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 1. 查询订单
    const orderRes = await db.collection('orders').doc(orderId).get();
    const order = orderRes.data;

    // 2. 校验是否是自己的订单
    if (order.userId !== openid) {
      return { success: false, message: '无权操作此订单' };
    }

    // 3. 校验订单状态
    if (!['pending', 'preparing'].includes(order.status)) {
      return { success: false, message: '当前订单状态不可取消' };
    }

    // 4. 校验时间（取餐时间前1小时）
    const pickupTime = new Date(order.pickupTime);
    const oneHourBefore = new Date(pickupTime.getTime() - 60 * 60 * 1000);
    const now = new Date();

    if (now >= oneHourBefore) {
      return { success: false, message: '已超过取消时限（取餐时间前1小时）' };
    }

    // 5. 更新订单状态
    await db.collection('orders').doc(orderId).update({
      data: {
        status: 'cancelled',
        updatedAt: new Date()
      }
    });

    // 6. 恢复商品库存
    for (const item of order.items) {
      await db.collection('products').doc(item.productId).update({
        data: {
          soldToday: db.command.inc(-item.quantity)
        }
      });
    }

    return { success: true };
  } catch (err) {
    console.error('取消订单失败', err);
    return { success: false, message: '取消订单失败，请重试' };
  }
};
