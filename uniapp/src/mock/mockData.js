/**
 * 模拟数据 - 本地测试用
 * 在真实环境中，这些数据来自云数据库
 */

export const shops = [
  {
    _id: 'shop001',
    name: '张记包子铺',
    address: '北京市朝阳区建国路88号',
    location: { latitude: 39.9042, longitude: 116.4074 },
    phone: '010-12345678',
    businessHours: { start: '06:30', end: '10:00' },
    status: 'open',
    rating: 4.8,
    notice: '新店开业，全场8折！'
  },
  {
    _id: 'shop002',
    name: '李氏粥铺',
    address: '北京市海淀区中关村大街100号',
    location: { latitude: 39.9842, longitude: 116.3074 },
    phone: '010-87654321',
    businessHours: { start: '07:00', end: '09:30' },
    status: 'open',
    rating: 4.5,
    notice: ''
  },
  {
    _id: 'shop003',
    name: '王姐豆浆',
    address: '北京市西城区西单北大街50号',
    location: { latitude: 39.9242, longitude: 116.3574 },
    phone: '010-11223344',
    businessHours: { start: '06:00', end: '08:30' },
    status: 'closed',
    rating: 4.2,
    notice: '装修中，暂停营业'
  },
  {
    _id: 'shop004',
    name: '晨曦早点',
    address: '北京市东城区王府井大街200号',
    location: { latitude: 39.9142, longitude: 116.4174 },
    phone: '010-55667788',
    businessHours: { start: '05:30', end: '10:30' },
    status: 'open',
    rating: 4.9,
    notice: '周一至周五早餐套餐立减5元'
  }
];

export const products = [
  // 张记包子铺
  { _id: 'prod001', shopId: 'shop001', name: '鲜肉包', price: 3.00, imageUrl: '', category: '包子', stock: 100, soldToday: 25, isAvailable: true },
  { _id: 'prod002', shopId: 'shop001', name: '菜包', price: 2.50, imageUrl: '', category: '包子', stock: 100, soldToday: 18, isAvailable: true },
  { _id: 'prod003', shopId: 'shop001', name: '豆沙包', price: 2.50, imageUrl: '', category: '包子', stock: 80, soldToday: 12, isAvailable: true },
  { _id: 'prod004', shopId: 'shop001', name: '皮蛋瘦肉粥', price: 8.00, imageUrl: '', category: '粥', stock: 50, soldToday: 30, isAvailable: true },
  { _id: 'prod005', shopId: 'shop001', name: '小米粥', price: 5.00, imageUrl: '', category: '粥', stock: 60, soldToday: 20, isAvailable: true },
  { _id: 'prod006', shopId: 'shop001', name: '豆浆', price: 3.00, imageUrl: '', category: '饮品', stock: 200, soldToday: 45, isAvailable: true },
  { _id: 'prod007', shopId: 'shop001', name: '油条', price: 2.00, imageUrl: '', category: '面点', stock: 150, soldToday: 50, isAvailable: true },

  // 李氏粥铺
  { _id: 'prod101', shopId: 'shop002', name: '皮蛋瘦肉粥', price: 7.00, imageUrl: '', category: '粥', stock: 80, soldToday: 35, isAvailable: true },
  { _id: 'prod102', shopId: 'shop002', name: '红豆粥', price: 6.00, imageUrl: '', category: '粥', stock: 60, soldToday: 22, isAvailable: true },
  { _id: 'prod103', shopId: 'shop002', name: '八宝粥', price: 7.00, imageUrl: '', category: '粥', stock: 50, soldToday: 18, isAvailable: true },
  { _id: 'prod104', shopId: 'shop002', name: '油条', price: 1.50, imageUrl: '', category: '面点', stock: 100, soldToday: 40, isAvailable: true },

  // 晨曦早点
  { _id: 'prod301', shopId: 'shop004', name: '牛肉包', price: 4.00, imageUrl: '', category: '包子', stock: 80, soldToday: 30, isAvailable: true },
  { _id: 'prod302', shopId: 'shop004', name: '三鲜包', price: 3.50, imageUrl: '', category: '包子', stock: 70, soldToday: 25, isAvailable: true },
  { _id: 'prod303', shopId: 'shop004', name: '紫米粥', price: 6.00, imageUrl: '', category: '粥', stock: 50, soldToday: 15, isAvailable: true },
  { _id: 'prod304', shopId: 'shop004', name: '牛奶', price: 5.00, imageUrl: '', category: '饮品', stock: 100, soldToday: 40, isAvailable: true },
  { _id: 'prod305', shopId: 'shop004', name: '鸡蛋灌饼', price: 6.00, imageUrl: '', category: '面点', stock: 60, soldToday: 35, isAvailable: true }
];

