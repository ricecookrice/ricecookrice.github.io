/**
 * 成就系统 - 自动检测和显示成就
 * 每秒自动检测所有成就条件，达成时更改按钮颜色为绿色
 */
console.log('Loading chenjiu.js...');
import gameValues from './values.js';

// 成就配置 - 统一管理所有成就信息
const ACHIEVEMENT_CONFIG = {
    'ac-1-1': {
        name: '从零开始！',
        description: '购买一个波动1',
        checkFunction: function() {
            return gameValues.pageUpgrades.page_1_1.triggers[0].buycount >= 1;
        }
    },
    'ac-1-2': {
        name: '这是...100%',
        description: '获得100个a',
        checkFunction: function() {
            return gameValues.resources.a >= 100;
        }
    },
    'ac-1-3': {
        name: '卷土重来',
        description: '进行一次重置',
        checkFunction: function() {
            return gameValues.reset.reset1.count >= 1;
        }
    },
    'ac-1-4': {
        name: '改造升级',
        description: '购买一个升级',
        checkFunction: function() {
            const page1_2 = gameValues.pageUpgrades.page_1_2;
            return page1_2 && (
                page1_2.buy1_1 === 1 || page1_2.buy1_2 === 1 || page1_2.buy1_3 === 1 ||
                page1_2.buy1_4 === 1 || page1_2.buy1_5 === 1 || page1_2.buy1_6 === 1 ||
                page1_2.buy1_7 === 1 || page1_2.buy1_8 === 1 || page1_2.buy1_9 === 1 ||
                page1_2.buy1_10 === 1
            );
        }
    },
    'ac-1-5': {
        name: '双缝干涉',
        description: '购买一个波动2',
        checkFunction: function() {
            return gameValues.pageUpgrades.page_1_1.triggers[1].buycount >= 1;
        }
    },
    'ac-1-6': {
        name: '三，三缝干涉',
        description: '购买一个波动3',
        checkFunction: function() {
            return gameValues.pageUpgrades.page_1_1.triggers[2].buycount >= 1;
        }
    },
    'ac-1-7': {
        name: '我不知道怎么取名了',
        description: '购买一个波动4',
        checkFunction: function() {
            return gameValues.pageUpgrades.page_1_1.triggers[3].buycount >= 1;
        }
    },
    'ac-1-8': {
        name: '十全十美',
        description: '购买页面（1，2）的全部升级',
        checkFunction: function() {
            const page1_2 = gameValues.pageUpgrades.page_1_2;
            return page1_2 && (
                page1_2.buy1_1 === 1 && page1_2.buy1_2 === 1 && page1_2.buy1_3 === 1 &&
                page1_2.buy1_4 === 1 && page1_2.buy1_5 === 1 && page1_2.buy1_6 === 1 &&
                page1_2.buy1_7 === 1 && page1_2.buy1_8 === 1 && page1_2.buy1_9 === 1 &&
                page1_2.buy1_10 === 1
            );
        }
    },
    'ac-2-1': {
        name: '十五全...十五美',
        description: '购买页面（1，3）的5个升级',
        checkFunction: function() {
            const page1_3 = gameValues.pageUpgrades.page_1_3;
            let upgradeCount = 0;
            if (page1_3) {
                if (page1_3.buy2_1 === 1) upgradeCount++;
                if (page1_3.buy2_2 === 1) upgradeCount++;
                if (page1_3.buy2_3 === 1) upgradeCount++;
                if (page1_3.buy2_4 === 1) upgradeCount++;
                if (page1_3.buy2_5 === 1) upgradeCount++;
            }
            return upgradeCount >= 5;
        }
    },
    'ac-2-2': {
        name: '花儿都谢了',
        description: '购买一个波动8',
        checkFunction: function() {
            return gameValues.pageUpgrades.page_1_1.triggers[7].buycount >= 1;
        }
    },
    'ac-2-3': {
        name: '幸运儿',
        description: '获得1M个a',
        checkFunction: function() {
            return gameValues.resources.a >= 1000000;
        }
    },
    'ac-2-4': {
        name: '彩蛋？？？',
        description: '点击成就下方的子栏25次',
        revealCondition: function() {
            return gameValues.revealedAchievements.ac24count >= 25; // 达到25次时揭示
        },
        checkFunction: function() {
            return gameValues.revealedAchievements.ac24count >= 25;
        }
    }
};

