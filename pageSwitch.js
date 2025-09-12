// 页面切换模块
const PageSwitch = {
    // 页面状态管理
    currentSubBar: 1,
    lastPageStates: {
        1: '1,1', // 子栏1默认页面
        2: '2,1',  // 子栏2默认页面
        3: '3,1'   // 子栏3默认页面
    },

    // 隐藏所有页面
    hideAllPages() {
        console.log('隐藏所有页面');
        const pages = document.querySelectorAll('.page-1-1, .page-1-2, .page-1-3, .page-2-1, .page-2-2, .page-3-1');
        pages.forEach(page => {
            page.classList.remove('active');
            page.style.display = 'none';
        });
    },

    // 显示指定页面
    showPage(pageId) {
        console.log('显示页面:', pageId);
        this.hideAllPages();
        let targetPage = null;

        switch(pageId) {
            case '1,1':
                targetPage = document.querySelector('.page-1-1');
                break;
            case '1,2':
                targetPage = document.querySelector('.page-1-2');
                break;
            case '1,3':
                targetPage = document.querySelector('.page-1-3');
                break;
            case '2,1':
                targetPage = document.querySelector('.page-2-1');
                break;
            case '2,2':
                targetPage = document.querySelector('.page-2-2');
                break;
            case '3,1':
                targetPage = document.querySelector('.page-3-1');
                break;
        }

        if (targetPage) {
            targetPage.classList.add('active');
            targetPage.style.display = targetPage.classList.contains('page-1-1') ? 'flex' : 'block';
            console.log(`页面 ${pageId} 已显示`);
        } else {
            console.warn(`未找到页面 ${pageId}`);
        }

        // 更新升级按钮状态
        if (window.BuySystem && window.BuySystem.updateUpgradeButtons) {
            window.BuySystem.updateUpgradeButtons();
        }

        // 保存当前页面状态
        this.lastPageStates[this.currentSubBar] = pageId;
    },

    // 切换子栏
    switchSubBar(barId) {
        this.currentSubBar = barId;

        // 获取子栏容器
        const subBarContainer = document.querySelector('.sub-bar');

        // 获取所有子栏元素
        const subBar1 = document.querySelector('.sub-bar-1');
        const subBar2 = document.querySelector('.sub-bar-2');
        const subBar3 = document.querySelector('.sub-bar-3');

        // 设置子栏容器的显示状态
        if (subBarContainer) {
            // 保持flex布局，但通过visibility控制可见性
            subBarContainer.style.display = 'flex';

            // 安全地设置显示状态，使用flex/none以保持布局一致性
            if (subBar1) {
                subBar1.style.display = barId === 1 ? 'flex' : 'none';
                subBar1.style.visibility = barId === 1 ? 'visible' : 'hidden';
            }
            if (subBar2) {
                subBar2.style.display = barId === 2 ? 'flex' : 'none';
                subBar2.style.visibility = barId === 2 ? 'visible' : 'hidden';
            }
            if (subBar3) {
                subBar3.style.display = barId === 3 ? 'flex' : 'none';
                subBar3.style.visibility = barId === 3 ? 'visible' : 'hidden';
            }
        }

        // 显示上次访问的页面
        this.showPage(this.lastPageStates[barId]);

        // 更新母栏按钮状态
        const mainBarButtons = document.querySelectorAll('.main-bar button');
        mainBarButtons.forEach((button, index) => {
            button.style.backgroundColor = index + 1 === barId ? '#ddd' : '';
        });
    },

    // 初始化函数
    init() {
        console.log('初始化页面切换系统...');

        // 初始显示子栏1和其默认页面
        this.switchSubBar(1);

        // 为母栏按钮添加事件监听
        document.querySelectorAll('.main-bar button').forEach((button, index) => {
            button.addEventListener('click', () => this.switchSubBar(index + 1));
        });

        // 为子栏1的按钮添加事件监听
        document.querySelectorAll('.sub-bar-1 button').forEach((button, index) => {
            button.addEventListener('click', () => this.showPage(`1,${index + 1}`));
        });

        // 为子栏2的按钮添加事件监听
        document.querySelector('.sub-bar-2 button')?.addEventListener('click', () => {
            this.showPage(this.lastPageStates[2]);
        });

        // 为子栏3的按钮添加事件监听
        document.querySelector('.sub-bar-3 button')?.addEventListener('click', () => {
            this.showPage(this.lastPageStates[3]);
        });

        console.log('页面切换系统初始化完成');
    }
};

// 导出页面切换模块
export default PageSwitch;