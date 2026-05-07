# 洛克王国异色精灵图鉴

![洛克王国](https://img.shields.io/badge/%E6%B4%9B%E5%85%8B%E7%8E%8B%E5%9B%BD-%E5%BC%82%E8%89%B2%E7%B2%BE%E7%81%B5-green)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

一个精美的洛克王国异色精灵展示网页，让你轻松浏览和了解各种异色宠物。

## ✨ 功能特点

- 🎨 **精美界面设计** - 采用渐变背景和粒子动画效果
- 🐾 **宠物图鉴** - 展示多种洛克王国异色精灵
- 🔍 **搜索功能** - 快速查找心仪的宠物
- 📱 **响应式布局** - 完美适配各种屏幕尺寸
- 💫 **流畅动画** - 丰富的交互动画效果
- 🔐 **管理后台** - 密码保护，支持数据编辑和API同步

## 🛠️ 技术栈

- **HTML5** - 页面结构
- **CSS3** - 样式设计（渐变、动画、响应式）
- **JavaScript** - 交互逻辑
- **Google Fonts** - ZCOOL KuaiLe 字体

## 📁 项目结构

```
luokewangguo-html/
├── index.html          # 主页面
├── pets.js             # 宠物数据
├── css/
│   └── style.css       # 样式文件
├── js/
│   ├── auth.js         # 认证、验证、API模块
│   └── app.js          # 应用逻辑
├── images/             # 宠物图片资源
│   ├── 大耳帽兜.png
│   ├── 治愈兔.png
│   └── ...
└── README.md           # 项目说明
```

## 🔐 管理员功能

### 登录密码
- 默认密码：`123456`
- 密码存储在 `js/auth.js` 文件的 `CONFIG.adminPassword` 中
- **重要**：首次使用请修改默认密码

### 安全特性
- 连续3次密码错误后账户锁定30秒
- 锁定期间无法尝试登录
- 错误次数实时显示

### 管理功能
- 编辑宠物价格和图片链接
- 保存修改到本地存储
- 支持API同步到服务器
- 编辑网站公告内容

## 🚀 快速开始

### 方法一：直接打开

1. 克隆仓库到本地：
```bash
git clone https://github.com/pipibigking/luokewangguo-html.git
```

2. 使用浏览器打开 `index.html` 文件即可浏览

### 方法二：使用本地服务器

```bash
cd luokewangguo-html
python -m http.server 8000
```

然后访问 `http://localhost:8000`

## 📷 预览

项目包含多种异色精灵展示：
- 大耳帽兜
- 治愈兔
- 嗜光嗡嗡
- 拉特
- 奇丽草
- 格兰种子
- 红火尾
- 恶魔狼
- 粉粉星
- 月牙雪熊
- 等等...

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

⭐ 如果觉得这个项目不错，请给个 Star 支持一下！