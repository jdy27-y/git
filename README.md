# 早餐预约微信小程序

基于微信小程序 + 云开发的早餐预订平台，支持用户在线下单、商家接单管理。

## 功能特性

### 用户端
- 首页展示附近商家列表（按距离排序）
- 商家详情页：菜单浏览、分类筛选、加购下单
- 确认订单：选择取餐时段、填写联系方式
- 订单管理：查看订单状态、取餐码、取消订单
- 个人中心：用户信息、订单入口

### 商家端
- 订单管理：接单/拒绝、标记备餐、确认取餐
- 商品管理：上架/下架、添加新菜品（支持图片上传）
- 店铺设置：营业状态切换、今日数据统计

## 项目结构

```
├── miniprogram/          # 微信小程序原生代码
│   ├── pages/            # 前端页面
│   ├── cloudfunctions/   # 云函数
│   └── project.config.json
├── uniapp/               # uni-app 跨平台版
│   ├── src/pages/        # 页面代码
│   ├── src/mock/         # 模拟数据
│   └── simulator.html    # 浏览器模拟器
└── README.md
```

## 快速开始

### 方式一：浏览器模拟器（推荐体验）

直接打开 `uniapp/simulator.html` 即可在浏览器中体验完整功能。

### 方式二：微信开发者工具

1. 下载安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 导入 `miniprogram` 文件夹
3. 在云开发控制台创建集合：`users`、`shops`、`products`、`orders`
4. 右键云函数文件夹 → 上传并部署

## 测试商家 ID

| ID | 店铺名称 |
|----|----------|
| s1 | 张记包子铺 |
| s2 | 李氏粥铺 |
| s4 | 晨曦早点 |

## 技术栈

- 前端：原生微信小程序 / uni-app (Vue3)
- 后端：微信云开发（云函数 + 云数据库）
- 模拟器：纯 HTML/CSS/JS（无依赖）

---

> 🤖 Generated with Codebuff
