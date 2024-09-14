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

function sendMessage2Background(key, value) {
    chrome.runtime.sendMessage({
        key: key,
        value: value
    }, function (response) {
        console.log(response);
    })
}

(function adsBlockInit() {
    // 获取 checkbox 元素
    const adsBlockCheckBox = document.getElementById('adsBlock');
    const toolsButtonCheckBox = document.getElementById('toolsButton');
    let adsBlockCheckBoxCache = getCache('adsBlock');
    let toolsButtonCheckBoxCache = getCache('toolsButton');

    // 开启广告拦截checkBox
    if (adsBlockCheckBoxCache !== null) {
        adsBlockCheckBox.checked = adsBlockCheckBoxCache;
        sendMessage2Background('adsBlock', adsBlockCheckBox.checked);
    } else {
        setCache('adsBlock', adsBlockCheckBox.checked);
        sendMessage2Background('adsBlock', adsBlockCheckBox.checked);
    }
    // 为 checkbox 添加 change 事件监听器
    adsBlockCheckBox.addEventListener('change', function () {
        setCache('adsBlock', adsBlockCheckBox.checked);
        sendMessage2Background('adsBlock', adsBlockCheckBox.checked);
        // console.log(adsBlockCheckBox.checked);
    });

    // 开启下单按钮checkBox
    if (toolsButtonCheckBoxCache !== null) {
        toolsButtonCheckBox.checked = toolsButtonCheckBoxCache;
        sendMessage2Background('toolsButton', toolsButtonCheckBox.checked);
    } else {
        setCache('toolsButton', adsBlockCheckBox.checked);
        sendMessage2Background('toolsButton', toolsButtonCheckBox.checked);
    }
    // 为 checkbox 添加 change 事件监听器
    toolsButtonCheckBox.addEventListener('change', function () {
        setCache('toolsButton', toolsButtonCheckBox.checked);
        sendMessage2Background('toolsButton', toolsButtonCheckBox.checked);
        // console.log(toolsButtonCheckBox.checked);
    });

    // 设置按钮宽度
    const toolsButton = document.getElementById('toolsButtonWidth');
    let toolsButtonWidthCache = getCache('toolsButtonWidth');
    if (toolsButtonWidthCache !== null) {
        toolsButton.value = toolsButtonWidthCache+'';
        sendMessage2Background('toolsButtonWidth', parseInt(toolsButton.value));
    } else {
        setCache('toolsButtonWidth', toolsButton.value);
        sendMessage2Background('toolsButtonWidth', parseInt(toolsButton.value));
    }
    // 为 toolsButton 添加 change 事件监听器
    toolsButton.addEventListener('change', function () {
        setCache('toolsButtonWidth', parseInt(toolsButton.value));
        sendMessage2Background('toolsButtonWidth', parseInt(toolsButton.value));
        // console.log(toolsButton.style.width.replace('px', ''));
    });

})();

