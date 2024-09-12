// 获取 checkbox 元素
const checkbox = document.getElementById('adsBlock');

// 为 checkbox 添加 change 事件监听器
checkbox.addEventListener('change', function () {
    if (checkbox.checked) {
        console.log('广告拦截已开启');
    } else {
        console.log('广告拦截已关闭');
    }
});