// ==UserScript==
// @name         孔夫子书籍信息提取增强版
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  提取书籍信息并添加复制功能
// @author       YourName
// @match        *://item.kongfz.com/book/*
// @grant        none
// ==/UserScript==

function objToEntry (obj){
  return Object.entries(obj).map(([key, value]) => `${key}@${value}`).join('$$')
}

function entryToObj (entry){
  return entry.split('$$').reduce((obj, item) => {
    const [key, value] = item.split('@')
    obj[key] = value
    return obj
  }, {})
}

function countPrice() {
  let priceList = []
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

  if (priceList.length === 0) {
    return {}
  }
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

  // 提取书籍信息函数
  function extractBookInfo() {
    const title = document.querySelector('h1.detail-title')?.textContent.trim() || '未找到标题';

    // 初始化信息对象
    const bookInfo = {
      title,
      author: '未知',
      publisher: '未知',
      ISBN: '未知'
    };

    // 遍历基本信息条目
    document.querySelectorAll('.info-con-box.info-con-box-left .item').forEach(li => {
      const label = li.firstElementChild
      if (label.innerText.includes('作者')) {
        bookInfo.author = li.children[1].textContent.trim().replace(/\s+/g, ' ');
      }
      if (label.innerText.includes('出版社')) {
        bookInfo.publisher = li.children[1].textContent.trim();
      }
      if (label.innerText.includes('ISBN')) {
        bookInfo.ISBN = li.children[1].textContent.trim();
      }
    });
    return bookInfo;
  }

  // 创建信息显示框
  function createInfoBox(info) {
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
            width: 400px;
        `;

    let priceInfo = countPrice()

    let recommendPrice = priceInfo.top10Average * 1.7
    if (recommendPrice - 0.5 < recommendPrice) {
      recommendPrice = Math.floor(recommendPrice) + 0.5
    } else {
      recommendPrice = Math.floor(recommendPrice) + 1
    }

    info.recommendPrice = recommendPrice
    info.标题 = `二手正版《${info.title}》${info.author} ${info.publisher}`
    info.desc = `
【包邮】在售就是还有货，可以直接拍，择优发货，仓库随机发货，非偏远地区包邮。

【发货】拍下后一般24小时内发货，最晚不超过48小时。

【成色】一般为8到9.5成新，择优发货，一般没有笔记划线，也没有破损缺页

【找书】有大量书籍未上架，如果需要可以点击"我想要"联系，最后提供ISBN编码

【售后】有问题可以联系客服退货，非质量问题的话不退不换`


    infoBox.innerHTML = `
            <h3 style="margin:0 0 0px;color:#007bff;">书籍信息</h3>
            ${createInfoItem('标题', info.title)}
            ${createInfoItem('作者', info.author)}
            ${createInfoItem('出版社', info.publisher)}
            ${createInfoItem('ISBN', info.ISBN)}
            ${createInfoItem('title', info.标题)}
            ${createInfoItem('desc', info.desc, { spanDisplay: 'none' })}
            ${createInfoItem('info', objToEntry(info), { spanDisplay: 'none' })}

            <h3 style="margin:0 0 0px;color:#007bff;">价格信息</h3>
            ${createInfoItem('最低/最高', priceInfo.lowestPrice + ' / ' + priceInfo.highestPrice)}
            ${createInfoItem('平均价格', priceInfo.averagePrice)}
            ${createInfoItem('前10平均', priceInfo.top10Average)}
            ${createInfoItem('建议价格', recommendPrice)}
        `;

    document.body.appendChild(infoBox);
    addCopyButtons(infoBox);
  }

  // 创建带复制按钮的信息项
  function createInfoItem(label, value, option) {
    return `
            <div class="info-item" style="margin:2px 0;display:flex;align-items:center;">
                <strong style="flex:0 0 90px;">${label}：</strong>
                <span style="flex:1;margin:0 10px;word-break:break-all;display: ${option?.spanDisplay || 'block'}">${value}</span>
                <button
                    class="copy-btn"
                    data-value="${value}"
                    style="flex:0 0 auto;padding:2px 8px;background:#007bff;color:white;border:none;border-radius:3px;cursor:pointer;">
                    复制
                </button>
            </div>
        `;
  }

  // 添加复制功能
  function addCopyButtons(container) {
    const buttons = container.querySelectorAll('.copy-btn');
    buttons.forEach(btn => {
      btn.addEventListener('click', function () {
        const value = this.dataset.value;
        copyToClipboard(value).then(() => {
          showFeedback('已复制到剪贴板');
        }).catch(() => {
          showFeedback('复制失败');
        });
      });
    });
  }

  // 剪贴板操作
  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // 降级方案
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    }
  }

  // 显示反馈提示
  function showFeedback(message) {
    const feedback = document.createElement('div');
    feedback.textContent = message;
    feedback.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #4CAF50;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            z-index: 10000;
            animation: fadeOut 2s forwards;
        `;

    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 2000);
  }

  // 初始化执行
  const priceInfo = countPrice()
  const bookInfo = extractBookInfo();
  createInfoBox({
    ...bookInfo,
    ...priceInfo
  });
}



(function () {
  if (!/_10_4_1/.test(window.location.href)) {
    const url = window.location.href.replace('.html', '')
    window.location.href = url + '_10_4_1.html'
    return
  }
  window.onload = main;
})();
