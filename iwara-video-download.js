// ==UserScript==
// @name         iwara 下载
// @namespace    http://tampermonkey.net/
// @version      2025-04-23
// @description  try to take over the world!
// @author       You
// @match        https://www.iwara.tv/video/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=iwara.tv
// @grant        none
// ==/UserScript==


(function() {
    'use strict';

    // 创建并返回一个美观的按钮元素
    function createButton() {
        const button = document.createElement('button');
        button.innerHTML = 'xxx';
        button.id = 'MonkeyButton1';

        // 设置按钮样式
        button.style.position = 'fixed';
        button.style.top = '50%';
        button.style.right = '0';
        button.style.transform = 'translateY(-50%)';
        button.style.zIndex = '9999';
        button.style.padding = '10px 15px';
        button.style.backgroundColor = '#4CAF50';
        button.style.color = 'white';
        button.style.border = 'none';
        button.style.borderRadius = '5px 0 0 5px';
        button.style.cursor = 'pointer';
        button.style.boxShadow = '-2px 2px 5px rgba(0,0,0,0.2)';
        button.style.fontSize = '14px';
        button.style.fontWeight = 'bold';
        button.style.transition = 'all 0.3s ease';

        // 添加悬停效果
        button.addEventListener('mouseover', function() {
            this.style.backgroundColor = '#45a049';
            this.style.paddingRight = '20px';
        });

        button.addEventListener('mouseout', function() {
            this.style.backgroundColor = '#4CAF50';
            this.style.paddingRight = '15px';
        });

        return button;
    }

    // 显示当前时间的函数
    function downloadSourceVideo() {
        const $video = document.querySelector('.videoPlayer .video-js .vjs-tech')
        const videoUrl = $video.getAttribute('src')
        window.open(videoUrl)
    }

    // 主函数
    function init() {
        const button = createButton();
        button.addEventListener('click', downloadSourceVideo);
        document.body.appendChild(button);
    }

    // 初始化
    init();
})();