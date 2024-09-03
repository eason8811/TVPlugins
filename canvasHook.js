// 保存原始的 fillRect 方法
const canvasNode1 = document.getElementsByClassName('chart-gui-wrapper')[0].children[0];
const ctx1 = canvasNode1.getContext('2d');
const originalFillRect1 = ctx1.fillRect;

const canvasNode2 = document.getElementsByClassName('chart-gui-wrapper')[0].children[1];
const ctx2 = canvasNode2.getContext('2d');
const originalFillRect2 = ctx2.fillRect;

window.toolsItem = {
    profitY: null,
    stopY: null
};

let defaultMaxWidth = 110;
let defaultMinWidth = 75;
let defaultMaxHeight = 55;
let defaultMinHeight = 37.5;
let widthRatio = 0.5;
let heightRatio = 0.3;
let defaultRadius = 10;

let enterButton = {};

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

function draw(ctx, x, y, width, height, radius) {
    // 绘制下单按钮
    enterButton = {
        height: Math.min(Math.max(defaultMinHeight, widthRatio * height), defaultMaxHeight),
        width: Math.min(Math.max(defaultMinWidth, heightRatio * width, 2 * this.height), defaultMaxWidth),
        opened: false,
        buttonX: 0,
        buttonY: 0
    };
    enterButton.width = Math.min(Math.max(defaultMinWidth, heightRatio * width, 2 * enterButton.height), defaultMaxWidth);
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
    ctx.fillStyle = isLong ? window.longToolColor['profitColor'] ? window.longToolColor['profitColor'] : window.shortToolColor['profitColor'] ? window.shortToolColor['profitColor'] : '#ffffff' : window.shortToolColor['profitColor'] ? window.shortToolColor['profitColor'] : '#ffffff';
    ctx.fillStyle = rgbaToHex(ctx.fillStyle);
    ctx.fill();
    ctx.strokeStyle = isLong ? window.longToolColor['lineColor'] ? window.longToolColor['lineColor'] : window.shortToolColor['lineColor'] ? window.shortToolColor['lineColor'] : '#000000' : window.shortToolColor['lineColor'] ? window.shortToolColor['lineColor'] : '#000000';
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
    ctx.fillStyle = isLong ? window.longToolColor['stopColor'] ? window.longToolColor['stopColor'] : window.shortToolColor['stopColor'] ? window.shortToolColor['stopColor'] : '#ffffff' : window.shortToolColor['stopColor'] ? window.shortToolColor['stopColor'] : '#ffffff';
    ctx.fillStyle = rgbaToHex(ctx.fillStyle);
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
    ctx.strokeStyle = isLong ? window.longToolColor['textColor'] ? window.longToolColor['textColor'] : window.shortToolColor['textColor'] ? window.shortToolColor['textColor'] : '#000000' : window.shortToolColor['textColor'] ? window.shortToolColor['textColor'] : '#000000';
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
    // const rect = this.getBoundingClientRect();
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const buttonX = enterButton.buttonX;
    const buttonY = enterButton.buttonY;
    console.log(`x: ${mouseX}, y: ${mouseY}, buttonX: ${buttonX}, buttonY: ${buttonY}`);

    if(mouseX > 200 && mouseX < 300 && mouseY > 200 && mouseY < 300)
        this.style.cursor = 'not-allowed';
    else{
        this.style.cursor = 'default';
    }

    // if (mouseX > buttonX && mouseX < buttonX + enterButton.width / 2 &&
    //     mouseY > buttonY && mouseY < buttonY + enterButton.height) {
    //     this.style.cursor = enterButton.opened ? 'default' : 'pointer';
    // } else if (mouseX > buttonX + enterButton.width / 2 && mouseX < buttonX + enterButton.width &&
    //     mouseY > buttonY && mouseY < buttonY + enterButton.height) {
    //     this.style.cursor = enterButton.opened ? 'pointer' : 'default';
    // } else {
    //     this.style.cursor = 'default';
    // }
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


// 覆盖 fillRect 方法
ctx1.fillRect = function (x, y, width, height) {
    // 颜色识别当前为多头工具的止损
    if (window.longToolColor && ctx1.fillStyle === window.longToolColor.stopColor) {
        window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        // 颜色识别当前为多头工具的止盈
    } else if (window.longToolColor && ctx1.fillStyle === window.longToolColor.profitColor && window.toolsItem['stopY']) {
        window.toolsItem['profitY'] = y;                    // 记录止盈的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        draw(ctx1, x, y, width, height, defaultRadius);        // 绘制下单按钮
        setupEventListeners(canvasNode1);
        // 颜色识别当前为空头工具的止损
    } else if (window.shortToolColor && ctx1.fillStyle === window.shortToolColor.stopColor) {
        window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        // 颜色识别当前为空头工具的止盈
    } else if (window.shortToolColor && ctx1.fillStyle === window.shortToolColor.profitColor && window.toolsItem['stopY']) {
        window.toolsItem['profitY'] = y;
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        draw(ctx1, x, y, width, height, defaultRadius);        // 绘制下单按钮
        setupEventListeners(canvasNode1);
    } else {
        originalFillRect1.call(this, x, y, width, height);
    }
};

// 覆盖 fillRect 方法
ctx2.fillRect = function (x, y, width, height) {
    // 颜色识别当前为多头工具的止损
    if (window.longToolColor && ctx2.fillStyle === window.longToolColor.stopColor) {
        window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        // 颜色识别当前为多头工具的止盈
    } else if (window.longToolColor && ctx2.fillStyle === window.longToolColor.profitColor && window.toolsItem['stopY']) {
        window.toolsItem['profitY'] = y;                    // 记录止盈的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        draw(ctx2, x, y, width, height, defaultRadius);        // 绘制下单按钮
        setupEventListeners(canvasNode2);
        // 颜色识别当前为空头工具的止损
    } else if (window.shortToolColor && ctx2.fillStyle === window.shortToolColor.stopColor) {
        window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        // 颜色识别当前为空头工具的止盈
    } else if (window.shortToolColor && ctx2.fillStyle === window.shortToolColor.profitColor && window.toolsItem['stopY']) {
        window.toolsItem['profitY'] = y;
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        draw(ctx2, x, y, width, height, defaultRadius);        // 绘制下单按钮
        setupEventListeners(canvasNode2);
    } else {
        originalFillRect1.call(this, x, y, width, height);
    }
};

// // 还原 fillRect 方法
// ctx1.fillRect = originalFillRect1;
// ctx2.fillRect = originalFillRect2;


 //# sourceURL=snippet:///canvasHook