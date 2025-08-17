# Markdown to WeChat Editor

这是一个谷歌浏览器插件，可以将 Markdown 文本转换为微信公众号富文本语法，并支持 Mermaid 图表。

## 功能特性

- 将 Markdown 文本转换为微信公众号富文本
- 支持 Mermaid 图表语法
- 简单易用的 popup 界面

## 安装方法

1. 打开谷歌浏览器，进入 `chrome://extensions/` 页面
2. 打开右上角的 "开发者模式"
3. 点击 "加载已解压的扩展程序"
4. 选择 `wechat-layout` 目录

## 使用方法

1. 打开微信公众号编辑页面
2. 点击插件图标，打开 popup 窗口
3. 在文本框中输入 Markdown 文本
4. 点击 "转换并插入" 按钮
5. 转换后的富文本将自动插入到微信公众号编辑器中

## 测试方法

1. 安装插件后，打开微信公众号编辑页面
2. 点击插件图标，打开 popup 窗口
3. 可以使用 `example.md` 文件中的示例内容进行测试
4. 点击 "转换并插入" 按钮
5. 检查微信公众号编辑器中是否正确显示了转换后的内容，包括 Mermaid 图表

## 构建和测试

- **构建项目**: `npm run build`
- **运行测试**: `npm test`
- **代码检查**: `npm run lint`
- **准备发布**: `npm run prepare` (自动运行构建和代码检查)

## 常见问题解决

### marked.js 加载问题

如果在使用插件时遇到 marked.js 加载失败的错误，这通常是因为 `node_modules/marked/lib/marked.esm.js` 文件没有正确配置在 `manifest.json` 的 `web_accessible_resources` 中。

确保 `manifest.json` 文件包含以下配置：

```json
"web_accessible_resources": [
  {
    "resources": ["mermaid.min.js", "styles.css", "sidepanel.js", "node_modules/marked/lib/marked.esm.js"],
    "matches": ["https://mp.weixin.qq.com/*"]
  }
]
```

如果修改了 `manifest.json` 文件，请重新构建项目：

```bash
npm run build
```

## 技术实现

- 使用 `marked.js` 库进行 Markdown 解析
- 使用 `mermaid.js` 库进行图表渲染
- 通过 Chrome 扩展 API 实现与微信公众号编辑器的交互

## 项目信息

- **Homepage**: 项目的主页链接
- **Funding**: 项目的赞助链接
- **Repository**: 项目的代码仓库链接
- **Bugs**: 项目的 bug 报告链接

## 文件结构

- `manifest.json`: 插件配置文件
- `content.js`: 内容脚本，负责 Markdown 转换和插入
- `background.js`: 后台脚本，处理扩展图标点击事件
- `popup.html`: popup 页面
- `popup.js`: popup 页面的 JavaScript 逻辑
- `styles.css`: 样式文件
- `mermaid.min.js`: Mermaid 图表库
- `node_modules/marked/lib/marked.esm.js`: Marked.js 库
- `example.md`: 示例 Markdown 文件
- `CHANGELOG.md`: 版本变更历史
- `CONTRIBUTING.md`: 贡献指南
- `.github/ISSUE_TEMPLATE/`: 问题模板目录
  - `bug_report.md`: Bug 报告模板
  - `feature_request.md`: 功能请求模板
- `.github/PULL_REQUEST_TEMPLATE.md`: Pull Request 模板
- `webpack.config.cjs`: webpack 配置文件
- `dist/`: 构建后的文件目录
- `.npmignore`: npm 忽略文件列表
- `eslint.config.mjs`: ESLint 配置文件
- `docs/`: 详细文档目录
  - `usage.md`: 使用说明
  - `technical_details.md`: 技术实现细节
  - `test_plan.md`: 测试计划


  ## 谷歌浏览器插件开发入门指南

开发谷歌浏览器插件（Google Chrome Extension）可以为你带来强大的定制化浏览体验，无论是想增强特定网站的功能、整合常用服务，还是仅仅为了自动化一些日常操作。本指南将从零开始，为你介绍插件开发的基础知识、核心组件和基本流程。

### 一、插件的核心构成：从`manifest.json`开始

每个Chrome插件都必须包含一个名为 `manifest.json` 的文件，它是插件的“身份证”和入口点。这个JSON文件定义了插件的名称、版本、图标、权限以及它所包含的各种脚本和页面。

一个最基础的 `manifest.json` 文件（使用Manifest V3版本）如下所示：

```json
{
  "manifest_version": 3,
  "name": "我的第一个插件",
  "version": "1.0",
  "description": "一个简单的Chrome插件示例。",
  "icons": {
    "16": "images/icon16.png",
    "48": "images/icon48.png",
    "128": "images/icon128.png"
  },
  "action": {
    "default_popup": "popup.html",
    "default_icon": {
      "16": "images/icon16.png",
      "48": "images/icon48.png"
    }
  }
}
```

**关键字段解析：**

  * `manifest_version`: **必须为 3**。这是最新的规范，安全性更高。
  * `name`, `version`, `description`: 插件的基本信息。
  * `icons`: 定义插件在不同场景下（如扩展管理页面、工具栏）显示的图标。
  * `action`: 定义用户点击浏览器工具栏上插件图标时的行为。
      * `default_popup`: 指定一个HTML文件，点击图标时会弹出一个小窗口。
      * `default_icon`: 指定在工具栏上显示的图标。

### 二、插件的四大核心组件

#### 1\. **弹出页面 (Popup)**

