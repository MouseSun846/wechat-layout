# 技术实现细节

## 架构概述

插件采用 Chrome 扩展的典型架构，包含以下组件：

- `manifest.json`: 插件配置文件，定义了插件的基本信息、权限和资源
- `content.js`: 内容脚本，在微信公众号编辑页面运行，负责 Markdown 转换和插入
- `background.js`: 后台脚本，处理扩展图标点击事件和消息传递
- `popup.html`/`popup.js`: popup 页面及其逻辑，提供用户界面

## Markdown 转换

使用 `marked.js` 库进行 Markdown 解析，将其转换为 HTML。

## Mermaid 图表处理

1. 在 Markdown 中识别 ```mermaid 代码块
2. 动态加载 `mermaid.js` 库
3. 将代码块替换为 `<div class="mermaid">` 元素
4. 调用 `mermaid.run()` 渲染图表

## 与微信公众号编辑器交互

通过查找微信公众号编辑器的 iframe (`ueditor_0`) 并向其中插入 HTML 内容来实现交互。