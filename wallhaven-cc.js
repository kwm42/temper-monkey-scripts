// ==UserScript==
// @name         Wallhaven Hover Preview
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  鼠标悬停显示Wallhaven大图预览
// @author       You
// @match        https://wallhaven.cc/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=wallhaven.cc
// @grant        GM_addStyle
// ==/UserScript==

(function() {
    'use strict';

    // 添加自定义样式
    GM_addStyle(`
        .preview-container {
            position: absolute;
            z-index: 9999;
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
            border-radius: 5px;
            overflow: auto;
            pointer-events: none;
        }
        .preview-image {
            max-width: 100%;
            height: 100%;
            object-fit: contain;
        }
        .switch-button {
            position: fixed;
            z-index: 9999;
            left: 0;
            bottom: 0;
            background: none;
            border: none;
        }
    `);

    let hoverTimer;
    let previewContainer;

    function switchVertical() {
        document.querySelectorAll('figure.thumb').forEach(f => {
            f.style.height = '400px'
            const img = f.querySelector('img')
            img.src = img.src.replace('small', 'orig')
            img.style.width = 'auto'
            img.style.height = '100%';
        })
    }

    function checkIsVertical(thumbnail){
        const wallres = thumbnail.querySelector('.wall-res')
        const resolutionString = wallres.innerHTML;

        // 使用正则表达式提取宽度和高度
        const match = resolutionString.match(/(\d+)\s*x\s*(\d+)/);

        if (match) {
            const width = parseInt(match[1], 10);
            const height = parseInt(match[2], 10);

            if (width > height) {
                return false
            } else if (width < height) {
                return true
            }
        } else {
            return false
        }
    }

    function createPreview() {
        previewContainer = document.createElement('div');
        previewContainer.className = 'preview-container';
        const img = document.createElement('img');
        img.className = 'preview-image';
        previewContainer.appendChild(img);
        document.body.appendChild(previewContainer);
        return previewContainer;
    }

    function createButton() {
        const button = document.createElement('button');
        button.className = 'switch-button';
        button.innerText = '切换横竖屏'
        document.body.appendChild(button);
        button.addEventListener('click', () => {
            window.onscrollend = switchVertical
        })
        return button;
    }

    function getFullSizeUrl(thumbElement) {
        const thumbnail = thumbElement.querySelector('img');
        const thumbnailUrl = thumbnail.src
        const pathParts = thumbnailUrl.split('/');
        const category = pathParts[4];
        const filename = pathParts[5].split('.')[0];
        let ext = 'jpg'
        if (thumbElement.querySelector('.thumb-info .png')) {
            ext = 'png'
        }
        return `https://w.wallhaven.cc/full/${category}/wallhaven-${filename}.${ext}`;

        //return thumbnailUrl.replace('small', 'orig')
    }

    function positionPreview(element, width) {
        const rect = element.getBoundingClientRect();
        if (rect.right + width + 100 > window.innerWidth) {
            previewContainer.style.left = `${rect.left + window.scrollX - width - 10}px`;
            previewContainer.style.top = `${rect.top + window.scrollY}px`;
        } else {
            previewContainer.style.left = `${rect.right + window.scrollX + 10}px`;
            previewContainer.style.top = `${rect.top + window.scrollY}px`;
        }
    }

    function handleMouseEnter(event) {
        const thumbElement = event.target.closest('figure.thumb');
        if (!thumbElement) return;

        const thumbnail = thumbElement.querySelector('img');
        if (!thumbnail) return;

        const isVertical = checkIsVertical(thumbElement)

        if (!previewContainer) createPreview();
        let width = 1200;
        if(isVertical) {
            width = 600;
        }
        previewContainer.style.width = `${width}px`;

        hoverTimer = setTimeout(async () => {
            if (!previewContainer) createPreview();

            const fullUrl = getFullSizeUrl(thumbElement);
            const img = previewContainer.querySelector('img');

            img.src = fullUrl;
            positionPreview(thumbElement, width);

            previewContainer.style.display = 'block';
        }, 1000);
    }

    function handleMouseLeave() {
        clearTimeout(hoverTimer);
        if (previewContainer) {
            previewContainer.style.display = 'none';
            previewContainer.querySelector('img').src = '';
        }
    }

    function init() {
        const observer = new MutationObserver(mutations => {
            bindEvents();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        bindEvents();
        createButton();
        createPreview();
    }

    function bindEvents() {
        const items = document.querySelectorAll('figure.thumb');
        items.forEach(item => {
            item.addEventListener('mouseenter', handleMouseEnter);
            item.addEventListener('mouseleave', handleMouseLeave);
            item.addEventListener('mousemove', positionPreview);
        });
    }


    window.addEventListener('load', init);
})();