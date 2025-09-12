/**
 * 隐藏系统 - 隐藏测试元素和调试信息
 * 用于在正式版本中隐藏不需要显示的测试内容
 */

// 隐藏测试元素和调试信息的函数
export function hideTestElements() {
    console.log('开始隐藏测试元素...');

    // 隐藏BuySystem测试计数器显示区
    const buyTestElement = document.getElementById('debugHValue');
    if (buyTestElement) {
        const containerDiv = buyTestElement.parentElement;
        if (containerDiv) {
            containerDiv.style.display = 'none';
            console.log('已隐藏BuySystem测试计数器');
        }
    }

    // 隐藏调试f值显示区
    const debugFElement = document.getElementById('debugFValue');
    if (debugFElement) {
        const containerDiv = debugFElement.parentElement;
        if (containerDiv) {
            containerDiv.style.display = 'none';
            console.log('已隐藏调试f值显示区');
        }
    }

    // 隐藏调试e值显示区
    const debugEElement = document.getElementById('debugEValue');
    if (debugEElement) {
        const containerDiv = debugEElement.parentElement;
        if (containerDiv) {
            containerDiv.style.display = 'none';
            console.log('已隐藏调试e值显示区');
        }
    }
    // 隐藏资源B显示
    const resourceBElement = document.getElementById('resourceB');
    if (resourceBElement) {
        const bContainer = resourceBElement.closest('h1');
        if (bContainer) {
            bContainer.style.display = 'none';
            console.log('已隐藏资源B显示');
        }
    }

    // 隐藏资源C显示
    const resourceCElement = document.getElementById('resourceC');
    if (resourceCElement) {
        const cContainer = resourceCElement.closest('h1');
        if (cContainer) {
            cContainer.style.display = 'none';
            console.log('已隐藏资源C显示');
        }
    }

    // 隐藏重置按钮
    const resetButtons = document.querySelectorAll('button[onclick*="handleReset1"], button[onclick*="performReset"]');
    resetButtons.forEach(button => {
        button.style.display = 'none';
        console.log('已隐藏重置按钮:', button.textContent);
    });

    // 隐藏测试时间显示按钮
    const testTimeButton = document.querySelector('button[onclick*="testTimeDisplay"]');
    if (testTimeButton) {
        testTimeButton.style.display = 'none';
        console.log('已隐藏测试时间显示按钮');
    }

    // 隐藏重置2中时间显示
    const reset2TimeSpan = document.getElementById('reset2PlayTime');
    if (reset2TimeSpan) {
        const containerDiv = reset2TimeSpan.parentElement;
        if (containerDiv) {
            containerDiv.style.display = 'none';
            console.log('已隐藏重置2中时间显示');
        }
    }

    console.log('测试元素隐藏完成');
}
// 默认导出隐藏函数
export default {
    hideTestElements
};