chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({
        config: {
            defaultService: "deepseek",
            deepseek: { enableDeepThinking: true, enableWebSearch: false },
            yuanbao: { enableDeepThinking: true, enableWebSearch: true },
            doubao: { enableDeepThinking: false, enableWebSearch: false }
        }
    });
});

chrome.omnibox.onInputEntered.addListener((text) => {
    console.log("输入的文本是: ", text)

    let defaultService = 'deepseek';

    // 从存储中获取默认服务商设置
    chrome.storage.sync.get(['config'], (result) => {
        console.log("result.config: ", result.config)
        console.log("result.config.defaultService: ", result.config.defaultService)
        defaultService = result.config.defaultService || 'deepseek';

        let service = defaultService;
        let prompt = text;

        const [firstWord, ...promptParts] = text.split(' ');
        const validServices = ['deepseek', 'doubao', 'yuanbao'];
        if (validServices.includes(firstWord.toLowerCase())) {
            service = firstWord.toLowerCase();
            prompt = promptParts.join(' ');
        }

        console.log("service: ", service)
        console.log("prompt: ", prompt)

        const URL_MAP = {
            deepseek: 'https://chat.deepseek.com/',
            doubao: 'https://www.doubao.com/chat/',
            yuanbao: 'https://yuanbao.tencent.com/'
        };

        const SELECTORS = {
            deepseek: {
                input: 'textarea[id="chat-input"]',
                button: 'div[aria-disabled="false"]'
            },
            doubao: {
                input: 'textarea[data-testid="chat_input_input"]',
                button: 'button[data-testid="chat_input_send_button"]'
            },
            yuanbao: {
                // 修改为通过更稳定的层级关系和属性选择输入框
                input: 'div[contenteditable="true"]',
                // 修改为通过包含特定图标类名来选择发送按钮
                button: '.icon-send'
            }
        };

        const url = URL_MAP[service];
        if (!url) return;

        console.log("before create tabs")
        // 获取当前活动的标签页
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            // 更新当前标签页的 URL
            chrome.tabs.update(currentTab.id, { url }, (tab) => {
                chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
                    if (tabId === tab.id && info.status === 'complete') {
                        chrome.tabs.onUpdated.removeListener(listener);

                        chrome.scripting.executeScript({
                            target: { tabId: tab.id },
                            func: (service, prompt, SELECTORS) => {
                                const { input, button } = SELECTORS[service] || {};
                                if (!input || !button) return;
                                console.log("input: ", input)
                                console.log("button: ", button)
                                const waitFor = (selector, timeout = 10000) => {
                                    return new Promise((resolve) => {
                                        const el = document.querySelector(selector);
                                        console.log("el: ", el)
                                        if (el) return resolve(el);
                                        const observer = new MutationObserver(() => {
                                            const el = document.querySelector(selector);
                                            if (el) {
                                                observer.disconnect();
                                                resolve(el);
                                            }
                                        });

                                        observer.observe(document, {
                                            childList: true,
                                            subtree: true
                                        });

                                        setTimeout(() => {
                                            observer.disconnect();
                                            resolve(null);
                                        }, timeout);
                                    });
                                };

                                (async () => {
                                    const inputEl = await waitFor(input);
                                    if (!inputEl) return;


                                    console.log("inputEl: ", inputEl)
                                    // 填充输入框内容
                                    inputEl.textContent = prompt; // 修改此处
                                    const inputEvent = new Event('input', { bubbles: true });
                                    inputEl.dispatchEvent(inputEvent);

                                    const buttonEl = await waitFor(button);

                                    if (buttonEl) {
                                        console.log('找到的按钮元素：', buttonEl);
                                        const clickEvent = new MouseEvent('click', {
                                            bubbles: true,
                                            cancelable: true,
                                            view: window
                                        });
                                        buttonEl.dispatchEvent(clickEvent);
                                    } else {
                                        console.log('未找到按钮元素');
                                    }
                                })();
                            },
                            args: [service, prompt, SELECTORS]
                        });
                    }
                });
            });
        });
    })
});
