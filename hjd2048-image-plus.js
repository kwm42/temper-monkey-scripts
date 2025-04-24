// ==UserScript==
// @name         hjd2048-image-plus
// @namespace    http://tampermonkey.net/
// @version      2025-04-24
// @description  替换预览图地址，改变图片大小
// @author       You
// @match        https://hjd2048.com/2048/simple/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=hjd2048.com
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  document.querySelectorAll('.att_img .preview-img').forEach(img => {
    img.src = img.getAttribute('data-original')
    img.setAttribute('style', `
          width: 500px;
          height: 500px;
          object-fit:contain;
        `)
  })
})();