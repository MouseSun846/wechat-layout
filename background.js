// background.js

const WECHAT_ORIGIN = 'https://mp.weixin.qq.com/';

// 设置侧边栏行为
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// 监听扩展图标点击事件
chrome.action.onClicked.addListener((tab) => {
  // 棣检查是否在微信公众号页面
  if (tab.url && tab.url.includes(WECHAT_ORIGIN)) {
    // 向 content script 发送消息，请求注入UI
    chrome.tabs.sendMessage(tab.id, {action: 'injectUI'}, (response) => {
      if (chrome.runtime.lastError) {
        // 如果发送消息失败，说明 content script 还没有加载，需要注入
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        }, () => {
          // 注入完成后再次发送消息
          chrome.tabs.sendMessage(tab.id, {action: 'injectUI'});
        });
      }
    });
  }
});

// 移除 chrome.sidePanel.onOpen 监听器，因为该API不存在或不支持
// 侧边栏的显示逻辑已通过 chrome.tabs.onUpdated 实现

// 监听标签页更新事件，仅在特定网站启用侧边栏
chrome.tabs.onUpdated.addListener(async (tabId, info, tab) => {
  if (!tab.url) return;
  const url = new URL(tab.url);
  // 在微信公众号页面启用侧边栏
  if (url.origin === WECHAT_ORIGIN) {
    await chrome.sidePanel.setOptions({
      tabId,
      path: 'sidepanel.html',
      enabled: true
    });
  } else {
    // 在其他网站停用侧边栏
    await chrome.sidePanel.setOptions({
      tabId,
      enabled: false
    });
  }
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 可以在这里处理来自 content script 的消息
  // 例如，请求用户输入 Markdown 文本
  if (request.action === 'requestMarkdownInput') {
    // 打开 popup 页面让用户输入 Markdown
    chrome.action.openPopup();
  }
});