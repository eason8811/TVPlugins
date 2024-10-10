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
    } else {
        sendResponse({response: `${request.key},${request.value} content.js已收到`});  // 可选的，返回响应给 background.js
        const event = new CustomEvent(request.key, {
            detail: {
                key: request.key,
                value: request.value
            }
        });
        window.dispatchEvent(event);
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
    console.log(`${file} 脚本开始加载`);
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.id = file.split('/')[1].replace('.js', '');
    script.src = chrome.runtime.getURL(file);  // 获取插件内的脚本文件的绝对路径
    console.log(script);
    script.onload = function () {
        // this.remove();  // 这里选择在加载完后移除 <script> 标签
        console.log(`${file} 脚本加载完成`);
    };
    (document.head || document.documentElement).appendChild(script);  // 将脚本插入页面
    return script;
}

// 注入脚本
let webpackHookScript = injectScript('functionScripts/webpackHook.js');
webpackHookScript.onload = () => {
    injectScript('functionScripts/adsBlock.js');
    injectScript('functionScripts/buttonDraw.js');
    injectScript('functionScripts/alertFunc.js');
};




