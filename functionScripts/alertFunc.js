window.alertMediaList = [
    ['fired', '3_notes_reverb', 'alarm_clock', 'beep_beep', 'alert_calling', 'chirpy', 'fault', 'hand_bell'],
    ['banjo', 'droplet', 'flickering', 'hoarse', 'knock-knock', 'promise', 'trumpets', 'you-win'],
    ['bullfrog', 'cat', 'dog', 'raven', 'rooster', 'thunder', 'water-drop', 'whale'],
    ['attention', 'guess-what', 'hey-pssst', 'hey-take-a-look', 'hey', 'look-at-me', 'mmm-sexy', 'oh'],
    ['applauses', 'breaking-some-glass', 'cash-register', 'chimes-power-down', 'dramatic-one-note', 'jackpot', 'man-laughing', 'martian-gun']
]

window.ExpireType = {
    'expire': true,
    'infinite': false
}
window.currentAlertExpireType = window.ExpireType.expire;
let infiniteAlertText = '无限制警报';

function getTrueAmount(obj) {
    if (typeof obj === 'number') {
        return obj ? 1 : 0;
    } else if (typeof obj === 'object') {
        let amount = 0;
        for (let key in obj) {
            if (obj[key])
                amount++;
        }
        return amount;
    } else if (obj instanceof Array) {
        let amount = 0;
        for (let i = 0; i < obj.length; i++) {
            if (obj[i])
                amount++;
        }
        return amount;
    }
}

