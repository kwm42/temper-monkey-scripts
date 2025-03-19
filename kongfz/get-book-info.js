// ==UserScript==
// @name         书本信息获取
// @namespace    http://tampermonkey.net/
// @version      2025-03-19
// @description  try to take over the world!
// @author       You
// @match        https://item.kongfz.com/book/*.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=kongfz.com
// @grant        none
// ==/UserScript==

function countPrice() {
  const priceList = []
  document.querySelectorAll('.detail-list-con li.item-list')
    .forEach(li => {
      const bookmoneyElement = li.querySelector('.list-con-moneys')
      const shipfeeElement = li.querySelector('.ship-fee')
      if (!bookmoneyElement || !shipfeeElement) {
        return
      }
      const bookmoney = bookmoneyElement.firstElementChild.textContent.replace('￥', '')
      let shipfee = shipfeeElement.firstElementChild.textContent
      const pricePattern = /快递:\s*￥\s*(\d+\.?\d*)/;
      const match = shipfee.match(pricePattern);
      shipfee = match ? match[1] : undefined;

      const money = parseFloat(bookmoney)
      const ship = parseFloat(shipfee)

      if (isNaN(money) || isNaN(ship)) {
        return
      }

      priceList.push({
        money: money.toFixed(2),
        ship: ship.toFixed(2),
        total: (money + ship).toFixed(2)
      })
    })

  const lowestPrice = priceList[0].total
  const highestPrice = priceList[priceList.length - 1].total
  const averagePrice = (priceList.reduce((sum, item) => sum + parseFloat(item.total), 0) / priceList.length).toFixed(2)
  const top10Average = (priceList.slice(0, 10).reduce((sum, item) => sum + parseFloat(item.total), 0) / 10).toFixed(2)

  return {
    lowestPrice,
    highestPrice,
    averagePrice,
    top10Average
  }
}

function main() {
  'use strict';

  if (!/_10_4_1/.test(window.location.href)) {
    const url = window.location.href.replace('.html', '')
    window.location.href = url + '_10_4_1.html'
    return
  }

  // 提取标题
  const title = document.querySelector('h1.detail-title')?.textContent.trim() || '未找到标题';

  // 初始化信息对象
  const bookInfo = {
    作者: '未知',
    出版社: '未知',
    ISBN: '未知'
  };

  // 遍历基本信息条目
  document.querySelectorAll('.info-con-box.info-con-box-left .item').forEach(li => {
    const label = li.firstElementChild
    if (label.innerText.includes('作者')) {
      bookInfo.作者 = li.children[1].textContent.trim();
    }
    if (label.innerText.includes('出版社')) {
      bookInfo.出版社 = li.children[1].textContent.trim();
    }
    if (label.innerText.includes('ISBN')) {
      bookInfo.ISBN = li.children[1].textContent.trim();
    }
  });

  const priceInfo = countPrice()

  // 创建显示框
  const infoBox = document.createElement('div');
  infoBox.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 15px;
        border: 2px solid #007bff;
        border-radius: 5px;
        z-index: 9999;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    `;

  // 填充信息
  infoBox.innerHTML = `
        <h3 style="margin:0 0 10px;color:#007bff;">书籍信息</h3>
        <p><strong>标题：</strong>${title}</p>
        <p><strong>作者：</strong>${bookInfo.作者}</p>
        <p><strong>出版社：</strong>${bookInfo.出版社}</p>
        <p><strong>ISBN：</strong>${bookInfo.ISBN}</p>
        <h3 style="margin:20px 0 10px;color:#007bff;">价格信息</h3>
        <p><strong>最低最高价：</strong>￥${priceInfo.lowestPrice}   ${priceInfo.highestPrice}</p>
        <p><strong>平均价：</strong>￥${priceInfo.averagePrice}</p>
        <p><strong>前10平均价：</strong>￥${priceInfo.top10Average}</p>
        <p><strong>建议价格：</strong>￥${priceInfo.top10Average * 1.7}</p>
    `;

  // 添加到页面
  document.body.appendChild(infoBox);

  // 控制台输出
  console.log('提取到的书籍信息：', { 标题: title, ...bookInfo });
}

setTimeout(main, 1000);