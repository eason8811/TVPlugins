// // 保存原始的 WebSocket 构造函数
// window.OriginalWebSocket = window.WebSocket;
//
// // 重写 WebSocket 构造函数
// window.WebSocket = function (url, protocols) {
//     console.log('WebSocket 被创建:', url);
//
//     // 拦截 WebSocket 请求，添加一些自定义逻辑
//     const socket = new window.OriginalWebSocket(url, protocols);
//
//     if (url.includes('data.tradingview.com')) {
//         // Hook 连接成功事件
//         socket.addEventListener('open', function (event) {
//             console.log('WebSocket 开启:', event);
//         });
//
//         // Hook 接收到消息的事件
//         socket.addEventListener('message', function (event) {
//             // console.log('WebSocket 收到信息:', event.data);
//
//             // 1. 使用 ~m~ 进行拆分
//             const parts = event.data.split('~m~');
//
//             // 2. 去除无效的部分（奇数位是长度信息，偶数位是实际的 JSON 数据）
//             const jsonMessages = [];
//             for (let i = 2; i < parts.length; i += 2) {
//                 if (parts[i].includes('~h~'))
//                     continue;
//                 const jsonPart = JSON.parse(parts[i]);
//                 jsonMessages.push(jsonPart);
//             }
//
//             // 3. 输出解析出的 JSON 对象
//             if (jsonMessages.length === 1 && jsonMessages[0].m && jsonMessages[0].m === 'du' && jsonMessages[0].p[1].sds_1) {
//                 console.log({
//                     time: jsonMessages[0].p[1].sds_1.s[0].v[0],
//                     open: jsonMessages[0].p[1].sds_1.s[0].v[1],
//                     high: jsonMessages[0].p[1].sds_1.s[0].v[2],
//                     low: jsonMessages[0].p[1].sds_1.s[0].v[3],
//                     close: jsonMessages[0].p[1].sds_1.s[0].v[4],
//                 });
//             }
//             // console.log(jsonMessages);
//         });
//
//         // Hook 关闭事件
//         socket.addEventListener('close', function (event) {
//             // console.log('WebSocket 连接关闭:', event);
//         });
//
//         // Hook 错误事件
//         socket.addEventListener('error', function (event) {
//             // console.error('WebSocket 错误:', event);
//         });
//     }
//
//     return socket;
// };

function modifyCode(inputCode, insertStr) {
    // 正则表达式分为三部分：
    // 1. for 循环中的变量 i
    // 2. 该变量与 renderer 函数的关联，确保变量一致
    // 3. 在 const o = i.renderer(t); 之前插入指定字符串
    const regex = /for\(const (\w) of (\w)\)\{const (\w)=\1\.renderer\(t\);/;

    // 替换匹配的部分，在 renderer 之前插入 insertStr
    const modifiedCode = inputCode.replace(regex, function(match, p1, p2, p3) {
        return `for(const ${p1} of ${p2}){${insertStr}const ${p3}=${p1}.renderer(t);`;
    });

    return modifiedCode;
}

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

        if (window.longToolColor === null && side === 'long') {
            window.longToolColor = {};
            window.longToolColor['profitColor'] = sources[key]['state']['state']['profitBackground'];
            window.longToolColor['stopColor'] = sources[key]['state']['state']['stopBackground'];
            window.longToolColor['lineColor'] = sources[key]['state']['state']['linecolor'];
            window.longToolColor['textColor'] = sources[key]['state']['state']['textcolor'];
        }
        if (window.shortToolColor === null && side === 'short') {
            window.shortToolColor = {};
            window.shortToolColor['profitColor'] = sources[key]['state']['state']['profitBackground'];
            window.shortToolColor['stopColor'] = sources[key]['state']['state']['stopBackground'];
            window.shortToolColor['lineColor'] = sources[key]['state']['state']['linecolor'];
            window.shortToolColor['textColor'] = sources[key]['state']['state']['textcolor'];
        }

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
            opened: false
        };
        console.log(`组件名称为:${name}\n进场价格为:${enter}\n止损价格为:${stop}\n止盈价格为:${profit}`);
    }
}

window.longToolColor = null;
window.shortToolColor = null;
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
