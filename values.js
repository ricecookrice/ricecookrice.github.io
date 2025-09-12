/**
 * 游戏数值存储系统
 * 这个文件负责管理游戏中所有的数值、状态和配置数据
 * 包括资源数量、升级状态、统计信息等
 */
console.log('Loading values.js...');

// 检查是否为模块环境，用于兼容不同的JavaScript运行环境
const isModule = typeof module !== 'undefined' && module.exports;

/**
 * 游戏核心数值对象
 * 包含所有游戏运行所需的数据结构
 */
const gameValues = {
    /**
     * 重置系统初始化配置
     * 存储不同重置等级的初始化数据
     * 使用继承方式减少重复配置
     */
    initialization: {
        // 基础配置模板 - 已弃用，仅用于向后兼容
        // 注意：此配置与运输系统无关，仅作为模板保留
        // 如果删除此配置，游戏可能无法正常运行
        base: {
            resources: {
                a: 1,
                a_multipliers: {
                    multiplier1: 1,
                    multiplier2: 1,
                    multiplier3: 1,
                    multiplier4: 1
                }
            },
            upgrades: {
                page_1_1: {
                    triggers: [
                        { incomeX: 0.1, buycount: 0, base_cost: 1, costX: 1.5, benefit: 0.1, Tnumber: 1 },
                        { incomeX: 0.2, buycount: 0, base_cost: 2, costX: 2.0, benefit: 0.2, Tnumber: 1 },
                        { incomeX: 0.3, buycount: 0, base_cost: 4, costX: 2.5, benefit: 0.3, Tnumber: 1 },
                        { incomeX: 0.4, buycount: 0, base_cost: 8, costX: 3.0, benefit: 0.4, Tnumber: 1 },
                        { incomeX: 0.5, buycount: 0, base_cost: 16, costX: 3.5, benefit: 0.5, Tnumber: 1 },
                        { incomeX: 0.6, buycount: 0, base_cost: 32, costX: 4.0, benefit: 0.6, Tnumber: 1 },
                        { incomeX: 0.7, buycount: 0, base_cost: 64, costX: 4.5, benefit: 0.7, Tnumber: 1 },
                        { incomeX: 0.8, buycount: 0, base_cost: 128, costX: 5.0, benefit: 0.8, Tnumber: 1 },
                        { perScount: 1 }
                    ]
                }
            }
        },

        // 重置等级1：基础重置 - 只修改部分数值
        // 示例：只重置a资源为1，前3个触发器的购买次数为0，其他保持不变
        table1: {
            // 只修改需要重置的数值，不包含的字段保持不变
            resources: {
                a: 1,  // 只重置a资源为1
                // 不包含b和c，保持原有值
            },
            upgrades: {
                page_1_1: {
                    triggers: [
                        // 只重置触发器的购买次数为0，其余保持不变
                        { buycount: 0 },  // 触发器0
                        { buycount: 0 },  // 触发器1
                        { buycount: 0 },  // 触发器2
                        { buycount: 0 },  // 触发器3
                        { buycount: 0 },  // 触发器4
                        { buycount: 0 },  // 触发器5
                        { buycount: 0 },  // 触发器6
                        { buycount: 0 },  // 触发器7
                    ]
                }
            },
            // 可以添加其他需要重置的字段
        },

        // 示例：完整重置配置（如果需要完全重置某个页面）
        // table1_full: {
        //     resources: {
        //         a: 1,
        //         b: 0,
        //         c: 0
        //     },
        //     upgrades: {
        //         page_1_1: {
        //             triggers: [
        //                 { incomeX: 0.1, buycount: 0, base_cost: 1, costX: 1.5, benefit: 0.1 },
        //                 // ... 其他触发器配置
        //             ]
        //         }
        //     }
        // },
    },

    /**
     * 重置系统统计与记录
     */
    reset: {
        reset1: { count: 0, time_record: 0 },  // 重置1时间记录，记录游戏初始化时间
        reset2: { count: 0, time_record: Date.now() },
        reset3: { count: 0, time_record: Date.now() }
    },

    // 重置系统永久解锁配置
    permanent_unlocks: {noResetTrigger1: false, noResetTrigger2: false, noResetTrigger3: false},

    /**
     * 基础资源配置
     * resources对象存储游戏中的基本资源数量和相关乘数
     */
    resources: {
        a: 1,  // 初始资源A数量
            a_multipliers: {
                multiplier1: 1,
                multiplier2: 1,
                multiplier3: 1,
                multiplier4: 1
            }  // 资源A的乘数配置
    },
    locked: {
        lock_b: 0
    },
    /**
     * 页面升级记录
     * 存储各个页面的升级状态、触发器和按钮数量
     */
    pageUpgrades: {
        /**
         * 页面(1,1) - 主要增长页面
         * 包含8个基础触发器和3个功能按钮
         */
        page_1_1: {
            // 触发器1-8的数据配置
            triggers: [
                {
                    incomeX: 0.1,     // 收益倍数：影响基础收入
                    buycount: 0,       // 购买次数：记录已购买数量，即是计数也是计算基础
                    base_cost: 1,      // 基础价格：初始购买成本
                    costX: 1.5,          // 价格倍数：每次购买后价格增长系数
                    benefit: 0.1,        // 加成系数：对下层触发器的加成效果
                    TnumberX: 1,        // 触发器数量倍乘：与升级加成有关数值，默认值1
                },
                {
                    incomeX: 0.2,     // 第二个触发器收益倍数略高
                    buycount: 0,
                    base_cost: 5,
                    costX: 3,
                    benefit: 0.2         // 第二个触发器的加成系数
                },
                {
                    incomeX: 0.3,     // 递增的收益倍数
                    buycount: 0,
                    base_cost: 25,
                    costX: 4,
                    benefit: 0.3
                },
                {
                    incomeX: 0.4,
                    buycount: 0,
                    base_cost: 125,
                    costX: 5,
                    benefit: 0.4
                },
                {
                    incomeX: 0.5,
                    buycount: 0,
                    base_cost: 625,
                    costX: 6,
                    benefit: 0.5
                },
                {
                    incomeX: 0.6,
                    buycount: 0,
                    base_cost: 3000,
                    costX: 7,
                    benefit: 0.6
                },
                {
                    incomeX: 0.7,
                    buycount: 0,
                    base_cost: 50000,
                    costX: 8,
                    benefit: 0.7
                },
                {
                    incomeX: 0.8,
                    buycount: 0,
                    base_cost: 2500000,
                    costX: 9,
                    benefit: 0.8
                },
                {perScount: 1,},      // 每秒计数次数，影响整体收益速度
            ],
            resetupgrades: [         // 重置升级,效果强，需要重置而且花费大
                {
                    buycount: 0,       // 购买次数：记录已购买数量，即是计数也是计算基础
                    base_cost: 800,      // 基础价格：初始购买成本
                    costX: 6,          // 价格倍数：每次购买后价格增长系数
                    allbenefit: 0.1,        // 加成系数：增加所有8个触发器的加成效果
                },
                {
                    buycount: 0,        // 购买次数
                    base_cost: 200,
                    costX: 12,     // 价格倍数，不要更改
                    basenumber: 1,
                },
                {
                    buycount: 0,        // 购买次数
                    base_cost: 2300,
                    costX: 18,     // 价格倍数，不要更改
                    
                }
            ],    
            
            /**
             * 功能按钮配置
             * 用于提供额外的游戏机制和加成效果
             */
            buttons: Array(3).fill().map(() => ({
                buycount: 0,      // 按钮购买次数
                base_cost: 1,     // 按钮基础价格
                costX: 1,         // 按钮价格增长系数
                bonus_value: 1    // 按钮提供的加成值
            }))
        },

        // 页面(1,2) - 10个升级的记录
        page_1_2: {
            // 升级成本定义
            cost1_1: 100,    // 升级1-1: a收入翻倍
            cost1_2: 1000,    // 升级1-2: 波动1增益+0.1
            cost1_3: 15000,   // 升级1-3: 波动1价格减弱
            cost1_4: 50000,  // 升级1-4: 
            cost1_5: 200000,  // 升级1-5: 
            cost1_6: 1000000,    // 升级1-6: 
            cost1_7: 20000000,    // 升级1-7: 
            cost1_8: 40000000,    // 升级1-8: 
            cost1_9: 100000000,    // 升级1-9: 不重置波动1
            cost1_10: 1e9,   // 升级1-10: 解锁重置2

            // 购买状态定义
            buy1_1: 0,       // 升级1-1购买状态
            buy1_2: 0,       // 升级1-2购买状态
            buy1_3: 0,       // 升级1-3购买状态
            buy1_4: 0,       // 升级1-4购买状态
            buy1_5: 0,       // 升级1-5购买状态
            buy1_6: 0,       // 升级1-6购买状态
            buy1_7: 0,       // 升级1-7购买状态
            buy1_8: 0,       // 升级1-8购买状态
            buy1_9: 0,       // 升级1-9购买状态
            buy1_10: 0       // 升级1-10购买状态
        },

        page_1_3: {
            // 升级成本定义
            cost2_1: 1,      // 升级2-1: 基础增强*10 (花费1b)
            cost2_2: 2,      // 升级2-2: 熟手加成 (花费2b)
            cost2_3: 5,      // 升级2-3: 解锁b提取器 (花费5b)
            cost2_4: 10,     // 升级2-4: 解锁挑战 (花费10b)
            cost2_5: 100,    // 升级2-5: 巨大代价 (花费100b)

            // 购买状态定义
            buy2_1: 0,       // 升级2-1购买状态
            buy2_2: 0,       // 升级2-2购买状态
            buy2_3: 0,       // 升级2-3购买状态
            buy2_4: 0,       // 升级2-4购买状态
            buy2_5: 0        // 升级2-5购买状态
        },
        /**
         * 页面(2,1) - 高级功能页面
         * 包含10个进阶升级选项
         */
        page_2_1: {
            buttons: Array(10).fill().map(() => ({
                purchase_count: 0,    // 购买计数
                purchase_limit: 1,     // 购买限制
                base_cost: 1,         // 起始价格
                cost_multiplier: 1,    // 价格系数
                bonus_value: 1        // 加成数值
            }))
        }
    },

    /**
     * 资源B系统配置
     * 第二层级资源系统的相关数值配置
     */
    resource_b: {
        value: 0,           // B资源当前数量
        multiplier1: 1,     // B资源第一重乘数
        multiplier2: 1,     // B资源第二重乘数
        upgrades: {
            purchase_count: 0,    // B资源升级购买次数
            base_cost: 1,         // B资源升级基础价格
            cost_multiplier: 1,    // B资源升级价格系数
            bonus_value: 1        // B资源升级加成值
        }
    },

    /**
     * 重置系统配置
     * 管理不同层级的重置机制
     */
    reset: {
        // 第一层重置
        reset1: {
            count: 0,           // 重置次数
            time_record: 0      // 上次重置时间
        },
        // 第二层重置
        reset2: {
            count: 0,
            time_record: 0
        },
        // 第三层重置
        reset3: {
            count: 0,
            time_record: 0
        },
        // 完全重置
        true_reset: {
            count: 0,
            time_record: 0
        }
    },
    
    // 成就系统状态存储
    achievements: {
        "ac-1-1": false,  // 示例成就
        "ac-1-2": false,
        "ac-1-3": false,
        "ac-1-4": false,
        "ac-1-5": false,
        "ac-1-6": false,
        "ac-1-7": false,
        "ac-1-8": false,
        "ac-2-1": false,
        "ac-2-2": false,
        "ac-2-3": false,
        "ac-2-4": false,
        "ac-2-5": false,
        // 可以继续添加更多成就
    },

    // 隐藏成就揭示状态与特殊值
    revealedAchievements: {
        "ac-2-4": false,
        ac24count: 0,
    },
    /**
     * 设置与成就系统
     * 存储游戏设置和成就完成状态
     */
    settings: {
        switches: {},    // 各种开关设置的状态记录
        achievements: {} // 成就完成状态记录
    },

    /**
     * 统计系统
     * 记录各类资源的实时产出速率和重置相关统计
     */
    statistics: {
        reset1: {},
        reset2: {},
        reset3: {},
        income_per_second: {
            a: 0,    // A资源每秒产出
            b: 0,    // B资源每秒产出
            c: 0     // C资源每秒产出
        }
    }
};

