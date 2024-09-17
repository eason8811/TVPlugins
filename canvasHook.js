// 保存原始的 fillRect 方法
const canvasNode1 = document.getElementsByClassName('chart-gui-wrapper')[0].children[0];
const ctx1 = canvasNode1.getContext('2d');
const originalFillRect1 = ctx1.fillRect;

const canvasNode2 = document.getElementsByClassName('chart-gui-wrapper')[0].children[1];
const ctx2 = canvasNode2.getContext('2d');
const originalFillRect2 = ctx2.fillRect;

// 保存原始的 fillText 方法
const timeAxiscanvasNode2 = document.getElementsByClassName('chart-markup-table time-axis')[0].children[0].children[1];
const timeAxisctx2 = timeAxiscanvasNode2.getContext('2d');
const originalTimeAxisFillText2 = timeAxisctx2.fillText;

// 保存原始的 fillText 方法
const priceAxiscanvasNode2 = document.getElementsByClassName('price-axis')[0].children[1];
const priceAxisctx2 = priceAxiscanvasNode2.getContext('2d');
const originalPriceAxisFillText2 = priceAxisctx2.fillText;

// 保存原始的 WebSocket 构造函数
const OriginalWebSocket = window.WebSocket;

window.toolsItem = {
    profitY: null,
    stopY: null,
    stopHeight: null,
};
window.currentToolIndex = -1;

let defaultWidth = getCache('toolsButtonWidth') ? getCache('toolsButtonWidth') : 75;
let defaultHeight = defaultWidth / 2;
let defaultRadius = 10;
let originCursor = canvasNode1.style.cursor;    // 原来的鼠标样式
let drawList = [];

let enterButton = null;

function getCache(key) {
    let cacheObj = JSON.parse(localStorage.getItem(key));
    if (cacheObj) {
        return cacheObj.value;
    }
    return null;
}

function parseDateStringWithOffset(inputStr, timeStr, timeZoneOffset) {
    // 定义一个函数，用于从解析的日期元素创建 Date 对象
    function createDate(year, month, day) {
        // JavaScript 中的月份是从 0 开始的（0 表示 1 月）
        return new Date(year, month - 1, day);
    }

    // 定义正则表达式来匹配不同的日期格式
    const patterns = [
        {regex: /^(\d{2}) (\d{1,2}) '(\d{2})$/, parse: (m) => createDate(1900 + parseInt(m[3]), m[2], m[1])}, // 29 9 '97 -> 1997-09-29
        {regex: /^(\d{1,2})月 (\d{1,2})$/, parse: (m) => createDate(new Date().getFullYear(), m[1], m[2])}, // 9月 29 -> 当前年-09-29
        {regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, parse: (m) => createDate(m[1], m[2], m[3])}, // 1997-09-29 -> 1997-09-29
        {regex: /^(\d{2})\/(\d{1,2})\/(\d{4})$/, parse: (m) => createDate(m[3], m[2], m[1])}, // 29/09/1997 -> 1997-09-29
        {regex: /^(\d{2})\/(\d{1,2})\/'(\d{2})$/, parse: (m) => createDate(1900 + parseInt(m[3]), m[2], m[1])}, // 29/9/'97 -> 1997-09-29
        {regex: /^(\d{1,2})月 (\d{1,2}), (\d{4})$/, parse: (m) => createDate(m[3], m[1], m[2])}, // 9月 29, 1997 -> 1997-09-29
        {regex: /^(\d{2})\/(\d{2})\/(\d{2})$/, parse: (m) => createDate(2000 + parseInt(m[1]), m[2], m[3])}, // 97/09/29 -> 1997-09-29
        {regex: /^(\d{2})-(\d{1,2})-(\d{4})$/, parse: (m) => createDate(m[3], m[2], m[1])}, // 29-09-1997 -> 1997-09-29
        {regex: /^(\d{2})-(\d{1,2})-'(\d{2})$/, parse: (m) => createDate(1900 + parseInt(m[3]), m[2], m[1])}, // 29-9-'97 -> 1997-09-29
    ];

    let date = null;

    // 遍历所有可能的格式，找到匹配的日期格式
    for (let pattern of patterns) {
        const match = inputStr.match(pattern.regex);
        if (match) {
            date = pattern.parse(match);
            break;
        }
    }

    // 如果没有匹配到日期格式，则返回错误
    if (!date) {
        throw new Error("无法解析日期字符串：" + inputStr);
    }

    // 处理时间部分并设定时区
    const timePattern = /^\d{2}:\d{2}$/;
    if (timePattern.test(timeStr)) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        date.setHours(hours);
        date.setMinutes(minutes);
    }

    // 将时区偏移量转换为毫秒 (1小时 = 3600000毫秒)
    const offsetInMs = 0;

    // 获取UTC时间戳
    const utcTimestamp = date.getTime();

    // 将时间戳调整为指定时区的时间戳
    return utcTimestamp - offsetInMs;
}

function rgbaToHex(rgba) {
    // 提取 r, g, b, a 值
    const parts = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),?\s*(\d*\.?\d+)?\)/);

    if (!parts) {
        return rgba;

    }

    const r = parseInt(parts[1], 10);
    const g = parseInt(parts[2], 10);
    const b = parseInt(parts[3], 10);
    // const a = parseFloat(parts[4] || 1); // 透明度值，默认是1

    // 将 r, g, b 转换为 16 进制并拼接
    const hex = (
        (1 << 24) +
        (r << 16) +
        (g << 8) +
        b
    ).toString(16).slice(1).toUpperCase();

    return `#${hex}`;
}

