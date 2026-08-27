// 云函数：createOrder
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { shopId, items, pickupTime, contactLast4 } = event;
  const wxContext = cloud.getWXContext();
  const openid = wxContext.OPENID;

  try {
    // 1. 校验商家是否存在且营业
    const shopRes = await db.collection('shops').doc(shopId).get();
    const shop = shopRes.data;

    if (shop.status !== 'open') {
      return { success: false, message: '商家未营业' };
    }

    // 2. 校验商品是否存在且有库存
    for (const item of items) {
      const productRes = await db.collection('products').doc(item.productId).get();
      const product = productRes.data;

      if (!product || !product.isAvailable) {
        return { success: false, message: `商品 ${item.name} 已下架` };
      }

      if (product.stock > 0 && product.soldToday + item.quantity > product.stock) {
        return { success: false, message: `商品 ${item.name} 库存不足` };
      }
    }

    // 3. 生成取餐码（4位随机数字，同商家同一天不重复）
    let pickupCode;
    let isUnique = false;

    while (!isUnique) {
      pickupCode = Math.floor(1000 + Math.random() * 9000).toString();

      // 检查同商家同一天是否有重复
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const existingOrder = await db.collection('orders')
        .where({
          shopId,
          pickupCode,
          createdAt: db.command.gte(today).and(db.command.lt(tomorrow))
        })
        .count();

      if (existingOrder.total === 0) {
        isUnique = true;
      }
    }

    // 4. 计算总价
    let totalPrice = 0;
    for (const item of items) {
      totalPrice += item.price * item.quantity;
    }

    // 5. 写入订单
    const orderData = {
      userId: openid,
      shopId,
      items,
      totalPrice,
      pickupTime: new Date(pickupTime),
      pickupCode,
      contactLast4,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const orderRes = await db.collection('orders').add({ data: orderData });

    // 6. 更新商品销量
    for (const item of items) {
      await db.collection('products').doc(item.productId).update({
        data: {
          soldToday: db.command.inc(item.quantity)
        }
      });
    }

    return {
      success: true,
      orderId: orderRes._id,
      pickupCode
    };
  } catch (err) {
    console.error('创建订单失败', err);
    return { success: false, message: '创建订单失败，请重试' };
  }
};
