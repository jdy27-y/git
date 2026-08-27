/**
 * 云函数本地测试脚本（独立运行，无需 npm install）
 * 用法：node test.js
 */

// 模拟 wx-server-sdk
const mockDB = {
  users: [
    {
      _id: 'user001',
      openid: 'test_openid_123',
      nickName: '测试用户',
      avatarUrl: 'https://example.com/avatar.jpg',
      phone: '13800138000',
      createdAt: new Date('2026-08-01'),
      isMember: false
    }
  ],
  shops: [
    {
      _id: 'shop001', name: '张记包子铺', address: '北京市朝阳区XXX路100号',
      location: { latitude: 39.9042, longitude: 116.4074 },
      phone: '010-12345678', businessHours: { start: '06:30', end: '10:00' },
      status: 'open', rating: 4.8, notice: '新店开业，全场8折！', createdAt: new Date('2026-08-01')
    },
    {
      _id: 'shop002', name: '李氏粥铺', address: '北京市海淀区XXX路200号',
      location: { latitude: 39.9842, longitude: 116.3074 },
      phone: '010-87654321', businessHours: { start: '07:00', end: '09:30' },
      status: 'open', rating: 4.5, notice: '', createdAt: new Date('2026-08-05')
    },
    {
      _id: 'shop003', name: '王姐豆浆', address: '北京市西城区XXX路300号',
      location: { latitude: 39.9242, longitude: 116.3574 },
      phone: '010-11223344', businessHours: { start: '06:00', end: '08:30' },
      status: 'closed', rating: 4.2, notice: '装修中，暂停营业', createdAt: new Date('2026-08-10')
    }
  ],
  products: [
    { _id: 'prod001', shopId: 'shop001', name: '鲜肉包', price: 3.00, category: '包子', stock: 100, soldToday: 25, isAvailable: true },
    { _id: 'prod002', shopId: 'shop001', name: '菜包', price: 2.50, category: '包子', stock: 100, soldToday: 18, isAvailable: true },
    { _id: 'prod003', shopId: 'shop001', name: '豆沙包', price: 2.50, category: '包子', stock: 80, soldToday: 12, isAvailable: true },
    { _id: 'prod004', shopId: 'shop001', name: '皮蛋瘦肉粥', price: 8.00, category: '粥', stock: 50, soldToday: 30, isAvailable: true },
    { _id: 'prod005', shopId: 'shop001', name: '小米粥', price: 5.00, category: '粥', stock: 60, soldToday: 20, isAvailable: true },
    { _id: 'prod006', shopId: 'shop001', name: '豆浆', price: 3.00, category: '饮品', stock: 200, soldToday: 45, isAvailable: true },
    { _id: 'prod007', shopId: 'shop001', name: '油条', price: 2.00, category: '面点', stock: 150, soldToday: 50, isAvailable: true },
    { _id: 'prod101', shopId: 'shop002', name: '皮蛋瘦肉粥', price: 7.00, category: '粥', stock: 80, soldToday: 35, isAvailable: true },
    { _id: 'prod102', shopId: 'shop002', name: '红豆粥', price: 6.00, category: '粥', stock: 60, soldToday: 22, isAvailable: true },
    { _id: 'prod103', shopId: 'shop002', name: '八宝粥', price: 7.00, category: '粥', stock: 50, soldToday: 18, isAvailable: true },
    { _id: 'prod104', shopId: 'shop002', name: '油条', price: 1.50, category: '面点', stock: 100, soldToday: 40, isAvailable: true },
    { _id: 'prod201', shopId: 'shop003', name: '原味豆浆', price: 2.50, category: '饮品', stock: 0, soldToday: 0, isAvailable: false }
  ],
  orders: []
};

// 模拟数据库
class MockDoc {
  constructor(data) { this._data = data; }
  get() { return Promise.resolve({ data: { ...this._data } }); }
  update({ data }) {
    for (const key in data) {
      if (data[key] && data[key].$inc !== undefined) {
        this._data[key] = (this._data[key] || 0) + data[key].$inc;
      } else if (data[key] && typeof data[key] === 'object' && !(data[key] instanceof Date)) {
        this._data[key] = { ...this._data[key], ...data[key] };
      } else {
        this._data[key] = data[key];
      }
    }
    return Promise.resolve({ stats: { updated: 1 } });
  }
}

