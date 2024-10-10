window.ExpireType = {
    'expire': true,
    'infinite': false
}
window.currentAlertExpireType = window.ExpireType.expire;

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
        let openAlertPage = document.querySelector('button[aria-label="警报"]');

        function openSetterPage(mutationsList, observer) {
            for (const mutation of mutationsList) {
                if (mutation.target.classList.value === "widgetbar-widgetbody" && mutation.addedNodes.length > 0 && mutation.addedNodes[0].classList.value === "wrapper-G90Hl2iS") {
                    let setAlertButton = document.querySelector('div[data-name="set-alert-button"]');
                    setAlertButton.click();
                    openAlertPage.click();
                    observer.disconnect();
                    if (selectedPageIndex !== -1) {
                        document.querySelectorAll('div[data-name="right-toolbar"] button')[selectedPageIndex].click();
                    }
                    break;
                }
            }
        }

        function changeExpireType(event) {
            const switcherObserver = new MutationObserver((mutationsList, observer) => {

                switcherObserver.disconnect();
                let expireTypeSwitcher = document.querySelector('span[class="switcher-fwE97QDf"]');
                let setExpireDateButtonList = document.querySelector('span[class="switcher-fwE97QDf"]').parentElement.parentElement.querySelectorAll('button[data-day], button[data-overflow-tooltip-text]');
                let expireTypeSwitcherInnerHTML = expireTypeSwitcher.innerHTML;
                if (event.type === 'click') {
                    event.stopPropagation();
                    originExpireDate = document.querySelector('span[class="content-H6_2ZGVv"]').innerText !== '无限制警报' ? document.querySelector('span[class="content-H6_2ZGVv"]').innerText : originExpireDate;
                    if (!window.currentAlertExpireType) {
                        expireTypeSwitcher.innerHTML = expireTypeSwitcherInnerHTML
                            .replace('switchView-CtnpmPzP small-CtnpmPzP', 'switchView-CtnpmPzP small-CtnpmPzP checked-CtnpmPzP')
                            .replace('input-fwE97QDf', 'input-fwE97QDf checked-fwE97QDf');
                    } else {
                        expireTypeSwitcher.innerHTML = expireTypeSwitcherInnerHTML;
                    }
                    expireTypeSwitcher.addEventListener('click', () => {
                        window.currentAlertExpireType = !window.currentAlertExpireType;
                        expireTypeSwitcher.querySelector('input').classList.toggle('checked-fwE97QDf');
                        expireTypeSwitcher.querySelector('span > span > span').classList.toggle('checked-CtnpmPzP');
                        let expireDateContent = document.querySelector('button[aria-controls="alert-editor-expiration-popup"] > span[class="content-H6_2ZGVv"]');
                        if (!window.currentAlertExpireType) {
                            expireDateContent.innerText = '无限制警报';
                        } else {
                            expireDateContent.innerText = originExpireDate;
                        }
                    });

                    for (let setExpireDateButton of setExpireDateButtonList) {
                        setExpireDateButton.addEventListener('click', () => {
                            window.currentAlertExpireType = window.ExpireType.expire;
                            expireTypeSwitcher.querySelector('input').classList.toggle('checked-fwE97QDf', false);
                            expireTypeSwitcher.querySelector('span > span > span').classList.toggle('checked-CtnpmPzP', false);
                            let expireDateContent = document.querySelector('button[aria-controls="alert-editor-expiration-popup"] > span[class="content-H6_2ZGVv"]');
                            if (setExpireDateButton === document.querySelector('button[class="btn-fpDXgGC1 button-D4RPB3ZC medium-D4RPB3ZC black-D4RPB3ZC primary-D4RPB3ZC apply-overflow-tooltip apply-overflow-tooltip--check-children-recursively apply-overflow-tooltip--allow-text apply-common-tooltip"]')) {
                                expireDateContent.innerText = document.querySelector('button[class="btn-fpDXgGC1 button-D4RPB3ZC medium-D4RPB3ZC black-D4RPB3ZC primary-D4RPB3ZC apply-overflow-tooltip apply-overflow-tooltip--check-children-recursively apply-overflow-tooltip--allow-text apply-common-tooltip"] > span[class="content-D4RPB3ZC"]').innerText;
                            }else {
                                expireDateContent.innerText = originExpireDate;
                            }
                        });
                    }
                }
            });
            let switcherObserverNode = document.querySelector('div[data-name="alerts-create-edit-dialog"] + div');
            switcherObserver.observe(switcherObserverNode, {childList: true, subtree: true});
        }

        const observer = new MutationObserver((mutationsList, observer) => {
            const innerObserver = new MutationObserver((innerMutationsList, innerObserver) => {
                originExpireDate = document.querySelector('span[class="content-H6_2ZGVv"]').innerText;
                document.querySelector('button[aria-controls="alert-editor-expiration-popup"]').addEventListener('click', changeExpireType);
                innerObserver.disconnect();
            });
            let innerObserverNode = document.querySelector('#overlap-manager-root');
            innerObserver.observe(innerObserverNode, {childList: true, subtree: true});
            openSetterPage(mutationsList, observer);
        });

        let observeNode = document.querySelector('div[class="widgetbar-pagescontent"]');
        observer.observe(observeNode, {childList: true, subtree: true});
        if (selectedPageIndex === 1) {
            document.querySelector('div[data-name="set-alert-button"]').click();
        } else {
            openAlertPage.click();
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
