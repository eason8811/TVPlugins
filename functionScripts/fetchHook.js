/*
hook到TV网页的加载器，以及模块数组的push方法，替换有关绘制盈亏比组件的脚本代码，插入提取代码
*/

window.webpackChunktradingview = window.webpackChunktradingview || [];
window.rebound = false;
// 保存原始的 push 方法
const originalPush = self.webpackChunktradingview.push;

// 创建一个用于加载脚本的异步函数
function loadScript(result) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([result], {type: 'application/javascript'});
        const blobURL = URL.createObjectURL(blob);
        const scriptElement = document.createElement('script');
        scriptElement.src = blobURL;

        // 当脚本加载完成时，触发 onload 回调
        scriptElement.onload = function () {
            console.log("window.targetModuleFunction已生成");
            resolve();  // 脚本加载完成，resolve Promise
        };
        document.head.appendChild(scriptElement);
        URL.revokeObjectURL(blobURL);
    });
}

// 重写 push 方法
self.webpackChunktradingview.push = function (...args) {
    if (!window.rebound) {
        let originalPush2 = self.webpackChunktradingview.push;
        self.webpackChunktradingview.push = async function (...args2) {
            // 定义正则表达式来匹配形如 ){const o=i.renderer( 的字符串
            const pattern = /\)\{\s*const\s+[a-zA-Z]\s*=\s*[a-zA-Z]\.renderer\s*\(/;
            let myCode = 'const toolItemDrawEvent=new CustomEvent(\'toolItemDraw\',{detail:{originObj:o,rendererObj:r,bitMediaInfo:t,ctx:e}});document.dispatchEvent(toolItemDrawEvent);';
            for (let moduleId of Object.keys(args2[0][1])) {
                if (pattern.test(args2[0][1][moduleId].toString())) {
                    const insertPattern = /(,\s*this\.state\(\)\);)(\s*if\()/;
                    // 识别 ,this.state()); 和 if( 并在其中间添加myCode

                    let scriptArray = args2[0][1][moduleId].toString().split(',this.state());if(');
                    for (let i = 0; i < scriptArray.length; i++) {
                        if (i !== 0) {
                            scriptArray[i] = ',this.state());if(' + scriptArray[i];
                        }
                        scriptArray[i] = scriptArray[i].replace(insertPattern, (match, part1, part2) => {
                            return `${part1}${myCode}${part2}`;  // 在 this.state()); 后插入 myCode
                        });
                    }
                    let result = '';
                    for (let j = 0; j < scriptArray.length; j++) {
                        result += scriptArray[j];
                    }
                    result = 'window.targetModuleFunction=' + result + ';';

                    // 加载脚本并等待其完成
                    await loadScript(result);
                    // 等待脚本加载完成后，将 window.targetModuleFunction 替换到 args2 中
                    if (window.targetModuleFunction) {
                        console.log('替换修改后的模块');
                        args2[0][1][moduleId] = window.targetModuleFunction;  // 替换 args2 的值
                    }
                }
            }
            return originalPush2.apply(this, args2);
        }
        window.rebound = true;
    }
    // 调用原始的 push 方法，保持原功能
    return originalPush.apply(this, args);
};


/*
以下一系列函数是从TV网页脚本上扣下来的逻辑，用于将盈亏比组件中renderer中点的数据转换为canvas画布上点的数据
 */

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


//定义按钮的长款以及圆角属性，为浏览器的localStorge变化添加事件监听器（其实是从content.js发过来的自定义事件）
let defaultWidth = getCache('toolsButtonWidth') ? getCache('toolsButtonWidth') : 75;
let defaultHeight = defaultWidth / 2;
let defaultRadius = 10;
let originCursor = null;    // 原来的鼠标样式

window.addEventListener('localStorgeChanged', (event) => {
    defaultWidth = event.detail.value;
    defaultHeight = defaultWidth / 2;
});

function getCache(key) {
    let cacheObj = JSON.parse(localStorage.getItem(key));
    if (cacheObj) {
        return cacheObj.value;
    }
    return null;
}

/*
将rgba格式颜色代码转换为十六进制代码
 */

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

/*
绘制下单按钮
 */

function drawButton(ctx, x, y, radius, profitTextColor, profitBgColor, stopTextColor, stopBgColor, buttonListKey) {
    // x: 横坐标, y: 纵坐标, width: 宽度, height: 高度, radius: 圆角半径
    // 绘制下单按钮
    ctx.save();

    let buttonX = x;
    let buttonY = y - defaultHeight / 2;
    try {
        window.buttonList[buttonListKey].buttonX = buttonX;
        window.buttonList[buttonListKey].buttonY = buttonY;
        window.buttonList[buttonListKey].buttonWidth = defaultWidth;
        window.buttonList[buttonListKey].buttonHeight = defaultHeight;
    } catch (e) {
        console.error(e.message);
    }


    // 绘制左半部分（绿色），中间无圆角
    ctx.beginPath();
    ctx.moveTo(buttonX + radius, buttonY);  // 左上角
    ctx.lineTo(buttonX + defaultWidth / 2, buttonY);  // 上边中点
    ctx.lineTo(buttonX + defaultWidth / 2, buttonY + defaultHeight);  // 下边中点
    ctx.lineTo(buttonX + radius, buttonY + defaultHeight);  // 左下角
    ctx.arcTo(buttonX, buttonY + defaultHeight, buttonX, buttonY + defaultHeight - radius, radius);  // 左下角圆角
    ctx.lineTo(buttonX, buttonY + radius);  // 左边
    ctx.arcTo(buttonX, buttonY, buttonX + radius, buttonY, radius);  // 左上角圆角
    ctx.closePath();
    ctx.fillStyle = profitBgColor;
    ctx.fillStyle = rgbaToHex(ctx.fillStyle);

    // 当当前绘画的时最后一个组件时，检测最后一个组件的索引
    let buttonColorControl = window.buttonList[buttonListKey] ? window.buttonList[buttonListKey].opened : false;

    if (buttonColorControl) {
        ctx.fillStyle = 'rgba(96, 100, 111, 1)';
    }
    ctx.fill();
    ctx.strokeStyle = profitTextColor;
    ctx.strokeStyle = rgbaToHex(ctx.strokeStyle);
    ctx.stroke();

    // 绘制右半部分（红色），中间无圆角
    ctx.beginPath();
    ctx.moveTo(buttonX + defaultWidth / 2, buttonY);  // 上边中点
    ctx.lineTo(buttonX + defaultWidth - radius, buttonY);  // 右上角
    ctx.arcTo(buttonX + defaultWidth, buttonY, buttonX + defaultWidth, buttonY + radius, radius);  // 右上角圆角
    ctx.lineTo(buttonX + defaultWidth, buttonY + defaultHeight - radius);  // 右边
    ctx.arcTo(buttonX + defaultWidth, buttonY + defaultHeight, buttonX + defaultWidth - radius, buttonY + defaultHeight, radius);  // 右下角圆角
    ctx.lineTo(buttonX + defaultWidth / 2, buttonY + defaultHeight);  // 下边中点
    ctx.closePath();
    ctx.fillStyle = stopBgColor;
    ctx.fillStyle = rgbaToHex(ctx.fillStyle);
    if (!buttonColorControl) {
        ctx.fillStyle = 'rgba(96, 100, 111, 1)';
    }
    ctx.fill();
    ctx.stroke();

    // 绘制中间的分割线
    ctx.beginPath();
    ctx.moveTo(buttonX + defaultWidth / 2, buttonY + 2);
    ctx.lineTo(buttonX + defaultWidth / 2, buttonY - 2 + defaultHeight);
    ctx.lineWidth = 2;
    // ctx.strokeStyle = isLong ? window.longToolColor['lineColor'] ? window.longToolColor['lineColor'] : window.shortToolColor['lineColor'] ? window.shortToolColor['lineColor'] : '#000000' : window.shortToolColor['lineColor'] ? window.shortToolColor['lineColor'] : '#000000';
    ctx.stroke();

    // 在左侧绘制对号，尖端向下，开口向上
    ctx.beginPath();
    ctx.moveTo(buttonX + defaultWidth / 4 - 5, buttonY + defaultHeight / 2 - 2);  // 顶部左边
    ctx.lineTo(buttonX + defaultWidth / 4, buttonY + defaultHeight / 2 + 6);  // 尖端
    ctx.lineTo(buttonX + defaultWidth / 4 + 10, buttonY + defaultHeight / 2 - 6);  // 顶部右边
    ctx.strokeStyle = stopTextColor;
    ctx.strokeStyle = rgbaToHex(ctx.strokeStyle);
    ctx.lineWidth = 2;
    ctx.stroke();

    // 在右侧绘制叉号
    ctx.beginPath();
    ctx.moveTo(buttonX + 3 * defaultWidth / 4 - 5, buttonY + defaultHeight / 2 - 5);
    ctx.lineTo(buttonX + 3 * defaultWidth / 4 + 5, buttonY + defaultHeight / 2 + 5);
    ctx.moveTo(buttonX + 3 * defaultWidth / 4 + 5, buttonY + defaultHeight / 2 - 5);
    ctx.lineTo(buttonX + 3 * defaultWidth / 4 - 5, buttonY + defaultHeight / 2 + 5);
    // ctx.strokeStyle = isLong ? window.longToolColor['textColor'] ? window.longToolColor['textColor'] : window.shortToolColor['textColor'] ? window.shortToolColor['textColor'] : '#000000' : window.shortToolColor['textColor'] ? window.shortToolColor['textColor'] : '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}

// 添加组件被绘画的事件监听器
document.addEventListener('toolItemDraw', (event) => {
    if (event.detail.originObj.toolname && event.detail.originObj.toolname.includes('LineToolRiskReward') && event.detail.rendererObj) {
        console.log(event.detail);
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

            // console.log(pointsOnCanvas);

            // drawButton(ctx, pointsOnCanvas.endPoint.x, pointsOnCanvas.endPoint.y, defaultRadius,
            //     profitTextColor, profitBgColor, stopTextColor, stopBgColor, toolId);
        }
    }
});

/*
添加鼠标移动事件监听器
 */
function mouseMoveEvent(event) {
    const rect = this.getBoundingClientRect();

    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    for (let key in window.buttonList) {
        let mouseInStyle = ['pointer', 'not-allowed'];
        originCursor = mouseInStyle.includes(this.style.cursor) ? originCursor : this.style.cursor;
        const buttonItem = window.buttonList[key];
        if (buttonItem.getCursorType(mouseX, mouseY)) {
            this.style.cursor = buttonItem.getCursorType(mouseX, mouseY);
            break;
        } else {
            this.style.cursor = originCursor;
        }
    }
}

function mouseDownEvent(event) {
    const rect = this.getBoundingClientRect();

    const scaleX = this.width / rect.width;
    const scaleY = this.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    for (let key in window.buttonList) {
        const buttonItem = window.buttonList[key];
        if (buttonItem.getInsideOrder(mouseX, mouseY)) {

        }
    }
}

function setupEventListeners(canvas) {
    canvas.addEventListener('mousemove', mouseMoveEvent);
    // canvas.addEventListener('click', clickEvent);
}

// 添加事件监听器
window.addEventListener('load', () => {
    originCursor = document.querySelector('div.chart-gui-wrapper canvas').style.cursor;
    setupEventListeners(document.querySelectorAll('div.chart-gui-wrapper canvas')[1]);
})

// Hook window的fetch方法，拦截请求并处理数据，将处理后的多头空头组件信息存在window.buttonList中
function getDecimalPlaces(num) {
    // 将数字转换为字符串
    const numStr = num.toString();

    // 查找小数点的位置
    const decimalIndex = numStr.indexOf('.');

    // 如果没有小数点，说明小数位数为0
    if (decimalIndex === -1) {
        return 0;
    }

    // 返回小数点后的字符长度
    return numStr.length - decimalIndex - 1;
}

function loadTools(sources) {
    for (let key in sources) {
        if (sources[key] === null) {
            if (window.buttonList[key] !== undefined)
                delete window.buttonList[key];
            continue;
        }

        let name = sources[key]['state']['type'];
        let side = name.toLowerCase().includes('short') ? 'short' : name.toLowerCase().includes('long') ? 'long' : null;
        if (side === null)
            continue;

        let enter = sources[key]['state']['points'][0]['price'];
        let small_point = getDecimalPlaces(enter);
        let stop_level = sources[key]['state']['state']['stopLevel'];
        let profit_level = sources[key]['state']['state']['profitLevel'];
        let stop = side === 'long' ? enter - stop_level / 10 ** small_point : enter + stop_level / 10 ** small_point;
        let profit = side === 'long' ? enter + profit_level / 10 ** small_point : enter - profit_level / 10 ** small_point;
        let timestamp_start = sources[key]['state']['points'][0]['time_t'];
        let timestamp_end = sources[key]['state']['points'][1]['time_t'];
        let offset_start = parseInt(sources[key]['state']['points'][0]['offset']);
        let offset_end = parseInt(sources[key]['state']['points'][1]['offset']);

        if (offset_start !== 0) {
            timestamp_start += window.interval * offset_start * 60
        }
        if (offset_end !== 0) {
            timestamp_end += window.interval * offset_end * 60
        }
        stop = Math.round(stop * 10 ** small_point) / 10 ** small_point;
        profit = Math.round(profit * 10 ** small_point) / 10 ** small_point;
        window.buttonList[key] = {
            timestamp_start: timestamp_start,
            timestamp_end: timestamp_end,
            enter: enter,
            stop: stop,
            profit: profit,
            side: side,
            opened: false,
            getInsideOrder: function (x, y) {
                let orderButtonX1, orderButtonY1, orderButtonX2, orderButtonY2;
                orderButtonX1 = this.buttonX;
                orderButtonY1 = this.buttonY;
                orderButtonX2 = this.buttonX + this.buttonWidth / 2;
                orderButtonY2 = this.buttonY + this.buttonHeight;

                return x > orderButtonX1 && x < orderButtonX2 && y > orderButtonY1 && y < orderButtonY2;
            },
            getInsideCancel: function (x, y) {
                let cancelButtonX1, cancelButtonY1, cancelButtonX2, cancelButtonY2;
                cancelButtonX1 = this.buttonX + this.buttonWidth / 2;
                cancelButtonY1 = this.buttonY;
                cancelButtonX2 = this.buttonX + this.buttonWidth;
                cancelButtonY2 = this.buttonY + this.buttonHeight;

                return x > cancelButtonX1 && x < cancelButtonX2 && y > cancelButtonY1 && y < cancelButtonY2;
            },
            getCursorType: function (x, y) {
                if (this.getInsideOrder(x, y)) {
                    return this.opened ? 'not-allowed' : 'pointer';
                } else if (this.getInsideCancel(x, y)) {
                    return this.opened ? 'pointer' : 'not-allowed';
                } else {
                    return null;
                }
            },
        };
        console.log(`组件名称为:${name}\n进场价格为:${enter}\n止损价格为:${stop}\n止盈价格为:${profit}`);
    }
}

window.buttonList = {};

const originalFetch = window.fetch;
window.fetch = function (...args) {
    const url = args[0];

    // 检查 URL 是否包含 'source'
    if (url.includes('sources?chart_id=_shared') || url.includes('charttimeline')) {
        console.log('拦截到请求：', url);
        if (url.includes('charttimeline')) {
            for (let pair of args[1].body.entries()) {
                if (pair[0] === 'interval') {
                    window.interval = parseInt(pair[1]);
                    console.log('interval:', window.interval);
                    break;
                }
            }
            return originalFetch.apply(this, arguments);
        }
        if (args[1].method !== 'PUT' && args[1].method !== 'GET')
            return originalFetch.apply(this, arguments);
        if (args[1].method === 'GET') {
            return originalFetch.apply(this, arguments).then(response => {
                // 克隆 response，以便后续处理
                const responseClone = response.clone();

                return responseClone.json().then(jsonData => {
                    let sources = jsonData.payload.sources;
                    loadTools(sources);
                    return response;  // 返回原始的 response 对象，便于后续处理
                });
            });
        }
        console.log(JSON.parse(args[1].body));
        let sources = JSON.parse(args[1].body).sources;
        console.log(sources);
        loadTools(sources);
    }

    // 调用原始的 fetch 方法
    return originalFetch.apply(this, arguments);
};

// window.addEventListener('load', function () {
//     window.timezone = parseInt(document.querySelector('div .inline-BXXUwft2 button div').innerHTML.match(/\(\w*([+-]\d+)\)/)[1]);
// });