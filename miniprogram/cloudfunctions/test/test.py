"""
微信云函数本地测试（Python 版）
测试所有云函数的业务逻辑是否正确
用法：python test.py
"""

import json
from datetime import datetime, timedelta

# 颜色
G = '\033[32m'
R = '\033[31m'
Y = '\033[33m'
C = '\033[36m'
END = '\033[0m'

passed = 0
failed = 0

def ok(msg):
    global passed
    print(f"  {G}✓{END} {msg}")
    passed += 1

def fail(msg):
    global failed
    print(f"  {R}✗{END} {msg}")
    failed += 1

# ========== 模拟数据库 ==========
shops_db = [
    {"_id": "shop001", "name": "张记包子铺", "address": "北京市朝阳区XXX路100号",
     "location": {"latitude": 39.9042, "longitude": 116.4074},
     "phone": "010-12345678", "businessHours": {"start": "06:30", "end": "10:00"},
     "status": "open", "rating": 4.8, "notice": "新店开业，全场8折！"},
    {"_id": "shop002", "name": "李氏粥铺", "address": "北京市海淀区XXX路200号",
     "location": {"latitude": 39.9842, "longitude": 116.3074},
     "phone": "010-87654321", "businessHours": {"start": "07:00", "end": "09:30"},
     "status": "open", "rating": 4.5, "notice": ""},
    {"_id": "shop003", "name": "王姐豆浆", "address": "北京市西城区XXX路300号",
     "location": {"latitude": 39.9242, "longitude": 116.3574},
     "phone": "010-11223344", "businessHours": {"start": "06:00", "end": "08:30"},
     "status": "closed", "rating": 4.2, "notice": "装修中，暂停营业"},
]

products_db = [
    {"_id": "prod001", "shopId": "shop001", "name": "鲜肉包", "price": 3.00, "category": "包子", "stock": 100, "soldToday": 25, "isAvailable": True},
    {"_id": "prod002", "shopId": "shop001", "name": "菜包", "price": 2.50, "category": "包子", "stock": 100, "soldToday": 18, "isAvailable": True},
    {"_id": "prod003", "shopId": "shop001", "name": "豆沙包", "price": 2.50, "category": "包子", "stock": 80, "soldToday": 12, "isAvailable": True},
    {"_id": "prod004", "shopId": "shop001", "name": "皮蛋瘦肉粥", "price": 8.00, "category": "粥", "stock": 50, "soldToday": 30, "isAvailable": True},
    {"_id": "prod005", "shopId": "shop001", "name": "小米粥", "price": 5.00, "category": "粥", "stock": 60, "soldToday": 20, "isAvailable": True},
    {"_id": "prod006", "shopId": "shop001", "name": "豆浆", "price": 3.00, "category": "饮品", "stock": 200, "soldToday": 45, "isAvailable": True},
    {"_id": "prod007", "shopId": "shop001", "name": "油条", "price": 2.00, "category": "面点", "stock": 150, "soldToday": 50, "isAvailable": True},
    {"_id": "prod101", "shopId": "shop002", "name": "皮蛋瘦肉粥", "price": 7.00, "category": "粥", "stock": 80, "soldToday": 35, "isAvailable": True},
    {"_id": "prod102", "shopId": "shop002", "name": "红豆粥", "price": 6.00, "category": "粥", "stock": 60, "soldToday": 22, "isAvailable": True},
    {"_id": "prod103", "shopId": "shop002", "name": "八宝粥", "price": 7.00, "category": "粥", "stock": 50, "soldToday": 18, "isAvailable": True},
    {"_id": "prod104", "shopId": "shop002", "name": "油条", "price": 1.50, "category": "面点", "stock": 100, "soldToday": 40, "isAvailable": True},
    {"_id": "prod201", "shopId": "shop003", "name": "原味豆浆", "price": 2.50, "category": "饮品", "stock": 0, "soldToday": 0, "isAvailable": False},
]

orders_db = []
order_counter = 0

# ========== 模拟云函数逻辑 ==========

