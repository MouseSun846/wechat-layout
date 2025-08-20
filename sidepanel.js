document.addEventListener('DOMContentLoaded', () => {
  const markdownInput = document.getElementById('markdownInput');
  const convertButton = document.getElementById('convertButton');
  const themeSelect = document.getElementById('theme-select');
  const fontSelect = document.getElementById('font-select');

  const themes = [
    { label: '默认主题', value: 'default' },
    { label: '橙心', value: 'chengxin' },
    { label: '墨黑', value: 'mohei' },
    { label: '姹紫', value: 'chazi' },
    { label: '嫩青', value: 'nenqing' },
    { label: '绿意', value: 'lvyi' },
    { label: '红绯', value: 'hongfei' },
    { label: 'WeChat-Format', value: 'wechat-format' },
    { label: '蓝莹', value: 'lanying' },
    { label: '科技蓝', value: 'kejilan' },
    { label: '兰青', value: 'lanqing' },
    { label: '山吹', value: 'shanchui' },
    { label: '前端之巅同款', value: 'qianduan' },
    { label: '极客黑', value: 'jikehei' },
    { label: '简', value: 'jian' },
    { label: '蔷薇紫', value: 'qiangweizi' },
    { label: '萌绿', value: 'menglv' },
    { label: '全栈蓝', value: 'quanzhanlan' },
  ];

  const fonts = [
    {
      label: '无衬线',
      value: 'fonts-no-cx',
    },
    {
      label: '衬线',
      value: 'fonts-cx',
    },
  ];

  // Populate theme options
  themes.forEach(theme => {
    const option = document.createElement('option');
    option.value = theme.value;
    option.textContent = theme.label;
    themeSelect.appendChild(option);
  });

  // Populate font options
  fonts.forEach(font => {
    const option = document.createElement('option');
    option.value = font.value;
    option.textContent = font.label;
    fontSelect.appendChild(option);
  });

  convertButton.addEventListener('click', () => {
    const markdownText = markdownInput.value;
    const selectedTheme = themeSelect.value;
    const selectedFont = fontSelect.value;

    if (markdownText.trim() === '') {
      alert('请输入 Markdown 文本');
      return;
    }

    // Disable button to prevent multiple clicks
    convertButton.disabled = true;
    convertButton.textContent = '转换中...';

    // Find the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        const tabId = tabs[0].id;
        // Send message to content script
        chrome.tabs.sendMessage(
          tabId,
          {
            action: 'convertMarkdown',
            markdown: markdownText,
            theme: selectedTheme,
            font: selectedFont,
          },
          (response) => {
            // Re-enable button
            convertButton.disabled = false;
            convertButton.textContent = '转换并插入';

            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError);
              alert('无法连接到页面，请刷新页面后重试');
            } else if (response && response.status === 'success') {
              console.log('Markdown converted and inserted successfully.');
            } else if (response && response.status === 'error') {
              console.error('Error converting Markdown:', response.message);
              alert(`转换失败: ${response.message}`);
            }
          }
        );
      } else {
        // Re-enable button
        convertButton.disabled = false;
        convertButton.textContent = '转换并插入';
        alert('找不到活动标签页');
      }
    });
  });
});
