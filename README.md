# ZNav｜3D 打印导航网站

一个开箱即用、可配置的 3D 打印导航站点。支持暗色模式、全屏聚焦搜索（Ctrl+K）、侧边栏展开/收起与一键展开全部分组、响应式布局与主题化样式。

## 功能特性

- 侧边栏导航
  - 顶部「展开全部/收起」按钮，一键切换一级分组
  - 桌面端支持收起/展开侧栏并记忆状态
- 全局搜索
  - Ctrl+K 呼出全屏搜索，ESC 退出
  - 支持按「主分类 / 子分类 / 站点」检索并高亮类型徽章
  - 结果固定高度容器滚动，输入框不跳动
- 暗色模式
  - 一键切换并持久化
  - 针对搜索、卡片、侧边栏等组件的暗黑配色优化
- 配置驱动
  - 通过 `assets/config/menu.json` 增改分组与链接
  - 自动渲染图标、标题与描述
- 细节体验
  - 卡片悬浮反馈、渐变与毛玻璃风格
  - favicon 自动抓取（失败有占位符）

## 目录结构

```text
.
├─ index.html               # 页面结构（含全屏搜索模态）
├─ assets/
│  ├─ app.css              # 全站样式（含暗色模式）
│  ├─ app.js               # 渲染逻辑、搜索、侧栏控制、主题切换
│  ├─ logo.png             # 顶部 Logo
│  └─ config/
│     └─ menu.json         # 导航配置（分组/链接）
├─ dev.sh                   # 本地开发脚本（live-server）
└─ README.md
```

## 本地开发

环境要求：Node.js ≥ 16，pnpm（或可改用 npm/yarn）

```bash
# 安装 pnpm（若未安装）
npm i -g pnpm

# 启动本地服务（推荐）
bash dev.sh

# 或直接使用 npx（等价效果）
pnpm dlx live-server --host=127.0.0.1 --port=5173 --no-browser
```

启动后访问 `http://127.0.0.1:5173/`。

## 快速定制

1) 编辑导航数据：`assets/config/menu.json`

- `sections[].id|icon|name`：定义主分类（Bootstrap Icons 图标类名）
- `children[].id|name|links[]`：定义子分类与链接
- `links[].name|url|desc`：站点名称/地址/描述

2) 调整主题与样式：`assets/app.css`

- 顶部导航、侧边栏、卡片、搜索、暗色模式均集中在该文件
- 可覆盖 `:root` 变量或直接修改组件段落

3) 行为逻辑：`assets/app.js`

- 渲染侧栏与内容区：`renderSidebar`、`renderContent`
- 搜索：`bindSearch`、`displaySearchResults`
- 侧栏控制：`toggleSidebarForDesktop`、`initToggleAllMenus`
- 主题：`initThemeToggle`

## 使用说明（交互）

- 全屏搜索：按 Ctrl+K 打开，ESC 关闭
- 搜索范围：主分类 / 子分类 / 站点（标题与描述）
- 侧栏：
  - 左上按钮可收起/展开整个侧栏（状态记忆）
  - 侧栏顶部「∨/∧」按钮可展开/收起全部一级分组
- 主题：右上角按钮切换明/暗模式（状态记忆）

## 部署

静态站点，无后端依赖，可直接部署到任意静态托管：

- GitHub Pages / Vercel / Netlify
- Nginx/Apache 静态目录

将仓库内容作为站点根目录即可，无需构建步骤。

## 常见问题

- favicon 加载失败？
  - 默认通过 `https://toolb.cn/favicon/{hostname}` 获取，若失败自动显示占位图标

## 致谢

- UI 组件基于 Bootstrap 5 / Bootstrap Icons
- 图标与配色参考了现代化渐变与毛玻璃风格

## 许可证

MIT