const AchievementSystem = {
    /**
     * ===========================================
     * 通用成就检测函数
     * ===========================================
     */

    // 通用成就检测函数
    checkAchievement(achievementId) {
        const config = ACHIEVEMENT_CONFIG[achievementId];
        if (!config) {
            console.warn(`未知的成就ID: ${achievementId}`);
            return;
        }

        const achieved = config.checkFunction();

        if (achieved && !gameValues.achievements[achievementId]) {
            gameValues.achievements[achievementId] = true;
            this.updateAchievementDisplay(achievementId, true);
            this.showAchievementPopup(config.name, config.description);
            console.log(`成就达成: ${config.name}`);
        }
    },

    /**
     * ===========================================
     * 主检测循环和显示更新
     * ===========================================
     */

    // 主检测函数 - 每秒调用一次所有成就检测
    checkAllAchievements() {
        // 首先检查隐藏成就的揭示条件
        Object.keys(ACHIEVEMENT_CONFIG).forEach(achievementId => {
            const config = ACHIEVEMENT_CONFIG[achievementId];
            if (config.revealCondition && !gameValues.revealedAchievements[achievementId]) {
                if (config.revealCondition()) {
                    gameValues.revealedAchievements[achievementId] = true;
                    this.syncAchievementButtons(); // 重新同步按钮显示
                    console.log(`隐藏成就揭示: ${config.name}`);
                }
            }
        });

        // 检测所有成就
        Object.keys(ACHIEVEMENT_CONFIG).forEach(achievementId => {
            this.checkAchievement(achievementId);
        });
    },

    // 更新成就显示 - 更改按钮颜色为绿色
    updateAchievementDisplay(achievementId, achieved) {
        if (!achieved) return;

        // 直接通过ID查找按钮元素
        // 成就ID格式: ac-R-C，对应的按钮ID为 achievement-R-C
        const buttonId = achievementId.replace('ac-', 'achievement-');
        const button = document.getElementById(buttonId);

        if (button) {
            button.style.backgroundColor = '#90ee90'; // 浅绿色
        }
    },

    // 同步成就按钮内容 - 从ACHIEVEMENT_CONFIG更新HTML按钮显示
    syncAchievementButtons() {
        Object.keys(ACHIEVEMENT_CONFIG).forEach(achievementId => {
            const config = ACHIEVEMENT_CONFIG[achievementId];
            const buttonId = achievementId.replace('ac-', 'achievement-');
            const button = document.getElementById(buttonId);

            if (button) {
                // 检查是否为隐藏成就且未被揭示
                const isHiddenUnrevealed = config.revealCondition && !gameValues.revealedAchievements[achievementId];

                if (!isHiddenUnrevealed) {
                    // 普通成就或已揭示的隐藏成就，显示真实内容
                    button.innerHTML = `
                        <strong style="font-size: 1.2em;">${config.name}</strong><br>
                        ${config.description}
                    `;
                }
                // 隐藏未揭示的成就保持HTML中的原始内容不变
            }
        });
    },

    // 成就弹窗队列
    popupQueue: [],
    isShowingPopup: false,

    // 显示成就弹窗
    showAchievementPopup(name, description) {
        this.popupQueue.push({ name, description });
        this.processPopupQueue();
    },

    // 处理弹窗队列
    processPopupQueue() {
        if (this.isShowingPopup || this.popupQueue.length === 0) {
            return;
        }

        this.isShowingPopup = true;
        const { name, description } = this.popupQueue.shift();

        const container = document.getElementById('achievement-popup-container');
        if (!container) {
            console.warn('成就弹窗容器未找到');
            this.isShowingPopup = false;
            return;
        }

        // 创建弹窗元素
        const popup = document.createElement('div');
        popup.className = 'achievement-popup';
        popup.innerHTML = `
            <div class="title">成就达成！</div>
            <div class="title">${name}</div>
            <div class="description">${description}</div>
        `;

        // 添加到容器
        container.appendChild(popup);

        // 3.5秒后开始淡出动画，4秒后移除
        setTimeout(() => {
            popup.style.animation = 'fadeOut 0.5s ease-in forwards';
            setTimeout(() => {
                if (popup.parentNode) {
                    popup.parentNode.removeChild(popup);
                }
                this.isShowingPopup = false;
                // 处理队列中的下一个弹窗
                this.processPopupQueue();
            }, 500);
        }, 3000);
    },

    // 初始化子栏3按钮的彩蛋功能
    initSubBar3Button() {
        const subBar3 = document.querySelector('.sub-bar-3');
        if (!subBar3) {
            console.warn('未找到子栏3元素');
            return;
        }

        const button = subBar3.querySelector('button');
        if (!button) {
            console.warn('未找到子栏3按钮');
            return;
        }

        button.addEventListener('click', (event) => {
            this.handleSubBar3Click(event, button);
        });

        console.log('子栏3按钮彩蛋功能已初始化');
    },

    // 处理子栏3按钮点击
    handleSubBar3Click(event, button) {
        // 增加计数器
        gameValues.revealedAchievements.ac24count++;
      // 创建星星效果
        this.createStarEffect(button);
        // 按钮点击反馈
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 100);
        console.log(`子栏3按钮点击，当前计数: ${gameValues.revealedAchievements.ac24count}`);
    },

    // 创建星星发射效果
    createStarEffect(button) {
        const buttonRect = button.getBoundingClientRect();
        const centerX = buttonRect.left + buttonRect.width / 2;
        const centerY = buttonRect.top + buttonRect.height / 2;
        // 创建6个星星左右
        const starCount = Math.floor(Math.random() * 2) + 5;
        for (let i = 0; i < starCount; i++) {
            this.createSingleStar(centerX, centerY);
        }
    },

    // 创建单个星星
    createSingleStar(startX, startY) {
        const star = document.createElement('div');
        star.textContent = '⭐';
        star.style.position = 'fixed';
        star.style.left = startX + 'px';
        star.style.top = startY + 'px';
        star.style.fontSize = '20px';
        star.style.pointerEvents = 'none';
        star.style.zIndex = '9999';
        star.style.userSelect = 'none';
        document.body.appendChild(star);

        // 随机方向和速度
        const angle = Math.random() * Math.PI * 2; // 0-360度
        const speed = Math.random() * 20 + 8; // 8-28像素每帧
        const gravity = 0.1; // 重力加速度

        let velocityX = Math.cos(angle) * speed;
        let velocityY = Math.sin(angle) * speed;
        let time = 0;
        const animate = () => {
            time += 0.1;
            velocityY += gravity; // 应用重力
            const newX = startX + velocityX * time;
            const newY = startY + velocityY * time;
            star.style.left = newX + 'px';
            star.style.top = newY + 'px';
            // 星星淡出效果
            const opacity = Math.max(0, 1 - time / 30); // 3秒后完全透明
            star.style.opacity = opacity;
            // 继续动画或清理
            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                if (star.parentNode) {
                    star.parentNode.removeChild(star);
                }
            }
        };
        requestAnimationFrame(animate);
    },

    // 初始化成就系统
    init() {
        console.log('成就系统初始化...');

        // 初始化子栏3按钮的彩蛋功能
        this.initSubBar3Button();

        // 同步成就按钮内容
        this.syncAchievementButtons();

        // 为已达成的成就立即设置显示
        for (const [achievementId, achieved] of Object.entries(gameValues.achievements)) {
            if (achieved) {
                this.updateAchievementDisplay(achievementId, true);
            }
        }

        // 立即检查一次所有成就（用于新达成的成就）
        this.checkAllAchievements();

        // 启动每秒检测循环
        setInterval(() => {
            this.checkAllAchievements();
        }, 1000);

        console.log('成就系统初始化完成');
    }
};

console.log('AchievementSystem.js loaded successfully!');

export default AchievementSystem;