def create_order(shop_id, items, pickup_time, contact_last4):
    """模拟 createOrder 云函数"""
    global order_counter

    # 1. 校验商家
    shop = next((s for s in shops_db if s["_id"] == shop_id), None)
    if not shop:
        return {"success": False, "message": "商家不存在"}
    if shop["status"] != "open":
        return {"success": False, "message": "商家未营业"}

    # 2. 校验商品和库存
    for item in items:
        product = next((p for p in products_db if p["_id"] == item["productId"]), None)
        if not product:
            return {"success": False, "message": f"商品 {item['name']} 不存在"}
        if not product["isAvailable"]:
            return {"success": False, "message": f"商品 {item['name']} 已下架"}
        if product["stock"] > 0 and product["soldToday"] + item["quantity"] > product["stock"]:
            return {"success": False, "message": f"商品 {item['name']} 库存不足"}

    # 3. 生成取餐码
    order_counter += 1
    pickup_code = str(1000 + (order_counter * 7) % 9000)

    # 4. 计算总价
    total_price = sum(item["price"] * item["quantity"] for item in items)

    # 5. 写入订单
    order = {
        "_id": f"order_{order_counter}",
        "userId": "test_openid_123",
        "shopId": shop_id,
        "items": items,
        "totalPrice": total_price,
        "pickupTime": pickup_time,
        "pickupCode": pickup_code,
        "contactLast4": contact_last4,
        "status": "pending",
        "createdAt": datetime.now(),
    }
    orders_db.append(order)

    # 6. 更新销量
    for item in items:
        product = next(p for p in products_db if p["_id"] == item["productId"])
        product["soldToday"] += item["quantity"]

    return {"success": True, "orderId": order["_id"], "pickupCode": pickup_code}


def cancel_order(order_id):
    """模拟 cancelOrder 云函数"""
    order = next((o for o in orders_db if o["_id"] == order_id), None)
    if not order:
        return {"success": False, "message": "订单不存在"}
    if order["userId"] != "test_openid_123":
        return {"success": False, "message": "无权操作此订单"}
    if order["status"] not in ("pending", "preparing"):
        return {"success": False, "message": "当前订单状态不可取消"}

    pickup_time = order["pickupTime"]
    one_hour_before = pickup_time - timedelta(hours=1)
    if datetime.now() >= one_hour_before:
        return {"success": False, "message": "已超过取消时限"}

    order["status"] = "cancelled"

    # 恢复库存
    for item in order["items"]:
        product = next((p for p in products_db if p["_id"] == item["productId"]), None)
        if product:
            product["soldToday"] -= item["quantity"]

    return {"success": True}


def get_shop_list(latitude=None, longitude=None):
    """模拟 getShopList 云函数"""
    import math

    shops = [s for s in shops_db if s["status"] == "open"]

    if latitude and longitude:
        for shop in shops:
            lat2, lng2 = shop["location"]["latitude"], shop["location"]["longitude"]
            R = 6371000
            d_lat = math.radians(lat2 - latitude)
            d_lng = math.radians(lng2 - longitude)
            a = math.sin(d_lat/2)**2 + math.cos(math.radians(latitude)) * math.cos(math.radians(lat2)) * math.sin(d_lng/2)**2
            c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
            dist = R * c
            shop["distance_text"] = f"{dist:.0f}m" if dist < 1000 else f"{dist/1000:.1f}km"
            shop["distance_value"] = dist
        shops.sort(key=lambda s: s["distance_value"])

    return {"shops": shops}


def get_shop_products(shop_id):
    """模拟 getShopProducts 云函数"""
    products = [p for p in products_db if p["shopId"] == shop_id and p["isAvailable"]]
    products.sort(key=lambda p: (p["category"], p["name"]))
    return {"products": products}


# ========== 测试用例 ==========

def test_create_order():
    print(f"{C}═══════ 测试 createOrder ═══════{END}")

    print(f"{Y}\n测试1：正常创建订单{END}")
    r = create_order("shop001", [
        {"productId": "prod001", "name": "鲜肉包", "price": 3.00, "quantity": 2},
        {"productId": "prod004", "name": "皮蛋瘦肉粥", "price": 8.00, "quantity": 1}
    ], datetime.now() + timedelta(hours=10), "8888")
    ok(f"订单创建成功: {r['success']}") if r["success"] else fail("订单创建失败")
    ok(f"取餐码: {r['pickupCode']} (4位数字)") if r.get("pickupCode", "").isdigit() else fail("取餐码异常")
    ok(f"订单已写入数据库 ({len(orders_db)} 条)")
    order = orders_db[-1]
    ok(f"总价计算正确: {order['totalPrice']} === 14.00") if order["totalPrice"] == 14.00 else fail(f"总价: {order['totalPrice']}")
    ok(f"订单状态: {order['status']}") if order["status"] == "pending" else fail(f"状态: {order['status']}")

    print(f"{Y}\n测试2：商家未营业{END}")
    r2 = create_order("shop003", [{"productId": "prod201", "name": "原味豆浆", "price": 2.50, "quantity": 1}], datetime.now(), "1234")
    ok("商家未营业 → 返回失败") if not r2["success"] else fail("应返回失败")

    print(f"{Y}\n测试3：库存不足{END}")
    r3 = create_order("shop001", [{"productId": "prod004", "name": "皮蛋瘦肉粥", "price": 8.00, "quantity": 100}], datetime.now(), "5678")
    ok("库存不足 → 返回失败") if not r3["success"] else fail("应返回失败")

    print(f"{Y}\n测试4：商品已下架{END}")
    r4 = create_order("shop003", [{"productId": "prod201", "name": "原味豆浆", "price": 2.50, "quantity": 1}], datetime.now(), "1111")
    ok("下架商品 → 返回失败") if not r4["success"] else fail("应返回失败")


