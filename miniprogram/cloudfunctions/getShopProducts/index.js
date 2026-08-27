// 云函数：getShopProducts
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

exports.main = async (event, context) => {
  const { shopId } = event;

  try {
    // 查询该商家所有上架的商品，按分类排序
    const productRes = await db.collection('products')
      .where({
        shopId,
        isAvailable: true
      })
      .orderBy('category', 'asc')
      .orderBy('name', 'asc')
      .get();

    return { products: productRes.data };
  } catch (err) {
    console.error('获取商品列表失败', err);
    return { products: [] };
  }
};
