(function listenAlertSet() {
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

        const observer = new MutationObserver((mutationsList, observer) => {
            for (const mutation of mutationsList) {
                if (mutation.target.classList.value === "widgetbar-widgetbody" && mutation.addedNodes[0].classList.value === "wrapper-G90Hl2iS") {
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
        });
        let observeNode = document.querySelector('div[class="widgetbar-pagescontent"]');
        observer.observe(observeNode, {childList: true, subtree: true});
        openAlertPage.click();
    }

    window.addEventListener('setAlert', activateOriginAlertSetter);
})();

class Alert {
    constructor(symbol, condition, triggerCondition, expire, alertName, alertMessage) {
        this.symbol = symbol;
        this.condition = condition;
        this.triggerCondition = triggerCondition;
        this.expire = expire;
        this.alertName = alertName;
        this.alertMessage = alertMessage;
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


}
