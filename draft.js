this = {
    response: null,
    responseText: null
};

let xhr = this;
const handler = {
    originResponse: xhr.response,
    originResponseText: xhr.responseText,
    get: function (target, property, receiver) {
        if (property === 'response' || property === 'responseText') {
            console.log(`Property '${property}' has been accessed, value: ${target[property]}`);
            debugger;
            return property === 'response' ? this.originResponse : this.originResponseText;
        }

        return Reflect.get(target, property, receiver);
    }
};

// 创建 Proxy 对象
const proxy = new Proxy(xhr, handler);
this.response = proxy;
this.responseText = proxy;



