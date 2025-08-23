// Generate random visitor ID
function generateRandomVisitorId() {
  return 'visitor-' + Math.random().toString(36).substr(2, 9);
}

// Get visitor ID
async function getVisitorId() {
  // Check if visitor ID exists in localStorage
  let visitorId = localStorage.getItem('visitorId');
  
  return visitorId;
}

// Generate and save visitor ID
function generateAndSaveVisitorId() {
  let visitorId = localStorage.getItem('visitorId');
  
  // If not exists, generate a new one and save it
  if (!visitorId) {
    visitorId = generateRandomVisitorId();
    localStorage.setItem('visitorId', visitorId);
  }
  
  return visitorId;
}

// Check if user is verified
function isUserVerified(visitorId) {
  const verifiedUsers = JSON.parse(localStorage.getItem('verifiedUsers') || '[]');
  return verifiedUsers.includes(visitorId);
}

// Add user to verified list
function addUserToVerifiedList(visitorId) {
  const verifiedUsers = JSON.parse(localStorage.getItem('verifiedUsers') || '[]');
  if (!verifiedUsers.includes(visitorId)) {
    verifiedUsers.push(visitorId);
    localStorage.setItem('verifiedUsers', JSON.stringify(verifiedUsers));
  }
}

// Show subscription modal
function showSubscriptionModal() {
  const modal = document.getElementById('subscriptionModal');
  modal.style.display = 'block';
  
  // Clear passcode input
  const passcodeInput = document.getElementById('passcodeInput');
  if (passcodeInput) {
    passcodeInput.value = '';
  }
}

// Hide subscription modal
function hideSubscriptionModal() {
  const modal = document.getElementById('subscriptionModal');
  modal.style.display = 'none';
}

// Verify passcode
async function verifyPasscode(visitorId, passcode) {
  const options = {
    method: 'POST',
    headers: {
      Accept: '*/*',
      'Accept-Encoding': 'gzip, deflate, br',
      'User-Agent': 'PostmanRuntime-ApipostRuntime/1.1.0',
      Connection: 'keep-alive',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ passcode })
  };

  try {
    const response = await fetch('https://lgy-in-dev.cnbita.com/dxjewkl7l-d7fe-2559-ab62-c3b95a066a82/api/passcode/verify', options);
    const result = await response.json();
    
    if (result.code === 200 && result.data && result.data.valid) {
      // Verification successful
      // Generate and save visitor ID
      const newVisitorId = generateAndSaveVisitorId();
      addUserToVerifiedList(newVisitorId);
      hideSubscriptionModal();
      return true;
    } else {
      // Verification failed
      alert(result.message || result.data?.message || '口令验证失败');
      return false;
    }
  } catch (err) {
    console.error(err);
    alert('验证过程中出现错误，请重试');
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const markdownInput = document.getElementById('markdownInput');
  const convertButton = document.getElementById('convertButton');
  const themeSelect = document.getElementById('theme-select');
  const fontSelect = document.getElementById('font-select');
  const subscriptionModal = document.getElementById('subscriptionModal');
  const passcodeInput = document.getElementById('passcodeInput');
  const verifyPasscodeButton = document.getElementById('verifyPasscode');
  const cancelVerificationButton = document.getElementById('cancelVerification');
  const modalClose = document.querySelector('.modal-close');

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
  setTimeout(() => {
    console.log('Populating theme options');
    themes.forEach(theme => {
      const option = document.createElement('option');
      option.value = theme.value;
      option.textContent = theme.label;
      themeSelect.appendChild(option);
    });
    console.log('Theme options populated');
  }, 100);

  // Populate font options
  setTimeout(() => {
    console.log('Populating font options');
    fonts.forEach(font => {
      const option = document.createElement('option');
      option.value = font.value;
      option.textContent = font.label;
      fontSelect.appendChild(option);
    });
    console.log('Font options populated');
  }, 100);

  // Handle convert button click
  convertButton.addEventListener('click', async () => {
    // Get visitor ID with timeout
    let visitorId;
    try {
      visitorId = await Promise.race([
        getVisitorId(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('获取用户ID超时')), 5000)
        )
      ]);

    } catch (error) {
      console.error('获取用户ID失败:', error);
      alert('获取用户身份信息失败，请检查网络连接后重试');
      convertButton.disabled = false;
      convertButton.textContent = '转换并插入';
      return;
    }
    
    // Check if user is already verified
    if (!visitorId) {
      // Show subscription modal
      showSubscriptionModal();
      return;
    }
    
    // User is verified, proceed with conversion
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
  
  // Handle passcode verification
  verifyPasscodeButton.addEventListener('click', async () => {
    const passcode = passcodeInput.value.trim();
    if (!passcode) {
      alert('请输入口令');
      return;
    }
    
    // Get visitor ID
    let visitorId = await getVisitorId();
    
    // If visitorId is null or undefined, generate a temporary one for verification
    if (!visitorId) {
      visitorId = generateRandomVisitorId();
    }
    
    // Verify passcode
    const isVerified = await verifyPasscode(visitorId, passcode);
    if (isVerified) {
      // Proceed with conversion
      convertButton.click();
    }
  });
  
  // Handle cancel verification
  cancelVerificationButton.addEventListener('click', () => {
    hideSubscriptionModal();
  });
  
  // Handle modal close
  modalClose.addEventListener('click', () => {
    hideSubscriptionModal();
  });
  
  // Handle click outside modal to close
  window.addEventListener('click', (event) => {
    if (event.target === subscriptionModal) {
      hideSubscriptionModal();
    }
  });
});
