// ==UserScript==
// @name         Clipboard Reader on Tab Switch
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Read clipboard value when switching to the current tab and display it on the page
// @author       You
// @match        https://www.goofish.pro/sale/product/add*
// @grant        GM_addStyle
// @grant        GM_setClipboard
// ==/UserScript==

function objToEntry(obj) {
  return Object.entries(obj).map(([key, value]) => `${key}@${value}`).join('$$')
}

function entryToObj(entry) {
  return entry.split('$$').reduce((obj, item) => {
    const [key, value] = item.split('@')
    obj[key] = value
    return obj
  }, {})
}

(function () {
  'use strict';

  function objectToString(obj) {
    const parts = [];
    for (const [key, value] of Object.entries(obj)) {
      parts.push(`${key}@${value}`);
    }
    return parts.join('$$');
  }

    const readClipboardAndDisplay = async () => {
        try {
            // 使用 Clipboard API 读取剪贴板内容
            const text = await navigator.clipboard.readText();

            // 假设剪贴板内容是 JSON 格式，解析为对象
            let data;
            try {
                data = entryToObj(text);
            } catch (parseError) {
                console.error('Failed to parse clipboard content as JSON:', parseError);
                return;
            }

            // 创建一个显示区域
            let displayDiv = document.createElement('div');
            displayDiv.id = 'clipboard-display';
            displayDiv.style.position = 'fixed';
            displayDiv.style.top = '10px';
            displayDiv.style.right = '10px';
            displayDiv.style.backgroundColor = 'white';
            displayDiv.style.border = '1px solid black';
            displayDiv.style.padding = '10px';
            displayDiv.style.zIndex = '9999';
            displayDiv.style.maxWidth = '500px';

            // 为每个信息项创建一行
            for (const [key, value] of Object.entries(data)) {
                const row = document.createElement('div');
                const labelElement = document.createElement('span');
                labelElement.textContent = `${key}: `;
                labelElement.style.fontWeight = 'bold';
                const valueElement = document.createElement('span');
                valueElement.textContent = value;
                // 添加点击事件监听器
                valueElement.addEventListener('click', async function () {
                    const range = document.createRange();
                    range.selectNodeContents(this);
                    const selection = window.getSelection();
                    selection.removeAllRanges();
                    selection.addRange(range);

                    // 复制选中的文本到剪贴板
                    try {
                        await navigator.clipboard.writeText(this.textContent);
                        console.log('Text copied to clipboard:', this.textContent);
                    } catch (copyError) {
                        console.error('Failed to copy text to clipboard:', copyError);
                    }
                });
                row.appendChild(labelElement);
                row.appendChild(valueElement);
                displayDiv.appendChild(row);
            }

            // 检查是否已有显示区域，有则替换，没有则添加
            let existingDiv = document.getElementById('clipboard-display');
            if (existingDiv) {
                existingDiv.parentNode.replaceChild(displayDiv, existingDiv);
            } else {
                document.body.appendChild(displayDiv);
            }
        } catch (error) {
            console.error('Failed to read clipboard:', error);
        }
    };


  // 监听页面可见性变化事件
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      // 当页面可见时，监听页面焦点事件
      window.addEventListener('focus', function onFocus() {
        // 读取剪贴板并显示内容
        readClipboardAndDisplay();
        // 移除焦点事件监听器，避免重复触发
        window.removeEventListener('focus', onFocus);
      });
    }
  });
})();    