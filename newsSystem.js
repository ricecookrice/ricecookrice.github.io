// ************ UI管理系统 ************
// 创建时间: 2025年9月6日
// 说明: 此文件包含游戏UI的所有交互逻辑，包括标签切换、子标签切换、新闻系统等

// ================= 新闻系统 =================
const newsSystem = {
    newsPool: [],
    MAX_NEWS_DISPLAY: 6, // 最多显示6行新闻

    // 添加新闻到新闻池
    addNews(message) {
        const timestamp = new Date().toLocaleTimeString();
        const newsItem = `[${timestamp}] ${message}`;
        
        this.newsPool.push(newsItem);
        
        // 限制新闻池大小，避免内存泄漏
        if (this.newsPool.length > 100) {
            this.newsPool = this.newsPool.slice(-50);
        }
        
        this.updateNewsDisplay();
    },

    // 更新新闻显示
    updateNewsDisplay() {
        const newsBox = document.getElementById('newsBox');
        if (!newsBox) return;
        
        // 只显示最后MAX_NEWS_DISPLAY行新闻
        const displayNews = this.newsPool.slice(-this.MAX_NEWS_DISPLAY);
        
        newsBox.innerHTML = displayNews.map(news => 
            `<div class="news-item" style="padding: 5px 10px; border-bottom: 1px solid #eee;">${news}</div>`
        ).join('');
        
        // 自动滚动到底部
        newsBox.scrollTop = newsBox.scrollHeight;
    },

    // 初始化新闻系统
    init() {
        console.log('初始化新闻系统(new.js)...');
        
        // 添加一些初始新闻
        this.addNews("当你醒来的时候，你发现自己是一个波");
        this.addNews("你尝试着制造更多的波动，使自己变得更大");
        // 每30秒添加一条随机新闻
        setInterval(() => {
            const randomNews = [
            "这是一个新闻",
            "你难道没有其它事可做吗？",
            "当你看到这句话时，说明新闻功能良好",
            "新功能即将上线",
            "上下滚动的设计使我们说的话要很短",
            "这不是一个新闻",
            "你知道吗?其实a和b的实际意义并不是字母",
            "a代表概率,b代表概念,c代表因果",
            "主人公是一个不断扩张的概念",
            "它从无穷小而来,最终变成无穷大",
            ];
            const randomMessage = randomNews[Math.floor(Math.random() * randomNews.length)];
            this.addNews(randomMessage);
        }, 30000); // 改为30秒
    }
};

// 为了向后兼容，添加全局方法
window.addNews = function(message) {
    newsSystem.addNews(message);
};

// 导出新闻系统模块
export default newsSystem;
