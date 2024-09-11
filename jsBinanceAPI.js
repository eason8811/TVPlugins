// 将参数对象转换为查询字符串的函数
function param2string(param) {
    let s = '';
    for (const key in param) {
        if (param.hasOwnProperty(key)) {
            s += key + '=' + encodeURIComponent(param[key]) + '&';
        }
    }
    return s.slice(0, -1); // 移除最后的 '&'
}

// 使用 Web Crypto API 生成 HMAC-SHA256 签名
async function generateSignature(secret_key, data) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret_key),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(data)
    );

    // 将签名转换为16进制字符串
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// 定义BinanceAPI类
class BinanceAPI {
    constructor(base_url, api_key, secret_key) {
        this.base_url = base_url;
        this.api_key = api_key;
        this.secret_key = secret_key;
    }

    async api(method, request_path, body) {
        const headers = {
            'X-MBX-APIKEY': this.api_key,
        };

        // 如果请求路径不是深度数据的路径，需要签名
        if (request_path !== '/dapi/v1/depth' && request_path !== '/api/v3/depth') {
            const paramStr = param2string(body);
            const signature = await generateSignature(this.secret_key, paramStr);
            body.signature = signature;
        }

        let url = `${this.base_url}${request_path}`;
        let options = {
            method: method,
            headers: headers,
        };

        if (method === 'GET' || method === 'DELETE') {
            const paramString = param2string(body);
            url += `?${paramString}`;
        } else if (method === 'POST') {
            options.body = new URLSearchParams(body); // 将body编码为form-data
        }

        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Error:', error);
        }
    }
}