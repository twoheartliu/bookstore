<div align="center">
  <h1>二心的旧书架</h1>
  <h3>Twoheart's Moving Sale</h3>

  [English](README.md) | [简体中文](README.zh.md)
</div>

一套极简风格的慈善旧书义卖站点，为 [nofan.xyz](https://nofan.xyz) 联邦宇宙实例募集服务器运维资金。全部收益直接用于服务器托管与带宽支出。

---

## 技术栈

React 19 · TypeScript · Express · Vite · Tailwind CSS v4 · Motion

## 功能

- 按分类浏览书籍（计算机科学、文学、人文社科、金融经济、哲学/逻辑）
- 购物车支持 5 分钟锁定机制，防止多人同时认领同一本书
- 联邦宇宙结账：填写收件信息后，自动生成私信链接，跳转至你所在实例向 @twoheart 发送订单确认
- 中英双语切换
- 实时筹款进度条
- 书籍封面图片代理容错加载
- Mastodon 实例域名自动补全

## 前置要求

Node.js

## 本地运行

```bash
npm install
cp .env.example .env.local   # 编辑 .env.local，填入你的 GEMINI_API_KEY
npm run dev
```

服务器默认运行在 `http://localhost:3000`。

## 生产构建

```bash
npm run build
npm run preview
```

## 数据源

书籍数据通过 [api.nofan.xyz](https://api.nofan.xyz/api/books) 提供，后端从 GitHub Gist 拉取并缓存。

## 许可证

Apache-2.0 · [@twoheart@nofan.xyz](https://nofan.xyz/@twoheart)