(function listenAlertSet() {
    let originExpireDate;

    function activateOriginAlertSetter(event) {
        let pageList = document.querySelectorAll('div[class="widgetbar-pagescontent"] > div');
        let selectedPageIndex = -1;
        for (let i = 0; i < pageList.length; i++) {
            if (pageList[i].classList.value === "widgetbar-page active") {
                selectedPageIndex = i;
                break;
            }
        }
        let openAlertPageButton = document.querySelector('button[data-name="alerts"]');

        function defineNoteAmountProperty(noteAmountNode, noteTypeInfo) {
            if (!noteAmountNode.hasOwnProperty('noteAmountValue')) {
                noteAmountNode.noteAmountValue = getTrueAmount(noteTypeInfo);
                Object.defineProperty(noteAmountNode, 'nodeValue', {
                    get() {
                        return this.noteAmountValue;
                    },
                    set(value) {
                        value = getTrueAmount(noteTypeInfo);
                        this.noteAmountValue = value;
                        this.textContent = value;
                    }
                })
            }
            noteAmountNode.noteAmountValue = getTrueAmount(noteTypeInfo);
            noteAmountNode.textContent = getTrueAmount(noteTypeInfo);
        }

        function afterOpenNotePage(noteMutationsList, noteObserver) {
            // 容器变化后，隐藏无效的通知方式，并为上方通知的方式数目添加相应的变化时间，以反应通知方式的数目
            noteObserver.disconnect();
            let checkBoxList = document.querySelectorAll('div[class="content-XZUCVcPz"] > div');
            let noteTypeInfo = window.getCache('noteType');
            for (let i = 0; i < checkBoxList.length; i++) {
                if (!(i >= 3 && i <= 5 || i >= 13 && i <= 15)) {
                    checkBoxList[i].style.display = 'none';
                } else {

                    function onclickNoteCheckboxLabel(event) {
                        // 当点击通知方式的勾选框时，实时更新通知方式数目
                        let label = event.currentTarget;
                        let noteAmountNode = document.querySelector('#alert-dialog-tabs__notifications span[class]').firstChild;
                        if (label === checkBoxList[3].querySelector('label') && event.target.tagName === 'INPUT') {
                            noteTypeInfo['toast'] = !noteTypeInfo['toast'];
                            window.setCache('noteType', noteTypeInfo);
                            defineNoteAmountProperty(noteAmountNode, noteTypeInfo);
                        } else if (label === checkBoxList[13].querySelector('label') && event.target.tagName === 'INPUT') {
                            noteTypeInfo['sound'] = !noteTypeInfo['sound'];
                            window.setCache('noteType', noteTypeInfo);
                            if (noteTypeInfo['sound'] && window.getCache('alertSoundInfo')){
                                // 如果开启了声音提示，并且有缓存信息
                                let alertSoundInfo = {};

                            }
                            defineNoteAmountProperty(noteAmountNode, noteTypeInfo);
                        }
                    }

                    if (i === 3 && noteTypeInfo['toast'] !== checkBoxList[i].querySelector('input').checked) {
                        checkBoxList[i].querySelector('label').click();
                    } else if (i === 13 && noteTypeInfo['sound'] !== checkBoxList[i].querySelector('input').checked) {
                        checkBoxList[i].querySelector('label').click();
                    }
                    if (i === 3 || i === 13) {
                        checkBoxList[i].querySelector('label').addEventListener('click', onclickNoteCheckboxLabel);
                        document.querySelector('#alert-dialog-tabs__settings').addEventListener('click', () => {
                            checkBoxList[i].querySelector('label').removeEventListener('click', onclickNoteCheckboxLabel);
                        });
                    }
                }
            }
        }

        function changeNotePage(event) {
            // 通知按钮被点击后，监听容器的变化，并隐藏无效的通知方式
            let noteObserver = new MutationObserver(afterOpenNotePage);
            let NoteObserverNode = document.querySelector('div[class="content-XZUCVcPz"]');
            noteObserver.observe(NoteObserverNode, {childList: true});
        }

        function changeExpireType(event) {
            // 当打开过期时间调整器时，替换无限制警报的按钮点击事件
            const switcherObserver = new MutationObserver((mutationsList, observer) => {

                switcherObserver.disconnect();

                infiniteAlertText = document.querySelector('div[data-name="menu-inner"] label[for="unexpired-date"]').innerText;
                let expireTypeSwitcher = document.querySelector('span[class="switcher-fwE97QDf"]');
                let setExpireDateButtonList = document.querySelector('span[class="switcher-fwE97QDf"]').parentElement.parentElement.querySelectorAll('button[data-day], button[data-overflow-tooltip-text]');
                let expireTypeSwitcherInnerHTML = expireTypeSwitcher.innerHTML;
                if (event.type === 'click') {
                    event.stopPropagation();
                    originExpireDate = document.querySelector('span[class="content-H6_2ZGVv"]').innerText !== infiniteAlertText ? document.querySelector('span[class="content-H6_2ZGVv"]').innerText : originExpireDate;
                    if (!window.currentAlertExpireType) {
                        expireTypeSwitcher.innerHTML = expireTypeSwitcherInnerHTML
                            .replace('switchView-CtnpmPzP small-CtnpmPzP', 'switchView-CtnpmPzP small-CtnpmPzP checked-CtnpmPzP')
                            .replace('input-fwE97QDf', 'input-fwE97QDf checked-fwE97QDf');
                        document.querySelector('button[aria-controls="alert-editor-expiration-popup"] > span[class="content-H6_2ZGVv"]').innerText = infiniteAlertText;
                    } else {
                        expireTypeSwitcher.innerHTML = expireTypeSwitcherInnerHTML;
                    }
                    expireTypeSwitcher.addEventListener('click', () => {
                        window.currentAlertExpireType = !window.currentAlertExpireType;
                        expireTypeSwitcher.querySelector('input').classList.toggle('checked-fwE97QDf');
                        expireTypeSwitcher.querySelector('span > span > span').classList.toggle('checked-CtnpmPzP');
                        let expireDateContent = document.querySelectorAll('button[aria-controls] > span[class="content-H6_2ZGVv"]');
                        if (!window.currentAlertExpireType) {
                            expireDateContent.innerText = infiniteAlertText;
                        } else {
                            expireDateContent.innerText = originExpireDate;
                        }
                    });

                    for (let setExpireDateButton of setExpireDateButtonList) {
                        setExpireDateButton.addEventListener('click', () => {
                            window.currentAlertExpireType = window.ExpireType.expire;
                            expireTypeSwitcher.querySelector('input').classList.toggle('checked-fwE97QDf', false);
                            expireTypeSwitcher.querySelector('span > span > span').classList.toggle('checked-CtnpmPzP', false);
                            let expireDateContent = document.querySelectorAll('button[aria-controls] > span[class="content-H6_2ZGVv"]');
                            if (setExpireDateButton === document.querySelector('button[class="btn-fpDXgGC1 button-D4RPB3ZC medium-D4RPB3ZC black-D4RPB3ZC primary-D4RPB3ZC apply-overflow-tooltip apply-overflow-tooltip--check-children-recursively apply-overflow-tooltip--allow-text apply-common-tooltip"]')) {
                                expireDateContent.innerText = document.querySelector('button[class="btn-fpDXgGC1 button-D4RPB3ZC medium-D4RPB3ZC black-D4RPB3ZC primary-D4RPB3ZC apply-overflow-tooltip apply-overflow-tooltip--check-children-recursively apply-overflow-tooltip--allow-text apply-common-tooltip"] > span[class="content-D4RPB3ZC"]').innerText;
                            } else {
                                expireDateContent.innerText = originExpireDate;
                            }
                        });
                    }
                }
            });
            let switcherObserverNode = document.querySelector('div[data-name="alerts-create-edit-dialog"] + div');
            switcherObserver.observe(switcherObserverNode, {childList: true, subtree: true});
        }

        function onclickAlertSettingButton(event) {
            // 当点击警报设置按钮时，添加监听器
            const innerObserver = new MutationObserver(afterOpenAlertPage);
            let innerObserverNode = document.querySelector('#overlap-manager-root');
            innerObserver.observe(innerObserverNode, {childList: true, subtree: true});
        }

        function onclickSubmitButton(event) {
            let submitButton = document.querySelector('button[data-name="submit"]');
            let cancelButton = document.querySelector('button[data-name="cancel"]');
            document.querySelector('#alert-dialog-tabs__settings').click();

            let symbol = document.querySelector('fieldset[class="container-Fddz5wLp symbolsRow-INZ15hnz"] span[class="label-QIZwlRt3 apply-overflow-tooltip"]').innerText;
            let conditionSpanList = document.querySelectorAll('fieldset[class="container-Fddz5wLp"] span[class="label-QIZwlRt3 apply-overflow-tooltip"]');

            let haveSubTarget = conditionSpanList.length > 3;
            let alertTarget = conditionSpanList[0].innerText;
            let subTarget = haveSubTarget ? conditionSpanList[1].innerText : null;
            let conditionType = conditionSpanList[haveSubTarget ? 2 : 1].innerText;
            let beTouchedElement = conditionSpanList[haveSubTarget ? 3 : 2].innerText;
            let beTouchedElementValue = document.querySelector('input[data-property-id="end-band-range"]').value;
            let condition = new Alert.Condition(haveSubTarget, alertTarget, subTarget, conditionType, beTouchedElement, beTouchedElementValue);

            let triggerButtonList = document.querySelectorAll('fieldset[class="container-Fddz5wLp"] button[data-name]');
            let checkedTriggerButton = triggerButtonList[0];
            for (let triggerButton of triggerButtonList) {
                if (triggerButton.getAttribute('aria-checked') === 'true') {
                    checkedTriggerButton = triggerButton;
                    break;
                }
            }
            let triggerType = checkedTriggerButton.getAttribute('data-name');
            let triggerCondition = new Alert.TriggerCondition(triggerType);

            let expireType = window.currentAlertExpireType;
            let expireDate = !expireType ? infiniteAlertText : document.querySelectorAll('button[aria-controls] > span[class="content-H6_2ZGVv"]').innerText;
            let expire = new Alert.Expire(expireType, expireDate);

            let alertName = document.querySelector('#alert-name').value;
            let alertMessage = document.querySelector('#alert-message').value;

            document.querySelector('#alert-dialog-tabs__notifications').click();
            let noteInfo = {
                'toast': window.getCache('noteType')['toast'],
                'sound': '',
            };

            let alert = new Alert(symbol, condition, triggerCondition, expire, alertName, alertMessage, noteInfo);


            console.log('提交被取消');
            cancelButton.click();
        }

        function afterOpenAlertPage(innerMutationsList, innerObserver) {
            // 为警报设置按钮添加事件监听器，当点击时，重新监听容器变化
            document.querySelector('#alert-dialog-tabs__settings').addEventListener('click', onclickAlertSettingButton)
            // 记录到期时间并添加监听器
            originExpireDate = document.querySelector('span[class="content-H6_2ZGVv"]').innerText;
            document.querySelector('button[aria-controls="alert-editor-expiration-popup"]').addEventListener('click', changeExpireType);
            let expireDateContent = document.querySelector('button[aria-controls="alert-editor-expiration-popup"] > span[class="content-H6_2ZGVv"]');
            if (!window.currentAlertExpireType) {
                expireDateContent.innerText = infiniteAlertText;
            } else {
                expireDateContent.innerText = originExpireDate;
            }

            let noteAmountSpan = document.querySelector('span[aria-label*="通知方式"]');
            if (!window.getCache('noteType')) {
                window.setCache('noteType', {
                    'toast': true,
                    'sound': true,
                });
            }
            noteAmountSpan.innerText = getTrueAmount(window.getCache('noteType'));
            // 为通知按钮添加事件监听器，当点击时，修改通知页面，调用回调函数 changeNotePage
            document.querySelector('#alert-dialog-tabs__notifications').addEventListener('click', changeNotePage);

            let submitButton = document.querySelector('button[data-overflow-tooltip-text*="创建"]');
            submitButton.addEventListener('click', onclickSubmitButton);
            innerObserver.disconnect();
        }

        function openSetterPage(mutationsList, observer) {
            // 打开添加警报页面，并恢复右边bar为原来的状态
            for (const mutation of mutationsList) {
                if (mutation.target.classList.value === "widgetbar-widgetbody" && mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.value === "wrapper-G90Hl2iS") {
                    let setAlertButton = document.querySelector('div[data-name="set-alert-button"]');
                    setAlertButton.click();
                    openAlertPageButton.click();
                    observer.disconnect();
                    if (selectedPageIndex !== -1) {
                        document.querySelectorAll('div[data-name="right-toolbar"] button')[selectedPageIndex].click();
                    }
                    break;
                }
            }
        }

        function afterOpenRightBarPage(mutationsList, observer) {
            // 检测警报设置页面是否被打开，如打开，执行回调函数 afterOpenAlertPage
            const innerObserver = new MutationObserver(afterOpenAlertPage);
            let innerObserverNode = document.querySelector('#overlap-manager-root');
            innerObserver.observe(innerObserverNode, {childList: true, subtree: true});
            openSetterPage(mutationsList, observer);
        }

        // 检测右边栏是否被打开，如打开，执行回调函数 afterOpenRightBarPage
        const observer = new MutationObserver(afterOpenRightBarPage);
        let observeNode = document.querySelector('div[class="widgetbar-pagescontent"]');
        observer.observe(observeNode, {childList: true, subtree: true});
        if (selectedPageIndex === 1) {
            document.querySelector('div[data-name="set-alert-button"]').click();
        } else {
            openAlertPageButton.click();
        }
    }

    window.addEventListener('setAlert', activateOriginAlertSetter);
})();

class Alert {
    constructor(symbol, condition, triggerCondition, expire, alertName, alertMessage, noteInfo) {
        this.symbol = symbol;
        this.condition = condition;
        this.triggerCondition = triggerCondition;
        this.expire = expire;
        this.alertName = alertName;
        this.alertMessage = alertMessage;
        this.noteInfo = noteInfo;
    }

    Condition = class {
        constructor(haveSubTarget, alertTarget, subTarget, conditionType, beTouchedElement, beTouchedElementValue) {
            this.haveSubTarget = haveSubTarget;
            this.alertTarget = alertTarget;
            this.subTarget = subTarget;
            this.conditionType = conditionType;
            this.beTouchedElement = beTouchedElement;
            this.beTouchedElementValue = beTouchedElementValue;
        }
    }

    TriggerCondition = class {
        constructor(triggerType) {
            this.triggerType = triggerType;
        }
    }

    Expire = class {
        constructor(expireType, expireDate) {
            this.expireType = expireType;
            this.expireDate = expireDate;
        }
    }
}
