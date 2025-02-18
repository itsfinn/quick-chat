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

            // 设置开关状态
            document.getElementById('deepseekDeepThinking').checked = config.deepseek.enableDeepThinking;
            document.getElementById('deepseekWebSearch').checked = config.deepseek.enableWebSearch;
            document.getElementById('yuanbaoDeepThinking').checked = config.yuanbao.enableDeepThinking;
            document.getElementById('yuanbaoWebSearch').checked = config.yuanbao.enableWebSearch;
            document.getElementById('doubaoDeepThinking').checked = config.doubao.enableDeepThinking;
            document.getElementById('doubaoWebSearch').checked = config.doubao.enableWebSearch;
        }
    });

    // 实时保存设置
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('change', saveConfig);
    });
}

function saveConfig() {
    const config = {
        defaultService: document.querySelector('input[name="defaultService"]:checked').value,
        deepseek: {
            enableDeepThinking: document.getElementById('deepseekDeepThinking').checked,
            enableWebSearch: document.getElementById('deepseekWebSearch').checked
        },
        yuanbao: {
            enableDeepThinking: document.getElementById('yuanbaoDeepThinking').checked,
            enableWebSearch: document.getElementById('yuanbaoWebSearch').checked
        },
        doubao: {
            enableDeepThinking: document.getElementById('doubaoDeepThinking').checked,
            enableWebSearch: document.getElementById('doubaoWebSearch').checked
        }
    };

    chrome.storage.sync.set({ config }, () => {
        console.log('配置已保存:', config);
    });
}