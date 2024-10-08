(function listenAlertSet() {
    function activateOriginAlertSetter(event) {
        let alertButton = document.querySelector('button[aria-label="警报"]');
        alertButton.click();
    }

    window.addEventListener('setAlert', activateOriginAlertSetter);
})();

function nn() {
    // 保存每个元素的原始 style
    const originalStyles = new Map();

    // 获取要监听的目标元素
    const targetElement = document.querySelector('div[class="js-rootresizer__contents layout-with-border-radius"]');

    // 保存初始样式的函数
    function saveInitialStyles(element) {
        originalStyles.set(element, element.style.cssText);
        // 如果需要对子孙元素进行处理，递归保存它们的初始样式
        element.querySelectorAll('*').forEach((child) => {
            originalStyles.set(child, child.style.cssText);
        });
    }

    // 调用函数保存初始样式
    saveInitialStyles(targetElement);

    // 创建 MutationObserver 实例
    const observer = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                const target = mutation.target;
                const oldStyle = originalStyles.get(target);  // 获取原来的样式
                const newStyle = target.style.cssText;  // 当前的新样式

                console.log(`Element: `, target);
                console.log(`Old style: ${oldStyle}`);
                console.log(`New style: ${newStyle}`);

                // 更新已保存的样式为最新样式
                originalStyles.set(target, newStyle);
            }
        });
    });

    // 配置 MutationObserver
    const config = {
        attributes: true,               // 监听属性变化
        attributeFilter: ['style'],     // 仅监听 'style' 属性
        subtree: true                   // 监听子孙节点的变化
    };

    // 开始观察目标元素及其子孙元素
    observer.observe(targetElement, config);
}