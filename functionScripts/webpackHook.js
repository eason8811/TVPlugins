/*
hook到TV网页的加载器，以及模块数组的push方法，替换有关绘制盈亏比组件的脚本代码，插入提取代码
*/

window.webpackChunktradingview = window.webpackChunktradingview || [];
window.rebound = false;
// 保存原始的 push 方法
const originalPush = self.webpackChunktradingview.push;

// 创建一个用于加载脚本的异步函数
function loadScript(result) {
    return new Promise((resolve, reject) => {
        const blob = new Blob([result], {type: 'application/javascript'});
        const blobURL = URL.createObjectURL(blob);
        const scriptElement = document.createElement('script');
        scriptElement.src = blobURL;

        // 当脚本加载完成时，触发 onload 回调
        scriptElement.onload = function () {
            console.log("window.targetModuleFunction已生成");
            resolve();  // 脚本加载完成，resolve Promise
        };
        document.head.appendChild(scriptElement);
        URL.revokeObjectURL(blobURL);
    });
}

// 重写 push 方法
self.webpackChunktradingview.push = function (...args) {
    if (!window.rebound) {
        let originalPush2 = self.webpackChunktradingview.push;
        self.webpackChunktradingview.push = async function (...args2) {
            // 定义正则表达式来匹配形如 ){const o=i.renderer( 的字符串
            const pattern = /\)\{\s*const\s+[a-zA-Z]\s*=\s*[a-zA-Z]\.renderer\s*\(/;
            let myCode = 'const toolItemDrawEvent=new CustomEvent(\'toolItemDraw\',{detail:{originObj:o,rendererObj:r,bitMediaInfo:t,ctx:e}});document.dispatchEvent(toolItemDrawEvent);';
            for (let moduleId of Object.keys(args2[0][1])) {
                if (pattern.test(args2[0][1][moduleId].toString())) {
                    const insertPattern = /(,\s*this\.state\(\)\);)(\s*if\()/;
                    // 识别 ,this.state()); 和 if( 并在其中间添加myCode

                    let scriptArray = args2[0][1][moduleId].toString().split(',this.state());if(');
                    for (let i = 0; i < scriptArray.length; i++) {
                        if (i !== 0) {
                            scriptArray[i] = ',this.state());if(' + scriptArray[i];
                        }
                        scriptArray[i] = scriptArray[i].replace(insertPattern, (match, part1, part2) => {
                            return `${part1}${myCode}${part2}`;  // 在 this.state()); 后插入 myCode
                        });
                    }
                    let result = '';
                    for (let j = 0; j < scriptArray.length; j++) {
                        result += scriptArray[j];
                    }
                    result = 'window.targetModuleFunction=' + result + ';';

                    // 加载脚本并等待其完成
                    await loadScript(result);
                    // 等待脚本加载完成后，将 window.targetModuleFunction 替换到 args2 中
                    if (window.targetModuleFunction) {
                        console.log('替换修改后的模块');
                        args2[0][1][moduleId] = window.targetModuleFunction;  // 替换 args2 的值
                    }
                }
            }
            return originalPush2.apply(this, args2);
        }
        window.rebound = true;
    }
    // 调用原始的 push 方法，保持原功能
    return originalPush.apply(this, args);
};