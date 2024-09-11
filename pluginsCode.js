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

async function fetchAndReadStream(response) {

    // 获取响应体的 ReadableStream
    const reader = response.body.getReader();

    // 创建一个解码器，用于将 Uint8Array 转换为字符串
    const decoder = new TextDecoder();
    let result = ''; // 用于存储最终的字符串结果
    let done = false;

    // 逐块读取数据
    while (!done) {
        const { value, done: isDone } = await reader.read();
        done = isDone;

        if (value) {
            // 将 Uint8Array 数据转换为字符串
            result += decoder.decode(value, { stream: true });
            console.log(result);
        }
    }

    // 读取结束后，进行最后的解码
    result += decoder.decode();

    // 打印或处理最终的结果
    console.log("Streamed response:", result);

    // return result;
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
            return originalFetch.apply(this, arguments).then(response => {
                // 克隆 response，以便后续处理
                const responseClone = response.clone();

                fetchAndReadStream(responseClone);
                return response;  // 返回原始的 response 对象，便于后续处理
            });
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
// window.fetch = originalFetch;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

window.addEventListener('load', function () {
    console.log('Page fully loaded');

    // 选择要观察的节点
    const targetNode = document.getElementsByClassName('toastListInner-Hvz5Irky')[0];
    const targetNode2 = document.getElementById('overlap-manager-root').children[document.getElementById('overlap-manager-root').children.length - 1];

    // 配置观察选项
    const config = {
        attributes: true,  // 监听属性变化
        childList: true,   // 监听子节点的变化（例如新增或删除子节点）
        subtree: true,     // 监听后代节点变化
        characterData: true // 监听节点内容或文本节点变化
    };

    // 创建一个回调函数，当 DOM 发生变化时会调用它
    const callback = function (mutationsList, observer) {
        const nodeList = document.getElementsByClassName('toastGroup-JUpQSPBo');
        for (let i = 0; i < nodeList.length; i++) {
            nodeList[i].style.display = 'none';
        }
        console.log('已进行一次广告拦截');
    };

    const callback2 = function (mutationsList, observer) {
        targetNode2.style.display = 'none';
        console.log('已进行一次大广告拦截');
    };

    // 创建一个 MutationObserver 实例，并传入回调函数
    const observer = new MutationObserver(callback);
    const observer2 = new MutationObserver(callback2);

    // 开始监听目标节点
    observer.observe(targetNode, config);
    observer2.observe(targetNode2, config);

// 你可以在需要时停止观察
// observer.disconnect();

});


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

