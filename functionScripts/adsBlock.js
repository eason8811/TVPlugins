window.addEventListener('localStorgeChanged', (event) => {
    let observer, observer2;
    if (event.detail.key === 'adsBlock' && event.detail.value) {
        adsBlock();
    } else if (event.detail.key === 'adsBlock' && !event.detail.value) {
        if (observer)
            observer.disconnect();
        if (observer2)
            observer2.disconnect();
    }
});

function adsBlock(observer, observer2) {
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
    observer = new MutationObserver(callback);
    observer2 = new MutationObserver(callback2);

    // 开始监听目标节点
    observer.observe(targetNode, config);
    observer2.observe(targetNode2, config);

    // 你可以在需要时停止观察
    // observer.disconnect();
}

window.addEventListener('load', function () {
    if (window.getCache('adsBlock'))
        window.dispatchEvent(new CustomEvent('adsBlock', {detail: {key: 'adsBlock', value: true}}));
});
