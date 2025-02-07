// ==UserScript==
// @name         自动浏览
// @namespace    http://tampermonkey.net/
// @version      2024-12-18
// @description  try to take over the world!
// @author       You
// @match        https://18comic.vip/photo/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=18comic.vip
// @grant        none
// ==/UserScript==

/**
 * 自动浏览漫画
 */

let speed = 8
let taskStatus = false
let $logText

const log = (option) => {
  console.log('【自动脚本】==> ' + option?.text)
  $logText.innerText = option?.text
}

function nextChapter() {
  const nextBtn = document.querySelector('.menu-bolock-ul .fa.fa-angle-double-right')
  nextBtn.click()
}

function autoScroll() {
  document.documentElement.scrollTop += speed
}

function scrollTick() {
  if (!taskStatus) {
    return
  }
  const topMargin = 1000
  const panelHeight = document.querySelector('.panel.panel-default').scrollHeight
  if (document.documentElement.scrollTop + topMargin < panelHeight) {
    autoScroll()
    requestAnimationFrame(scrollTick)
  } else {
    nextChapter()

    //setTimeout(() => {
    //  start()
    //}, 5000)
  }
}


const start = () => {
  taskStatus = true
  scrollTick()
  log({ text: '开始' })
}

const stop = () => {
  taskStatus = false
  log({ text: '停止' })
}

const accelerate = () => {
  speed += 0.5
  log({ text: `加速, 当前速度${speed.toFixed(1)}` })
}

const decelerate = () => {
  speed -= 0.3
  log({ text: `减速, 当前速度${speed.toFixed(1)}` })
}

/**按钮=================================== */

const createButton = (option) => {
  let $btn = document.createElement('button')
  $btn.innerText = option.text
  $btn.style.position = 'fixed'
  $btn.style.top = option.top || '50%'
  $btn.style.left = option.left || '50%'
  $btn.style.zIndex = '9999'
  $btn.style.backgroundColor = '#409eff'
  $btn.style.color = '#fff'
  $btn.style.border = 'none'
  $btn.style.padding = '10px 20px'
  $btn.style.borderRadius = '5px'
  $btn.style.cursor = 'pointer'
  $btn.style.transform = 'translate(50%, -50%)'
  $btn.onclick = option.click
  return $btn
}

const initButton = () => {
  // 开始点赞
  let $startBtn = createButton({
    text: '开始',
    click: start,
    top: '500px',
    left: '0px'
  })

  // 停止点赞
  let $stopBtn = createButton({
    text: '停止',
    click: stop,
    top: '550px',
    left: '0px'
  })

  // 停止点赞
  let $accelerateBtn = createButton({
    text: '加速',
    click: accelerate,
    top: '600px',
    left: '0px'
  })

  // 停止点赞
  let $decreaseBtn = createButton({
    text: '减速',
    click: decelerate,
    top: '650px',
    left: '0px'
  })

  document.body.appendChild($startBtn)
  document.body.appendChild($stopBtn)
  document.body.appendChild($decreaseBtn)
  document.body.appendChild($accelerateBtn)
}

const createLogText = (option) => {
  $logText = document.createElement('div')
  $logText.innerText = option.text
  $logText.style.position = 'fixed'
  $logText.style.maxWidth = '150px'
  $logText.style.top = option.top || '50%'
  $logText.style.left = option.left || '50%'
  $logText.style.zIndex = '9999'
  $logText.style.color = option.color || 'white'
  return $logText
}

const initLogText = () => {
  let $logText = createLogText({
    text: '',
    top: '700px',
    left: '0px',
    color: '#333'
  })

  document.body.appendChild($logText)
}

function createUI() {
  initButton()
  initLogText()
}

createUI()

setTimeout(start, 3000)
