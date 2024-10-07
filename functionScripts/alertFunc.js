(function listenAlertSet() {
    function activateOriginAlertSetter(event) {
        let container = document.querySelector('#overlap-manager-root');
        let template = event.detail.value.template;
        container.insertAdjacentHTML('beforeend', template);
    }

    window.addEventListener('setAlert', activateOriginAlertSetter);
})();