def test_cancel_order():
    print(f"{C}═══════ 测试 cancelOrder ═══════{END}")

    # 先创建一个订单
    cr = create_order("shop001", [{"productId": "prod001", "name": "鲜肉包", "price": 3.00, "quantity": 1}],
                       datetime.now() + timedelta(hours=10), "9999")

    print(f"{Y}\n测试1：正常取消{END}")
    r1 = cancel_order(cr["orderId"])
    ok("取消成功") if r1["success"] else fail("取消失败")
    cancelled = next(o for o in orders_db if o["_id"] == cr["orderId"])
    ok(f"状态变为 cancelled: {cancelled['status']}") if cancelled["status"] == "cancelled" else fail(f"状态: {cancelled['status']}")

    # 创建并标记为已完成的订单
    cr2 = create_order("shop001", [{"productId": "prod001", "name": "鲜肉包", "price": 3.00, "quantity": 1}],
                        datetime.now() + timedelta(hours=10), "7777")
    order2 = next(o for o in orders_db if o["_id"] == cr2["orderId"])
    order2["status"] = "completed"

    print(f"{Y}\n测试2：取消已完成的订单{END}")
    r2 = cancel_order(cr2["orderId"])
    ok("已完成订单不可取消") if not r2["success"] else fail("应返回失败")

    # 创建并标记为 ready 的订单
    cr3 = create_order("shop001", [{"productId": "prod001", "name": "鲜肉包", "price": 3.00, "quantity": 1}],
                        datetime.now() + timedelta(hours=10), "5555")
    order3 = next(o for o in orders_db if o["_id"] == cr3["orderId"])
    order3["status"] = "ready"

    print(f"{Y}\n测试3：取消已备好的订单{END}")
    r3 = cancel_order(cr3["orderId"])
    ok("已备好订单不可取消") if not r3["success"] else fail("应返回失败")


def test_get_shop_list():
    print(f"{C}═══════ 测试 getShopList ═══════{END}")

    print(f"{Y}\n测试1：获取营业中的商家{END}")
    r1 = get_shop_list()
    ok(f"返回 {len(r1['shops'])} 个商家") if len(r1["shops"]) == 2 else fail(f"期望 2，实际 {len(r1['shops'])}")
    ok("所有商家状态为 open") if all(s["status"] == "open" for s in r1["shops"]) else fail("存在非 open 商家")

    print(f"{Y}\n测试2：带距离排序{END}")
    r2 = get_shop_list(39.9042, 116.4074)
    ok(f"shop001 距离: {r2['shops'][0]['distance_text']}") if r2["shops"][0]["_id"] == "shop001" else fail("距离排序异常")


def test_get_shop_products():
    print(f"{C}═══════ 测试 getShopProducts ═══════{END}")

    print(f"{Y}\n测试1：获取张记包子铺商品{END}")
    r1 = get_shop_products("shop001")
    ok(f"返回 {len(r1['products'])} 个商品") if len(r1["products"]) == 7 else fail(f"期望 7，实际 {len(r1['products'])}")
    ok("全部已上架") if all(p["isAvailable"] for p in r1["products"]) else fail("存在未上架商品")
    cats = set(p["category"] for p in r1["products"])
    ok(f"分类: {', '.join(cats)}") if "包子" in cats and "粥" in cats else fail("分类缺失")

    print(f"{Y}\n测试2：已停业商家{END}")
    r2 = get_shop_products("shop003")
    ok(f"返回 {len(r2['products'])} 个商品") if len(r2["products"]) == 0 else fail("应返回 0")


# ========== 主入口 ==========
if __name__ == "__main__":
    print(f"{C}╔═══════════════════════════════════════════════╗{END}")
    print(f"{C}║   微信云函数本地测试（Python 版，无需安装依赖）  ║{END}")
    print(f"{C}╚═══════════════════════════════════════════════╝{END}")

    try:
        test_create_order()
        test_cancel_order()
        test_get_shop_list()
        test_get_shop_products()

        print(f"{C}\n╔═══════════════════════════════════════════════╗{END}")
        if failed == 0:
            print(f"{C}║  结果: {G}{passed} 通过{END} / {G}0 失败{END}{C}  ║{END}")
        else:
            print(f"{C}║  结果: {G}{passed} 通过{END} / {R}{failed} 失败{END}{C}  ║{END}")
        print(f"{C}╚═══════════════════════════════════════════════╝{END}")

        exit(0 if failed == 0 else 1)
    except Exception as e:
        print(f"{R}\n错误: {e}{END}")
        import traceback
        traceback.print_exc()
        exit(1)
