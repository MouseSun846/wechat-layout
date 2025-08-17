// content.js

// 用于存储动态导入的marked库
let marked;

// 监听来自 popup 或 background 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Received message:', request);
  
  if (request.action === 'convertMarkdown') {
    // 获取 Markdown 文本
    const markdownText = request.markdown;
    
    // 转换 Markdown 为 HTML
    convertMarkdownToHTML(markdownText).then(html => {
      // 将 HTML 插入到微信公众号编辑器中
      insertHTMLToEditor(html);
      sendResponse({status: 'success'});
    }).catch(error => {
      console.error('Error converting Markdown:', error);
      sendResponse({status: 'error', message: error.message});
    });
    
    // 保持消息通道开放以发送异步响应
    return true;
  }
  
  // 处理 injectUI 消息，但只在侧边栏环境中工作
  if (request.action === 'injectUI') {
    // 检查消息来源是否为扩展本身
    if (sender.id === chrome.runtime.id) {
      // 在侧边栏中创建UI元素
      // 这里可以添加在侧边栏中显示UI的代码
      console.log('Injecting UI in side panel');
      sendResponse({status: 'success'});
    }
    return true;
  }
});

// 移除了 injectDraggableUI 函数，因为UI应该只在侧边栏中显示

// 为注入的UI添加拖动功能
function addDragFunctionality(element) {
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;
  
  const draggableElement = element;
  const dragHeader = element.querySelector('.drag-header');
  
  // 限制拖动范围的函数
  function constrainPosition() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const elementWidth = draggableElement.offsetWidth;
    const elementHeight = draggableElement.offsetHeight;
    
    if (xOffset < 0) xOffset = 0;
    if (yOffset < 0) yOffset = 0;
    if (xOffset > windowWidth - elementWidth) xOffset = windowWidth - elementWidth;
    if (yOffset > windowHeight - elementHeight) yOffset = windowHeight - elementHeight;
  }
  
  // 更新元素位置的函数
  function setPosition() {
    constrainPosition();
    draggableElement.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
  }
  
  // 拖动开始事件处理函数
  function dragStart(e) {
    if (e.type === "touchstart") {
      initialX = e.touches[0].clientX - xOffset;
      initialY = e.touches[0].clientY - yOffset;
    } else {
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
    }
    
    if (e.target === dragHeader) {
      isDragging = true;
    }
  }
  
  // 拖动结束事件处理函数
  function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    
    isDragging = false;
  }
  
  // 拖动事件处理函数
  function drag(e) {
    if (isDragging) {
      e.preventDefault();
      
      if (e.type === "touchmove") {
        currentX = e.touches[0].clientX - initialX;
        currentY = e.touches[0].clientY - initialY;
      } else {
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
      }
      
      xOffset = currentX;
      yOffset = currentY;
      
      setPosition();
    }
  }
  
  // 添加事件监听器
  dragHeader.addEventListener("mousedown", dragStart, false);
  document.addEventListener("mouseup", dragEnd, false);
  document.addEventListener("mousemove", drag, false);
  
  dragHeader.addEventListener("touchstart", dragStart, false);
  document.addEventListener("touchend", dragEnd, false);
  document.addEventListener("touchmove", drag, false);
}

// 转换 Markdown 为 HTML 的函数
async function convertMarkdownToHTML(markdown) {
  // 动态加载 marked.js 库
  if (!marked) {
    try {
      const markedModule = await import(chrome.runtime.getURL('node_modules/marked/lib/marked.esm.js'));
      marked = markedModule.marked;
    } catch (error) {
      console.error('Failed to load marked.js:', error);
      throw new Error('Failed to load marked.js');
    }
  }
  
  // 使用 marked.js 转换 Markdown 为 HTML
  let html = marked.parse(markdown);
  
  // 处理 mermaid 图表
  html = await processMermaidCharts(html);
  
  return html;
}

// 处理 mermaid 图表的函数
async function processMermaidCharts(html) {
  // 创建一个临时的 div 元素来解析 HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;
  
  // 查找所有包含 mermaid 图表的代码块
  const mermaidBlocks = tempDiv.querySelectorAll('pre code.language-mermaid');
  
  // 如果没有 mermaid 图表，直接返回
  if (mermaidBlocks.length === 0) {
    return tempDiv.innerHTML;
  }
  
  // 动态加载 mermaid.js 库
  await loadMermaid();
  
  // 遍历每个 mermaid 代码块并替换为图表
  mermaidBlocks.forEach((block, index) => {
    // 获取 mermaid 图表定义
    const mermaidDefinition = block.textContent;
    
    // 创建一个用于渲染图表的 div
    const chartDiv = document.createElement('div');
    chartDiv.className = 'mermaid';
    chartDiv.id = `mermaid-chart-${index}`;
    chartDiv.textContent = mermaidDefinition;
    
    // 替换原来的代码块
    block.parentElement.replaceWith(chartDiv);
  });
  
  // 渲染 mermaid 图表
  await mermaid.run({
    querySelector: '.mermaid'
  });
  
  // 返回处理后的 HTML
  return tempDiv.innerHTML;
}

// 动态加载 mermaid.js 库
function loadMermaid() {
  return new Promise((resolve, reject) => {
    // 检查是否已经加载了 mermaid
    if (window.mermaid) {
      resolve();
      return;
    }
    
    // 创建 script 标签加载 mermaid
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('mermaid.min.js');
    script.onload = () => {
      // 初始化 mermaid
      mermaid.initialize({ startOnLoad: false });
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 将 HTML 插入到微信公众号编辑器中的函数
function insertHTMLToEditor(html) {
  // 查找微信公众号编辑器的 iframe
  const editorIframe = document.getElementById('ueditor_0');
  
  if (editorIframe && editorIframe.contentDocument) {
    // 获取 iframe 中的 body 元素
    const editorBody = editorIframe.contentDocument.body;
    
    if (editorBody) {
      // 创建一个临时的 div 元素
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      
      // 将 HTML 内容逐个插入到编辑器中
      while (tempDiv.firstChild) {
        editorBody.appendChild(tempDiv.firstChild);
      }
      
      console.log('HTML inserted to editor successfully');
    } else {
      console.error('Could not find editor body');
    }
  } else {
    console.error('Could not find editor iframe');
  }
}