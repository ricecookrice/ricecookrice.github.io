/**
 * 游戏核心计算系统
 * 负责处理游戏中的各种数值计算、更新和状态管理
 */
console.log('Loading gamecore.js...');
import gameValues from './values.js';

// 验证gameValues是否正确导入
if (!gameValues) {
    console.error('Error: gameValues not imported correctly!');
} else {
    console.log('gameValues imported successfully:', gameValues);
}

const GameCore = {
    /**
     * 页面管理器集合
     */
    pageManagers: {
        /**
         * 页面(1,1)管理器
         */
           updateStats() {
            // 更新统计数据
            this.updateAIncomeStats();
            this.updateDisplay();
        },

        // 测试时间倍数计算公式
        testTimeMultiplierFormula(seconds) {
            const x = Math.max(seconds, 1);
            const multiplier = Math.pow(x, (Math.log2(x) / 40));
            const clamped = Math.max(1, Math.min(multiplier, 1000));
            console.log(`时间: ${seconds}s -> 倍数: ${clamped.toFixed(2)} (原始: ${multiplier.toFixed(4)})`);
            return clamped;
        },page_1_1: {
            init() {
                // 初始化页面专属数据
                this.lastUpdate = Date.now();
            },

            // 计算所有触发器的收益
            // 返回每个触发器的分项收入数组
            // 该处使用来自values.js的pageUpgrades.page_1_1.triggers数组进行收益计算
            // 该处使用来自values.js的resources.a_multipliers进行乘数计算
            calculateTriggerIncome() {
                const triggers = gameValues.pageUpgrades.page_1_1.triggers;
                const perScount = Number(triggers[8].perScount) || 1;
                let incomeArr = [];
                for (let i = 0; i < triggers.length - 1; i++) {
                    const buycount = Number(triggers[i].buycount) || 0;

                    // 如果购买数为0，跳过此触发器的计算
                    if (buycount === 0) {
                        incomeArr.push(0);
                        continue;
                    }

                    const incomeX = Number(triggers[i].incomeX) || 0;
                    let baseIncome = incomeX * buycount;
                    let bonusIncome = 0;

                    // 计算前置触发器的加成收益
                    for (let j = 0; j < i; j++) {
                        const prevBuycount = Number(triggers[j].buycount) || 0;
                        const prevBenefit = Number(triggers[j].benefit) || 0;
                        // 只有前置触发器有购买数时才计算加成
                        if (prevBuycount > 0) {
                            bonusIncome += prevBenefit * prevBuycount;
                        }
                    }

                    let finalIncome = baseIncome + bonusIncome;
                    
                    // 添加 multiplier3 的特殊逻辑：当层数小于等于 multiplier3+1 时，该层收益 × 该层数
                    if ((i + 1) <= gameValues.resources.a_multipliers.multiplier3) {
                        finalIncome *= (i + 1);
                    }

                    let totalIncome = finalIncome * 3 * perScount * gameValues.resources.a_multipliers.multiplier1 * gameValues.resources.a_multipliers.multiplier2 * gameValues.resources.a_multipliers.multiplier4; //这个常数3是调试值
                    incomeArr.push(totalIncome);
                }
                return incomeArr;
            },

            // 用于 index 显示每个触发器的分项收入
            getAllTriggerIncome() {
                return this.calculateTriggerIncome();
            },

            // 统计实时每秒收入（检测几秒内a值变化并显示在顶栏）
            _realtimeIncomeStats: {
                lastA: 0,
                lastTime: Date.now(),
                interval: 3, // 秒
            },
            getRealtimeIncomeStats() {
                const now = Date.now();
                const curA = gameValues.resources.a;
                const stats = this._realtimeIncomeStats;
                const diffSec = (now - stats.lastTime) / 1000;
                let incomePerSec = 0;
                if (diffSec >= stats.interval) {
                    incomePerSec = (curA - stats.lastA) / diffSec;
                    stats.lastA = curA;
                    stats.lastTime = now;
                    // 显示到顶栏调试区
                    const debugE = document.getElementById('debugEValue');
                    if (debugE) debugE.textContent = incomePerSec.toFixed(2);
                }
                return incomePerSec;
            },

            // 更新所有触发器的状态
            updateTriggers() {
                const now = Date.now();
                const diff = (now - this.lastUpdate) / 1000; // 转换为秒
                this.lastUpdate = now;

                // 计算所有触发器的收益
                const incomes = this.calculateTriggerIncome();
                const totalIncomeThisTick = incomes.reduce((sum, income) => sum + income, 0) * diff;

                // 更新资源A的数量
                if (!isNaN(totalIncomeThisTick)) {
                    gameValues.resources.a += totalIncomeThisTick;
                    
                    // 更新统计数据
                    gameValues.statistics.income_per_second.a = totalIncomeThisTick / diff;
                } else {
                    console.error('检测到无效的收入计算结果:', { incomes, diff, totalIncomeThisTick });
                }
            },

            // 计算购买触发器的成本
            calculateTriggerCost(triggerIndex) {
                const trigger = gameValues.pageUpgrades.page_1_1.triggers[triggerIndex];
                return trigger.base_cost * Math.pow(trigger.costX, trigger.buycount);
            },

            // 尝试购买触发器
            tryPurchaseTrigger(triggerIndex) {
                const cost = this.calculateTriggerCost(triggerIndex);
                if (gameValues.resources.a >= cost) {
                    gameValues.resources.a -= cost;
                    gameValues.pageUpgrades.page_1_1.triggers[triggerIndex].buycount++;
                    // 重新计算所有触发器的收益
                    this.updateTriggers();
                    return true;
                }
                return false;
            },

            // 应用重置升级效果
            // 该处使用来自values.js的pageUpgrades.page_1_1.resetupgrades数组获取升级配置
            // 该处使用来自values.js的pageUpgrades.page_1_1.triggers数组修改触发器属性
            // 该处使用来自values.js的resources.a_multipliers.multiplier3进行乘数修改
            applyResetUpgradeEffect(index) {
                const resetUpgrade = gameValues.pageUpgrades.page_1_1.resetupgrades[index];
                const buycount = resetUpgrade.buycount;

                switch (index) {
                    case 0: // 共振增强
                        // 增加所有触发器的加成效果
                        const allBenefitIncrease = resetUpgrade.allbenefit * buycount;
                        gameValues.pageUpgrades.page_1_1.triggers.forEach((trigger, triggerIndex) => {
                            if (triggerIndex < 8) { // 排除perScount
                                trigger.benefit += allBenefitIncrease;
                            }
                        });
                        console.log(`重置升级0(共振增强): 所有触发器增益+${allBenefitIncrease}`);
                        break;

                    case 1: // 堆叠
                        // 增加全局的 multiplier3 值
                        const multiplierIncrease = resetUpgrade.allnumber * buycount;
                        gameValues.resources.a_multipliers.multiplier3 += 1//不要更改，basenumber暂时无用
                        console.log(`重置升级1(堆叠): multiplier3 +${multiplierIncrease}，当前值: ${gameValues.resources.a_multipliers.multiplier3}`);
                        break;

                    case 2: // 精简化
                        // 方案3：使用0.95，5次大约减去3/4，更自然的比例法
                        const maxPurchases = 5; // 限制最大购买次数
                        const effectiveBuycount = Math.min(buycount, maxPurchases);
                        const costReduction = Math.pow(0.95, effectiveBuycount);
                        gameValues.pageUpgrades.page_1_1.triggers.forEach((trigger, triggerIndex) => {
                            if (triggerIndex > 0 && triggerIndex < 8) { // 排除波动1和perScount
                                const originalCostX = 2.0 + (triggerIndex * 0.5); // 恢复原始costX
                                const newCostX = originalCostX * costReduction;
                                trigger.costX = Math.max(1.1, newCostX); // 确保不低于1.1
                            }
                        });
                        console.log(`重置升级2(精简化): 波动2-8价格倍数*${costReduction} (限制${maxPurchases}次)`);
                        break;
                }

                // 重新计算所有触发器的收益
                this.updateTriggers();
            }
        },
        
        // 其他页面将按照类似的结构实现
        page_1_2: {
            init() {
                this.lastUpdate = Date.now();
                console.log('页面1-2管理器初始化完成');
            },

            // 升级1-1: a收入翻倍
            upgrade_1_1() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                gameValues.resources.a_multipliers.multiplier1 *= 2;
                console.log('升级1-1: a收入翻倍激活，当前倍数:', gameValues.resources.a_multipliers.multiplier1);
                return true;
            },

            // 升级1-2: 波动1对其它波动的增益增加
            upgrade_1_2() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                gameValues.pageUpgrades.page_1_1.triggers[0].benefit += 0.05;
                console.log('升级1-2: 波动1增益+0.05激活，当前增益:', gameValues.pageUpgrades.page_1_1.triggers[0].benefit);
                return true;
            },

            // 升级1-3: 每次重置以100a开始
            upgrade_1_3() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                // 这个会在重置系统中处理
                gameValues.initialization.table1.resources.a = 100;
                console.log('升级1-3: 重置起始100a激活');
                return true;
            },

            // 升级1-5: a基于游玩时间获得加成
            upgrade_1_5() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                // 初始化时间倍数更新器
                if (!this._timeMultiplierUpdater) {
                    this._timeMultiplierUpdater = setInterval(() => {
                        if (gameValues.pageUpgrades.page_1_2.buy1_5 === 1) {
                            const now = Date.now();
                            // 获取重置1的时间记录，如果没有设置则使用当前时间
                            const reset1Time = gameValues.reset.reset1.time_record || now;
                            const timeSinceReset1 = Math.max(0, (now - reset1Time) / 1000); // 确保不为负数

                            // 确保时间至少为1秒，避免log2(0)或负数
                            const x = Math.max(timeSinceReset1, 1);
                            const timeMultiplier = Math.pow(x, (Math.log2(x) / 40));
                            const clampedMultiplier = Math.max(1, Math.min(timeMultiplier, 1000));

                            // 更新multiplier2
                            gameValues.resources.a_multipliers.multiplier2 = clampedMultiplier;

                            // 更新upgrade1-5按钮显示
                            const displayElement = document.getElementById('upgrade1-5');
                            if (displayElement) {
                                // 只更新span元素的内容，保持HTML结构完整
                                const multiplierSpan = displayElement.querySelector('#multiplier2Display');
                                if (multiplierSpan) {
                                    multiplierSpan.textContent = clampedMultiplier.toFixed(2);
                                }
                            }
                        }
                    }, 1000); // 每秒更新一次
                }

                // 初次购买时的效果
                const now = Date.now();
                const reset1Time = gameValues.reset.reset1.time_record || now;
                const timeSinceReset1 = Math.max(0, (now - reset1Time) / 1000);
                const x = Math.max(timeSinceReset1, 1);
                const timeMultiplier = Math.pow(x, (Math.log2(x) / 40));
                const clampedMultiplier = Math.max(1, Math.min(timeMultiplier, 1000));

                gameValues.resources.a_multipliers.multiplier2 = clampedMultiplier;
                console.log(`升级1-3: 时间加成激活，游玩时间: ${timeSinceReset1.toFixed(1)}s，初始倍数: ${clampedMultiplier.toFixed(2)}`);
                return true;
            },


            // 升级1-6: 波动I价格倍增减弱
            upgrade_1_6() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                gameValues.pageUpgrades.page_1_1.triggers[0].costX *= 0.8; // 降低价格增长
                console.log('升级1-6: 波动I价格减弱激活，当前价格倍数:', gameValues.pageUpgrades.page_1_1.triggers[0].costX);
                return true;
            },

            // 升级1-7: 波动I对其它波动的增益+0.5
            upgrade_1_7() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                gameValues.pageUpgrades.page_1_1.triggers[0].benefit += 0.5;
                console.log('升级1-7: 波动I增益+0.5激活，当前增益:', gameValues.pageUpgrades.page_1_1.triggers[0].benefit);
                return true;
            },

            // 升级1-8: a收入基于重置次数获得加成
            upgrade_1_8() {
                // 检查是否已购买升级1-8
                if (gameValues.pageUpgrades.page_1_2.buy1_8 !== 1) {
                    return false;
                }
                
                // 线性叠加：倍率 = 1 + 重置1次数 * 0.2
                const resetCount = gameValues.reset.reset1.count || 0;
                const multiplier = 1 + (resetCount * 0.2);

                // 直接设置multiplier4，避免与自动更新叠加产生指数爆炸
                gameValues.resources.a_multipliers.multiplier4 = multiplier;
                
                console.log(`升级1-8: 重置次数加成激活，重置次数: ${resetCount}，当前倍数: ${multiplier}`);
                return true;
            },

            // 升级1-9: 不再重置波动1
            upgrade_1_9() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                // 这个会在重置系统中处理
                gameValues.permanent_unlocks.noResetTrigger1 = true;
                console.log('升级1-9: 不重置波动1激活');
                return true;
            },

            // 升级1-10: 解锁重置2
            upgrade_1_10() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                // 解锁重置2功能
                gameValues.locked.lock_b = 1;
                console.log('升级1-10: 重置2解锁激活');
                return true;
            }
        },

        page_1_3: {
            init() {
                this.lastUpdate = Date.now();
                console.log('页面1-3管理器初始化完成');
            },

            // 升级2-1: 基础增强：所有波动基础收入*10
            upgrade_2_1() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                // 增加所有波动的收入倍数
                gameValues.pageUpgrades.page_1_1.triggers.forEach((trigger, index) => {
                    if (index < 8) { // 只对前8个波动生效
                        gameValues.pageUpgrades.page_1_1.triggers[index].incomeX *= 10;
                    }
                });
                console.log('升级2-1: 基础增强*10激活');
                return true;
            },

            // 升级2-2: 熟手：b收入基于重置1次数获得加成
            upgrade_2_2() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                const resetCount = gameValues.reset.reset1.count || 0;
                const multiplier = 1 + (resetCount * 0.2);
                gameValues.resource_b.multiplier1 *= multiplier;
                console.log('升级2-2: 熟手加成激活，当前倍数:', gameValues.resource_b.multiplier1);
                return true;
            },

            // 升级2-3: 解锁b提取器
            upgrade_2_3() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                gameValues.settings.unlocks = gameValues.settings.unlocks || {};
                gameValues.settings.unlocks.b_extractor = true;
                console.log('升级2-3: b提取器解锁激活');
                return true;
            },

            // 升级2-4: 挑战：解锁挑战功能
            upgrade_2_4() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                gameValues.settings.unlocks = gameValues.settings.unlocks || {};
                gameValues.settings.unlocks.challenges = true;
                console.log('升级2-4: 挑战功能解锁激活');
                return true;
            },

            // 升级2-5: 巨大代价：波动1加成改为乘法
            upgrade_2_5() {
                // 移除重复检查，因为购买逻辑已在buyUpgrade函数中处理
                // 将波动1的加成从加法改为乘法
                gameValues.pageUpgrades.page_1_1.triggers[0].benefit *= 2; // 增强加成效果
                gameValues.pageUpgrades.page_1_1.triggers[0].costX *= 2; // 增加价格倍增
                console.log('升级2-5: 巨大代价激活，波动1增益:', gameValues.pageUpgrades.page_1_1.triggers[0].benefit);
                return true;
            }
        },

        page_2_1: {
            init() {
                this.lastUpdate = Date.now();
            }
            // 待实现
        }
    },

    /**
     * 资源计算系统
     */
    resourceCalculator: {
        // 所有资源计算已移至各个页面管理器中
        updateResources() {
            // 遍历所有页面更新资源
            for (const pageKey in GameCore.pageManagers) {
                const page = GameCore.pageManagers[pageKey];
                if (page.updateTriggers) {
                    page.updateTriggers();
                }
            }
        }
    },

    /**
     * 统计系统
     */
    statistics: {
        // A资源收入统计
        aIncomeStats: {
            history: [], // 存储最近5秒的收入数据
            maxHistory: 5, // 5秒历史数据
            lastA: 0, // 上次记录的A值
            lastTime: 0, // 上次记录时间
            updateInterval: 200, // 200ms更新一次
            displayElement: null, // 显示元素
            lastUpdate: 0, // 上次数据更新时间
            lastDisplayUpdate: 0, // 上次显示更新时间
            displayUpdateInterval: 100, // 0.1秒更新显示一次
        },

        // 时间统计
        timeStats: {
            gameStartTime: Date.now(), // 游戏开始时间
            totalPlayTime: 0, // 总游玩时间（秒）
            lastUpdateTime: Date.now(), // 上次更新时间
            reset1Time: 0, // 重置1后的时间（秒）
            reset2Time: 0, // 重置2后的时间（秒）
            displayElements: {
                totalTime: null,
                reset1Time: null,
                reset2Time: null
            }
        },

        // 初始化统计系统
        init() {
            const now = Date.now();
            this.aIncomeStats.lastA = gameValues.resources.a;
            this.aIncomeStats.lastTime = now;
            this.aIncomeStats.lastUpdate = now;
            this.aIncomeStats.lastDisplayUpdate = now;
            this.aIncomeStats.displayElement = document.getElementById('debugTestValue');

            // 初始化时间统计
            this.timeStats.gameStartTime = now;
            this.timeStats.lastUpdateTime = now;
            this.timeStats.displayElements.totalTime = document.getElementById('totalPlayTime');
            this.timeStats.displayElements.reset1Time = document.getElementById('reset1PlayTime');
            this.timeStats.displayElements.reset2Time = document.getElementById('reset2PlayTime');

            // 设置重置1的时间记录为游戏开始时间（如果还没有设置过）
            if (!gameValues.reset.reset1.time_record || gameValues.reset.reset1.time_record === 0) {
                gameValues.reset.reset1.time_record = now;
                console.log('重置1时间记录已初始化为游戏开始时间');
            }

            // 调试：检查元素是否找到
            console.log('时间统计初始化完成');

            console.log('统计系统初始化完成');

            // 初始化完成后立即更新一次显示
            this.updateTimeDisplay();
        },

        // 更新A资源收入统计
        updateAIncomeStats() {
            try {
                const now = Date.now();
                const currentA = gameValues.resources.a;

                // 检查是否到了更新间隔
                if (now - this.aIncomeStats.lastUpdate < this.aIncomeStats.updateInterval) {
                    return;
                }

                // 计算时间差（秒）
                const timeDiff = (now - this.aIncomeStats.lastTime) / 1000;

                if (timeDiff > 0 && timeDiff < 10) { // 防止时间差过大导致异常
                    // 计算这段时间的收入
                    const incomeThisPeriod = (currentA - this.aIncomeStats.lastA) / timeDiff;

                    // 只记录合理的收入值（防止异常数据）
                    if (!isNaN(incomeThisPeriod) && isFinite(incomeThisPeriod) && incomeThisPeriod >= 0) {
                        // 添加到历史记录
                        this.aIncomeStats.history.push({
                            income: incomeThisPeriod,
                            timestamp: now
                        });

                        // 保持历史记录在5秒内
                        while (this.aIncomeStats.history.length > 0 &&
                               (now - this.aIncomeStats.history[0].timestamp) / 1000 > this.aIncomeStats.maxHistory) {
                            this.aIncomeStats.history.shift();
                        }
                    }

                    // 更新记录
                    this.aIncomeStats.lastA = currentA;
                    this.aIncomeStats.lastTime = now;
                    this.aIncomeStats.lastUpdate = now;
                }
            } catch (error) {
                console.warn('统计数据更新出错:', error);
            }
        },

        // 获取5秒平均收入
        getAverageIncomePerSecond() {
            try {
                if (this.aIncomeStats.history.length === 0) {
                    return 0;
                }

                // 计算所有历史记录的平均值
                const validRecords = this.aIncomeStats.history.filter(record =>
                    !isNaN(record.income) && isFinite(record.income) && record.income >= 0
                );

                if (validRecords.length === 0) {
                    return 0;
                }

                const totalIncome = validRecords.reduce((sum, record) => sum + record.income, 0);
                return totalIncome / validRecords.length;
            } catch (error) {
                console.warn('计算平均收入出错:', error);
                return 0;
            }
        },

        // 更新显示
        updateDisplay() {
            try {
                const now = Date.now();

                // 检查是否到了显示更新间隔
                if (now - this.aIncomeStats.lastDisplayUpdate < this.aIncomeStats.displayUpdateInterval) {
                    return;
                }

                const avgIncome = this.getAverageIncomePerSecond();
                const displayValue = (isNaN(avgIncome) ? 0 : avgIncome).toFixed(2) + ' a/s';

                if (this.aIncomeStats.displayElement) {
                    this.aIncomeStats.displayElement.textContent = displayValue;
                }

                // 更新时间统计显示
                this.updateTimeDisplay();

                // 更新显示时间戳
                this.aIncomeStats.lastDisplayUpdate = now;
            } catch (error) {
                console.warn('更新显示出错:', error);
            }
        },

        // 更新时间统计显示
        updateTimeDisplay() {
            // 格式化时间显示
            const formatTime = (seconds) => {
                if (seconds < 60) return `${seconds.toFixed(1)}s`;
                if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`;
                if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`;
                return `${(seconds / 86400).toFixed(1)}d`;
            };

            // 更新总时间显示
            if (this.timeStats.displayElements.totalTime) {
                const totalTimeText = formatTime(this.timeStats.totalPlayTime);
                this.timeStats.displayElements.totalTime.textContent = totalTimeText;
            }

            // 更新重置1时间显示
            if (this.timeStats.displayElements.reset1Time) {
                const reset1TimeText = formatTime(this.timeStats.reset1Time);
                this.timeStats.displayElements.reset1Time.textContent = reset1TimeText;
            }

            // 更新重置2时间显示
            if (this.timeStats.displayElements.reset2Time) {
                const reset2TimeText = formatTime(this.timeStats.reset2Time);
                this.timeStats.displayElements.reset2Time.textContent = reset2TimeText;
            }
        },

        updateStats() {
            // 更新统计数据
            this.updateAIncomeStats();
            this.updateTimeStats();
            this.updateDisplay();
        },

        // 更新时间统计
        updateTimeStats() {
            const now = Date.now();
            const timeDiff = (now - this.timeStats.lastUpdateTime) / 1000; // 转换为秒

            if (timeDiff > 0) {
                // 更新总游玩时间
                this.timeStats.totalPlayTime += timeDiff;

                // 更新重置1后的时间
                const reset1Time = gameValues.reset.reset1.time_record;
                if (reset1Time) {
                    this.timeStats.reset1Time = (now - reset1Time) / 1000;
                }

                // 更新重置2后的时间
                const reset2Time = gameValues.reset.reset2.time_record;
                if (reset2Time) {
                    this.timeStats.reset2Time = (now - reset2Time) / 1000;
                }

                this.timeStats.lastUpdateTime = now;
            }
        },

        // 重置时间统计（在重置时调用）
        resetTimeStats(resetType) {
            const now = Date.now();

            if (resetType === 1) {
                this.timeStats.reset1Time = 0;
                // 重置1时不重置总时间
            } else if (resetType === 2) {
                this.timeStats.reset2Time = 0;
                // 重置2时不重置总时间和重置1时间
            }

            this.timeStats.lastUpdateTime = now;
            console.log(`时间统计已重置 (类型: ${resetType})`);

            // 重置后立即更新显示
            this.updateTimeDisplay();
        },

        // 测试时间倍数计算公式
        testTimeMultiplierFormula(seconds) {
            const x = Math.max(seconds, 1);
            const multiplier = Math.pow(x, (Math.log2(x) / 40));
            const clamped = Math.max(1, Math.min(multiplier, 1000));
            console.log(`时间: ${seconds}s -> 倍数: ${clamped.toFixed(2)} (原始: ${multiplier.toFixed(4)})`);
            return clamped;
        },

        // 手动测试时间统计显示更新
        testTimeDisplay() {
            console.log('手动测试时间统计显示更新');
            this.updateTimeDisplay();
            console.log('当前时间统计值:', {
                totalPlayTime: this.timeStats.totalPlayTime,
                reset1Time: this.timeStats.reset1Time,
                reset2Time: this.timeStats.reset2Time
            });
        }
    },

    /**
     * 初始化游戏
     * index的主流程：游戏启动时的初始化函数，设置所有页面管理器并启动主循环
     */
    init() {
        // 初始化所有页面
        for (const pageKey in this.pageManagers) {
            const page = this.pageManagers[pageKey];
            if (page.init) {
                page.init();
            }
        }

        // 初始化统计系统
        this.statistics.init();

        // 启动主循环 - index的主流程：每帧更新游戏状态
        setInterval(() => this.mainLoop(), 1000 / 60); // 60fps
    },

    /**
     * 主循环
     * index的主流程：游戏的核心循环，每帧执行资源更新和统计更新
     */
    mainLoop() {
        // 更新所有资源
        this.resourceCalculator.updateResources();

        // 更新统计数据
        this.statistics.updateStats();
    }
};

console.log('GameCore.js loaded successfully!');

// 移除旧的测试计数器代码
// 统计功能已集成到statistics系统中

export default GameCore;
