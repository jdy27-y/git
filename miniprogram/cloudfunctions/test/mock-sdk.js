/**
 * 模拟 wx-server-sdk，用于本地测试云函数
 * 在真实环境中，wx-server-sdk 由微信云开发环境提供
 */

// 模拟数据库
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
      _id: 'shop001',
      name: '张记包子铺',
      address: '北京市朝阳区XXX路100号',
      location: { latitude: 39.9042, longitude: 116.4074 },
      phone: '010-12345678',
      businessHours: { start: '06:30', end: '10:00' },
      status: 'open',
      rating: 4.8,
      notice: '新店开业，全场8折！',
      createdAt: new Date('2026-08-01')
    },
    {
      _id: 'shop002',
      name: '李氏粥铺',
      address: '北京市海淀区XXX路200号',
      location: { latitude: 39.9842, longitude: 116.3074 },
      phone: '010-87654321',
      businessHours: { start: '07:00', end: '09:30' },
      status: 'open',
      rating: 4.5,
      notice: '',
      createdAt: new Date('2026-08-05')
    },
    {
      _id: 'shop003',
      name: '王姐豆浆',
      address: '北京市西城区XXX路300号',
      location: { latitude: 39.9242, longitude: 116.3574 },
      phone: '010-11223344',
      businessHours: { start: '06:00', end: '08:30' },
      status: 'closed',
      rating: 4.2,
      notice: '装修中，暂停营业',
      createdAt: new Date('2026-08-10')
    }
  ],
  products: [
    { _id: 'prod001', shopId: 'shop001', name: '鲜肉包', price: 3.00, imageUrl: '', category: '包子', stock: 100, soldToday: 25, isAvailable: true, createdAt: new Date() },
    { _id: 'prod002', shopId: 'shop001', name: '菜包', price: 2.50, imageUrl: '', category: '包子', stock: 100, soldToday: 18, isAvailable: true, createdAt: new Date() },
    { _id: 'prod003', shopId: 'shop001', name: '豆沙包', price: 2.50, imageUrl: '', category: '包子', stock: 80, soldToday: 12, isAvailable: true, createdAt: new Date() },
    { _id: 'prod004', shopId: 'shop001', name: '皮蛋瘦肉粥', price: 8.00, imageUrl: '', category: '粥', stock: 50, soldToday: 30, isAvailable: true, createdAt: new Date() },
    { _id: 'prod005', shopId: 'shop001', name: '小米粥', price: 5.00, imageUrl: '', category: '粥', stock: 60, soldToday: 20, isAvailable: true, createdAt: new Date() },
    { _id: 'prod006', shopId: 'shop001', name: '豆浆', price: 3.00, imageUrl: '', category: '饮品', stock: 200, soldToday: 45, isAvailable: true, createdAt: new Date() },
    { _id: 'prod007', shopId: 'shop001', name: '油条', price: 2.00, imageUrl: '', category: '面点', stock: 150, soldToday: 50, isAvailable: true, createdAt: new Date() },

    { _id: 'prod101', shopId: 'shop002', name: '皮蛋瘦肉粥', price: 7.00, imageUrl: '', category: '粥', stock: 80, soldToday: 35, isAvailable: true, createdAt: new Date() },
    { _id: 'prod102', shopId: 'shop002', name: '红豆粥', price: 6.00, imageUrl: '', category: '粥', stock: 60, soldToday: 22, isAvailable: true, createdAt: new Date() },
    { _id: 'prod103', shopId: 'shop002', name: '八宝粥', price: 7.00, imageUrl: '', category: '粥', stock: 50, soldToday: 18, isAvailable: true, createdAt: new Date() },
    { _id: 'prod104', shopId: 'shop002', name: '油条', price: 1.50, imageUrl: '', category: '面点', stock: 100, soldToday: 40, isAvailable: true, createdAt: new Date() },

    { _id: 'prod201', shopId: 'shop003', name: '原味豆浆', price: 2.50, imageUrl: '', category: '饮品', stock: 0, soldToday: 0, isAvailable: false, createdAt: new Date() }
  ],
  orders: []
};

// 模拟数据库操作
class MockDoc {
  constructor(data) {
    this._data = data;
  }
  get() {
    return Promise.resolve({ data: this._data });
  }
  update({ data }) {
    for (const key in data) {
      if (key === 'soldToday' && data[key].$inc) {
        this._data.soldToday += data[key].$inc;
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
    this._data = [...(mockDB[name] || [])];
  }
  where(query) {
    this._query = query;
    return this;
  }
  doc(id) {
    const item = this._data.find(d => d._id === id);
    if (!item) {
      throw new Error(`Document ${id} not found in ${this.name}`);
    }
    return new MockDoc(item);
  }
  get() {
    let result = [...this._data];
    if (this._query) {
      result = result.filter(item => {
        return Object.keys(this._query).every(key => {
          const val = this._query[key];
          if (val && val.$gte) return item[key] >= val.$gte;
          if (val && val.$lt) return item[key] < val.$lt;
          if (val && val.$and) return true; // 简化
          return item[key] === val;
        });
      });
    }
    return Promise.resolve({ data: result });
  }
  count() {
    return this.get().then(res => ({ total: res.data.length }));
  }
  add({ data }) {
    const newId = `${this.name}_${mockDB[this.name].length + 1}`;
    data._id = newId;
    mockDB[this.name].push(data);
    return Promise.resolve({ _id: newId });
  }
  orderBy(field, order) {
    this._orderBy = { field, order };
    return this;
  }
}

// 模拟 wx-server-sdk
const cloud = {
  init: () => {},
  getWXContext: () => ({
    OPENID: 'test_openid_123'
  }),
  database: () => ({
    command: {
      gte: (val) => ({ $gte: val }),
      lt: (val) => ({ $lt: val }),
      inc: (val) => ({ $inc: val }),
      and: (...args) => ({ $and: args })
    },
    collection: (name) => new MockCollection(name)
  }),
  openapi: {
    subscribeMessage: {
      send: () => Promise.resolve({ errCode: 0 })
    }
  }
};

module.exports = cloud;
module.exports.mockDB = mockDB;