class MockCollection {
  constructor(name) {
    this.name = name;
    this._data = mockDB[name];
    this._conditions = [];
  }
  where(cond) {
    this._conditions.push(cond);
    return this;
  }
  doc(id) {
    const item = this._data.find(d => d._id === id);
    if (!item) throw new Error(`Document ${id} not found in ${this.name}`);
    return new MockDoc(item);
  }
  get() {
    let result = [...this._data];
    for (const cond of this._conditions) {
      for (const key of Object.keys(cond)) {
        result = result.filter(item => item[key] === cond[key]);
      }
    }
    return Promise.resolve({ data: result });
  }
  count() {
    return this.get().then(res => ({ total: res.data.length }));
  }
  add({ data }) {
    const newId = `order_${mockDB.orders.length + 100}`;
    data._id = newId;
    this._data.push(data);
    return Promise.resolve({ _id: newId });
  }
  orderBy() { return this; }
}

const mockCloud = {
  init() {},
  getWXContext: () => ({ OPENID: 'test_openid_123' }),
  database: () => ({
    command: {
      gte: v => ({ __op: 'gte', value: v }),
      lt: v => ({ __op: 'lt', value: v }),
      inc: v => ({ $inc: v }),
      and: (...args) => ({ $and: args })
    },
    collection: name => new MockCollection(name)
  }),
  openapi: { subscribeMessage: { send: () => Promise.resolve({ errCode: 0 }) } }
};

// 注入 mock
require.cache[require.resolve('wx-server-sdk')] = { id: 'wx-server-sdk', filename: 'wx-server-sdk', loaded: true, exports: mockCloud };

// 颜色
const G = t => `\x1b[32m${t}\x1b[0m`;
const R = t => `\x1b[31m${t}\x1b[0m`;
const Y = t => `\x1b[33m${t}\x1b[0m`;
const C = t => `\x1b[36m${t}\x1b[0m`;

let passed = 0, failed = 0;

function assert(cond, msg) {
  if (cond) { console.log(`  ${G('✓')} ${msg}`); passed++; }
  else { console.log(`  ${R('✗')} ${msg}`); failed++; }
}

async function testCreateOrder() {
  console.log(C('\n═══════ 测试 createOrder ═══════'));
  delete require.cache[require.resolve('../createOrder/index')];
  const createOrder = require('../createOrder/index');

  // 测试1：正常创建
  console.log(Y('\n测试1：正常创建订单'));
  const r1 = await createOrder.main({
    shopId: 'shop001',
    items: [
      { productId: 'prod001', name: '鲜肉包', price: 3.00, quantity: 2 },
      { productId: 'prod004', name: '皮蛋瘦肉粥', price: 8.00, quantity: 1 }
    ],
    pickupTime: new Date(Date.now() + 36000000),
    contactLast4: '8888'
  }, {});
  assert(r1.success === true, '订单创建成功');
  assert(r1.pickupCode && r1.pickupCode.length === 4, `取餐码: ${r1.pickupCode}`);
  assert(mockDB.orders.length > 0, '订单写入数据库');
  const order = mockDB.orders[mockDB.orders.length - 1];
  assert(order.totalPrice === 14.00, `总价: ${order.totalPrice} === 14.00`);
  assert(order.status === 'pending', `状态: ${order.status}`);

  // 测试2：商家未营业
  console.log(Y('\n测试2：商家未营业'));
  const r2 = await createOrder.main({
    shopId: 'shop003',
    items: [{ productId: 'prod201', name: '原味豆浆', price: 2.50, quantity: 1 }],
    pickupTime: new Date(), contactLast4: '1234'
  }, {});
  assert(r2.success === false, '商家未营业 → 失败');

  // 测试3：库存不足
  console.log(Y('\n测试3：库存不足'));
  const r3 = await createOrder.main({
    shopId: 'shop001',
    items: [{ productId: 'prod004', name: '皮蛋瘦肉粥', price: 8.00, quantity: 100 }],
    pickupTime: new Date(), contactLast4: '5678'
  }, {});
  assert(r3.success === false, '库存不足 → 失败');
}

