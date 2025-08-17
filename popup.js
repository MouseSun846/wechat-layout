// popup.js

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
        // 关闭 popup
        window.close();
      }
    } catch (error) {
      console.error('Error converting Markdown:', error);
      // 恢复按钮状态
      convertButton.textContent = '转换并插入';
      convertButton.disabled = false;
      // 显示错误信息
      alert('转换失败: ' + error.message);
    }
  });
  
  // 当 popup 打开时，向 content script 发送消息，请求注入UI
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0].url && tabs[0].url.includes('https://mp.weixin.qq.com/')) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'injectUI'}, (response) => {
        if (chrome.runtime.lastError) {
          console.log('Content script not ready, UI will be injected when content script loads');
        }
      });
    }
  });
});