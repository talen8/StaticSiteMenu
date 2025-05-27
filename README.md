<a id="readme-top"></a>
<br />

<div align="center">
  <a href="https://github.com/othneildrew/Best-README-Template">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">StaticSiteMenu</h3>

  <p align="center">
    一个现代化的个人网站导航中心，让网络浏览更加高效便捷。
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template"><strong>探索本项目的文档 »</strong></a>
    <br />
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template">查看演示 🎯</a>
    &middot;
    <a href="https://github.com/othneildrew/Best-README-Template/issues/new?labels=bug&template=bug-report---.md">Bug 报告 🐞</a>
    &middot;
    <a href="https://github.com/othneildrew/Best-README-Template/issues/new?labels=enhancement&template=feature-request---.md">功能需求 🚀</a>
  </p>
</div>

<details>
  <summary>目录</summary>
  <ol>
    <li>
      <a href="#关于项目">关于项目</a>
      <ul>
        <li><a href="#技术栈">技术栈</a></li>
        <li><a href="#项目结构">项目结构</a></li>
      </ul>
    </li>
    <li>
      <a href="#开始使用">开始使用</a>
      <ul>
        <li><a href="#前置要求">前置要求</a></li>
        <li><a href="#安装">安装</a></li>
      </ul>
    </li>
    <li><a href="#使用示例">使用示例</a></li>
    <li><a href="#功能列表">功能列表</a></li>
    <li><a href="#参与贡献">参与贡献</a></li>
    <li><a href="#许可证">许可证</a></li>
    <li><a href="#联系方式">联系方式</a></li>
    <li><a href="#致谢">致谢</a></li>
  </ol>
</details>

## 关于项目

[![产品截图][product-screenshot]](https://example.com)

在当今信息爆炸的时代，我们每天都需要访问大量的网站和资源。StaticSiteMenu 应运而生，旨在为用户提供一个现代化的个人网站导航中心，让网络浏览更加高效便捷。

为什么选择 StaticSiteMenu：

- 简洁优雅的界面设计，让导航变得轻松愉快
- 完全静态化部署，无需后端支持，加载速度极快
- 文档全面丰富，帮助用户快速上手和进阶使用
- 快速访问常用网站，提高工作效率
- 支持分类管理，让网站收藏更有条理

我们致力于打造一个简单易用但功能强大的网站导航工具。如果你有任何建议或想法，欢迎通过 fork 仓库并创建 pull request 或提出 issue 来参与改进。感谢所有为这个项目做出贡献的人！

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

### 技术栈

- Vue3 - 渐进式 JavaScript 框架
- Vite - 下一代前端构建工具
- TailwindCSS - 实用优先的 CSS 框架
- Pinia - Vue 的状态管理库
- Supabase - 开源的后端即服务
- ECharts - 功能强大的图表库
- Vue Router - Vue.js 官方路由管理器

### 项目结构

```
StaticSiteMenu/
├── src/                 # 源代码目录
│   ├── components/        # Vue 组件
│   ├── views/             # 页面视图
│   ├── router/            # 路由配置
│   ├── store/             # Pinia 状态管理
│   ├── App.vue            # 根组件
│   ├── main.js            # 入口文件
│   └── style.css          # 公共样式
├── public/              # 公共资源
├── index.html           # 入口文件
├── .env                 # 环境变量
├── config.yaml          # 系统配置文件
├── package.json         # 项目依赖
├── vite.config.js       # Vite 配置
├── tailwind.config.js   # Tailwind 配置
├── eslint.config.js     # ESlint 配置
├── .prettierrc.yaml     # Prettier 配置
├── README.md            # 项目说明
└── CHANGELOG.md         # 更新日志
```

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

## 开始使用

### 前置要求

这是列出使用软件所需内容。

- Node.js >= 16.0.0
- npm >= 7.0.0
- 官网注册 Supabase

### 安装

1. 克隆仓库
   ```sh
   git clone https://github.com/talen8/StaticSiteMenu.git
   ```
2. 安装 NPM 包
   ```sh
   cd StaticSiteMenu
   npm install
   ```
3. 环境配置
   ```bash
   # 复制或重命名 config.example.yaml 为 config.yaml
   cp config.example.yaml config.yaml
   # 复制或重命名 .env.example 为 .env
   cp .env.example .env
   ```
4. 在 [https://supabase.com/dashboard](https://supabase.com/dashboard) 获取数据库连接参数，具体方法查阅项目文档
5. 在 `.env` 中输入连接参数
   ```js
   VITE_SUPABASE_URL = your - project - url
   VITE_SUPABASE_ANON_KEY = your - anon - key
   VITE_SUPABASE_SERVICE_ROLE_KEY = your - service - role - key
   ```
6. 更多个性化配置修改 config.yaml 文件
7. 启动项目

   开发环境：

   ```bash
   # 启动开发服务器
   npm run dev
   ```

   生产环境：

   ```bash
   # 构建生产版本
   npm run build

   # 预览生产版本
   npm run preview
   ```

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

## 使用示例

| 网站名称 |                     网站地址                     | 说明 |
| :------: | :----------------------------------------------: | :--: |
| FlecMENU | [https://menu.talen.top](https://menu.talen.top) | 演示 |

上方展示使用本项目的网站演示或复刻项目，如果你想在上方展示，请点击 <a href="https://github.com/othneildrew/Best-README-Template/issues/new?labels=enhancement&template=submit-site---.md">此处提交</a>。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

## 功能列表

- [x]纯前端部署
- [x]卡片式布局
- [x]后台管理
- [x]分类、标签功能
- [x]主题切换
- [x]高度自定义
- [x]页面：关于我们
- [x]页面：友情链接
- [x]悬浮工具
- [x]用户角色系统
- [x]集成 Echarts
- [ ] 多语言支持
- [ ] 更多部署方式
- [ ] 数据管理（导入/导出）

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

## 参与贡献

贡献是让开源社区成为一个学习、激励和创造的绝佳场所的原因。你做出的任何贡献都**非常感激**。

如果你有改进建议，请 fork 仓库并创建 pull request。你也可以简单地用"enhancement"标签提出 issue。
别忘了给项目点个星！再次感谢！

1. Fork 项目
2. 创建你的特性分支 (`git checkout -b feature/feature-name`)
3. 提交你的更改 (`git commit -m 'feat: 添加新功能或修复问题'`)
4. 推送到分支 (`git push origin feature/feature-name`)
5. 开启 Pull Request

### 主要贡献者：

<a href="https://github.com/othneildrew/StaticSiteMenu/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=othneildrew/StaticSiteMenu" alt="contrib.rocks image" />
</a>

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<!-- 许可证 -->

## 许可证

本项目采用 MIT 许可证，完整的许可证文本请查看 [LICENSE](LICENSE) 文件。

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<!-- 联系方式 -->

## 联系方式

- 邮箱：talen2004@163.com
- 微信：f18596373623
- 博客：https://blog.talen.top

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>

<!-- 致谢 -->

## 致谢

- [PearAPI](https://api.pearktrue.cn/)
- [allOrigins](https://github.com/gnuns/allorigins)
- [cdnjs](https://cdnjs.com/)
- [Unsplash](https://unsplash.com/)
- ... ...

<p align="right">(<a href="#readme-top">返回顶部</a>)</p>
