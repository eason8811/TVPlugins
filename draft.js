let obj = {
    123: (a) => {
        console.log(`函数123: 参数 ${a}`);
    },
    456: 'I am a value',
    789: {
        123: 'I am a Object'
    },
    901: (b) => {
        class c {
            constructor() {
                this.key = 'abc';
                this.value = 888;
            }

            _drawSourceImpl(e, t, i, s, o, n) {
                if (n && n.has(o.id()))
                    return;
                const r = i(o, this.state());
                if (r)
                    for (const i of r) {
                        const o = i.renderer(t);
                        o && (e.save(),
                            s(o, e, t),
                            e.restore())
                    }
            }
        }
    }
}

function myStringify(obj) {
    for (let key in obj) {
        if (typeof obj[key] !== 'object') {
            obj[key] = obj[key].toString();
        } else {
            obj[key] = myStringify(obj[key]);
        }
    }
    // console.log(JSON.stringify(obj));
    return JSON.stringify(obj);
}

function myAntiStringify(str) {
    let obj = JSON.parse(str);
    for (let key in obj) {
        try {
            obj[key] = eval(obj[key]);
        } catch (e) {
            try {
                obj[key] = JSON.parse(obj[key]);
            } catch (e) {
                obj[key] = obj[key];
            }
            obj[key] = obj[key];
        }
    }
    return obj;
}

let stringifiedObj = myStringify(obj);
console.log(stringifiedObj);
obj = myAntiStringify(stringifiedObj);
console.log(obj);

