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

(function() {
    // 使用 Set 跟踪已经处理过的 script 标签
    const processedScripts = new Set();

    const observer = new MutationObserver(function(mutationsList) {
        for (let mutation of mutationsList) {
            if (mutation.type === 'childList') {
                if (document.head) {
                    // 找到 <head> 标签后停止观察整个文档
                    observer.disconnect();

                    const scriptObserver = new MutationObserver(function(scriptMutations, observer) {
                        for (let scriptMutation of scriptMutations) {
                            if (scriptMutation.type === 'childList') {
                                scriptMutation.addedNodes.forEach(node => {
                                    if (node.tagName === 'SCRIPT' && /20162\..*\.js/.test(node.src)) {
                                        // 检查是否已经处理过该 script 标签
                                        if (!processedScripts.has(node.src)) {
                                            // 标记该 script 已经处理过
                                            processedScripts.add(node.src);

                                            let xhr = new XMLHttpRequest();
                                            xhr.open('GET', node.src, true);
                                            xhr.onreadystatechange = function() {
                                                if (xhr.readyState === 4 && xhr.status === 200) {
                                                    let modifiedScript = xhr.responseText;

                                                    // 在这里添加你自己的逻辑
                                                    modifiedScript += `\nconsole.log('Custom logic injected with Blob support.');`;

                                                    // 创建一个 Blob 对象，包含修改后的脚本代码
                                                    const blob = new Blob([modifiedScript], { type: 'application/javascript' });

                                                    // 创建一个 Blob URL 来引用这个 Blob 对象
                                                    const blobUrl = URL.createObjectURL(blob);

                                                    // 仅在 parentNode 存在时移除原有的 script 标签
                                                    if (node.parentNode) {
                                                        node.parentNode.removeChild(node);
                                                    }

                                                    // 创建一个新的 script 标签，引用 Blob URL
                                                    const newScript = document.createElement('script');
                                                    newScript.crossOrigin = 'anonymous';
                                                    newScript.defer = true;
                                                    newScript.src = blobUrl;

                                                    // 将新的 script 标签插入页面
                                                    document.head.appendChild(newScript);

                                                    // 成功替换 script 标签后，断开该观察器
                                                    observer.disconnect();
                                                }
                                            };
                                            xhr.send();
                                        }
                                    }
                                });
                            }
                        }
                    });

                    // 监听 <head> 中的 script 标签变化
                    scriptObserver.observe(document.head, { childList: true, subtree: true });
                }
            }
        }
    });

    // 监听整个文档，直到找到 <head> 标签
    observer.observe(document.documentElement, { childList: true, subtree: true });
})();






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
