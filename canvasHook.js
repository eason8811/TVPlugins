// 保存原始的 translate 和 scale 方法
const canvasNode = document.getElementsByClassName('chart-gui-wrapper')[0].children[0];
const ctx = canvasNode.getContext('2d');
const originalFillRect = ctx.fillRect;
window.toolsItem = {
    profitY: null,
    stopY: null
};


// 覆盖 fillRect 方法
ctx.fillRect = function (x, y, width, height) {
    let enterButton = {
        height: Math.min(Math.max(15, 0.5 * height), 100),
        width: Math.min(Math.max(40, 0.3 * width), 200)
    }
    if (window.longToolColor && ctx.fillStyle === window.longToolColor.stopColor) {
        console.log(`LongStop x: ${x}, y: ${y}, width: ${width}, height: ${height} color: ${ctx.fillStyle}`);
        window.toolsItem['stopY'] = y;

        // 调用原始的 scale 方法
        originalFillRect.call(this, x, y, width, height);
    } else if (window.longToolColor && ctx.fillStyle === window.longToolColor.profitColor && window.toolsItem['stopY']) {
        console.log(`LongProfit x: ${x}, y: ${y}, width: ${width}, height: ${height} color: ${ctx.fillStyle}`);
        window.toolsItem['profitY'] = y;

        // 调用原始的 scale 方法
        originalFillRect.call(this, x, y, width, height);
        ctx.save();

        if (window.toolsItem['stopY'] >= window.toolsItem['profitY']) {
            // 代表当前是多头工具
            ctx.fillStyle = 'white';
            originalFillRect.call(this, x + width, window.toolsItem['stopY'], enterButton['width'], enterButton['height']);
        } else {
            // 代表当前是空头工具
            ctx.fillStyle = 'red';
            originalFillRect.call(this, x + width, y, enterButton['width'], enterButton['height']);
        }

        window.toolsItem['stopY'] = null;
        window.toolsItem['profitY'] = null;
        ctx.restore();
    } else if (window.shortToolColor && ctx.fillStyle === window.shortToolColor.stopColor) {
        console.log(`ShortStop x: ${x}, y: ${y}, width: ${width}, height: ${height} color: ${ctx.fillStyle}`);
        window.toolsItem['stopY'] = y;

        // 调用原始的 scale 方法
        originalFillRect.call(this, x, y, width, height);
    } else if (window.shortToolColor && ctx.fillStyle === window.shortToolColor.profitColor && window.toolsItem['stopY']) {
        console.log(`LongProfit x: ${x}, y: ${y}, width: ${width}, height: ${height} color: ${ctx.fillStyle}`);
        window.toolsItem['profitY'] = y;

        // 调用原始的 scale 方法
        originalFillRect.call(this, x, y, width, height);
        ctx.save();

        if (window.toolsItem['stopY'] >= window.toolsItem['profitY']) {
            // 代表当前是多头工具
            ctx.fillStyle = 'white';
            originalFillRect.call(this, x + width, window.toolsItem['stopY'], enterButton['width'], enterButton['height']);
        } else {
            // 代表当前是空头工具
            ctx.fillStyle = 'red';
            originalFillRect.call(this, x + width, y, enterButton['width'], enterButton['height']);
        }

        window.toolsItem['stopY'] = null;
        window.toolsItem['profitY'] = null;
        ctx.restore();
    } else {
        originalFillRect.call(this, x, y, width, height);
    }

};

// // 还原 fillRect 方法
// ctx.fillRect = originalFillRect;