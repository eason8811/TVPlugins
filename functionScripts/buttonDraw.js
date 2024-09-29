window.buttonList = {};
//定义按钮的长款以及圆角属性，为浏览器的localStorge变化添加事件监听器（其实是从content.js发过来的自定义事件）
let defaultWidth = window.getCache('toolsButtonWidth') ? window.getCache('toolsButtonWidth') : 75;
let defaultHeight = defaultWidth / 2;
let defaultRadius = 10;
let originCursor = null;    // 原来的鼠标样式

window.addEventListener('localStorgeChanged', (event) => {
    defaultWidth = event.detail.value;
    defaultHeight = defaultWidth / 2;
    for (let key in window.buttonList) {
        window.buttonList[key].setWidth(defaultWidth);
    }
});

class Button {
    constructor(buttonElement) {
        this.ctx = buttonElement.ctx;
        this.id = buttonElement.id;
        this.enter = buttonElement.enter;
        this.profit = buttonElement.profit;
        this.stop = buttonElement.stop;
        this.opened = buttonElement.opened;
        this.relativeX = buttonElement.relativeX;   // 绘画参照物的x坐标
        this.relativeY = buttonElement.relativeY;   // 绘画参照物的y坐标
        this._x = this.relativeX;
        this._y = this.relativeY - buttonElement.height / 2;
        this.width = buttonElement.width;
        this.height = buttonElement.height;
        this.profitColor = buttonElement.profitColor;
        this.stopColor = buttonElement.stopColor;
        this.profitTextColor = buttonElement.profitTextColor;
        this.stopTextColor = buttonElement.stopTextColor;
        this.radius = buttonElement.radius;
    }

    get x() {
        return this._x;
    }

    get y() {
        this._y = this.relativeY - this.height / 2;
        return this._y;
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

    setWidth(width) {
        this.width = width;
        this.height = width / 2;
        this.draw();
    }

    draw() {
        // x: 横坐标, y: 纵坐标, width: 宽度, height: 高度, radius: 圆角半径
        // 绘制下单按钮
        let ctx = this.ctx;
        ctx.save();

        // 绘制左半部分（绿色），中间无圆角
        ctx.beginPath();
        ctx.moveTo(this.x + this.radius, this.y);  // 左上角
        ctx.lineTo(this.x + this.width / 2, this.y);  // 上边中点
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);  // 下边中点
        ctx.lineTo(this.x + this.radius, this.y + this.height);  // 左下角
        ctx.arcTo(this.x, this.y + this.height, this.x, this.y + this.height - this.radius, this.radius);  // 左下角圆角
        ctx.lineTo(this.x, this.y + this.radius);  // 左边
        ctx.arcTo(this.x, this.y, this.x + this.radius, this.y, this.radius);  // 左上角圆角
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
        ctx.moveTo(this.x + this.width / 2, this.y);  // 上边中点
        ctx.lineTo(this.x + this.width - this.radius, this.y);  // 右上角
        ctx.arcTo(this.x + this.width, this.y, this.x + this.width, this.y + this.radius, this.radius);  // 右上角圆角
        ctx.lineTo(this.x + this.width, this.y + this.height - this.radius);  // 右边
        ctx.arcTo(this.x + this.width, this.y + this.height, this.x + this.width - this.radius, this.y + this.height, this.radius);  // 右下角圆角
        ctx.lineTo(this.x + this.width / 2, this.y + this.height);  // 下边中点
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
        ctx.moveTo(this.x + this.width / 2, this.y + 2);
        ctx.lineTo(this.x + this.width / 2, this.y - 2 + this.height);
        ctx.lineWidth = 2;
        ctx.stroke();

        // 在左侧绘制对号，尖端向下，开口向上
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 4 - 5, this.y + this.height / 2 - 2);  // 顶部左边
        ctx.lineTo(this.x + this.width / 4, this.y + this.height / 2 + 6);  // 尖端
        ctx.lineTo(this.x + this.width / 4 + 10, this.y + this.height / 2 - 6);  // 顶部右边
        ctx.strokeStyle = this.stopTextColor;
        ctx.strokeStyle = this.#rgbaToHex(ctx.strokeStyle);
        ctx.lineWidth = 2;
        ctx.stroke();

