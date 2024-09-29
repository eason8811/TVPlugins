window.buttonList = {};
//定义按钮的长款以及圆角属性，为浏览器的localStorge变化添加事件监听器（其实是从content.js发过来的自定义事件）
let defaultWidth = getCache('toolsButtonWidth') ? getCache('toolsButtonWidth') : 75;
let defaultHeight = defaultWidth / 2;
let defaultRadius = 10;
let originCursor = null;    // 原来的鼠标样式

window.addEventListener('localStorgeChanged', (event) => {
    defaultWidth = event.detail.value;
    defaultHeight = defaultWidth / 2;
    for (let key in window.buttonList) {

    }
});

function getCache(key) {
    let cacheObj = JSON.parse(localStorage.getItem(key));
    if (cacheObj) {
        return cacheObj.value;
    }
    return null;
}

class Button {
    constructor(buttonElement) {
        this.ctx = buttonElement.ctx;
        this.id = buttonElement.id;
        this.enter = buttonElement.enter;
        this.profit = buttonElement.profit;
        this.stop = buttonElement.stop;
        this.opened = buttonElement.opened;
        this.x = buttonElement.x;
        this.y = buttonElement.y;
        this.width = buttonElement.width;
        this.height = buttonElement.height;
        this.profitColor = buttonElement.profitColor;
        this.stopColor = buttonElement.stopColor;
        this.profitTextColor = buttonElement.profitTextColor;
        this.stopTextColor = buttonElement.stopTextColor;
    }

    getInsideOrder(x, y) {
        let orderButtonX1, orderButtonY1, orderButtonX2, orderButtonY2;
        orderButtonX1 = this.x;
        orderButtonY1 = this.y;
        orderButtonX2 = this.x + this.width / 2;
        orderButtonY2 = this.y + this.height;

        return x > orderButtonX1 && x < orderButtonX2 && y > orderButtonY1 && y < orderButtonY2;
    }

    getInsideCancel(x, y) {
        let cancelButtonX1, cancelButtonY1, cancelButtonX2, cancelButtonY2;
        cancelButtonX1 = this.x + this.width / 2;
        cancelButtonY1 = this.y;
        cancelButtonX2 = this.x + this.width;
        cancelButtonY2 = this.y + this.height;

        return x > cancelButtonX1 && x < cancelButtonX2 && y > cancelButtonY1 && y < cancelButtonY2;
    }

    getCursorType(x, y) {
        if (this.getInsideOrder(x, y)) {
            return this.opened ? 'not-allowed' : 'pointer';
        } else if (this.getInsideCancel(x, y)) {
            return this.opened ? 'pointer' : 'not-allowed';
        } else {
            return null;
        }
    }

    #rgbaToHex(rgba) {
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

