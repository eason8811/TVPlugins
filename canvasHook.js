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

function draw(ctx, x, y, width, height, enterButton, radius) {
    // 绘制下单按钮
    ctx.save();

    if (window.toolsItem['stopY'] >= window.toolsItem['profitY']) {
        // 代表当前是多头工具
        ctx.fillStyle = 'white';
        // originalFillRect1.call(ctx, x + width, window.toolsItem['stopY'], enterButton['width'], enterButton['height']);
        x = x + width;
        y = window.toolsItem['stopY'];
        width = 200;
        height = 100;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);  // 从矩形左上角开始
        ctx.lineTo(x + width - radius, y); // 上边
        ctx.arcTo(x + width, y, x + width, y + radius, radius); // 右上角
        ctx.lineTo(x + width, y + height - radius); // 右边
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius); // 右下角
        ctx.lineTo(x + radius, y + height); // 下边
        ctx.arcTo(x, y + height, x, y + height - radius, radius); // 左下角
        ctx.lineTo(x, y + radius); // 左边
        ctx.arcTo(x, y, x + radius, y, radius); // 左上角
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    } else {
        // 代表当前是空头工具
        ctx.fillStyle = 'red';
        // originalFillRect1.call(ctx, x + width, y, enterButton['width'], enterButton['height']);
        x = x + width;
        width = 200;
        height = 100;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);  // 从矩形左上角开始
        ctx.lineTo(x + width - radius, y); // 上边
        ctx.arcTo(x + width, y, x + width, y + radius, radius); // 右上角
        ctx.lineTo(x + width, y + height - radius); // 右边
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius); // 右下角
        ctx.lineTo(x + radius, y + height); // 下边
        ctx.arcTo(x, y + height, x, y + height - radius, radius); // 左下角
        ctx.lineTo(x, y + radius); // 左边
        ctx.arcTo(x, y, x + radius, y, radius); // 左上角
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }

    window.toolsItem['stopY'] = null;
    window.toolsItem['profitY'] = null;
    ctx.restore();
}

// 覆盖 fillRect 方法
ctx1.fillRect = function (x, y, width, height) {
    let enterButton = {
        height: Math.min(Math.max(15, 0.5 * height), 100),
        width: Math.min(Math.max(40, 0.3 * width), 200)
    }

    // 颜色识别当前为多头工具的止损
    if (window.longToolColor && ctx1.fillStyle === window.longToolColor.stopColor) {
        window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        // 颜色识别当前为多头工具的止盈
    } else if (window.longToolColor && ctx1.fillStyle === window.longToolColor.profitColor && window.toolsItem['stopY']) {
        window.toolsItem['profitY'] = y;                    // 记录止盈的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        draw(ctx1, x, y, width, height, enterButton, 20);        // 绘制下单按钮
        // 颜色识别当前为空头工具的止损
    } else if (window.shortToolColor && ctx1.fillStyle === window.shortToolColor.stopColor) {
        window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        // 颜色识别当前为空头工具的止盈
    } else if (window.shortToolColor && ctx1.fillStyle === window.shortToolColor.profitColor && window.toolsItem['stopY']) {
        window.toolsItem['profitY'] = y;
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        draw(ctx1, x, y, width, height, enterButton, 20);        // 绘制下单按钮
    } else {
        originalFillRect1.call(this, x, y, width, height);
    }
};

// 覆盖 fillRect 方法
ctx2.fillRect = function (x, y, width, height) {
    let enterButton = {
        height: Math.min(Math.max(15, 0.5 * height), 100),
        width: Math.min(Math.max(40, 0.3 * width), 200)
    }

    // 颜色识别当前为多头工具的止损
    if (window.longToolColor && ctx2.fillStyle === window.longToolColor.stopColor) {
        window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        // 颜色识别当前为多头工具的止盈
    } else if (window.longToolColor && ctx2.fillStyle === window.longToolColor.profitColor && window.toolsItem['stopY']) {
        window.toolsItem['profitY'] = y;                    // 记录止盈的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        draw(ctx2, x, y, width, height, enterButton, 20);        // 绘制下单按钮
        // 颜色识别当前为空头工具的止损
    } else if (window.shortToolColor && ctx2.fillStyle === window.shortToolColor.stopColor) {
        window.toolsItem['stopY'] = y;                      // 记录止损的绘图位置
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        // 颜色识别当前为空头工具的止盈
    } else if (window.shortToolColor && ctx2.fillStyle === window.shortToolColor.profitColor && window.toolsItem['stopY']) {
        window.toolsItem['profitY'] = y;
        originalFillRect1.call(this, x, y, width, height);  // 调用原始的 fillRect 方法
        draw(ctx2, x, y, width, height, enterButton, 20);        // 绘制下单按钮
    } else {
        originalFillRect1.call(this, x, y, width, height);
    }
};

// // 还原 fillRect 方法
// ctx1.fillRect = originalFillRect1;
// ctx2.fillRect = originalFillRect2;

