// sidepanel.js

document.addEventListener('DOMContentLoaded', function() {
  // 检查是否在扩展环境中运行
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    console.log('Not running in extension environment');
    return;
  }
  
  const convertButton = document.getElementById('convertButton');
  const markdownInput = document.getElementById('markdownInput');
  
  convertButton.addEventListener('click', async function() {
    const markdown = markdownInput.value;
    
    // 显示加载状态
    convertButton.textContent = '转换中...';
    convertButton.disabled = true;
    
    try {
      // 发送消息到 content script 进行转换
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const response = await chrome.tabs.sendMessage(tabs[0].id, {action: 'convertMarkdown', markdown: markdown});
      
      if (response && response.status === 'success') {
        console.log('Markdown converted successfully');
        // 在侧边栏中显示成功消息
        showStatusMessage('转换成功!', 'success');
      }
    } catch (error) {
      console.error('Error converting Markdown:', error);
      // 恢复按钮状态
      convertButton.textContent = '转换并插入';
      convertButton.disabled = false;
      // 显示错误信息
      showStatusMessage('转换失败: ' + error.message, 'error');
    }
  });
  
  // 当侧边栏打开时，向 content script 发送消息，请求注入UI
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0].url && tabs[0].url.includes('https://mp.weixin.qq.com/')) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'injectUI'}, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Content script not ready, UI will be injected when content script loads');
        }
      });
    }
  });
  
  // 显示状态消息的函数
  function showStatusMessage(message, type) {
    // 移除之前的状态消息
    const existingMessage = document.querySelector('.status-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // 创建新的状态消息元素
    const statusMessage = document.createElement('div');
    statusMessage.className = `status-message ${type}`;
    statusMessage.textContent = message;
    statusMessage.style.position = 'fixed';
    statusMessage.style.top = '10px';
    statusMessage.style.left = '50%';
    statusMessage.style.transform = 'translateX(-50%)';
    statusMessage.style.padding = '10px 20px';
    statusMessage.style.borderRadius = '4px';
    statusMessage.style.color = 'white';
    statusMessage.style.fontWeight = 'bold';
    statusMessage.style.zIndex = '1000';
    statusMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
    
    if (type === 'success') {
      statusMessage.style.backgroundColor = '#4CAF50';
    } else {
      statusMessage.style.backgroundColor = '#f44336';
    }
    
    document.body.appendChild(statusMessage);
    
    // 3秒后自动移除消息
    setTimeout(() => {
      if (statusMessage.parentNode) {
        statusMessage.remove();
      }
      // 恢复按钮状态
      const convertButton = document.getElementById('convertButton');
      convertButton.textContent = '转换并插入';
      convertButton.disabled = false;
    }, 3000);
  }
});