function getToolItemIndex(x, y) {
    // window.toolItemList = window.toolItemList.sort((a, b) => a.x - b.x);
    for (let i = 0; i < window.toolItemList.length; i++) {
        const toolItem = window.toolItemList[i];
        if (toolItem.x === x && toolItem.profitY === y)
            return i
    }
}

function draw(ctx, x, y, width, height, radius, toolAndButtonInfo) {
    // x: 横坐标, y: 纵坐标, width: 宽度, height: 高度, radius: 圆角半径
    // 绘制下单按钮
    enterButton = {
        height: defaultHeight,
        width: defaultWidth,
        opened: false,
    };
    ctx.save();

    let buttonX, buttonY;

    let isLong = window.toolsItem['stopY'] >= window.toolsItem['profitY'];
    if (isLong) {
        // 代表当前是多头工具
        buttonX = x + width;
        buttonY = window.toolsItem['stopY'] - enterButton.height / 2;
    } else {
        // 代表当前是空头工具
        buttonX = x + width;
        buttonY = y - enterButton.height / 2;
    }

    enterButton.buttonX = buttonX;
    enterButton.buttonY = buttonY;
    toolAndButtonInfo.buttonX = buttonX;
    toolAndButtonInfo.buttonY = buttonY;


    // 绘制左半部分（绿色），中间无圆角
    ctx.beginPath();
    ctx.moveTo(buttonX + radius, buttonY);  // 左上角
    ctx.lineTo(buttonX + enterButton.width / 2, buttonY);  // 上边中点
    ctx.lineTo(buttonX + enterButton.width / 2, buttonY + enterButton.height);  // 下边中点
    ctx.lineTo(buttonX + radius, buttonY + enterButton.height);  // 左下角
    ctx.arcTo(buttonX, buttonY + enterButton.height, buttonX, buttonY + enterButton.height - radius, radius);  // 左下角圆角
    ctx.lineTo(buttonX, buttonY + radius);  // 左边
    ctx.arcTo(buttonX, buttonY, buttonX + radius, buttonY, radius);  // 左上角圆角
    ctx.closePath();
    ctx.fillStyle = isLong ? window.longToolColor !== null ? window.longToolColor['profitColor'] : window.shortToolColor !== null ? window.shortToolColor['profitColor'] : '#ffffff' : window.shortToolColor !== null ? window.shortToolColor['profitColor'] : '#ffffff';
    ctx.fillStyle = rgbaToHex(ctx.fillStyle);

    // 当当前绘画的时最后一个组件时，检测最后一个组件的索引
    let buttonColorControl = false;

    if (buttonColorControl) {
        ctx.fillStyle = 'rgba(96, 100, 111, 1)';
    }
    ctx.fill();
    ctx.strokeStyle = isLong ? window.longToolColor !== null ? window.longToolColor['lineColor'] : window.shortToolColor !== null ? window.shortToolColor['lineColor'] : '#000000' : window.shortToolColor !== null ? window.shortToolColor['lineColor'] : '#000000';
    ctx.strokeStyle = rgbaToHex(ctx.strokeStyle);
    ctx.stroke();

    // 绘制右半部分（红色），中间无圆角
    ctx.beginPath();
    ctx.moveTo(buttonX + enterButton.width / 2, buttonY);  // 上边中点
    ctx.lineTo(buttonX + enterButton.width - radius, buttonY);  // 右上角
    ctx.arcTo(buttonX + enterButton.width, buttonY, buttonX + enterButton.width, buttonY + radius, radius);  // 右上角圆角
    ctx.lineTo(buttonX + enterButton.width, buttonY + enterButton.height - radius);  // 右边
    ctx.arcTo(buttonX + enterButton.width, buttonY + enterButton.height, buttonX + enterButton.width - radius, buttonY + enterButton.height, radius);  // 右下角圆角
    ctx.lineTo(buttonX + enterButton.width / 2, buttonY + enterButton.height);  // 下边中点
    ctx.closePath();
    ctx.fillStyle = isLong ? window.longToolColor !== null ? window.longToolColor['stopColor'] : window.shortToolColor !== null ? window.shortToolColor['stopColor'] : '#ffffff' : window.shortToolColor !== null ? window.shortToolColor['stopColor'] : '#ffffff';
    ctx.fillStyle = rgbaToHex(ctx.fillStyle);
    if (!buttonColorControl) {
        ctx.fillStyle = 'rgba(96, 100, 111, 1)';
    }
    ctx.fill();
    ctx.stroke();

    // 绘制中间的分割线
    ctx.beginPath();
    ctx.moveTo(buttonX + enterButton.width / 2, buttonY + 2);
    ctx.lineTo(buttonX + enterButton.width / 2, buttonY - 2 + enterButton.height);
    ctx.lineWidth = 2;
    // ctx.strokeStyle = isLong ? window.longToolColor['lineColor'] ? window.longToolColor['lineColor'] : window.shortToolColor['lineColor'] ? window.shortToolColor['lineColor'] : '#000000' : window.shortToolColor['lineColor'] ? window.shortToolColor['lineColor'] : '#000000';
    ctx.stroke();

    // 在左侧绘制对号，尖端向下，开口向上
    ctx.beginPath();
    ctx.moveTo(buttonX + enterButton.width / 4 - 5, buttonY + enterButton.height / 2 - 2);  // 顶部左边
    ctx.lineTo(buttonX + enterButton.width / 4, buttonY + enterButton.height / 2 + 6);  // 尖端
    ctx.lineTo(buttonX + enterButton.width / 4 + 10, buttonY + enterButton.height / 2 - 6);  // 顶部右边
    ctx.strokeStyle = isLong ? window.longToolColor !== null ? window.longToolColor['textColor'] : window.shortToolColor !== null ? window.shortToolColor['textColor'] : '#000000' : window.shortToolColor !== null ? window.shortToolColor['textColor'] : '#000000';
    ctx.strokeStyle = rgbaToHex(ctx.strokeStyle);
    ctx.lineWidth = 2;
    ctx.stroke();

    // 在右侧绘制叉号
    ctx.beginPath();
    ctx.moveTo(buttonX + 3 * enterButton.width / 4 - 5, buttonY + enterButton.height / 2 - 5);
    ctx.lineTo(buttonX + 3 * enterButton.width / 4 + 5, buttonY + enterButton.height / 2 + 5);
    ctx.moveTo(buttonX + 3 * enterButton.width / 4 + 5, buttonY + enterButton.height / 2 - 5);
    ctx.lineTo(buttonX + 3 * enterButton.width / 4 - 5, buttonY + enterButton.height / 2 + 5);
    // ctx.strokeStyle = isLong ? window.longToolColor['textColor'] ? window.longToolColor['textColor'] : window.shortToolColor['textColor'] ? window.shortToolColor['textColor'] : '#000000' : window.shortToolColor['textColor'] ? window.shortToolColor['textColor'] : '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    window.toolsItem['stopY'] = null;
    window.toolsItem['profitY'] = null;
    ctx.restore();
}

