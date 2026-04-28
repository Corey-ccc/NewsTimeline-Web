/**
 * NewsTimeline - API模拟服务
 * 用于演示和数据模拟，无需后端即可运行
 */

const DEMO_NEWS = [
    {
        id: 'news_001',
        title: '中美高层会谈：双方就经贸问题达成共识',
        description: '中美两国代表在华盛顿举行高层会谈，就双边经贸关系达成多项共识...',
        source: '新华网',
        language: 'zh',
        category: 'politics',
        country: 'CN',
        published: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        tags: ['#中美关系', '#经贸', '#国际']
    },
    {
        id: 'news_002',
        title: '俄罗斯总统访问中国，双方签署多项合作协议',
        description: '俄罗斯总统普京对中国进行国事访问，双方签署了能源、贸易等领域的多项合作协议...',
        source: '人民日报',
        language: 'zh',
        category: 'international',
        country: 'CN',
        published: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        tags: ['#俄罗斯', '#中俄关系', '#国际']
    },
    {
        id: 'news_003',
        title: 'AI技术新突破：新一代语言模型发布',
        description: '多家科技公司发布新一代人工智能语言模型，在理解能力和生成质量上有显著提升...',
        source: '科技日报',
        language: 'zh',
        category: 'technology',
        country: 'CN',
        published: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        tags: ['#人工智能', '#AI', '#科技']
    },
    {
        id: 'news_004',
        title: '全球股市普遍上涨，投资者信心回升',
        description: '受经济数据利好影响，全球主要股市普遍上涨，投资者情绪有所改善...',
        source: '华尔街见闻',
        language: 'zh',
        category: 'finance',
        country: 'CN',
        published: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        tags: ['#股市', '#财经', '#全球经济']
    },
    {
        id: 'news_005',
        title: '以色列与伊朗局势紧张，中东地区安全形势堪忧',
        description: '以色列与伊朗关系持续紧张，多个中东国家呼吁各方保持克制...',
        source: 'BBC中文',
        language: 'zh',
        category: 'international',
        country: 'UK',
        published: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        tags: ['#以色列', '#伊朗', '#中东', '#地缘政治']
    },
    {
        id: 'news_006',
        title: '中国航天事业再获突破，嫦娥六号成功着陆月球背面',
        description: '中国探月工程嫦娥六号探测器成功着陆月球背面，并将携带月壤样本返回地球...',
        source: '央视新闻',
        language: 'zh',
        category: 'technology',
        country: 'CN',
        published: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        tags: ['#中国航天', '#嫦娥', '#月球', '#科技']
    },
    {
        id: 'news_007',
        title: '华为发布新一代芯片，性能提升显著',
        description: '华为公司发布新一代麒麟芯片，在制程工艺和性能表现上都有重大突破...',
        source: '36氪',
        language: 'zh',
        category: 'technology',
        country: 'CN',
        published: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        tags: ['#华为', '#芯片', '#半导体', '#科技']
    },
    {
        id: 'news_008',
        title: '美联储宣布维持利率不变，市场反应积极',
        description: '美联储宣布维持当前利率水平不变，市场对此反应积极，股市小幅上涨...',
        source: 'FT中文网',
        language: 'zh',
        category: 'finance',
        country: 'UK',
        published: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        tags: ['#美联储', '#利率', '#全球经济', '#财经']
    },
    {
        id: 'news_009',
        title: '俄乌战争持续一年，双方谈判前景不明',
        description: '俄乌冲突持续超过一年，尽管国际社会多次呼吁停火，但双方谈判前景仍不明朗...',
        source: '联合早报',
        language: 'zh',
        category: 'international',
        country: 'SG',
        published: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        tags: ['#俄乌战争', '#俄罗斯', '#乌克兰', '#国际']
    },
    {
        id: 'news_010',
        title: '国内消费市场回暖，经济复苏态势明显',
        description: '最新经济数据显示，国内消费市场持续回暖，多项经济指标好于预期...',
        source: '经济参考报',
        language: 'zh',
        category: 'finance',
        country: 'CN',
        published: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        tags: ['#中国经济', '#消费', '#财经', '#复苏']
    },
    {
        id: 'news_011',
        title: '联合国安理会召开紧急会议，讨论中东局势',
        description: '联合国安理会就中东地区紧张局势召开紧急闭门会议，多国呼吁各方保持冷静...',
        source: '联合国新闻',
        language: 'zh',
        category: 'international',
        country: 'UN',
        published: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
        tags: ['#联合国', '#中东', '#国际组织', '#地缘政治']
    },
    {
        id: 'news_012',
        title: '比亚迪销量再创新高，超越特斯拉成为全球第一',
        description: '比亚迪公布最新销量数据，成功超越特斯拉成为全球新能源汽车销量冠军...',
        source: '第一财经',
        language: 'zh',
        category: 'technology',
        country: 'CN',
        published: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        tags: ['#比亚迪', '#新能源汽车', '#特斯拉', '#科技']
    }
];

const TAGS = ['#中美关系', '#中美贸易', '#俄罗斯', '#中俄关系', '#乌克兰', '#俄乌战争', '#以色列', '#伊朗', '#中东', '#人工智能', '#AI', '#科技', '#华为', '#芯片', '#半导体', '#财经', '#股市', '#美联储', '#中国经济', '#消费', '#月球', '#航天', '#联合国', '#国际组织', '#地缘政治', '#新能源汽车', '#特斯拉', '#比亚迪'];

