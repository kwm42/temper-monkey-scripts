// ==UserScript==
// @name         Google Trends 相关查询链接替换
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  将Google Trends相关查询的链接替换为自定义链接
// @author       You
// @match        https://trends.google.com/trends/explore*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    // 等待页面完全加载
    function waitForElement(selector, callback, timeout = 10000) {
        const startTime = Date.now();
        
        function check() {
            const element = document.querySelector(selector);
            if (element) {
                callback(element);
            } else if (Date.now() - startTime < timeout) {
                setTimeout(check, 100);
            }
        }
        check();
    }

    // 修改Google Trends URL，在q参数中添加GPTs，确保包含中文语言设置
    function modifyTrendsUrl(originalUrl) {
        try {
            // 如果是相对URL，转换为完整URL进行处理
            let url;
            if (originalUrl.startsWith('/')) {
                url = new URL(originalUrl, 'https://trends.google.com');
            } else {
                url = new URL(originalUrl);
            }
            
            let modified = false;
            
            // 获取当前的q参数值
            const currentQ = url.searchParams.get('q') || '';
            
            // 如果q参数中还没有包含GPTs，则添加GPTs
            if (currentQ && !currentQ.includes('GPTs')) {
                const newQ = 'GPTs,' + currentQ;
                url.searchParams.set('q', newQ);
                console.log(`修改q参数: "${currentQ}" -> "${newQ}"`);
                modified = true;
            }
            
            // 检查是否有hl参数，如果没有则添加zh-CN
            const currentHl = url.searchParams.get('hl');
            if (!currentHl) {
                url.searchParams.set('hl', 'zh-CN');
                console.log(`添加语言参数: hl=zh-CN`);
                modified = true;
            } else if (currentHl !== 'zh-CN') {
                console.log(`当前语言参数: hl=${currentHl} (保持不变)`);
            }
            
            if (modified) {
                console.log(`URL修改完成`);
            }
            
            // 返回修改后的URL（保持原来的格式，如果原来是相对路径则返回相对路径）
            if (originalUrl.startsWith('/')) {
                return url.pathname + url.search + url.hash;
            } else {
                return url.toString();
            }
        } catch (error) {
            console.error('URL解析错误:', error, '原始URL:', originalUrl);
            return originalUrl; // 如果解析失败，返回原始URL
        }
    }

    // 替换相关查询链接的函数
    function replaceRelatedQueryLinks() {
        // 查找相关查询部分的所有链接
        // 使用您提供的精确选择器
        const relatedQuerySelectors = [
            'body.tremolo-theme .fe-related-queries .progress-label a',
            'body.tremolo-theme .fe-related-queries .progress-label',
            '.fe-related-queries .progress-label a',
            '.fe-related-queries .progress-label'
        ];

        let linksFound = false;

        relatedQuerySelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length > 0) {
                console.log(`找到 ${elements.length} 个相关查询元素 (选择器: ${selector})`);
                linksFound = true;
                
                elements.forEach((element, index) => {
                    // 如果元素本身是链接
                    if (element.tagName === 'A') {
                        const originalHref = element.getAttribute('href');
                        const modifiedHref = modifyTrendsUrl(originalHref);
                        element.setAttribute('href', modifiedHref);
                        console.log(`链接 ${index + 1}: ${originalHref} -> ${modifiedHref}`);
                    } else {
                        // 如果元素不是链接，查找其内部的链接
                        const innerLinks = element.querySelectorAll('a');
                        if (innerLinks.length > 0) {
                            innerLinks.forEach((link, linkIndex) => {
                                const originalHref = link.getAttribute('href');
                                const modifiedHref = modifyTrendsUrl(originalHref);
                                link.setAttribute('href', modifiedHref);
                                console.log(`内部链接 ${index + 1}-${linkIndex + 1}: ${originalHref} -> ${modifiedHref}`);
                            });
                        } else {
                            console.log(`元素 ${index + 1}: "${element.textContent.trim()}" 没有找到链接`);
                        }
                    }
                });
            }
        });

        // 如果没有找到链接，尝试更通用的选择器
        if (!linksFound) {
            // 查找所有可能包含相关查询的链接
            const allLinks = document.querySelectorAll('a[href*="/trends/explore"]');
            allLinks.forEach((link, index) => {
                // 检查链接是否在相关查询区域内
                const linkText = link.textContent.trim();
                const parentText = link.parentElement ? link.parentElement.textContent : '';
                
                // 如果链接看起来像是相关查询（通常是短文本）
                if (linkText.length < 50 && !linkText.includes('Google') && !linkText.includes('trends')) {
                    const originalHref = link.getAttribute('href');
                    link.setAttribute('href', 'https://example.com');
                    link.setAttribute('target', '_blank');
                    console.log(`相关查询链接 ${index + 1}: ${linkText} (${originalHref}) -> https://example.com`);
                    linksFound = true;
                }
            });
        }

        return linksFound;
    }

    // 观察DOM变化的函数
    function observeChanges() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // 延迟执行以确保新内容完全加载
                    setTimeout(() => {
                        replaceRelatedQueryLinks();
                    }, 500);
                }
            });
        });

        // 开始观察整个文档的变化
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('开始监听DOM变化...');
    }

    // 主函数
    function init() {
        console.log('Google Trends 链接替换脚本已启动');
        
        // 等待页面基本结构加载完成
        waitForElement('body', () => {
            console.log('页面加载完成，开始处理链接...');
            
            // 初始替换
            setTimeout(() => {
                replaceRelatedQueryLinks();
            }, 1000);
            
            // 定期检查新的链接（Google Trends是动态加载内容）
            setInterval(() => {
                replaceRelatedQueryLinks();
            }, 2000);
            
            // 监听DOM变化
            observeChanges();
        });
    }

    // 页面加载完成后启动脚本
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();