function mouseMoveEvent(event) {
    // window.currentToolIndex = -1;
    const rect = this.getBoundingClientRect();

    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    let cursorInRight = false;
    let cursorInCancle = false;
    for (let i = 0; i < window.toolItemList.length; i++) {
        const buttonX = window.toolItemList[i].buttonX;
        const buttonY = window.toolItemList[i].buttonY;
        cursorInRight = cursorInRight || (mouseX > buttonX && mouseX < buttonX + enterButton.width / 2 && mouseY > buttonY && mouseY < buttonY + enterButton.height);
        cursorInCancle = cursorInCancle || (mouseX > buttonX + enterButton.width / 2 && mouseX < buttonX + enterButton.width && mouseY > buttonY && mouseY < buttonY + enterButton.height);
    }

    let buttonList = Object.values(window.buttonList);
    for (let i = 0; i < buttonList.length; i++) {
        if (buttonList[i].timestamp_start * 1000 <= window.currentCursorTimestamp && window.currentCursorTimestamp <= buttonList[i].timestamp_end * 1000
            && (buttonList[i].side === 'short' ? (buttonList[i].profit <= window.currentCursorPrice && window.currentCursorPrice <= buttonList[i].stop) : (buttonList[i].profit >= window.currentCursorPrice && window.currentCursorPrice >= buttonList[i].stop))) {
            window.currentToolIndex = i;
            break;
        }
    }
    let outsideTool = true;
    for (let i = 0; i < buttonList.length; i++) {
        outsideTool = outsideTool && !(buttonList[i].timestamp_start * 1000 <= window.currentCursorTimestamp && window.currentCursorTimestamp <= buttonList[i].timestamp_end * 1000
            && (buttonList[i].side === 'short' ? (buttonList[i].profit <= window.currentCursorPrice && window.currentCursorPrice <= buttonList[i].stop) : (buttonList[i].profit >= window.currentCursorPrice && window.currentCursorPrice >= buttonList[i].stop)));
    }
    if (outsideTool)
        window.currentToolIndex = -1;
    // console.log(window.currentToolIndex);

    let mouseInStyle = ['pointer', 'not-allowed'];
    originCursor = mouseInStyle.includes(this.style.cursor) ? originCursor : this.style.cursor;

    if (cursorInRight) {
        this.style.cursor = enterButton.opened ? 'not-allowed' : 'pointer';
    } else if (cursorInCancle) {
        this.style.cursor = enterButton.opened ? 'pointer' : 'not-allowed';
    } else {
        this.style.cursor = originCursor;
    }
}

