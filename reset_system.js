/**
 * 重置系统 - 统一管理游戏重置功能
 * 提供不同等级的重置操作，重置游戏状态并记录统计数据
 */
console.log('Loading reset_system.js...');
import gameValues from './values.js';

const ResetSystem = {
    /**
     * ===========================================
     * 核心重置功能
     * ===========================================
     */

    /**
     * 执行重置1 - 基础重置
     * 重置游戏到初始状态，保留重置统计和时间记录
     * @returns {boolean} 重置是否成功
     */
    performReset1() {
        console.log('=== 执行重置1 ===');

        try {
            // 1. 记录重置前状态
            this.recordPreResetStats(1);

            // 2. 获取重置配置
            const initData = this.loadInitializationTable(1);
            if (!initData) {
                console.error('无法加载重置1配置数据');
                return false;
            }

            // 3. 应用重置
            this.applySimpleReset(initData);

            // 4. 更新重置统计
            this.updateResetMetrics(1);

            // 5. 重置时间统计
            this.resetTimeStats(1);

            // 6. 更新显示
            this.updateDisplay();

            // 7. 触发重置后事件
            this.triggerPostReset(1);

            // 8. 更新升级1-8效果（如果已购买）
            if (window.GameCore && window.GameCore.pageManagers && window.GameCore.pageManagers.page_1_2 && gameValues.pageUpgrades.page_1_2.buy1_8 === 1) {
                window.GameCore.pageManagers.page_1_2.upgrade_1_8();
            }

            console.log('=== 重置1执行成功 ===');
            return true;

        } catch (error) {
            console.error('重置1执行失败:', error);
            return false;
        }
    },

    /**
     * 执行高级重置 (重置2/3)
     * @param {number} resetType - 重置类型 (2或3)
     * @returns {boolean} 重置是否成功
     */
    performReset(resetType) {
        if (resetType < 2 || resetType > 3) {
            console.error('无效的重置类型:', resetType);
            return false;
        }

        console.log(`=== 执行重置${resetType} ===`);

        try {
            // 1. 记录重置前状态
            this.recordPreResetStats(resetType);

            // 2. 获取重置配置
            const initData = this.loadInitializationTable(resetType);
            if (!initData) return false;

            // 3. 应用重置
            this.applyReset(resetType, initData);

            // 4. 更新重置统计
            this.updateResetMetrics(resetType);

            // 5. 重置时间统计
            this.resetTimeStats(resetType);

            // 6. 更新显示
            this.updateDisplay();

            // 7. 触发重置后事件
            this.triggerPostReset(resetType);

            console.log(`=== 重置${resetType}执行成功 ===`);
            return true;

        } catch (error) {
            console.error(`重置${resetType}执行失败:`, error);
            return false;
        }
    },

    /**
     * ===========================================
     * 配置和数据管理
     * ===========================================
     */

    /**
     * 加载重置初始化配置
     * @param {number} resetType - 重置类型
     * @returns {object|null} 初始化配置数据
     */
    loadInitializationTable(resetType) {
        const tableData = gameValues.initialization[`table${resetType}`];

        if (!tableData) {
            console.error(`未找到重置类型 ${resetType} 的初始化配置`);
            return null;
        }

        console.log(`加载重置${resetType}配置:`, tableData);
        return tableData;
    },

    /**
     * 记录重置前状态
     * @param {number} resetType - 重置类型
     */
    recordPreResetStats(resetType) {
        const stats = gameValues.statistics || (gameValues.statistics = {});
        const resetStats = stats[`reset${resetType}`] || (stats[`reset${resetType}`] = {});

        // 记录资源状态
        resetStats.last_resources = { ...gameValues.resources };

        // 记录升级状态
        resetStats.last_upgrades = JSON.stringify(gameValues.pageUpgrades);

        // 记录时间数据
        const lastResetTime = gameValues.reset[`reset${resetType}`]?.time_record || Date.now();
        resetStats.last_reset_duration = Date.now() - lastResetTime;

        console.log(`记录重置${resetType}前状态完成`);
    },

    /**
     * 更新重置统计指标
     * @param {number} resetType - 重置类型
     */
    updateResetMetrics(resetType) {
        const reset = gameValues.reset || (gameValues.reset = {});
        const resetData = reset[`reset${resetType}`] || (reset[`reset${resetType}`] = { count: 0 });

        // 增加重置计数
        resetData.count = (resetData.count || 0) + 1;

        // 更新时间记录 - 所有重置类型都更新时间记录
        resetData.time_record = Date.now();

        console.log(`重置${resetType}统计已更新，当前计数: ${resetData.count}, 时间记录已更新`);
    },

    /**
     * ===========================================
     * 重置应用逻辑
     * ===========================================
     */

    /**
     * 应用完整重置 (用于重置2/3)
     * @param {number} resetType - 重置类型
     * @param {object} initData - 初始化数据
     */
    applyReset(resetType, initData) {
        console.log(`应用重置${resetType}...`);

        // 重置资源到初始值
        if (initData.resources) {
            for (const [key, value] of Object.entries(initData.resources)) {
                gameValues.resources[key] = value;
                console.log(`重置资源 ${key}: ${value}`);
            }
        }

        // 重置升级状态
        if (initData.upgrades) {
            for (const [key, value] of Object.entries(initData.upgrades)) {
                gameValues.pageUpgrades[key] = value;
                console.log(`重置升级页面 ${key}`);
            }
        }

        // 应用永久解锁项
        this.applyPermanentUnlocks();

        console.log(`重置${resetType}应用完成`);
    },

    /**
     * 应用简单重置 (用于重置1)
     * 只更新指定的字段，保持其他数据不变
     * @param {object} initData - 初始化数据
     */
    applySimpleReset(initData) {
        console.log('应用简单重置...');

        // 部分重置资源
        if (initData.resources) {
            for (const [key, value] of Object.entries(initData.resources)) {
                if (gameValues.resources.hasOwnProperty(key)) {
                    gameValues.resources[key] = value;
                    console.log(`重置资源 ${key}: ${value}`);
                } else {
                    console.warn(`资源 ${key} 不存在，跳过重置`);
                }
            }
        }

        // 部分重置升级状态
        if (initData.upgrades) {
            for (const [pageKey, pageData] of Object.entries(initData.upgrades)) {
                if (gameValues.pageUpgrades[pageKey]) {
                    this.applyPartialUpgradeReset(pageKey, pageData);
                } else {
                    console.warn(`页面 ${pageKey} 不存在，跳过重置`);
                }
            }
        }

        // 重置其他数据
        if (initData.reset) {
            for (const [key, value] of Object.entries(initData.reset)) {
                if (gameValues.reset[key]) {
                    gameValues.reset[key] = { ...gameValues.reset[key], ...value };
                    console.log(`重置数据 ${key}:`, value);
                }
            }
        }

        console.log('简单重置应用完成');
    },

    /**
     * 应用部分升级重置
     * @param {string} pageKey - 页面键
     * @param {object} pageData - 页面数据
     */
    applyPartialUpgradeReset(pageKey, pageData) {
        const targetPage = gameValues.pageUpgrades[pageKey];
        const upgradeFlags = this.checkUpgradeFlagsForReset();

        // 处理触发器重置
        if (pageData.triggers && Array.isArray(pageData.triggers)) {
            pageData.triggers.forEach((triggerUpdate, index) => {
                // 检查升级1-9效果：如果已购买且是page_1_1的trigger 0，则跳过重置
                if (pageKey === 'page_1_1' && index === 0 && upgradeFlags.noResetTrigger1) {
                    console.log(`跳过重置页面 ${pageKey} 触发器 ${index}（升级1-9效果）`);
                    return;
                }
                
                if (targetPage.triggers && targetPage.triggers[index]) {
                    Object.assign(targetPage.triggers[index], triggerUpdate);
                    console.log(`重置页面 ${pageKey} 触发器 ${index}`);
                }
            });
        }

        // 处理按钮重置
        if (pageData.buttons && Array.isArray(pageData.buttons)) {
            pageData.buttons.forEach((buttonUpdate, index) => {
                if (targetPage.buttons && targetPage.buttons[index]) {
                    Object.assign(targetPage.buttons[index], buttonUpdate);
                    console.log(`重置页面 ${pageKey} 按钮 ${index}`);
                }
            });
        }

        // 处理其他字段
        for (const [key, value] of Object.entries(pageData)) {
            if (key !== 'triggers' && key !== 'buttons') {
                targetPage[key] = value;
                console.log(`重置页面 ${pageKey} 字段 ${key}`);
            }
        }
    },

    /**
     * 重置时间统计
     * @param {number} resetType - 重置类型
     */
    resetTimeStats(resetType) {
        if (window.GameCore && window.GameCore.statistics) {
            window.GameCore.statistics.resetTimeStats(resetType);
            console.log(`时间统计已重置 (类型: ${resetType})`);
        }
    },

    /**
     * ===========================================
     * 辅助方法和工具函数
     * ===========================================
     */

    /**
     * 检查升级标志对重置的影响
     * @returns {object} 包含各种升级标志的状态
     */
    checkUpgradeFlagsForReset() {
        const unlocks = gameValues.permanent_unlocks || {};
        return {
            noResetTrigger1: unlocks.noResetTrigger1 || false
        };
    },

    /**
     * 应用永久解锁项
     */
    applyPermanentUnlocks() {
        // permanent_unlocks 现在是对象，直接应用其属性
        const unlocks = gameValues.permanent_unlocks || {};
        for (const [key, value] of Object.entries(unlocks)) {
            if (value === true) {
                this.applyPermanentUnlock(key);
            }
        }
    },

    /**
     * 应用单个永久解锁
     * @param {string} unlockKey - 解锁键名
     */
    applyPermanentUnlock(unlockKey) {
        // 根据解锁类型应用效果
        switch (unlockKey) {
            case 'noResetTrigger1':
                // 升级1-9效果已在applyPartialUpgradeReset中处理
                console.log('应用永久解锁: noResetTrigger1');
                break;
            default:
                console.log(`未知的永久解锁: ${unlockKey}`);
        }
    },

    /**
     * 重置后处理
     * @param {number} resetType - 重置类型
     */
    triggerPostReset(resetType) {
        // 重置时间统计
        this.resetTimeStats(resetType);

        // 更新显示
        this.updateDisplay();

        // 检查特殊效果
        this.checkSpecialEffects(resetType);

        // 检查成就
        this.checkAchievements(resetType);

        console.log(`重置${resetType}后处理完成`);
    },

    /**
     * 更新显示
     */
    updateDisplay() {
        // 更新资源显示
        document.querySelectorAll('[data-resource]').forEach(el => {
            const resource = el.dataset.resource;
            if (gameValues.resources[resource] !== undefined) {
                el.textContent = gameValues.resources[resource].toFixed(2);
            }
        });

        // 更新重置计数显示
        document.querySelectorAll('[data-reset-count]').forEach(el => {
            const resetType = el.dataset.resetCount;
            const count = gameValues.reset[`reset${resetType}`]?.count || 0;
            el.textContent = count;
        });

        console.log('显示更新完成');
    },

    /**
     * 检查特殊效果
     * @param {number} resetType - 重置类型
     */
    checkSpecialEffects(resetType) {
        const effects = gameValues.special_effects?.[`reset${resetType}`];
        if (effects) {
            for (const effect of effects) {
                if (this.checkEffectCondition(effect)) {
                    this.applyEffect(effect);
                }
            }
        }
    },

    /**
     * 检查成就
     * @param {number} resetType - 重置类型
     */
    checkAchievements(resetType) {
        const achievements = gameValues.achievements?.reset;
        if (achievements) {
            for (const achievement of achievements) {
                if (this.checkAchievementCondition(achievement, resetType)) {
                    this.unlockAchievement(achievement);
                }
            }
        }
    },

    /**
     * 检查效果条件 (占位符)
     * @param {object} effect - 效果配置
     * @returns {boolean} 是否满足条件
     */
    checkEffectCondition(effect) {
        // 这里实现效果条件检查逻辑
        return false;
    },

    /**
     * 应用效果 (占位符)
     * @param {object} effect - 效果配置
     */
    applyEffect(effect) {
        // 这里实现效果应用逻辑
        console.log('应用效果:', effect);
    },

    /**
     * 检查成就条件 (占位符)
     * @param {object} achievement - 成就配置
     * @param {number} resetType - 重置类型
     * @returns {boolean} 是否满足条件
     */
    checkAchievementCondition(achievement, resetType) {
        // 这里实现成就条件检查逻辑
        return false;
    },

    /**
     * 解锁成就 (占位符)
     * @param {object} achievement - 成就配置
     */
    unlockAchievement(achievement) {
        // 这里实现成就解锁逻辑
        console.log('解锁成就:', achievement);
    },

    /**
     * 获取调试信息
     * @param {number} resetType - 重置类型
     * @returns {object} 调试信息
     */
    getDebugValue(resetType) {
        const reset = gameValues.reset?.[`reset${resetType}`];
        if (!reset) return 'N/A';

        const lastResetTime = reset.time_record || Date.now();
        const timeSinceReset = (Date.now() - lastResetTime) / 1000;

        return {
            resetCount: reset.count || 0,
            timeSinceLastReset: timeSinceReset.toFixed(1) + 's',
            currentResources: { ...gameValues.resources }
        };
    }
};

export default ResetSystem;
