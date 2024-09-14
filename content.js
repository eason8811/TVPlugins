let checkBoxIDList = ['adsBlock', 'toolsButton']

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.key && checkBoxIDList.includes(request.key)) {
        setCache(request.key, request.value);
        sendResponse({response: `${request.key},${request.value} content.js已收到`});  // 可选的，返回响应给 background.js
    }
});

function getCache(key) {
    let cacheObj = JSON.parse(localStorage.getItem(key));
    if (cacheObj) {
        return cacheObj.value;
    }
    return null;
}

function setCache(key, value) {
    let cacheObj = {
        value: value,
    }
    localStorage.setItem(key, JSON.stringify(cacheObj));
}

// 动态加载fetchHook.js脚本
// 动态创建 script 标签，并将其插入到页面中
function injectScript(file) {
    console.log('fetchHook.js 脚本开始加载');
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'fetchHook';
    script.src = chrome.runtime.getURL(file);  // 获取插件内的脚本文件的绝对路径
    console.log(script);
    script.onload = function() {
        // 在脚本加载完成后，可以选择移除它，防止污染 DOM
        // this.remove();  // 这里选择在加载完后移除 <script> 标签
        console.log('fetchHook.js 脚本加载完成');
    };
    (document.head || document.documentElement).appendChild(script);  // 将脚本插入页面
}

// 注入 fetchHook.js
injectScript('fetchHook.js');



if (getCache('adsBlock')) {
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
}