        // 在右侧绘制叉号
        ctx.beginPath();
        ctx.moveTo(this.x + 3 * this.width / 4 - 5, this.y + this.height / 2 - 5);
        ctx.lineTo(this.x + 3 * this.width / 4 + 5, this.y + this.height / 2 + 5);
        ctx.moveTo(this.x + 3 * this.width / 4 + 5, this.y + this.height / 2 - 5);
        ctx.lineTo(this.x + 3 * this.width / 4 - 5, this.y + this.height / 2 + 5);
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }
}


//以下一系列函数是从TV网页脚本上扣下来的逻辑，用于将盈亏比组件中renderer中点的数据转换为canvas画布上点的数据
function minMaxBox(t, n) {
    // t = {x: 0, y: 0}
    // n = {x: mediaWidth, y: mediaHeight}
    return {
        min: {x: Math.min(t.x, n.x), y: Math.min(t.y, n.y)},
        max: {x: Math.max(t.x, n.x), y: Math.max(t.y, n.y)}
    }
}

function transformPoints(t, n) {
    // 输入：t = renderer中的数据点
    //      n = mediaSize中的数据点经过min，max处理过的对象
    var e = t[0].x
        , r = t[0].y
        , u = t[1].x
        , o = t[1].y
        , a = n.min.x
        , s = n.min.y
        , l = n.max.x
        , f = n.max.y;

    function c(t, n, e, r, i, u) {
        var o = 0;
        return t < e ? o |= 1 : t > i && (o |= 2),
            n < r ? o |= 4 : n > u && (o |= 8),
            o
    }

    for (var d = c(e, r, a, s, l, f), h = c(u, o, a, s, l, f), v = !1, p = 0; ;) {
        if (p > 1e3)
            throw new Error("Cohen - Sutherland algorithm: infinity loop");
        if (p++,
            !(d | h)) {
            v = !0;
            break
        }
        if (d & h)
            break;
        var y = d || h
            , g = void 0
            , x = void 0;
        8 & y ? (g = e + (u - e) * (f - r) / (o - r),
            x = f) : 4 & y ? (g = e + (u - e) * (s - r) / (o - r),
            x = s) : 2 & y ? (x = r + (o - r) * (l - e) / (u - e),
            g = l) : (x = r + (o - r) * (a - e) / (u - e),
            g = a),
            y === d ? d = c(e = g, r = x, a, s, l, f) : h = c(u = g, o = x, a, s, l, f)
    }
    return v ? e === u && r === o ? {x: e, y: r} : (() => {
        if (e !== u || r !== o)
            return [{x: e, y: r}, {x: u, y: o}];
        else throw new Error("Points of a segment should be distinct");
    })() : null;
}

function drawEnter(e, t, i, r, n, s) {
    // e: ctx
    // t: point[0].x
    // i: point[0].y
    // r: point[1].x
    // n: point[1].y
    // s: {horizontalPixelRatio: o, verticalPixelRatio: l}
    function h(e, t, i, r) {
        const n = e.lineWidth % 2 ? .5 : 0;
        return {
            startPoint: {x: i, y: t + n},
            endPoint: {x: r, y: t + n}
        };
    }

    function p(e, t, i, r) {
        const n = e.lineWidth % 2 ? .5 : 0;
        return {
            startPoint: {x: t + n, y: i},
            endPoint: {x: t + n, y: r}
        };
    }

    function T(e, t, i, r, n) {
        return {
            startPoint: {x: t, y: i},
            endPoint: {x: r, y: n}
        };
    }

    const {horizontalPixelRatio: o, verticalPixelRatio: l} = s;
    return t === r ? p(e, Math.round(t * o), i * l, n * l) : i === n ? h(e, Math.round(i * l), t * o, r * o) : T(e, t * o, i * l, r * o, n * l);
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

            let buttonInfo = {
                ctx: ctx,
                id: toolId,
                enter: parseFloat(event.detail.originObj._entryPriceAxisView._axisRendererData.text.replace(',', '')),
                profit: parseFloat(event.detail.originObj._profitPriceAxisView._axisRendererData.text.replace(',', '')),
                stop: parseFloat(event.detail.originObj._stopPriceAxisView._axisRendererData.text.replace(',', '')),
                opened: false,
                relativeX: pointsOnCanvas.endPoint.x,
                relativeY: pointsOnCanvas.endPoint.y,
                width: defaultWidth,
                height: defaultHeight,
                profitColor: profitBgColor,
                stopColor: stopBgColor,
                profitTextColor: profitTextColor,
                stopTextColor: stopTextColor,
                radius: defaultRadius
            };
            window.buttonList[toolId] = new Button(buttonInfo);
            window.buttonList[toolId].draw();
        }
    }
});