/**
 * 渲染A资源值到页面
 * 更新显示A资源的当前数值
 */
function renderAValue() {
    const resourceA = document.getElementById('resourceA');
    if (resourceA) resourceA.textContent = formatNumber(gameValues.resources.a);
}

/**
 * 更新显示函数
 * 负责更新页面上所有动态数值的显示
 * 该处使用来自values.js的pageUpgrades.page_1_1.triggers数组进行数值计算
 * 数值更新与缩写采用values.js的formatNumber函数进行格式化
 * index的主流程：每帧调用此函数更新所有UI显示
 */
function updateDisplay() {
    // 更新基础资源显示
    renderAValue();
    const resourceB = document.getElementById('resourceB');
    if (resourceB) resourceB.textContent = formatNumber(gameValues.resource_b.value);
    const resourceC = document.getElementById('resourceC');
    if (resourceC) resourceC.textContent = formatNumber(gameValues.statistics.income_per_second.c);

    // 更新触发器相关显示 - 使用来自values.js的pageUpgrades.page_1_1.triggers数组
    const triggers = gameValues.pageUpgrades.page_1_1.triggers;
    for (let i = 0; i < 8; i++) {
        const trigger = triggers[i];
        const elements = {
            count: document.getElementById(`trigger-${i}-count`),
            income: document.getElementById(`trigger-${i}-income`),
            price: document.getElementById(`trigger-${i}-price`)
        };

        // 使用统一的更新方法 - 数值更新与缩写采用values.js的formatNumber函数
        if (elements.count) elements.count.textContent = trigger.buycount;
        if (elements.income) elements.income.textContent = formatNumber(trigger.incomeX * trigger.buycount);
        if (elements.price) elements.price.textContent = formatNumber(trigger.base_cost * Math.pow(trigger.costX, trigger.buycount));
    }

    // 更新触发器按钮状态
    if (window.BuySystem && window.BuySystem.updateTriggerButtons) {
        window.BuySystem.updateTriggerButtons();
    }

    // 更新升级按钮状态
    if (window.BuySystem && window.BuySystem.updateUpgradeButtons) {
        window.BuySystem.updateUpgradeButtons();
    }

    // 更新重置升级按钮状态
    if (window.BuySystem && window.BuySystem.updateResetUpgradeButtons) {
        window.BuySystem.updateResetUpgradeButtons();
    }

    // 更新升级1-8的倍数显示
    const upgrade1_8_multiplier = document.getElementById('upgrade1-8-multiplier');
    if (upgrade1_8_multiplier) {
        upgrade1_8_multiplier.textContent = gameValues.resources.a_multipliers.multiplier4.toFixed(2);
    }

    // 更新升级按钮花费显示
    updateUpgradeCosts();
}

