// options.js
document.addEventListener('DOMContentLoaded', initOptions);

function initOptions() {
    // 菜单切换
    document.querySelectorAll('.menu li').forEach(item => {
        item.addEventListener('click', () => {
            document.querySelector('.menu li.active').classList.remove('active');
            item.classList.add('active');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(item.dataset.tab).classList.add('active');
        });
    });

    // 加载保存的设置
    chrome.storage.sync.get(['config'], ({ config }) => {
        if (config) {
            // 设置默认服务
            document.querySelector(`input[value="${config.defaultService}"]`).checked = true;

        }
    });

    // 实时保存设置
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', saveConfig);
    });
}

function saveConfig() {
    const config = {
        defaultService: document.querySelector('input[name="defaultService"]:checked').value
    };

    chrome.storage.sync.set({ config }, () => {
        console.log('配置已保存:', config);
    });
}