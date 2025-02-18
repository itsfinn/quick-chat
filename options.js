// 获取选择框和保存按钮元素
const defaultServiceSelect = document.getElementById('default-service');
const saveButton = document.getElementById('save-button');

// 从存储中加载当前的默认服务商设置
chrome.storage.sync.get(['defaultService'], (result) => {
    const defaultService = result.defaultService || 'deepseek';
    defaultServiceSelect.value = defaultService;
});

// 保存按钮点击事件处理
saveButton.addEventListener('click', () => {
    const selectedService = defaultServiceSelect.value;
    chrome.storage.sync.set({ defaultService: selectedService }, () => {
        alert('Settings saved!');
    });
});