export const orders = [];

// 模拟API
export const mockAPI = {
  // 获取商家列表
  getShopList(lat, lng) {
    let result = shops.filter(s => s.status === 'open');
    if (lat && lng) {
      result = result.map(s => {
        const dist = this.calcDistance(lat, lng, s.location.latitude, s.location.longitude);
        return { ...s, distance: dist < 1000 ? `${Math.round(dist)}m` : `${(dist / 1000).toFixed(1)}km` };
      });
      result.sort((a, b) => a.distance.localeCompare(b.distance));
    }
    return result;
  },

  // 获取商家商品
  getShopProducts(shopId) {
    return products.filter(p => p.shopId === shopId && p.isAvailable);
  },

  // 获取商家信息
  getShop(shopId) {
    return shops.find(s => s._id === shopId);
  },

  // 创建订单
  createOrder(shopId, items, pickupTime, contactLast4) {
    const shop = this.getShop(shopId);
    if (!shop || shop.status !== 'open') {
      return { success: false, message: '商家未营业' };
    }

    // 计算总价
    let totalPrice = 0;
    for (const item of items) {
      const product = products.find(p => p._id === item.productId);
      if (!product || !product.isAvailable) {
        return { success: false, message: `商品 ${item.name} 不可用` };
      }
      if (product.stock > 0 && product.soldToday + item.quantity > product.stock) {
        return { success: false, message: `商品 ${item.name} 库存不足` };
      }
      totalPrice += item.price * item.quantity;
    }

    // 生成取餐码
    const pickupCode = String(1000 + Math.floor(Math.random() * 9000));

    // 创建订单
    const order = {
      _id: `order_${Date.now()}`,
      userId: 'test_user',
      shopId,
      items,
      totalPrice,
      pickupTime: new Date(pickupTime),
      pickupCode,
      contactLast4,
      status: 'pending',
      createdAt: new Date()
    };

    orders.push(order);

    // 更新销量
    for (const item of items) {
      const product = products.find(p => p._id === item.productId);
      if (product) product.soldToday += item.quantity;
    }

    return { success: true, orderId: order._id, pickupCode };
  },

  // 取消订单
  cancelOrder(orderId) {
    const order = orders.find(o => o._id === orderId);
    if (!order) return { success: false, message: '订单不存在' };
    if (!['pending', 'preparing'].includes(order.status)) {
      return { success: false, message: '当前状态不可取消' };
    }

    const pickupTime = new Date(order.pickupTime);
    const oneHourBefore = new Date(pickupTime.getTime() - 3600000);
    if (new Date() >= oneHourBefore) {
      return { success: false, message: '已超过取消时限' };
    }

    order.status = 'cancelled';

    // 恢复库存
    for (const item of order.items) {
      const product = products.find(p => p._id === item.productId);
      if (product) product.soldToday -= item.quantity;
    }

    return { success: true };
  },

  // 获取用户订单
  getUserOrders() {
    return orders.filter(o => o.userId === 'test_user').sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  // 获取订单详情
  getOrder(orderId) {
    return orders.find(o => o._id === orderId);
  },

  // 计算距离
  calcDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
};
