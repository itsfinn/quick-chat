chrome.omnibox.onInputEntered.addListener((text) => {
    const [service, ...promptParts] = text.split(' ');
    const prompt = promptParts.join(' ');
    const serviceLower = service.toLowerCase();
  
    const URL_MAP = {
      deepseek: 'https://chat.deepseek.com/',
      doubao: 'https://www.doubao.com/chat/',
      yuanbao: 'https://yuanbao.tencent.com/'
    };
  
    const SELECTORS = {
      deepseek: {
        input: 'textarea[placeholder="Ask anything..."]',
        button: 'button[aria-label="Send"]'
      },
      doubao: {
        input: '.input-box',
        button: '.send-button'
      },
      yuanbao: {
        input: '#prompt-input',
        button: '.submit-btn'
      }
    };
  
    const url = URL_MAP[serviceLower];
    if (!url) return;
  
    chrome.tabs.create({ url }, (tab) => {
      chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
        if (tabId === tab.id && info.status === 'complete') {
          chrome.tabs.onUpdated.removeListener(listener);
          
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: (service, prompt, SELECTORS) => {
              const { input, button } = SELECTORS[service] || {};
              if (!input || !button) return;
  
              const waitFor = (selector, timeout = 5000) => {
                return new Promise((resolve) => {
                  const el = document.querySelector(selector);
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
  
                inputEl.value = prompt;
                inputEl.dispatchEvent(new Event('input', { bubbles: true }));
                
                const buttonEl = await waitFor(button);
                buttonEl?.click();
              })();
            },
            args: [serviceLower, prompt, SELECTORS]
          });
        }
      });
    });
  });