const CATEGORIES = [
    { id: 'all', name: '全部', icon: '📰' },
    { id: 'general', name: '综合', icon: '📰' },
    { id: 'politics', name: '政治', icon: '🏛️' },
    { id: 'international', name: '国际', icon: '🌍' },
    { id: 'finance', name: '财经', icon: '💰' },
    { id: 'technology', name: '科技', icon: '💻' },
    { id: 'military', name: '军事', icon: '✈️' },
    { id: 'sports', name: '体育', icon: '⚽' },
    { id: 'entertainment', name: '娱乐', icon: '🎬' },
    { id: 'culture', name: '文化', icon: '📚' },
    { id: 'china', name: '中国', icon: '🇨🇳' },
];

// 存储
let userData = {
    favorites: [],
    pinned: [],
    hiddenCategories: []
};

// 初始化
function init() {
    loadUserData();
}

// 加载用户数据
function loadUserData() {
    const saved = localStorage.getItem('newstimeline_user');
    if (saved) {
        userData = JSON.parse(saved);
    }
}

// 保存用户数据
function saveUserData() {
    localStorage.setItem('newstimeline_user', JSON.stringify(userData));
}

// API路由处理
window.NewsTimelineAPI = {
    // 获取新闻列表
    async getNews(params = {}) {
        let news = [...DEMO_NEWS];
        
        // 按分类筛选
        if (params.category && params.category !== 'all') {
            news = news.filter(n => n.category === params.category);
        }
        
        // 按语言筛选
        if (params.language) {
            news = news.filter(n => n.language === params.language);
        }
        
        // 分页
        const offset = params.offset || 0;
        const limit = params.limit || 20;
        news = news.slice(offset, offset + limit);
        
        return { success: true, data: news, total: news.length };
    },
    
    // 获取单条新闻
    async getNewsById(id) {
        const news = DEMO_NEWS.find(n => n.id === id);
        return news ? { success: true, data: news } : { success: false, error: 'Not found' };
    },
    
    // 搜索新闻
    async searchNews(keyword) {
        const news = DEMO_NEWS.filter(n => 
            n.title.includes(keyword) || 
            n.tags.some(t => t.includes(keyword))
        );
        return { success: true, data: news, total: news.length };
    },
    
    // 获取标签
    async getTags(keyword = '') {
        if (keyword) {
            return { success: true, data: TAGS.filter(t => t.includes(keyword)) };
        }
        return { success: true, data: TAGS };
    },
    
    // 获取时间线
    async getTimeline(tag, offset = 0, limit = 10) {
        const news = DEMO_NEWS.filter(n => n.tags.some(t => t.includes(tag.replace('#', ''))));
        const result = news.slice(offset, offset + limit);
        return { 
            success: true, 
            data: result, 
            tag: tag, 
            has_more: news.length > offset + limit 
        };
    },
    
    // 获取分类
    async getCategories() {
        return { success: true, data: CATEGORIES };
    },
    
    // 获取收藏
    async getFavorites() {
        const favorites = DEMO_NEWS.filter(n => userData.favorites.includes(n.id));
        return { success: true, data: favorites };
    },
    
    // 添加收藏
    async addFavorite(newsId) {
        if (!userData.favorites.includes(newsId)) {
            userData.favorites.push(newsId);
            saveUserData();
        }
        return { success: true };
    },
    
    // 移除收藏
    async removeFavorite(newsId) {
        userData.favorites = userData.favorites.filter(id => id !== newsId);
        saveUserData();
        return { success: true };
    },
    
    // 获取置顶
    async getPinned() {
        return { success: true, data: userData.pinned };
    },
    
    // 置顶标签
    async pinTag(tag) {
        const news = DEMO_NEWS.filter(n => n.tags.some(t => t.includes(tag.replace('#', '')))).slice(0, 4);
        const pinned = {
            tag: tag,
            news_count: news.length,
            preview_news: news
        };
        
        // 移除已存在的
        userData.pinned = userData.pinned.filter(p => p.tag !== tag);
        userData.pinned.unshift(pinned);
        userData.pinned = userData.pinned.slice(0, 3); // 最多3个
        
        saveUserData();
        return { success: true };
    },
    
    // 取消置顶
    async unpinTag(tag) {
        userData.pinned = userData.pinned.filter(p => p.tag !== tag);
        saveUserData();
        return { success: true };
    },
    
    // 获取用户设置
    async getUserSettings() {
        return { success: true, data: { hidden: userData.hiddenCategories } };
    },
    
    // 设置用户分类偏好
    async setCategories(categories) {
        userData.hiddenCategories = Object.entries(categories)
            .filter(([_, visible]) => !visible)
            .map(([cat]) => cat);
        saveUserData();
        return { success: true };
    },
    
    // AI对话
    async chat(message, context = null) {
        // 模拟AI响应
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        let response = '';
        
        if (message.includes('总结') || message.includes('分析')) {
            response = `根据收集到的新闻，我对「${context?.tag || '当前话题'}」进行了分析：

**主要观点：**
1. 相关事件持续发展，各方反应不一
2. 国际社会保持关注，呼吁各方保持克制
3. 未来走势仍需进一步观察

**建议关注：**
- 关键当事方的后续表态
- 国际斡旋努力的进展
- 可能产生的外溢效应

如需了解更多细节，请告诉我具体想了解的方面。`;
        } else {
            response = `感谢你的提问！

我可以帮你：
- 分析新闻事件的发展趋势
- 解读时间线中的关键节点
- 总结相关话题的新闻要点

请告诉我你想了解的具体内容，或者我可以帮你分析当前时间线的新闻。`;
        }
        
        return { success: true, data: { response, session_id: 'demo_session' } };
    },
    
    // 健康检查
    async health() {
        return { success: true, status: 'healthy' };
    }
};

// 初始化
init();