function clickEvent(event) {
    const rect = this.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const buttonX = this.width / 2 - enterButton.width / 2;
    const buttonY = this.height / 2 - enterButton.height / 2;

    if (mouseX > buttonX && mouseX < buttonX + enterButton.width / 2 &&
        mouseY > buttonY && mouseY < buttonY + enterButton.height) {
        if (!enterButton.opened) {
            console.log('下单按钮被点击');
        }
    } else if (mouseX > buttonX + enterButton.width / 2 && mouseX < buttonX + enterButton.width &&
        mouseY > buttonY && mouseY < buttonY + enterButton.height) {
        if (enterButton.opened) {
            console.log('取消按钮被点击');
        }
    }
}

// 事件监听器
function setupEventListeners(canvas) {
    canvas.addEventListener('mousemove', mouseMoveEvent);
    canvas.addEventListener('click', clickEvent);
}

function hooks() {
    setupEventListeners(canvasNode1);
    setupEventListeners(canvasNode2);
    // 覆盖 fillRect 方法
    ctx1.fillRect = function (x, y, width, height) {
        if (x === 0 && y === 0) {
            // 记录工具列表
            window.toolItemList = [];
            drawList = [];
        }

        drawList.push([x, y, width, height]);

        // 颜色识别当前为多头工具的止损
        if (window.longToolColor && ctx1.fillStyle === window.longToolColor.stopColor) {
            window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
            window.toolsItem['stopHeight'] = height;            // 记录止损的高度
            originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
            // 颜色识别当前为多头工具的止盈
        } else if (window.longToolColor && ctx1.fillStyle === window.longToolColor.profitColor && window.toolsItem['stopY']) {
            window.toolsItem['profitY'] = y;                    // 记录止盈的绘图位置
            originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
            let toolAndButtonInfo = {
                x: x,
                profitY: y,
                stopY: window.toolsItem['stopY'],
                width: width,
                profitHeight: height,
                stopHeight: window.toolsItem['stopHeight'],
                side: window.toolsItem['stopY'] >= y ? 'long' : 'short',
            };
            window.toolItemList.push(toolAndButtonInfo);
            // console.log(x, y, width, height);
            draw(ctx1, x, y, width, height, defaultRadius, toolAndButtonInfo);        // 绘制下单按钮
            // 颜色识别当前为空头工具的止损
        } else if (window.shortToolColor && ctx1.fillStyle === window.shortToolColor.stopColor) {
            window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
            originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
            // 颜色识别当前为空头工具的止盈
        } else if (window.shortToolColor && ctx1.fillStyle === window.shortToolColor.profitColor && window.toolsItem['stopY']) {
            window.toolsItem['profitY'] = y;
            originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
            let toolAndButtonInfo = {
                x: x,
                profitY: y,
                stopY: window.toolsItem['stopY'],
                width: width,
                profitHeight: height,
                stopHeight: window.toolsItem['stopHeight'],
                side: window.toolsItem['stopY'] >= y ? 'long' : 'short',
            };
            window.toolItemList.push(toolAndButtonInfo);
            draw(ctx1, x, y, width, height, defaultRadius, toolAndButtonInfo);        // 绘制下单按钮
        } else {
            originalFillRect1.call(this, x, y, width, height);
        }
    };

    // 覆盖 fillRect 方法
    ctx2.fillRect = function (x, y, width, height) {
        if (x === 0 && y === 0) {
            // 记录工具列表
            window.toolItemList = [];
        }
        // 颜色识别当前为多头工具的止损
        if (window.longToolColor && ctx2.fillStyle === window.longToolColor.stopColor) {
            window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
            originalFillRect2.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
            // 颜色识别当前为多头工具的止盈
        } else if (window.longToolColor && ctx2.fillStyle === window.longToolColor.profitColor && window.toolsItem['stopY']) {
            window.toolsItem['profitY'] = y;                    // 记录止盈的绘图位置
            originalFillRect2.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
            let toolAndButtonInfo = {
                x: x,
                profitY: y,
                stopY: window.toolsItem['stopY'],
                width: width,
                profitHeight: height,
                stopHeight: window.toolsItem['stopHeight'],
                side: window.toolsItem['stopY'] >= y ? 'long' : 'short',
            };
            window.toolItemList.push(toolAndButtonInfo);
            draw(ctx2, x, y, width, height, defaultRadius, toolAndButtonInfo);        // 绘制下单按钮
            // 颜色识别当前为空头工具的止损
        } else if (window.shortToolColor && ctx2.fillStyle === window.shortToolColor.stopColor) {
            window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
            originalFillRect2.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
            // 颜色识别当前为空头工具的止盈
        } else if (window.shortToolColor && ctx2.fillStyle === window.shortToolColor.profitColor && window.toolsItem['stopY']) {
            window.toolsItem['profitY'] = y;
            originalFillRect2.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
            let toolAndButtonInfo = {
                x: x,
                profitY: y,
                stopY: window.toolsItem['stopY'],
                width: width,
                profitHeight: height,
                stopHeight: window.toolsItem['stopHeight'],
                side: window.toolsItem['stopY'] >= y ? 'long' : 'short',
            };
            window.toolItemList.push(toolAndButtonInfo);
            draw(ctx2, x, y, width, height, defaultRadius, toolAndButtonInfo);        // 绘制下单按钮
        } else {
            originalFillRect2.call(this, x, y, width, height);
        }
    };

    // 重写 fillText 方法
    timeAxisctx2.fillText = function (text, x, y, maxWidth) {
        // 在这里可以执行你自己的逻辑，例如打印出文本或修改它
        // console.log("Hooked fillText(2):", text, x, y, maxWidth);
        let date = text.split('   ')[0];
        let firstSpaceIndex = date.indexOf(' ');
        date = date.substring(firstSpaceIndex + 1);
        let time = text.split('   ')[1];
        let timeZone = parseInt(document.getElementsByClassName('inline-BXXUwft2')[0].children[0].children[0].children[0].innerHTML.match(/\(UTC([+-]\d{1,2})\)/)[1])
        window.currentCursorTimestamp = parseDateStringWithOffset(date, time, timeZone);
        // console.log(new Date(window.currentCursorTimestamp));
        // 调用原始的 fillText 方法
        originalTimeAxisFillText2.call(this, text, x, y, maxWidth);
    };

    // 重写 fillText 方法
    priceAxisctx2.fillText = function (text, x, y, maxWidth) {
        // 在这里可以执行你自己的逻辑，例如打印出文本或修改它
        // console.log("Hooked fillText(2):", text, x, y, maxWidth);
        window.currentCursorPrice = parseFloat(text.replace(/,/g, ''));
        // 调用原始的 fillText 方法
        originalPriceAxisFillText2.call(this, text, x, y, maxWidth);
    };
}