/**
 * 数值格式化函数
 * 将大数字转换为更易读的形式（K/M后缀）
 * 该函数被buy.js和values.js等多个文件调用，用于统一数值显示格式
 * index的主流程：updateDisplay函数中调用此函数格式化所有数值显示
 * @param {number} num - 要格式化的数值
 * @returns {string} 格式化后的字符串
 */
function formatNumber(num) {
    if (num >= 1e12) {
        return (num / 1e12).toFixed(2) + 'T';
    }
    if (num >= 1000000000) {
        return (num / 1000000000).toFixed(2) + 'B';
    }
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(2) + 'K';
    }
    return num.toFixed(2);
}

// e值调试：每0.1秒自增并显示
let eValue = 0;
/**
 * 更新调试用e值
 * 用于测试和调试目的
 */
function updateEValue() {
    eValue += 1;
    const debugE = document.getElementById('debugEValue');
    if (debugE) debugE.textContent = eValue;
}

// 启动e值更新
setInterval(updateEValue, 100);

/**
 * 页面加载完成后的初始设置
 * index的主流程：页面加载完成后立即更新显示并启动定期更新循环
 */
window.onload = function() {
    updateDisplay();
    setInterval(updateDisplay, 1000/60);  // 60fps更新显示 - index的主流程：每帧更新UI
    setInterval(window.updateEValue, 100); // 更新e值
};

