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

function eventListenerAdder(element, event, callback) {
    if (element.addEventListener) {
        element.addEventListener(event, callback, false);
    } else if (element.attachEvent) {
        element.attachEvent('on' + event, callback);
    }
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
        toolsButton.value = toolsButtonWidthCache + '';
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

(function checkBoxAction() {
    // 获取 checkbox的label 元素
    // const label = document.getElementById('adsBlockLabel');
    const adsBlockCheckBox = document.getElementById('adsBlock');
    const toolsButtonCheckBox = document.getElementById('toolsButton');

    function changeCheckbox() {
        if (this.checked) {
            this.nextElementSibling.classList.add('checked-ywH2tsV_');
            this.nextElementSibling.firstElementChild.innerHTML =
                '<span role="img" class="icon-ywH2tsV_" aria-hidden="true">' +
                '   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 11 9" width="11" height="9" fill="none">' +
                '       <path stroke="currentColor" stroke-width="2" d="M0.999878 4L3.99988 7L9.99988 1"></path>' +
                '   </svg>' +
                '</span>';
        } else {
            this.nextElementSibling.classList.remove('checked-ywH2tsV_');
            this.nextElementSibling.firstElementChild.innerHTML = '';
        }
    }

    changeCheckbox.apply(adsBlockCheckBox);
    changeCheckbox.apply(toolsButtonCheckBox);

    eventListenerAdder(adsBlockCheckBox, 'change', changeCheckbox);
    eventListenerAdder(toolsButtonCheckBox, 'change', changeCheckbox);
})();

(function numericInputHover() {
    const inputSpanBox = document.querySelectorAll('.inner-slot-W53jtLjw.inner-middle-slot-W53jtLjw')[0].parentElement;

    function changeButtonStatus(event) {
        const buttonContainer = this.querySelector('.controlWrapper-DBTazUk2');
        if (event.type === 'mouseenter') {
            buttonContainer.innerHTML =
                '<button type="button" tabindex="-1" aria-label="增加"' +
                '   class="control-DBTazUk2 controlIncrease-DBTazUk2">' +
                '   <span role="img" class="controlIcon-DBTazUk2" aria-hidden="true">' +
                '       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18">' +
                '           <path fill="currentColor"' +
                '               d="M3.92 7.83 9 12.29l5.08-4.46-1-1.13L9 10.29l-4.09-3.6-.99 1.14Z">' +
                '           </path>' +
                '       </svg>' +
                '   </span>' +
                '</button>' +
                '<button type="button" tabindex="-1" aria-label="减少"' +
                '   class="control-DBTazUk2 controlDecrease-DBTazUk2">' +
                '   <span role="img" class="controlIcon-DBTazUk2" aria-hidden="true">' +
                '       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18" width="18" height="18">' +
                '            <path fill="currentColor"' +
                '               d="M3.92 7.83 9 12.29l5.08-4.46-1-1.13L9 10.29l-4.09-3.6-.99 1.14Z">' +
                '         </path>' +
                '       </svg>' +
                '   </span>' +
                '</button>';
            let addButton = buttonContainer.querySelector('button[aria-label="增加"]');
            let decreaseButton = buttonContainer.querySelector('button[aria-label="减少"]');

            function changeValue(event) {
                let input = document.getElementById('toolsButtonWidth');
                input.focus();
                let value = parseInt(input.value);
                if (event.currentTarget === addButton) {
                    value++;
                } else if (event.currentTarget === decreaseButton) {
                    value--;
                }
                input.value = value;
                const newEvent = new Event('change', {
                    bubbles: true,  // 设置为 true 使事件冒泡
                    cancelable: true  // 设置为 true 使事件可取消
                });
                input.dispatchEvent(newEvent);  // 手动触发 change 事件
            }

            eventListenerAdder(addButton, 'click', changeValue);
            eventListenerAdder(decreaseButton, 'click', changeValue);
        } else if (event.type === 'mouseleave') {
            let addButton = buttonContainer.querySelector('button[aria-label="增加"]');
            let decreaseButton = buttonContainer.querySelector('button[aria-label="减少"]');
            addButton.removeEventListener('click', changeValue);
            decreaseButton.removeEventListener('click', changeValue);

            buttonContainer.innerHTML = '';
        }
    }


    eventListenerAdder(inputSpanBox, 'mouseenter', changeButtonStatus);
    eventListenerAdder(inputSpanBox, 'mouseleave', changeButtonStatus);
})();

(function inputFocus() {
    const input = document.getElementById('toolsButtonWidth');

    function inputFocusBlur(event) {
        let parentSpan = this.parentElement.parentElement;
        let siblingSpan = this.parentElement.nextElementSibling.nextElementSibling;
        if (event.type === 'focus') {
            input.setAttribute('tabindex', '0');
            parentSpan.setAttribute('tabindex', '-1');
            parentSpan.setAttribute('class', 'container-WDZ0PRNh container-small-WDZ0PRNh intent-primary-WDZ0PRNh border-thin-WDZ0PRNh size-small-WDZ0PRNh with-highlight-WDZ0PRNh focused-WDZ0PRNh adjust-position-WDZ0PRNh first-row-WDZ0PRNh first-col-WDZ0PRNh font-size-medium-WDZ0PRNh input-ZOx_CVY3');
            siblingSpan.setAttribute('class', 'highlight-WDZ0PRNh shown-WDZ0PRNh size-small-WDZ0PRNh');
        } else if (event.type === 'blur') {
            input.setAttribute('tabindex', '-1');
            parentSpan.setAttribute('tabindex', '0');
            parentSpan.setAttribute('class', 'container-WDZ0PRNh container-small-WDZ0PRNh intent-default-WDZ0PRNh border-thin-WDZ0PRNh size-small-WDZ0PRNh adjust-position-WDZ0PRNh first-row-WDZ0PRNh first-col-WDZ0PRNh font-size-medium-WDZ0PRNh input-ZOx_CVY3');
            siblingSpan.setAttribute('class', 'highlight-WDZ0PRNh');
        }
    }

    eventListenerAdder(input, 'focus', inputFocusBlur);
    eventListenerAdder(input, 'blur', inputFocusBlur);
})();

(function optionTabsChange() {
    const basic = document.getElementById('basic');
    const alerts = document.getElementById('alerts');

    function changeTab(event) {
        let thisTab = event.currentTarget;
        let buttonList = document.getElementById('id_source-properties-editor-tabs_tablist')
            .querySelectorAll('button');

        let buttonIndex = 0;
        for (let i = 0; i < buttonList.length; i++) {
            let tabID = `${buttonList[i].id}Tab`;
            if (buttonList[i] === thisTab) {
                buttonList[i].setAttribute('class', 'underline-tab-cfYYXvwA size-small-cfYYXvwA selected-cfYYXvwA');
                document.getElementById(tabID).style.setProperty('display', 'block');
                buttonIndex = i;
            } else {
                buttonList[i].setAttribute('class', 'underline-tab-cfYYXvwA size-small-cfYYXvwA');
                document.getElementById(tabID).style.setProperty('display', 'none');
            }
        }
        let translateX = 0;
        for (let i = 0; i <= buttonIndex; i++) {
            let buttonMarginLeft = parseInt(getComputedStyle(buttonList[i]).marginLeft.replace('px', ''));
            let buttonWidth = parseInt(getComputedStyle(buttonList[i]).width.replace('px', ''));
            let buttonMarginRight = parseInt(getComputedStyle(buttonList[i]).marginRight.replace('px', ''));
            translateX += buttonMarginLeft + buttonWidth + buttonMarginRight;
            if (i === buttonIndex) {
                translateX -= buttonMarginRight + buttonWidth;
            }
        }
        document.querySelector('.underline-Pun8HxCz').setAttribute('style', `transform: translateX(${translateX}px) scaleX(0.32); transition-duration: 100ms;`);
    }

    eventListenerAdder(basic, 'click', changeTab);
    eventListenerAdder(alerts, 'click', changeTab);
})();

(function tooltipsShow() {
    const tooltipsContainer = document.getElementById('tooltip-root-element');
    let optionButtonList = [],
        buttonParentList = document.querySelector('.container-u7Ufi_N7.container-CTQ1auV7').children;
    for (let i = 0; i < buttonParentList.length; i++) {
        let partButtonList = buttonParentList[i].children;
        for (let j = 0; j < partButtonList.length; j++) {
            optionButtonList.push(partButtonList[j]);
        }
    }
    let alertButtonList = document.querySelectorAll('.overlayButtons-ucBqatk5 div');

    function changeTooltipStatus(event) {
        let currentButton = event.currentTarget;
        if (event.type === 'mouseenter') {
            let title = currentButton.getAttribute('title');
            let template;
            fetch('templates/tooltips.html')
                .then(respond => respond.text())
                .then(data => {
                    template = data.replace(/ {2,}|[\r\n]+/g, '');
                    tooltipsContainer.innerHTML = template.replace('{{ title }}', title);
                    let top = currentButton.getBoundingClientRect().top;
                    let left = currentButton.getBoundingClientRect().left;
                    let tooltipWidth = document.querySelector('#common-tooltip-wrapper').offsetWidth;
                    let tooltipHeight = document.querySelector('#common-tooltip-wrapper').offsetHeight;
                    let buttonWidth = currentButton.offsetWidth;
                    // let buttonHeight = currentButton.offsetHeight;
                    let tooltipTop = top - tooltipHeight - 10;
                    let tooltipLeft = left + buttonWidth / 2 - tooltipWidth / 2;
                    document.querySelector('#common-tooltip-wrapper').setAttribute('style', `top: ${tooltipTop}px; left: ${tooltipLeft}px;`);

                    let id = setTimeout(() => {
                        document.querySelector('#common-tooltip-wrapper').setAttribute('class', 'common-tooltip-EJBD96zX common-tooltip--horizontal-EJBD96zX common-tooltip--direction_normal-EJBD96zX');
                    }, 500);
                    window.tooltipsTimeoutList = window.tooltipsTimeoutList || [];
                    window.tooltipsTimeoutList.push(id);
                    currentButton.removeAttribute('title');
                    currentButton.setAttribute('data-title', title);
                });
        } else if (event.type === 'mouseleave' && window.tooltipsTimeoutList) {
            for (let id of window.tooltipsTimeoutList) {
                clearTimeout(id);
            }
            tooltipsContainer.innerHTML = '';
            let title = currentButton.getAttribute('data-title');
            currentButton.setAttribute('title', title);
            currentButton.removeAttribute('data-title');
        }
    }

    function mouseLeaveDoc(event) {
        // 鼠标离开页面
        if (window.tooltipsTimeoutList) {
            for (let id of window.tooltipsTimeoutList) {
                clearTimeout(id);
            }
            tooltipsContainer.innerHTML = '';
        }
    }

    for (let button of optionButtonList) {
        eventListenerAdder(button, 'mouseenter', changeTooltipStatus);
        eventListenerAdder(button, 'mouseleave', changeTooltipStatus);
    }
    for (let button of alertButtonList) {
        eventListenerAdder(button, 'mouseenter', changeTooltipStatus);
        eventListenerAdder(button, 'mouseleave', changeTooltipStatus);
    }
    eventListenerAdder(document, 'mouseleave', mouseLeaveDoc);
})();

(function openOriginSetAlertPage() {
    let setAlertButton = document.querySelector('div[data-name="set-alert-button"]');
    eventListenerAdder(setAlertButton, 'click', function () {
        fetch('/templates/setAlert.html')
            .then(respond => respond.text())
            .then(data => {
                // let template = data.replace(/ {2,}|[\r\n]+/g, '');
                sendMessage2Background('setAlert', {'template': data});
            })
    })
})();
