// content.js

// 用于存储动态导入的marked库
let marked;

// Escape 函数实现，从 marked.js 源码中提取
const escapeReplacements = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
};

function escape(html, encode) {
  const escapeTest = /[&<>'"]/;
  const escapeReplace = /[&<>'"]/g;
  const escapeTestNoEncode = /[<>"']|&(?!#?\w+;)/;
  const escapeReplaceNoEncode = /[<>"']|&(?!#?\w+;)/g;
  
  const getEscapeReplacement = (ch) => escapeReplacements[ch];
  
  if (encode) {
    if (escapeTest.test(html)) {
      return html.replace(escapeReplace, getEscapeReplacement);
    }
  } else {
    if (escapeTestNoEncode.test(html)) {
      return html.replace(escapeReplaceNoEncode, getEscapeReplacement);
    }
  }

  return html;
}

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
  
  // 创建自定义渲染器，将标题转换为span标签
  const renderer = {
    // Block level renderers
    heading({ tokens, depth }) {
      // 根据标题级别返回不同的span标签和样式
      const headingStyles = [
        'font-size: 20px; font-weight: 700; color: #1e293b; background-color: #dbeafe; border-radius: 12px; padding: 15px 20px; margin-top: 30px; margin-bottom: 25px; letter-spacing: -0.5px; line-height: 1.2; display: block; width: fit-content; min-width: 200px; text-align: center;',
        'font-size: 18px; font-weight: 700; color: #1e293b; background-color: #e0e7ff; border-radius: 10px; padding: 12px 18px; margin-top: 28px; margin-bottom: 22px; letter-spacing: -0.3px; line-height: 1.25; display: block; width: fit-content; min-width: 180px; text-align: center;',
        'font-size: 16px; font-weight: 600; color: #0891b2; background-color: #cff9fe; border-radius: 8px; padding: 10px 16px; margin-top: 25px; margin-bottom: 20px; letter-spacing: -0.2px; line-height: 1.3; display: block; width: fit-content; min-width: 160px; text-align: center;',
        'font-size: 15px; font-weight: 600; color: #059669; background-color: #dcfce7; border-radius: 7px; padding: 8px 14px; margin-top: 22px; margin-bottom: 18px; letter-spacing: -0.1px; line-height: 1.35; display: block; width: fit-content; min-width: 140px; text-align: center;',
        'font-size: 14px; font-weight: 600; color: #ea580c; background-color: #ffedd5; border-radius: 6px; padding: 6px 12px; margin-top: 20px; margin-bottom: 16px; line-height: 1.4; display: block; width: fit-content; min-width: 120px; text-align: center;',
        'font-size: 13px; font-weight: 600; color: #64748b; background-color: #e2e8f0; border-radius: 5px; padding: 5px 10px; margin-top: 18px; margin-bottom: 14px; line-height: 1.45; display: block; width: fit-content; min-width: 100px; text-align: center;'
      ];
      
      // 使用解析器处理 tokens
      const text = this.parser.parseInline(tokens);
      // 修改为符合用户要求的DOM结构，直接在span节点通过style表达样式，防止被编辑器重置
      return `<p><span leaf=""><span textstyle="" style="${headingStyles[depth-1]}">${text}</span></span></p>`;
    },
    paragraph({ tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<p>${text}</p>`;
    },
    list(token) {
      const ordered = token.ordered;
      const start = token.start;
      
      let body = '';
      for (let j = 0; j < token.items.length; j++) {
        const item = token.items[j];
        body += this.listitem(item);
      }
      
      const type = ordered ? 'ol' : 'ul';
      const startAttr = (ordered && start !== 1) ? (` start="${start}"`) : '';
      return `<${type}${startAttr}>${body}</${type}>`;
    },
    listitem(item) {
      let itemBody = '';
      if (item.task) {
        const checkbox = this.checkbox({ checked: !!item.checked });
        if (item.loose) {
          if (item.tokens[0]?.type === 'paragraph') {
            item.tokens[0].text = checkbox + ' ' + item.tokens[0].text;
            if (item.tokens[0].tokens && item.tokens[0].tokens.length > 0 && item.tokens[0].tokens[0].type === 'text') {
              item.tokens[0].tokens[0].text = checkbox + ' ' + item.tokens[0].tokens[0].text;
              item.tokens[0].tokens[0].escaped = true;
            }
          } else {
            item.tokens.unshift({
              type: 'text',
              raw: checkbox + ' ',
              text: checkbox + ' ',
              escaped: true,
            });
          }
        } else {
          itemBody += checkbox + ' ';
        }
      }
      
      itemBody += this.parser.parse(item.tokens, !!item.loose);
      return `<li>${itemBody}</li>`;
    },
    checkbox({ checked }) {
      return '<input '
        + (checked ? 'checked="" ' : '')
        + 'disabled="" type="checkbox">';
    },
    code({ text, lang, escaped }) {
      const langString = (lang || '').match(/\S*/)?.[0];
      const code = text.replace(/\n$/, '') + '\n';
      
      // 检查是否为Mermaid代码块
      if (langString && langString.toLowerCase() === 'mermaid') {
        // 对于Mermaid代码块，转换为图片插入
        return `<div class="mermaid">${code}</div>`;
      }
      
      if (!langString) {
        // 修改为符合用户要求的DOM结构
        return '<section class="code-snippet__js"><pre class="code-snippet__js code-snippet code-snippet_nowrap" data-lang=""><code><span leaf="">'
          + (escaped ? code : escape(code, true))
          + '</span></code></pre></section>\n';
      }
      
      // 修改为符合用户要求的DOM结构
      return '<section class="code-snippet__js"><pre class="code-snippet__js code-snippet code-snippet_nowrap" data-lang="' + escape(langString) + '"><code><span leaf="">'
        + (escaped ? code : escape(code, true))
        + '</span></code></pre></section>\n';
    },
    blockquote({ tokens }) {
      const body = this.parser.parse(tokens);
      // 修改为符合用户要求的DOM结构
      return `<blockquote><p><span leaf="">${body.replace(/<p>(.*?)<\/p>/g, '$1')}</span></p></blockquote>`;
    },
    html({ text }) {
      return text;
    },
    def(token) {
      return '';
    },
    hr(token) {
      // 修改为符合用户要求的DOM结构
      return '<hr style="border-style: solid; border-width: 1px 0 0; border-color: rgba(0,0,0,0.1); -webkit-transform-origin: 0 0; -webkit-transform: scale(1, 0.5); transform-origin: 0 0; transform: scale(1, 0.5);" contenteditable="false">\n';
    },
    // This method was missing and caused the error
    space(token) {
      return '';
    },
    // Table renderers
    table(token) {
      let header = '';
      
      // header
      let cell = '';
      for (let j = 0; j < token.header.length; j++) {
        cell += this.tablecell(token.header[j]);
      }
      header += this.tablerow({ text: cell });
      
      let body = '';
      for (let j = 0; j < token.rows.length; j++) {
        const row = token.rows[j];
        
        cell = '';
        for (let k = 0; k < row.length; k++) {
          cell += this.tablecell(row[k]);
        }
        
        body += this.tablerow({ text: cell });
      }
      if (body) body = `<tbody>${body}</tbody>`;
      
      return '<table>\n'
        + '<thead>\n'
        + header
        + '</thead>\n'
        + body
        + '</table>\n';
    },
    tablerow({ text }) {
      return `<tr>\n${text}</tr>\n`;
    },
    tablecell(token) {
      const content = this.parser.parseInline(token.tokens);
      const type = token.header ? 'th' : 'td';
      const tag = token.align
        ? `<${type} align="${token.align}">`
        : `<${type}>`;
      return tag + content + `</${type}>\n`;
    },
    // Inline level renderers
    strong({ tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<strong>${text}</strong>`;
    },
    em({ tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<em>${text}</em>`;
    },
    codespan({ text }) {
      return `<code>${escape(text, true)}</code>`;
    },
    br(token) {
      return '<br>';
    },
    del({ tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<del>${text}</del>`;
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const cleanHref = cleanUrl(href);
      if (cleanHref === null) {
        return text;
      }
      href = cleanHref;
      let out = '<a href="' + href + '"';
      if (title) {
        out += ' title="' + (escape(title)) + '"';
      }
      out += '>' + text + '</a>';
      return out;
    },
    image({ href, title, text, tokens }) {
      if (tokens) {
        text = this.parser.parseInline(tokens, this.parser.textRenderer);
      }
      const cleanHref = cleanUrl(href);
      if (cleanHref === null) {
        return escape(text);
      }
      href = cleanHref;
      
      let out = `<img src="${href}" alt="${text}"`;
      if (title) {
        out += ` title="${escape(title)}"`;
      }
      out += '>';
      return out;
    },
    text(token) {
      return 'tokens' in token && token.tokens
        ? this.parser.parseInline(token.tokens)
        : ('escaped' in token && token.escaped ? token.text : escape(token.text));
    }
  };
  
  // 使用 marked.js 转换 Markdown 为 HTML，并应用自定义渲染器
  let html = marked.parse(markdown, { renderer });
  
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
  // 支持两种格式：旧的<pre><code class="language-mermaid">和新的<div class="mermaid">
  const mermaidBlocks = tempDiv.querySelectorAll('pre code.language-mermaid, div.mermaid');
  
  // 如果没有 mermaid 图表，直接返回
  if (mermaidBlocks.length === 0) {
    return tempDiv.innerHTML;
  }
  
  // 动态加载 mermaid.js 库
  await loadMermaid();
  
  // 遍历每个 mermaid 代码块并替换为图表
  mermaidBlocks.forEach((block, index) => {
    // 获取 mermaid 图表定义
    let mermaidDefinition = '';
    
    // 根据不同的元素类型获取内容
    if (block.tagName.toLowerCase() === 'div' && block.classList.contains('mermaid')) {
      // 新格式：直接从<div class="mermaid">获取内容
      mermaidDefinition = block.textContent;
    } else if (block.tagName.toLowerCase() === 'code' && block.classList.contains('language-mermaid')) {
      // 旧格式：从<pre><code class="language-mermaid">获取内容
      mermaidDefinition = block.textContent;
      
      // 创建一个用于渲染图表的 div
      const chartDiv = document.createElement('div');
      chartDiv.className = 'mermaid';
      chartDiv.textContent = mermaidDefinition;
      
      // 替换原来的代码块
      block.parentElement.replaceWith(chartDiv);
      return; // 继续下一个元素
    }
    
    // 确保元素有正确的类名用于渲染
    if (!block.classList.contains('mermaid')) {
      block.classList.add('mermaid');
    }
    
    // 更新元素内容
    block.textContent = mermaidDefinition;
  });
  
  // 使用 Promise 来等待 mermaid 渲染完成
  return new Promise((resolve, reject) => {
    const containerId = `mermaid-container-${Date.now()}`;
    tempDiv.id = containerId;
    tempDiv.style.display = 'none';
    document.body.appendChild(tempDiv);

    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('dist/mermaid_renderer.js');
    script.dataset.containerId = containerId;

    const messageListener = (event) => {
      if (event.source === window && event.data.type && event.data.containerId === containerId) {
        window.removeEventListener('message', messageListener);
        const renderedContainer = document.getElementById(containerId);
        if (renderedContainer) {
          const resultHTML = renderedContainer.innerHTML;
          renderedContainer.remove();
          if (event.data.type === 'MERMAID_RENDER_COMPLETE') {
            resolve(resultHTML);
          } else if (event.data.type === 'MERMAID_RENDER_ERROR') {
            // Log more detailed error information
            console.error('Mermaid rendering failed:', event.data.error);
            // Try to parse the error for more details
            let detailedError = event.data.error;
            if (typeof event.data.error === 'string' && event.data.error.includes('Could not find a suitable point for the given distance')) {
              console.error('This error is related to Mermaid flowchart curve calculations. Try changing the curve type in mermaid configuration.');
              console.error('Attempting fallback rendering with linear curve...');
              // Provide a more user-friendly error message
              reject(new Error('Mermaid rendering failed due to curve calculation issues. The extension automatically attempted a fallback rendering with a linear curve, but it also failed. Try simplifying your diagram or changing the curve type in mermaid configuration.'));
            } else {
              reject(new Error('Mermaid rendering failed: ' + detailedError));
            }
          }
        } else {
          reject(new Error('Mermaid container not found after rendering.'));
        }
      }
    };

    window.addEventListener('message', messageListener);
    document.head.appendChild(script);
  });
}

// 动态加载 mermaid.js 库
function loadMermaid() {
  return new Promise((resolve, reject) => {
    const mermaidScriptURL = chrome.runtime.getURL('mermaid.min.js');
    // 检查 mermaid.js 是否已经被注入
    if (document.querySelector(`script[src="${mermaidScriptURL}"]`)) {
      resolve();
      return;
    }
    
    // 创建 script 标签加载 mermaid
    const script = document.createElement('script');
    script.src = mermaidScriptURL;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// 将 HTML 插入到微信公众号编辑器中的函数
function insertHTMLToEditor(html) {
  // 直接查找文档中的 ProseMirror 元素
  const proseMirrorElement = document.querySelector('.ProseMirror');
  
  if (proseMirrorElement) {
    // 创建一个临时的 div 元素
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // 处理 mermaid 图表图片
    const mermaidImages = tempDiv.querySelectorAll('img.mermaid-diagram');
    mermaidImages.forEach(img => {
      // 为 mermaid 图片添加微信公众号需要的属性
      img.setAttribute('class', 'rich_pages wxw-img');
      img.setAttribute('data-type', 'png');
      img.setAttribute('type', 'block');
      img.setAttribute('contenteditable', 'false');
      
      // 包装在 section 标签中以匹配微信公众号的格式
      const section = document.createElement('section');
      section.style.textAlign = 'center';
      section.setAttribute('nodeleaf', '');
      section.appendChild(img.cloneNode(true));
      
      // 添加 ProseMirror 分隔符和换行符
      const separator = document.createElement('img');
      separator.className = 'ProseMirror-separator';
      separator.alt = '';
      section.appendChild(separator);
      
      const br = document.createElement('br');
      br.className = 'ProseMirror-trailingBreak';
      section.appendChild(br);
      
      // 替换原始图片
      img.replaceWith(section);
    });
    
    // 清空现有的内容
    proseMirrorElement.innerHTML = '';
    
    // 将 HTML 内容逐个插入到 ProseMirror 元素中
    while (tempDiv.firstChild) {
      proseMirrorElement.appendChild(tempDiv.firstChild);
    }
    
    console.log('HTML inserted to editor successfully');
  } else {
    console.error('Could not find ProseMirror element');
  }
}