// 将需要的函数挂载到window上供全局使用
// index的主流程：将核心函数暴露给全局作用域供其他模块调用
window.updateDisplay = updateDisplay;  // UI更新函数
window.formatNumber = formatNumber;    // 数值格式化函数
window.renderAValue = renderAValue;    // A资源渲染函数
window.updateUpgradeCosts = updateUpgradeCosts;  // 升级花费更新函数

/**
 * 更新升级按钮花费显示
 * 将values.js中的升级成本绑定到HTML显示
 */
function updateUpgradeCosts() {
    // 更新页面1-2的升级花费
    const page1_2 = gameValues.pageUpgrades.page_1_2;
    for (let i = 1; i <= 10; i++) {
        const costElement = document.getElementById(`upgrade1-${i}-price`);
        if (costElement) {
            const costKey = `cost1_${i}`;
            const cost = page1_2[costKey];
            costElement.textContent = formatNumber(cost);
        }
    }

    // 更新页面1-3的升级花费
    const page1_3 = gameValues.pageUpgrades.page_1_3;
    for (let i = 1; i <= 5; i++) {
        const costElement = document.getElementById(`upgrade2-${i}-price`);
        if (costElement) {
            const costKey = `cost2_${i}`;
            const cost = page1_3[costKey];
            costElement.textContent = formatNumber(cost);
        }
    }
}

// 导出游戏数值对象和相关函数
export default gameValues;