function restore() {
    ctx1.fillRect = originalFillRect1;
    ctx2.fillRect = originalFillRect2;
    timeAxisctx2.fillText = originalTimeAxisFillText2;
    priceAxisctx2.fillText = originalPriceAxisFillText2;
}

let lastValueToolsButton = undefined;
let lastValueToolsButtonWidth = undefined;

setInterval(function () {
    const newValueToolsButton = localStorage.getItem('toolsButton');
    const newValueToolsButtonWidth = localStorage.getItem('toolsButtonWidth');

    if (newValueToolsButtonWidth !== lastValueToolsButtonWidth) {
        // toolsButtonWidth改变，就改变defaultWidth的值
        defaultWidth = JSON.parse(newValueToolsButtonWidth).value;
        defaultHeight = defaultWidth / 2;
        lastValueToolsButtonWidth = newValueToolsButtonWidth;
    }

    if (newValueToolsButton !== lastValueToolsButton) {
        // toolsButton开启，就hook函数
        if (JSON.parse(newValueToolsButton).value) {
            console.log('toolsButton开启，hook完成');
            hooks();
        } else {
            console.log('toolsButton关闭，恢复原始函数');
            restore();
        }
        lastValueToolsButton = newValueToolsButton;
    }

}, 500); // 每秒检查一次
