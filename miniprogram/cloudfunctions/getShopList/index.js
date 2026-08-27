// 云函数：getShopList
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

exports.main = async (event, context) => {
  const { latitude, longitude } = event;

  try {
    // 查询所有营业中的商家
    let query = db.collection('shops')
      .where({ status: 'open' })
      .orderBy('rating', 'desc');

    const shopRes = await query.get();
    let shops = shopRes.data;

    // 如果提供了经纬度，计算距离并排序
    if (latitude && longitude) {
      shops = shops.map(shop => {
        const distance = calculateDistance(
          latitude, longitude,
          shop.location.latitude, shop.location.longitude
        );
        return {
          ...shop,
          distance: formatDistance(distance)
        };
      });

      // 按距离排序
      shops.sort((a, b) => a.distanceValue - b.distanceValue);
    }

    return { shops };
  } catch (err) {
    console.error('获取商家列表失败', err);
    return { shops: [] };
  }
};

// 计算两点之间的距离（单位：米）
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // 地球半径（米）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 格式化距离
function formatDistance(distance) {
  if (distance < 1000) {
    return { text: `${Math.round(distance)}m`, value: distance };
  } else {
    return { text: `${(distance / 1000).toFixed(1)}km`, value: distance };
  }
}
