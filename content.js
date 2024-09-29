let checkBoxIDList = ['adsBlock', 'toolsButton', 'toolsButtonWidth']

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.key && checkBoxIDList.includes(request.key)) {
        setCache(request.key, request.value);
        sendResponse({response: `${request.key},${request.value} content.js已收到`});  // 可选的，返回响应给 background.js
        const localStorgeChanged = new CustomEvent('localStorgeChanged', {
            detail: {
                key: request.key,
                value: request.value
            }
        });
        window.dispatchEvent(localStorgeChanged);
    }
});

window.getCache = function (key) {
    let cacheObj = JSON.parse(localStorage.getItem(key));
    if (cacheObj) {
        return cacheObj.value;
    }
    return null;
}

window.setCache = function (key, value) {
    let cacheObj = {
        value: value,
    }
    localStorage.setItem(key, JSON.stringify(cacheObj));
}

// 动态加载fetchHook.js脚本
// 动态创建 script 标签，并将其插入到页面中
function injectScript(file) {
    console.log(`${file} 脚本开始加载`);
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = 'fetchHook';
    script.src = chrome.runtime.getURL(file);  // 获取插件内的脚本文件的绝对路径
    console.log(script);
    script.onload = function () {
        // 在脚本加载完成后，可以选择移除它，防止污染 DOM
        // this.remove();  // 这里选择在加载完后移除 <script> 标签
        console.log(`${file} 脚本加载完成`);
    };
    (document.head || document.documentElement).appendChild(script);  // 将脚本插入页面
}

// 注入脚本
// injectScript('functionScripts/webpackHook.js');
injectScript('functionScripts/fetchHook.js');
// injectScript('functionScripts/adsBlock.js');