async function testCancelOrder() {
  console.log(C('\n═══════ 测试 cancelOrder ═══════'));
  delete require.cache[require.resolve('../cancelOrder/index')];
  delete require.cache[require.resolve('../createOrder/index')];
  const cancelOrder = require('../cancelOrder/index');
  const createOrder = require('../createOrder/index');

  // 先创建一个订单
  const cr = await createOrder.main({
    shopId: 'shop001',
    items: [{ productId: 'prod001', name: '鲜肉包', price: 3.00, quantity: 1 }],
    pickupTime: new Date(Date.now() + 72000000),
    contactLast4: '9999'
  }, {});

  console.log(Y('\n测试1：正常取消订单'));
  const r1 = await cancelOrder.main({ orderId: cr.orderId }, {});
  assert(r1.success === true, '订单取消成功');
  const cancelled = mockDB.orders.find(o => o._id === cr.orderId);
  assert(cancelled.status === 'cancelled', `状态: ${cancelled.status}`);

  // 创建并标记为已完成的订单
  const cr2 = await createOrder.main({
    shopId: 'shop001',
    items: [{ productId: 'prod001', name: '鲜肉包', price: 3.00, quantity: 1 }],
    pickupTime: new Date(Date.now() + 72000000),
    contactLast4: '7777'
  }, {});
  const order2 = mockDB.orders.find(o => o._id === cr2.orderId);
  order2.status = 'completed';

  console.log(Y('\n测试2：取消已完成的订单'));
  const r2 = await cancelOrder.main({ orderId: cr2.orderId }, {});
  assert(r2.success === false, '已完成订单不可取消');
}

async function testGetShopList() {
  console.log(C('\n═══════ 测试 getShopList ═══════'));
  delete require.cache[require.resolve('../getShopList/index')];
  const getShopList = require('../getShopList/index');

  console.log(Y('\n测试1：获取营业中商家'));
  const r1 = await getShopList.main({}, {});
  assert(r1.shops.length === 2, `返回 ${r1.shops.length} 个商家`);
  assert(r1.shops.every(s => s.status === 'open'), '状态均为 open');

  console.log(Y('\n测试2：带距离信息'));
  const r2 = await getShopList.main({ latitude: 39.9042, longitude: 116.4074 }, {});
  const s1 = r2.shops.find(s => s._id === 'shop001');
  assert(s1 && s1.distance, `shop001 距离: ${s1.distance.text}`);
}

async function testGetShopProducts() {
  console.log(C('\n═══════ 测试 getShopProducts ═══════'));
  delete require.cache[require.resolve('../getShopProducts/index')];
  const getShopProducts = require('../getShopProducts/index');

  console.log(Y('\n测试1：获取张记包子铺商品'));
  const r1 = await getShopProducts.main({ shopId: 'shop001' }, {});
  assert(r1.products.length === 7, `返回 ${r1.products.length} 个商品`);
  assert(r1.products.every(p => p.isAvailable), '全部已上架');

  const cats = [...new Set(r1.products.map(p => p.category))];
  assert(cats.includes('包子'), '包含 包子 分类');
  assert(cats.includes('粥'), '包含 粥 分类');

  console.log(Y('\n测试2：已停业商家无商品'));
  const r2 = await getShopProducts.main({ shopId: 'shop003' }, {});
  assert(r2.products.length === 0, '返回 0 个商品');
}

// 运行
(async () => {
  console.log(C('╔═══════════════════════════════════════════╗'));
  console.log(C('║   微信云函数本地测试（无需 npm install）    ║'));
  console.log(C('╚═══════════════════════════════════════════╝'));

  try {
    await testCreateOrder();
    await testCancelOrder();
    await testGetShopList();
    await testGetShopProducts();

    console.log(C('\n╔═══════════════════════════════════════════╗'));
    console.log(`║  结果: ${G(`${passed} 通过`)} / ${failed > 0 ? R(`${failed} 失败`) : G('0 失败')}`);
    console.log(C('╚═══════════════════════════════════════════╝'));
    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error(R('\n错误:'), err);
    process.exit(1);
  }
})();