    draw() {
        // x: 横坐标, y: 纵坐标, width: 宽度, height: 高度, radius: 圆角半径
        // 绘制下单按钮
        let ctx = this.ctx;
        ctx.save();

        // 绘制左半部分（绿色），中间无圆角
        ctx.beginPath();
        ctx.moveTo(this.x + defaultRadius, this.y);  // 左上角
        ctx.lineTo(this.x + defaultWidth / 2, this.y);  // 上边中点
        ctx.lineTo(this.x + defaultWidth / 2, this.y + defaultHeight);  // 下边中点
        ctx.lineTo(this.x + defaultRadius, this.y + defaultHeight);  // 左下角
        ctx.arcTo(this.x, this.y + defaultHeight, this.x, this.y + defaultHeight - defaultRadius, defaultRadius);  // 左下角圆角
        ctx.lineTo(this.x, this.y + defaultRadius);  // 左边
        ctx.arcTo(this.x, this.y, this.x + defaultRadius, this.y, defaultRadius);  // 左上角圆角
        ctx.closePath();
        ctx.fillStyle = this.profitColor;
        ctx.fillStyle = this.#rgbaToHex(ctx.fillStyle);

        if (this.opened) {
            ctx.fillStyle = 'rgba(96, 100, 111, 1)';
        }
        ctx.fill();
        ctx.strokeStyle = this.profitTextColor;
        ctx.strokeStyle = this.#rgbaToHex(ctx.strokeStyle);
        ctx.stroke();

        // 绘制右半部分（红色），中间无圆角
        ctx.beginPath();
        ctx.moveTo(this.x + defaultWidth / 2, this.y);  // 上边中点
        ctx.lineTo(this.x + defaultWidth - defaultRadius, this.y);  // 右上角
        ctx.arcTo(this.x + defaultWidth, this.y, this.x + defaultWidth, this.y + defaultRadius, defaultRadius);  // 右上角圆角
        ctx.lineTo(this.x + defaultWidth, this.y + defaultHeight - defaultRadius);  // 右边
        ctx.arcTo(this.x + defaultWidth, this.y + defaultHeight, this.x + defaultWidth - defaultRadius, this.y + defaultHeight, radius);  // 右下角圆角
        ctx.lineTo(this.x + defaultWidth / 2, this.y + defaultHeight);  // 下边中点
        ctx.closePath();
        ctx.fillStyle = this.stopColor;
        ctx.fillStyle = this.#rgbaToHex(ctx.fillStyle);
        if (!this.opened) {
            ctx.fillStyle = 'rgba(96, 100, 111, 1)';
        }
        ctx.fill();
        ctx.stroke();

        // 绘制中间的分割线
        ctx.beginPath();
        ctx.moveTo(this.x + defaultWidth / 2, this.y + 2);
        ctx.lineTo(this.x + defaultWidth / 2, this.y - 2 + defaultHeight);
        ctx.lineWidth = 2;
        // ctx.strokeStyle = isLong ? window.longToolColor['lineColor'] ? window.longToolColor['lineColor'] : window.shortToolColor['lineColor'] ? window.shortToolColor['lineColor'] : '#000000' : window.shortToolColor['lineColor'] ? window.shortToolColor['lineColor'] : '#000000';
        ctx.stroke();

        // 在左侧绘制对号，尖端向下，开口向上
        ctx.beginPath();
        ctx.moveTo(this.x + defaultWidth / 4 - 5, this.y + defaultHeight / 2 - 2);  // 顶部左边
        ctx.lineTo(this.x + defaultWidth / 4, this.y + defaultHeight / 2 + 6);  // 尖端
        ctx.lineTo(this.x + defaultWidth / 4 + 10, this.y + defaultHeight / 2 - 6);  // 顶部右边
        ctx.strokeStyle = this.stopTextColor;
        ctx.strokeStyle = this.#rgbaToHex(ctx.strokeStyle);
        ctx.lineWidth = 2;
        ctx.stroke();

        // 在右侧绘制叉号
        ctx.beginPath();
        ctx.moveTo(this.x + 3 * defaultWidth / 4 - 5, this.y + defaultHeight / 2 - 5);
        ctx.lineTo(this.x + 3 * defaultWidth / 4 + 5, this.y + defaultHeight / 2 + 5);
        ctx.moveTo(this.x + 3 * defaultWidth / 4 + 5, this.y + defaultHeight / 2 - 5);
        ctx.lineTo(this.x + 3 * defaultWidth / 4 - 5, this.y + defaultHeight / 2 + 5);
        // ctx.strokeStyle = isLong ? window.longToolColor['textColor'] ? window.longToolColor['textColor'] : window.shortToolColor['textColor'] ? window.shortToolColor['textColor'] : '#000000' : window.shortToolColor['textColor'] ? window.shortToolColor['textColor'] : '#000000';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}


// 添加组件被绘画的事件监听器
document.addEventListener('toolItemDraw', (event) => {
    if (event.detail.originObj.toolname && event.detail.originObj.toolname.includes('LineToolRiskReward') && event.detail.rendererObj) {
        // console.log(event.detail);
        let toolId = event.detail.originObj._id;

        let horizontalPixelRatio = event.detail.bitMediaInfo.bitmapSize.width / event.detail.bitMediaInfo.mediaSize.width;
        let verticalPixelRatio = event.detail.bitMediaInfo.bitmapSize.height / event.detail.bitMediaInfo.mediaSize.height;
        let profitRenderer = event.detail.rendererObj[0]._fullTargetBgRenderer;
        let stopRenderer = event.detail.rendererObj[0]._fullStopBgRenderer;
        let entryLineRenderer = event.detail.rendererObj[0]._entryLineRenderer;
        let ctx = event.detail.ctx;
        let profitTextColor = profitRenderer._data.color;
        let profitBgColor = profitRenderer._data.backcolor;
        let stopTextColor = stopRenderer._data.color;
        let stopBgColor = stopRenderer._data.backcolor;

        let minMaxBoxObj = minMaxBox(
            {x: 0, y: 0},
            {x: event.detail.bitMediaInfo.mediaSize.width, y: event.detail.bitMediaInfo.mediaSize.height}
        )
        let transformedPoints = transformPoints(entryLineRenderer._data.points, minMaxBoxObj);
        if (transformedPoints) {
            let pointsOnCanvas = drawEnter(ctx,
                transformedPoints[0].x, transformedPoints[0].y, transformedPoints[1].x, transformedPoints[1].y,
                {horizontalPixelRatio: horizontalPixelRatio, verticalPixelRatio: verticalPixelRatio});

            let buttonX = pointsOnCanvas.endPoint.x;
            let buttonY = pointsOnCanvas.endPoint.y - defaultHeight / 2;

            let buttonInfo = {
                ctx: ctx,
                id: toolId,
                enter: parseFloat(event.detail.originObj._entryPriceAxisView._axisRendererData.text.replace(',', '')),
                profit: parseFloat(event.detail.originObj._profitPriceAxisView._axisRendererData.text.replace(',', '')),
                stop: parseFloat(event.detail.originObj._stopPriceAxisView._axisRendererData.text.replace(',', '')),
                opened: false,
                x: buttonX,
                y: buttonY,
                width: defaultWidth,
                height: defaultHeight,
                profitColor: profitBgColor,
                stopColor: stopBgColor,
                profitTextColor: profitTextColor,
                stopTextColor: stopTextColor
            };
            window.buttonList[toolId] = new Button(buttonInfo);
            window.buttonList[toolId].draw();
        }

        // console.log(pointsOnCanvas);

        // drawButton(ctx, pointsOnCanvas.endPoint.x, pointsOnCanvas.endPoint.y, defaultRadius,
        //     profitTextColor, profitBgColor, stopTextColor, stopBgColor, toolId);
    }
});