/**
 * 购买系统
 * 处理游戏中所有的购买相关操作
 */
import gameValues from './values.js';

const BuySystem = {
    // 调试计数器
    hValue: 0,
    
    /**
     * 初始化购买系统
     * index的主流程：设置所有按钮的事件监听器，准备购买功能
     */
    init() {
        // 启动h值计数器
        setInterval(() => {
            this.hValue += 3;
            const debugH = document.getElementById('debugHValue');
            if (debugH) debugH.textContent = this.hValue;
        }, 100);

        // 为所有触发器按钮添加点击事件
        this.initTriggerButtons();

        // 为所有升级按钮添加点击事件
        this.initUpgradeButtons();

        // 为所有重置升级按钮添加点击事件
        this.initResetUpgradeButtons();
    },

    /**
     * 初始化触发器按钮
     */
    initTriggerButtons() {
        // 确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initTriggerButtons());
            return;
        }

        console.log('开始初始化触发器按钮...');

        // 为所有触发器按钮添加点击事件并设置初始状态
        const triggerButtons = document.querySelectorAll('.trigger-button');
        triggerButtons.forEach(button => {
            const index = parseInt(button.getAttribute('data-index'));
            if (!isNaN(index)) {
                // 清除所有可能的状态类，确保从默认状态开始
                button.classList.remove('unavailable');
                button.disabled = false;
                
                button.addEventListener('click', () => {
                    this.buyTrigger(index);
                });
            }
        });

        // 初始化完成后立即更新按钮状态
        this.updateTriggerButtons();
        
        console.log('触发器按钮初始化完成');
    },

    /**
     * 初始化升级按钮
     */
    initUpgradeButtons() {
        // 确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initUpgradeButtons());
            return;
        }

        console.log('开始初始化升级按钮...');

        // 初始化页面1-2的升级按钮
        for (let i = 1; i <= 10; i++) {
            const button = document.getElementById(`upgrade1-${i}`);
            if (button) {
                // 清除所有可能的状态类，确保从默认状态开始
                button.classList.remove('available', 'purchased');
                button.disabled = false;
                
                button.addEventListener('click', () => {
                    this.buyUpgrade('1-2', i);
                });
            }
        }

        // 初始化页面1-3的升级按钮
        for (let i = 1; i <= 5; i++) {
            const button = document.getElementById(`upgrade2-${i}`);
            if (button) {
                // 清除所有可能的状态类，确保从默认状态开始
                button.classList.remove('available', 'purchased');
                button.disabled = false;
                
                button.addEventListener('click', () => {
                    this.buyUpgrade('1-3', i);
                });
            }
        }

        // 初始化完成后立即更新按钮状态
        this.updateUpgradeButtons();
        
        console.log('升级按钮初始化完成');
    },

    /**
     * 初始化重置升级按钮
     */
    initResetUpgradeButtons() {
        // 确保DOM已加载
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initResetUpgradeButtons());
            return;
        }

        console.log('开始初始化重置升级按钮...');

        // 为所有重置升级按钮添加点击事件
        for (let i = 0; i < 3; i++) {
            const button = document.getElementById(`reset-upgrade-${i}`);
            if (button) {
                button.addEventListener('click', () => {
                    this.buyResetUpgrade(i);
                });
            }
        }

        // 初始化完成后立即更新按钮状态
        this.updateResetUpgradeButtons();
        
        console.log('重置升级按钮初始化完成');
    },

    /**
     * 检查是否可以购买
     */
    /**
     * 检查是否可以购买指定物品
     * 该处使用来自values.js的resources.a、resource_b.value进行资源检查
     * 该处使用来自values.js的pageUpgrades.page_1_2.cost1_*、pageUpgrades.page_1_3.cost2_*进行成本计算
     * @param {string} itemType - 物品类型 ('trigger', 'upgrade', 'resetupgrade')
     * @param {string} itemId - 物品ID
     * @returns {boolean} 是否可以购买
     */
    canBuy(itemType, itemId) {
        const cost = this.calculateCost(itemType, itemId);
        if (itemType === 'upgrade') {
            // 处理itemId格式：'1-2-2' 或 '1-3-2'
            const parts = itemId.split('-');
            if (parts.length === 3) {
                const [mainPage, subPage] = parts;
                const pageKey = `${mainPage}-${subPage}`;
                if (pageKey === '1-3') {
                    // 页面1-3的升级使用b资源
                    return gameValues.resource_b.value >= cost;
                }
            }
        }
        
        const canAfford = gameValues.resources.a >= cost;
        
        return canAfford;
    },

    /**
     * 计算购买价格
     * 该处使用来自values.js的pageUpgrades.page_1_1.triggers、resetupgrades进行价格计算
     * 该处使用来自values.js的pageUpgrades.page_1_2.cost1_*、pageUpgrades.page_1_3.cost2_*进行升级价格获取
     */
    calculateCost(itemType, itemId) {
        if (itemType === 'trigger') {
            const trigger = gameValues.pageUpgrades.page_1_1.triggers[itemId];
            return trigger.base_cost * Math.pow(trigger.costX, trigger.buycount);
        } else if (itemType === 'resetupgrade') {
            const resetUpgrade = gameValues.pageUpgrades.page_1_1.resetupgrades[itemId];
            return resetUpgrade.base_cost * Math.pow(resetUpgrade.costX, resetUpgrade.buycount);
        } else if (itemType === 'upgrade') {
            // 处理itemId格式：'1-2-2' 或 '1-3-2'
            const parts = itemId.split('-');
            if (parts.length === 3) {
                const [mainPage, subPage, upgradeIndex] = parts;
                const pageKey = `${mainPage}-${subPage}`; // '1-2' 或 '1-3'
                const index = parseInt(upgradeIndex);
                
                if (pageKey === '1-2') {
                    // 页面1-2的升级
                    const costKey = `cost1_${index}`;
                    return gameValues.pageUpgrades.page_1_2[costKey] || 0;
                } else if (pageKey === '1-3') {
                    // 页面1-3的升级
                    const costKey = `cost2_${index}`;
                    return gameValues.pageUpgrades.page_1_3[costKey] || 0;
                }
            }
        }
        return Infinity;
    },

    /**
     * 执行一次性升级购买
     * 专门处理升级的一次性购买逻辑（只能购买一次）
     * 该处使用来自values.js的pageUpgrades.page_1_2.buy1_*和pageUpgrades.page_1_3.buy2_*购买状态
     */
    buyUpgrade(page, upgradeNum) {
        const itemId = `${page}-${upgradeNum}`;

        // 检查是否已经购买 - 使用来自values.js的购买状态字段
        const buyKey = page === '1-2' ? `buy1_${upgradeNum}` : `buy2_${upgradeNum}`;
        const pageObj = page === '1-2' ? gameValues.pageUpgrades.page_1_2 : gameValues.pageUpgrades.page_1_3;

        if (pageObj[buyKey] === 1) {
            console.log(`升级 ${itemId} 已经购买过了`);
            return false;
        }

        // 获取成本 - 使用来自values.js的成本定义字段
        const costKey = page === '1-2' ? `cost1_${upgradeNum}` : `cost2_${upgradeNum}`;
        const cost = pageObj[costKey];
        
        // 检查资源是否足够
        const useBResource = page === '1-3';
        if (useBResource) {
            if (gameValues.resource_b.value < cost) {
                console.log('B资源不足，无法购买升级');
                return false;
            }
        } else {
            if (gameValues.resources.a < cost) {
                console.log('A资源不足，无法购买升级');
                return false;
            }
        }

        // 扣除资源
        if (useBResource) {
            gameValues.resource_b.value -= cost;
        } else {
            gameValues.resources.a -= cost;
        }

        // 标记为已购买
        pageObj[buyKey] = 1;

        // 触发升级效果
        const upgradeFuncName = page === '1-2' ? `upgrade_1_${upgradeNum}` : `upgrade_2_${upgradeNum}`;
        const pageManager = page === '1-2' ? window.GameCore.pageManagers.page_1_2 : window.GameCore.pageManagers.page_1_3;
        
        if (window.GameCore && pageManager && pageManager[upgradeFuncName]) {
            pageManager[upgradeFuncName]();
        }

        // 更新显示
        this.updateDisplay();

        // 让按钮变灰
        const buttonId = page === '1-2' ? `upgrade1-${upgradeNum}` : `upgrade2-${upgradeNum}`;
        const button = document.getElementById(buttonId);
        if (button) {
            button.classList.add('purchased');
            button.disabled = true;
            // 不改变按钮文本，只改变样式
        }

        // 添加新闻
        if (window.addNews) {
            const displayText = page === '1-2' ? `1-${upgradeNum}` : `2-${upgradeNum}`;
            window.addNews(`购买了升级 ${displayText}`);
            console.log(`新闻提示: 购买了升级 ${displayText} (原始itemId: ${itemId})`);
        }

        console.log(`升级 ${itemId} 购买成功`);
        return true;
    },

    /**
     * 执行重复升级购买
     * 允许重复购买升级，每次购买都会增加购买次数
     */
    rebuyUpgrade(page, upgradeNum) {
        const itemId = `${page}-${upgradeNum}`;

        // 获取购买键和页面对象
        const buyKey = page === '1-2' ? `buy1_${upgradeNum}` : `buy2_${upgradeNum}`;
        const pageObj = page === '1-2' ? gameValues.pageUpgrades.page_1_2 : gameValues.pageUpgrades.page_1_3;

        // 获取当前购买次数，如果不存在则初始化为0
        const currentBuyCount = pageObj[buyKey] || 0;

        // 获取成本（重复购买时成本会增加）
        const costKey = page === '1-2' ? `cost1_${upgradeNum}` : `cost2_${upgradeNum}`;
        const baseCost = pageObj[costKey];
        const cost = baseCost * Math.pow(1.5, currentBuyCount); // 每次购买成本增加1.5倍

        // 检查资源是否足够
        const useBResource = page === '1-3';
        if (useBResource) {
            if (gameValues.resource_b.value < cost) {
                console.log('B资源不足，无法重复购买升级');
                return false;
            }
        } else {
            if (gameValues.resources.a < cost) {
                console.log('A资源不足，无法重复购买升级');
                return false;
            }
        }

        // 扣除资源
        if (useBResource) {
            gameValues.resource_b.value -= cost;
        } else {
            gameValues.resources.a -= cost;
        }

        // 增加购买次数
        pageObj[buyKey] = currentBuyCount + 1;

        // 触发升级效果（每次重复购买都会重新触发）
        const upgradeFuncName = page === '1-2' ? `upgrade_1_${upgradeNum}` : `upgrade_2_${upgradeNum}`;
        const pageManager = page === '1-2' ? window.GameCore.pageManagers.page_1_2 : window.GameCore.pageManagers.page_1_3;

        if (window.GameCore && pageManager && pageManager[upgradeFuncName]) {
            pageManager[upgradeFuncName]();
        }

        // 更新显示
        this.updateDisplay();

        // 按钮状态保持可用（不改变样式，因为可以重复购买）
        const buttonId = page === '1-2' ? `upgrade1-${upgradeNum}` : `upgrade2-${upgradeNum}`;
        const button = document.getElementById(buttonId);
        if (button) {
            // 重复购买时按钮保持可用状态，不变灰
            button.classList.remove('purchased');
            button.classList.add('available');
            button.disabled = false;
        }

        // 添加新闻
        if (window.addNews) {
            const displayText = page === '1-2' ? `1-${upgradeNum}` : `2-${upgradeNum}`;
            window.addNews(`重复购买了升级 ${displayText} (第${currentBuyCount + 1}次)`);
            console.log(`新闻提示: 重复购买了升级 ${displayText} (第${currentBuyCount + 1}次) (原始itemId: ${itemId})`);
        }

        console.log(`升级 ${itemId} 重复购买成功 (第${currentBuyCount + 1}次)`);
        return true;
    },

    /**
     * 执行购买操作
     */
    executePurchase(itemType, itemId) {
        if (!this.canBuy(itemType, itemId)) {
            console.log('资源不足，无法购买');
            return false;
        }

        // 获取成本并扣除资源
        const cost = this.calculateCost(itemType, itemId);
        if (itemType === 'upgrade') {
            // 处理itemId格式：'1-2-2' 或 '1-3-2'
            const parts = itemId.split('-');
            if (parts.length === 3) {
                const [mainPage, subPage] = parts;
                const pageKey = `${mainPage}-${subPage}`;
                if (pageKey === '1-3') {
                    // 页面1-3的升级使用b资源
                    gameValues.resource_b.value -= cost;
                } else {
                    gameValues.resources.a -= cost;
                }
            } else {
                gameValues.resources.a -= cost;
            }
        } else {
            gameValues.resources.a -= cost;
        }

        // 增加购买次数或标记升级为已购买
        if (itemType === 'trigger') {
            gameValues.pageUpgrades.page_1_1.triggers[itemId].buycount++;
        } else if (itemType === 'upgrade') {
            // 处理itemId格式：'1-2-2' 或 '1-3-2'
            const parts = itemId.split('-');
            if (parts.length === 3) {
                const [mainPage, subPage, upgradeIndexStr] = parts;
                const pageKey = `${mainPage}-${subPage}`;
                const upgradeIndex = parseInt(upgradeIndexStr);
                
                if (pageKey === '1-2') {
                    const buyKey = `buy1_${upgradeIndex}`;
                    gameValues.pageUpgrades.page_1_2[buyKey] = 1;
                    // 调用升级函数
                    if (window.GameCore && window.GameCore.pageManagers.page_1_2[`upgrade_1_${upgradeIndex}`]) {
                        window.GameCore.pageManagers.page_1_2[`upgrade_1_${upgradeIndex}`]();
                    }
                } else if (pageKey === '1-3') {
                    const buyKey = `buy2_${upgradeIndex}`;
                    gameValues.pageUpgrades.page_1_3[buyKey] = 1;
                    // 调用升级函数
                    if (window.GameCore && window.GameCore.pageManagers.page_1_3[`upgrade_2_${upgradeIndex}`]) {
                        window.GameCore.pageManagers.page_1_3[`upgrade_2_${upgradeIndex}`]();
                    }
                }
            }
        }

        // 更新显示
        this.updateDisplay();

        // 添加新闻
        if (window.addNews) {
            window.addNews(`购买了 ${itemType} ${itemId}`);
        }

        return true;
    },

    /**
     * 购买触发器
     */
    buyTrigger(index) {
        if (!this.canBuy('trigger', index)) {
            console.log(`资源不足，无法购买触发器 ${index}`);
            return false;
        }

        // 获取成本并扣除资源
        const cost = this.calculateCost('trigger', index);
        gameValues.resources.a -= cost;

        // 增加购买次数
        gameValues.pageUpgrades.page_1_1.triggers[index].buycount++;

        // 更新显示
        this.updateDisplay();

        // 添加新闻
        if (window.addNews) {
            window.addNews(`购买了波动 ${index + 1}`);
        }

        console.log(`触发器 ${index} 购买成功`);
        return true;
    },

    /**
     * 购买重置升级
     */
    buyResetUpgrade(index) {
        if (!this.canBuy('resetupgrade', index)) {
            console.log(`资源不足，无法购买重置升级 ${index}`);
            return false;
        }

        // 获取成本并扣除资源
        const cost = this.calculateCost('resetupgrade', index);
        gameValues.resources.a -= cost;

        // 增加购买次数
        gameValues.pageUpgrades.page_1_1.resetupgrades[index].buycount++;

        // 触发升级效果
        if (window.GameCore && window.GameCore.pageManagers.page_1_1) {
            window.GameCore.pageManagers.page_1_1.applyResetUpgradeEffect(index);
        }

        // 每次购买都触发重置1
        if (window.ResetSystem) {
            console.log(`购买重置升级 ${index} 后触发重置1`);
            window.ResetSystem.performReset1();
        } else {
            console.warn('ResetSystem 未找到，无法执行重置1');
        }

        // 更新显示
        this.updateDisplay();

        // 添加新闻
        const upgradeNames = ['共振增强', '堆叠', '精简化'];
        if (window.addNews) {
            window.addNews(`购买了重置升级：${upgradeNames[index]} (已触发重置1)`);
        }

        console.log(`重置升级 ${index} 购买成功并触发重置1`);
        return true;
    },

    /**
     * 更新显示
     * 该处使用来自values.js的resources.a、resource_b.value进行资源显示更新
     * 数值更新与缩写采用values.js的formatNumber函数进行格式化（注意：此处直接使用toFixed而非formatNumber）
     * index的主流程：购买操作完成后调用此函数更新所有UI显示
     */
    updateDisplay() {
        // 更新资源显示
        const resourceA = document.getElementById('resourceA');
        if (resourceA) {
            resourceA.textContent = gameValues.resources.a.toFixed(2);
        }

        // 更新b资源显示
        const resourceB = document.getElementById('resourceB');
        if (resourceB) {
            resourceB.textContent = gameValues.resource_b.value.toFixed(2);
        }

        // 更新升级按钮状态
        this.updateUpgradeButtons();

        // 更新触发器按钮状态
        this.updateTriggerButtons();

        // 更新重置升级按钮状态
        this.updateResetUpgradeButtons();
    },

    /**
     * 更新升级按钮状态
     * 该处使用来自values.js的pageUpgrades.page_1_2.buy1_*和pageUpgrades.page_1_3.buy2_*购买状态
     * 数值更新与缩写采用values.js的formatNumber函数进行格式化
     */
    updateUpgradeButtons() {
        // 更新页面1-2的升级按钮 - 使用来自values.js的pageUpgrades.page_1_2.buy1_*购买状态
        for (let i = 1; i <= 10; i++) {
            const button = document.getElementById(`upgrade1-${i}`);
            if (button) {
                const buyKey = `buy1_${i}`;
                const isPurchased = gameValues.pageUpgrades.page_1_2[buyKey] === 1;
                const canAfford = this.canBuy('upgrade', `1-2-${i}`);
                
                // 移除所有状态类
                button.classList.remove('available', 'purchased', 'unavailable');
                
                // 根据状态应用适当的类
                if (isPurchased) {
                    button.classList.add('purchased');
                    button.disabled = true;
                } else if (canAfford) {
                    button.classList.add('available');
                    button.disabled = false;
                } else {
                    button.classList.add('unavailable');
                    button.disabled = true;
                }
            }
        }

        // 更新页面1-3的升级按钮 - 使用来自values.js的pageUpgrades.page_1_3.buy2_*购买状态
        for (let i = 1; i <= 5; i++) {
            const button = document.getElementById(`upgrade2-${i}`);
            if (button) {
                const buyKey = `buy2_${i}`;
                const isPurchased = gameValues.pageUpgrades.page_1_3[buyKey] === 1;
                const canAfford = this.canBuy('upgrade', `1-3-${i}`);
                
                // 移除所有状态类
                button.classList.remove('available', 'purchased', 'unavailable');
                
                // 根据状态应用适当的类
                if (isPurchased) {
                    button.classList.add('purchased');
                    button.disabled = true;
                } else if (canAfford) {
                    button.classList.add('available');
                    button.disabled = false;
                } else {
                    button.classList.add('unavailable');
                    button.disabled = true;
                }
            }
        }
    },

    /**
     * 更新重置升级按钮状态
     * 该处使用来自values.js的pageUpgrades.page_1_1.resetupgrades数组
     * 数值更新与缩写采用values.js的formatNumber函数进行格式化
     */
    updateResetUpgradeButtons() {
        const resetUpgrades = gameValues.pageUpgrades.page_1_1.resetupgrades;
        for (let i = 0; i < resetUpgrades.length; i++) {
            const button = document.getElementById(`reset-upgrade-${i}`);
            if (button) {
                const canAfford = gameValues.resources.a >= this.calculateCost('resetupgrade', i);
                
                // 更新按钮文本
                const countSpan = document.getElementById(`reset-upgrade-${i}-count`);
                const priceSpan = document.getElementById(`reset-upgrade-${i}-price`);
                
                if (countSpan) {
                    countSpan.textContent = resetUpgrades[i].buycount;
                }
                if (priceSpan) {
                    const cost = this.calculateCost('resetupgrade', i);
                    priceSpan.textContent = window.formatNumber ? window.formatNumber(cost) : cost.toFixed(0);
                }
                
                // 更新按钮状态
                if (canAfford) {
                    button.disabled = false;
                    button.style.opacity = '1';
                } else {
                    button.disabled = true;
                    button.style.opacity = '0.5';
                }
            }
        }
    },
    updateTriggerButtons() {
        const triggers = gameValues.pageUpgrades.page_1_1.triggers;
        for (let i = 0; i < triggers.length; i++) {
            const button = document.querySelector(`.trigger-button[data-index="${i}"]`);
            if (button) {
                const canAfford = gameValues.resources.a >= this.calculateCost('trigger', i);
                const isUnavailable = button.classList.contains('unavailable');
                
                if (canAfford && isUnavailable) {
                    button.classList.remove('unavailable');
                    button.disabled = false;
                } else if (!canAfford && !isUnavailable) {
                    button.classList.add('unavailable');
                    button.disabled = true;
                }
            }
        }
    },
};

// 导出购买系统
export default BuySystem;

// 在全局作用域中暴露测试函数
window.testUpgradePurchase = () => {
    if (window.BuySystem) {
        window.BuySystem.testUpgradePurchase();
    } else {
        console.log('BuySystem未初始化');
    }
};