这是用户与插件交互最直接的窗口。当用户点击插件图标时，`popup.html` 文件就会被加载。你可以在这个HTML文件中像开发普通网页一样，引入CSS和JavaScript，来构建插件的用户界面和交互逻辑。

**示例 `popup.html`:**

```html
<!DOCTYPE html>
<html>
<head>
  <title>我的插件</title>
  <link rel="stylesheet" href="popup.css">
</head>
<body>
  <h1>你好，世界！</h1>
  <button id="myButton">点击我</button>
  <script src="popup.js"></script>
</body>
</html>
```

#### 2\. **内容脚本 (Content Scripts)**

内容脚本是注入到网页上下文中的JavaScript文件。它可以直接读取和修改网页的DOM，从而实现与网页内容的深度交互。例如，你可以用它来高亮特定关键词、自动填写表单或在页面上添加额外的功能按钮。

在 `manifest.json` 中配置内容脚本：

```json
"content_scripts": [
  {
    "matches": ["https://*.google.com/*"],
    "js": ["content.js"],
    "css": ["styles.css"]
  }
]
```

  * `matches`: 指定内容脚本在哪些网址上生效。
  * `js` 和 `css`: 分别指定要注入的JavaScript和CSS文件。

**重要提示：** 内容脚本与页面的JavaScript运行在隔离的环境中，但共享同一个DOM。它们不能直接调用页面中的函数或访问其变量，反之亦然。

#### 3\. **后台脚本 (Background Scripts / Service Worker)**

后台脚本（在Manifest V3中称为Service Worker）是插件的事件处理器，它在后台持续运行（或在需要时被唤醒），监听浏览器事件，如标签页更新、书签创建、网络请求等。这是实现插件核心逻辑的地方。

在 `manifest.json` 中配置后台脚本：

```json
"background": {
  "service_worker": "background.js"
}
```

后台脚本不能直接访问网页的DOM，但可以通过Chrome提供的API与内容脚本和弹出页面进行通信。

#### 4\. **选项页面 (Options Page)**

如果你的插件需要一些用户可以自定义的设置，你可以提供一个选项页面。用户可以在插件的管理页面中找到并打开它。

在 `manifest.json` 中配置选项页面：

```json
"options_page": "options.html"
```

### 三、核心：Chrome Extension APIs

Chrome提供了丰富的JavaScript API，让插件能够与浏览器进行深度交互。这些API是实现复杂功能的关键。

**常用API一览：**

  * **`chrome.storage`**: 在用户的浏览器中存储和读取数据。有 `storage.local` (本地存储) 和 `storage.sync` (跨设备同步存储) 两种。
  * **`chrome.tabs`**: 管理和操作浏览器的标签页，如创建、查询、更新标签页。
  * **`chrome.scripting`**: 动态地注入和执行脚本。
  * **`chrome.runtime`**: 管理插件的生命周期，并用于不同组件之间的消息传递。
  * **`chrome.action`**: 控制工具栏上插件图标的行为，如更改图标、标题或弹出内容。
  * **`chrome.contextMenus`**: 创建和管理浏览器的右键菜单项。

### 四、开发与调试流程

1.  **创建项目文件夹**: 新建一个文件夹，将 `manifest.json`、`popup.html`、`popup.js` 等所有相关文件放入其中。

2.  **加载插件**:

      * 在Chrome浏览器中输入 `chrome://extensions` 并回车，进入扩展程序管理页面。
      * 打开右上角的 **“开发者模式”** 开关。
      * 点击左上角的 **“加载已解压的扩展程序”** 按钮，选择你的项目文件夹。

3.  **调试**:

      * **弹出页面 (Popup)**: 右键点击工具栏上的插件图标，选择“审查弹出内容”。
      * **后台脚本 (Service Worker)**: 在扩展管理页面，点击你的插件下方的“查看视图：Service Worker”链接。
      * **内容脚本 (Content Scripts)**: 直接在注入了脚本的网页上，按 `F12` 打开开发者工具，在“来源(Sources)”面板的“Content scripts”标签页下找到你的脚本。

4.  **更新代码**: 修改代码后，无需重新加载整个插件。只需在扩展管理页面点击插件卡片上的刷新图标即可。对于 `manifest.json` 的修改，通常需要点击刷新。

### 五、发布到Chrome网上应用店

当你完成了插件的开发和测试，就可以将其发布到Chrome网上应用店，与全球用户分享。

1.  **准备材料**: 包括插件的`.zip`压缩包、不同尺寸的图标、详细的功能描述和屏幕截图。
2.  **注册开发者账号**: 前往Chrome网上应用店开发者信息中心，支付一次性的注册费用。
3.  **上传和配置**: 上传你的`.zip`文件，填写所有必要的商店信息。
4.  **提交审核**: Google会对你的插件进行审核，以确保其符合政策规定。审核通过后，你的插件就会正式上架。

通过以上步骤，你已经掌握了开发Chrome插件的基本流程和核心知识。建议从一个简单的想法开始，动手实践，并随时查阅 [**Google官方开发文档**](https://developer.chrome.com/docs/extensions/) 以获取更详细的信息和API参考。

## 常见问题解决

### .ProseMirror元素查找问题

在某些情况下，插件可能无法找到微信公众号编辑器中的.ProseMirror元素。这通常是因为页面结构发生了变化。

解决方案：

1. 确保content.js中的insertHTMLToEditor函数使用正确的选择器来查找.ProseMirror元素。
2. 如果页面结构发生变化，可能需要更新选择器以匹配新的结构。
3. 重新构建项目以应用更改：

```bash
npm run build
```