/**
 * NewsTimeline - 前端交互逻辑
 */

// ========== 全局变量 ==========

// API基础路径 - 部署时请替换为你的Railway后端URL
// API基础路径 - 部署时请替换为你的后端URL
const API_BASE = 'https://newstimeline-api.onrender.com';  // 后端地址
let useLocalAPI = false;  // 使用真实API
let currentUser = null;
let currentPage = 'home';
let currentCategory = 'all';
let newsOffset = 0;
let timelineOffset = 0;
let currentTag = null;
let currentTimelineNews = [];
let isLoading = false;
let hasMoreNews = true;
let aiSessionId = null;
let searchTimeout = null;

// 分类配置
const CATEGORIES = [
    { id: 'all', name: '全部' },
    { id: 'general', name: '综合' },
    { id: 'politics', name: '政治' },
    { id: 'international', name: '国际' },
    { id: 'finance', name: '财经' },
    { id: 'technology', name: '科技' },
    { id: 'military', name: '军事' },
    { id: 'sports', name: '体育' },
    { id: 'entertainment', name: '娱乐' },
    { id: 'culture', name: '文化' },
    { id: 'china', name: '中国' },
];

// ========== 初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initUser();
    loadInitialData();
    setupInfiniteScroll();
    setupSearch();
    setupCategoryTabs();
});

// ========== 主题切换 ==========

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const icon = document.getElementById('themeIcon');
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ========== API调用辅助函数 ==========

async function apiCall(endpoint, options = {}) {
    // 优先使用本地模拟API
    if (useLocalAPI && window.NewsTimelineAPI) {
        return await simulateAPICall(endpoint, options);
    }
    
    // 真实API调用
    const url = `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(currentUser && { 'X-User-ID': currentUser.user_id }),
            ...options.headers
        }
    });
    return response.json();
}

async function simulateAPICall(endpoint, options = {}) {
    const method = options.method || 'GET';
    const params = options.params || {};
    const body = options.body ? JSON.parse(options.body) : {};
    
    // 解析endpoint并调用对应的模拟API
    if (endpoint.startsWith('/news')) {
        if (endpoint.includes('/search')) {
            return await window.NewsTimelineAPI.searchNews(params.q || '');
        }
        return await window.NewsTimelineAPI.getNews(params);
    }
    
    if (endpoint.startsWith('/tags')) {
        return await window.NewsTimelineAPI.getTags(params.q);
    }
    
    if (endpoint.startsWith('/timeline/')) {
        const tag = decodeURIComponent(endpoint.split('/timeline/')[1]);
        return await window.NewsTimelineAPI.getTimeline(tag, params.offset || 0, params.limit || 10);
    }
    
    if (endpoint.startsWith('/categories')) {
        return await window.NewsTimelineAPI.getCategories();
    }
    
    if (endpoint.startsWith('/user/favorites')) {
        if (method === 'POST') {
            await window.NewsTimelineAPI.addFavorite(body.news_id);
            return { success: true };
        }
        if (method === 'DELETE') {
            await window.NewsTimelineAPI.removeFavorite(body.news_id);
            return { success: true };
        }
        return await window.NewsTimelineAPI.getFavorites();
    }
    
    if (endpoint.startsWith('/user/pinned')) {
        if (endpoint.includes('/unpin') || (method === 'DELETE' && options.headers && options.headers['X-Method'] === 'unpin')) {
            const tag = decodeURIComponent(endpoint.split('/user/pinned/')[1]);
            return await window.NewsTimelineAPI.unpinTag(tag);
        }
        if (method === 'POST') {
            return await window.NewsTimelineAPI.pinTag(body.tag);
        }
        return await window.NewsTimelineAPI.getPinned();
    }
    
    if (endpoint.startsWith('/user/categories')) {
        if (method === 'PUT') {
            return await window.NewsTimelineAPI.setCategories(body.categories);
        }
        return await window.NewsTimelineAPI.getUserSettings();
    }
    
    if (endpoint.startsWith('/ai/chat')) {
        return await window.NewsTimelineAPI.chat(body.message, body.context);
    }
    
    if (endpoint === '/user/register' || endpoint === '/user/login') {
        return { success: true, data: { user_id: 'user_' + Date.now(), username: body.username } };
    }
    
    return { success: true, data: [] };
}

// ========== 用户认证 ==========

function initUser() {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserUI();
    }
}

function toggleUserPanel() {
    document.getElementById('userPanel').classList.toggle('active');
}

function closeUserPanel() {
    document.getElementById('userPanel').classList.remove('active');
}

function updateUserUI() {
    const loginSection = document.getElementById('loginSection');
    const userInfo = document.getElementById('userInfo');
    
    if (currentUser) {
        loginSection.style.display = 'none';
        userInfo.style.display = 'block';
        document.getElementById('displayUsername').textContent = currentUser.username;
    } else {
        loginSection.style.display = 'block';
        userInfo.style.display = 'none';
    }
}

async function login() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (!username) {
        showToast('请输入用户名', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            currentUser = result.data;
            localStorage.setItem('user', JSON.stringify(currentUser));
            updateUserUI();
            showToast('登录成功', 'success');
            closeUserPanel();
            loadPinned();
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        // 如果API不可用，使用本地登录
        currentUser = { user_id: 'local_' + username, username };
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateUserUI();
        showToast('登录成功（本地模式）', 'success');
        closeUserPanel();
    }
}

async function register() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value;
    
    if (!username) {
        showToast('请输入用户名', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            showToast('注册成功，请登录', 'success');
        } else {
            showToast(result.error, 'error');
        }
    } catch (error) {
        // 如果API不可用，使用本地注册
        currentUser = { user_id: 'local_' + username, username };
        localStorage.setItem('user', JSON.stringify(currentUser));
        updateUserUI();
        showToast('注册成功（本地模式）', 'success');
        closeUserPanel();
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('user');
    updateUserUI();
    showToast('已退出登录', 'success');
    closeUserPanel();
    loadPinned();
}

// ========== 数据加载 ==========

async function loadInitialData() {
    loadPinned();
    loadNews();
}

async function loadPinned() {
    if (!currentUser) {
        // 未登录时显示空的置顶区
        const pinnedSection = document.getElementById('pinnedSection');
        pinnedSection.style.display = 'none';
        return;
    }
    
    try {
        const result = await apiCall('/user/pinned');
        
        if (result.success && result.data.length > 0) {
            renderPinnedCards(result.data);
            document.getElementById('pinnedSection').style.display = 'block';
        } else {
            document.getElementById('pinnedSection').style.display = 'none';
        }
    } catch (error) {
        document.getElementById('pinnedSection').style.display = 'none';
    }
}

function renderPinnedCards(pinnedList) {
    const container = document.getElementById('pinnedCards');
    container.innerHTML = '';
    
    // 只显示前3个
    const displayList = pinnedList.slice(0, 3);
    
    displayList.forEach(item => {
        const card = document.createElement('div');
        card.className = 'pinned-card';
        card.onclick = () => goToTimeline(item.tag);
        
        const newsHtml = (item.preview_news || []).map(news => `
            <div class="pinned-news-item">
                <span class="time">${formatTime(news.published)}</span>
                <span class="title">${escapeHtml(news.title)}</span>
            </div>
        `).join('');
        
        card.innerHTML = `
            <div class="pinned-card-header">
                <span class="pinned-tag">${escapeHtml(item.tag)}</span>
                <div class="pinned-actions">
                    <button onclick="event.stopPropagation(); unpinTag('${escapeHtml(item.tag)}')">
                        <i class="fas fa-times"></i> 取消置顶
                    </button>
                </div>
            </div>
            <div class="pinned-news-list">
                ${newsHtml || '<p style="color: var(--text-tertiary)">暂无预览</p>'}
            </div>
        `;
        
        container.appendChild(card);
    });
}

async function loadNews(reset = false) {
    if (isLoading || (!hasMoreNews && !reset)) return;
    
    if (reset) {
        newsOffset = 0;
        hasMoreNews = true;
        document.getElementById('newsList').innerHTML = '';
    }
    
    isLoading = true;
    document.getElementById('loadingIndicator').style.display = 'block';
    
    try {
        const params = new URLSearchParams({ limit: 20, offset: newsOffset });
        if (currentCategory !== 'all') {
            params.append('category', currentCategory);
        }
        
        const result = await apiCall(`/news?${params.toString()}`);
        
        if (result.success) {
            renderNewsList(result.data);
            newsOffset += result.data.length;
            
            if (result.data.length < 20) {
                hasMoreNews = false;
                document.getElementById('endIndicator').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('加载新闻失败:', error);
        showToast('加载新闻失败，请刷新重试', 'error');
    } finally {
        isLoading = false;
        document.getElementById('loadingIndicator').style.display = 'none';
    }
}

function renderNewsList(newsList) {
    const container = document.getElementById('newsList');
    
    newsList.forEach(news => {
        const card = createNewsCard(news);
        container.appendChild(card);
    });
}

function createNewsCard(news) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.onclick = () => showNewsDetail(news);
    
    const tagsHtml = (news.tags || []).slice(0, 5).map(tag => 
        `<span class="news-tag" onclick="event.stopPropagation(); goToTimeline('${escapeHtml(tag)}')">${escapeHtml(tag)}</span>`
    ).join('');
    
    card.innerHTML = `
        <div class="news-header">
            <span class="news-source">
                <i class="fas fa-globe"></i>
                ${escapeHtml(news.source)}
            </span>
            <span class="news-time">${formatTime(news.published)}</span>
        </div>
        <h3 class="news-title">${escapeHtml(news.title)}</h3>
        <div class="news-tags">${tagsHtml}</div>
    `;
    
    return card;
}

// ========== 页面导航 ==========

function goHome() {
    document.getElementById('mainContainer').style.display = 'block';
    document.getElementById('timelinePage').style.display = 'none';
    document.getElementById('searchPage').style.display = 'none';
    currentPage = 'home';
    window.scrollTo(0, 0);
}

function goToTimeline(tag) {
    currentTag = tag;
    timelineOffset = 0;
    currentTimelineNews = [];
    
    document.getElementById('mainContainer').style.display = 'none';
    document.getElementById('timelinePage').style.display = 'block';
    document.getElementById('searchPage').style.display = 'none';
    
    document.getElementById('timelineTitle').textContent = tag;
    document.getElementById('timelineList').innerHTML = '';
    document.getElementById('timelineLoading').style.display = 'block';
    document.getElementById('timelineEmpty').style.display = 'none';
    
    loadTimeline();
    updatePinButton();
    
    window.scrollTo(0, 0);
}

async function loadTimeline() {
    if (!currentTag) return;
    
    isLoading = true;
    
    try {
        const result = await apiCall(`/timeline/${encodeURIComponent(currentTag)}?limit=10&offset=${timelineOffset}`);
        
        if (result.success) {
            if (result.data.length > 0) {
                renderTimeline(result.data);
                currentTimelineNews.push(...result.data);
                timelineOffset += result.data.length;
            }
            
            if (result.data.length < 10) {
                document.getElementById('timelineEmpty').style.display = 'block';
                document.getElementById('timelineLoading').style.display = 'none';
            } else {
                document.getElementById('timelineLoading').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('加载时间线失败:', error);
        document.getElementById('timelineEmpty').style.display = 'block';
    } finally {
        isLoading = false;
        document.getElementById('timelineLoading').style.display = 'none';
    }
}

function renderTimeline(newsList) {
    const container = document.getElementById('timelineList');
    
    newsList.forEach(news => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        
        const tagsHtml = (news.tags || []).slice(0, 5).map(tag => 
            `<span class="news-tag" onclick="goToTimeline('${escapeHtml(tag)}')">${escapeHtml(tag)}</span>`
        ).join('');
        
        item.innerHTML = `
            <div class="timeline-time">${formatTime(news.published)}</div>
            <div class="timeline-content-title">${escapeHtml(news.title)}</div>
            <div class="timeline-source">${escapeHtml(news.source)}</div>
            <div class="timeline-tags">${tagsHtml}</div>
        `;
        
        item.onclick = () => showNewsDetail(news);
        container.appendChild(item);
    });
}

function goBack() {
    if (document.getElementById('searchPage').style.display === 'block') {
        goHome();
    } else if (document.getElementById('timelinePage').style.display === 'block') {
        goHome();
    }
}

// ========== 搜索功能 ==========

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const suggestions = document.getElementById('searchSuggestions');
    
    searchInput.addEventListener('input', async (e) => {
        const keyword = e.target.value.trim();
        
        if (keyword.length < 2) {
            suggestions.classList.remove('active');
            return;
        }
        
        // 防抖
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            await loadSearchSuggestions(keyword);
        }, 300);
    });
    
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.length >= 2) {
            document.getElementById('searchSuggestions').classList.add('active');
        }
    });
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            suggestions.classList.remove('active');
        }
    });
}

async function loadSearchSuggestions(keyword) {
    const suggestions = document.getElementById('searchSuggestions');
    
    try {
        const result = await apiCall(`/tags?q=${encodeURIComponent(keyword)}`);
        
        if (result.success && result.data.length > 0) {
            suggestions.innerHTML = result.data.slice(0, 8).map(tag => `
                <div class="suggestion-item" onclick="searchByTag('${escapeHtml(tag)}')">
                    <i class="fas fa-tag"></i>
                    <span>${escapeHtml(tag)}</span>
                </div>
            `).join('');
            suggestions.classList.add('active');
        } else {
            suggestions.classList.remove('active');
        }
    } catch (error) {
        suggestions.classList.remove('active');
    }
}

function searchNews() {
    const keyword = document.getElementById('searchInput').value.trim();
    if (keyword) {
        searchByTag('#' + keyword);
    }
}

async function searchByTag(tag) {
    // 跳转到时间线
    goToTimeline(tag);
    document.getElementById('searchInput').value = '';
    document.getElementById('searchSuggestions').classList.remove('active');
}

function mobileSearch() {
    const keyword = document.getElementById('mobileSearchInput').value.trim();
    if (keyword) {
        searchByTag('#' + keyword);
        closeMobileMenu();
    }
}

function searchMoreNews() {
    // 全网检索功能
    showToast('正在全网检索...', 'success');
    // TODO: 实现全网检索
}

// ========== 分类筛选 ==========

function setupCategoryTabs() {
    const tabs = document.getElementById('categoryTabs');
    tabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.category-tab');
        if (tab) {
            const category = tab.dataset.category;
            changeCategory(category);
        }
    });
}

function changeCategory(category) {
    currentCategory = category;
    
    // 更新标签样式
    document.querySelectorAll('.category-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.category === category);
    });
    
    // 重新加载新闻
    loadNews(true);
}

// ========== 无限滚动 ==========

function setupInfiniteScroll() {
    window.addEventListener('scroll', () => {
        if (currentPage === 'home') {
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop;
            const clientHeight = document.documentElement.clientHeight;
            
            if (scrollTop + clientHeight >= scrollHeight - 500) {
                loadNews();
            }
        } else if (currentPage === 'timeline' && currentTag) {
            const scrollHeight = document.documentElement.scrollHeight;
            const scrollTop = document.documentElement.scrollTop;
            const clientHeight = document.documentElement.clientHeight;
            
            if (scrollTop + clientHeight >= scrollHeight - 500) {
                loadTimeline();
            }
        }
    });
}

// ========== 收藏和置顶 ==========

function updatePinButton() {
    if (!currentTag) return;
    
    const pinBtn = document.getElementById('pinBtn');
    pinBtn.classList.remove('active');
}

async function togglePin() {
    if (!currentUser) {
        showToast('请先登录', 'error');
        toggleUserPanel();
        return;
    }
    
    if (!currentTag) return;
    
    try {
        if (pinBtn.classList.contains('active')) {
            // 取消置顶
            await apiCall(`/user/pinned/${encodeURIComponent(currentTag)}`, { method: 'DELETE' });
            pinBtn.classList.remove('active');
            showToast('已取消置顶', 'success');
        } else {
            // 置顶
            await apiCall('/user/pinned', {
                method: 'POST',
                body: JSON.stringify({
                    tag: currentTag,
                    news_count: currentTimelineNews.length,
                    preview_news: currentTimelineNews.slice(0, 4)
                })
            });
            pinBtn.classList.add('active');
            showToast('已置顶并收藏', 'success');
        }
        
        loadPinned();
    } catch (error) {
        showToast('操作失败', 'error');
    }
}

async function toggleFavorite() {
    if (!currentUser) {
        showToast('请先登录', 'error');
        toggleUserPanel();
        return;
    }
    
    showToast('已收藏', 'success');
}

async function unpinTag(tag) {
    if (!currentUser) return;
    
    try {
        await apiCall(`/user/pinned/${encodeURIComponent(tag)}`, { method: 'DELETE' });
        showToast('已取消置顶', 'success');
        loadPinned();
    } catch (error) {
        showToast('操作失败', 'error');
    }
}

function showFavorites() {
    showToast('我的收藏 - 功能开发中', 'success');
}

function showPinned() {
    if (currentUser) {
        loadPinned();
        goHome();
    } else {
        showToast('请先登录', 'error');
        toggleUserPanel();
    }
}

// ========== AI助手 ==========

function toggleAI() {
    document.getElementById('aiOverlay').classList.toggle('active');
}

function handleAIInput(event) {
    if (event.key === 'Enter') {
        sendAIMessage();
    }
}

async function sendAIMessage() {
    const input = document.getElementById('aiInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    // 添加用户消息
    addAIMessage('user', message);
    input.value = '';
    
    // 发送请求
    try {
        if (!aiSessionId) {
            aiSessionId = 'sess_' + Date.now();
        }
        
        const context = currentTimelineNews.length > 0 ? {
            type: 'timeline_context',
            tag: currentTag,
            news_count: currentTimelineNews.length
        } : null;
        
        const result = await apiCall('/ai/chat', {
            method: 'POST',
            body: JSON.stringify({
                message,
                session_id: aiSessionId,
                context
            })
        });
        
        if (result.success) {
            addAIMessage('assistant', result.data.response);
        } else {
            addAIMessage('assistant', '抱歉，暂时无法回答，请稍后重试。');
        }
    } catch (error) {
        addAIMessage('assistant', '网络错误，请检查连接后重试。');
    }
}

function addAIMessage(role, content) {
    const chat = document.getElementById('aiChat');
    
    // 移除欢迎消息
    const welcome = chat.querySelector('.ai-welcome');
    if (welcome) {
        welcome.remove();
    }
    
    const message = document.createElement('div');
    message.className = `ai-message ${role}`;
    message.innerHTML = `
        <div class="avatar">
            <i class="fas fa-${role === 'user' ? 'user' : 'robot'}"></i>
        </div>
        <div class="content">${escapeHtml(content)}</div>
    `;
    
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}

async function sendToAI() {
    if (currentTimelineNews.length === 0) {
        showToast('当前时间线没有新闻', 'error');
        return;
    }
    
    toggleAI();
    
    // 自动发送分析请求
    setTimeout(() => {
        const prompt = `请分析以下关于「${currentTag}」的新闻时间线，总结关键事件和发展趋势：\n\n` +
            currentTimelineNews.slice(0, 5).map(n => `- ${n.title}`).join('\n');
        
        document.getElementById('aiInput').value = prompt;
        sendAIMessage();
    }, 300);
}

// ========== 新闻详情 ==========

function showNewsDetail(news) {
    const modal = document.getElementById('newsModal');
    const content = document.getElementById('modalContent');
    
    const tagsHtml = (news.tags || []).map(tag => 
        `<span class="news-tag" onclick="closeNewsModal(); goToTimeline('${escapeHtml(tag)}')">${escapeHtml(tag)}</span>`
    ).join('');
    
    content.innerHTML = `
        <div class="news-header" style="margin-bottom: 16px;">
            <span class="news-source">
                <i class="fas fa-globe"></i>
                ${escapeHtml(news.source)}
            </span>
            <span class="news-time">${formatTime(news.published)}</span>
        </div>
        <h2 style="font-size: 20px; margin-bottom: 16px;">${escapeHtml(news.title)}</h2>
        ${news.description ? `<p style="color: var(--text-secondary); margin-bottom: 16px;">${escapeHtml(news.description)}</p>` : ''}
        <div class="news-tags" style="margin-bottom: 20px;">${tagsHtml}</div>
        <a href="${escapeHtml(news.link)}" target="_blank" class="btn-primary" style="display: inline-block; text-decoration: none;">
            <i class="fas fa-external-link-alt"></i> 阅读原文
        </a>
    `;
    
    modal.classList.add('active');
}

function closeNewsModal() {
    document.getElementById('newsModal').classList.remove('active');
}

// ========== 类别设置 ==========

function showCategorySettings() {
    const panel = document.getElementById('categoryPanel');
    const toggles = document.getElementById('categoryToggles');
    
    // 获取用户隐藏的类别
    apiCall('/user/categories')
        .then(result => {
            const hidden = result.data?.hidden || [];
            
            toggles.innerHTML = CATEGORIES.slice(1).map(cat => `
                <div class="category-toggle">
                    <span>${cat.name}</span>
                    <div class="toggle-switch ${!hidden.includes(cat.id) ? 'active' : ''}" 
                         onclick="toggleCategory('${cat.id}', this)"></div>
                </div>
            `).join('');
        })
        .catch(() => {
            toggles.innerHTML = CATEGORIES.slice(1).map(cat => `
                <div class="category-toggle">
                    <span>${cat.name}</span>
                    <div class="toggle-switch active" onclick="toggleCategory('${cat.id}', this)"></div>
                </div>
            `).join('');
        });
    
    panel.classList.add('active');
}

function closeCategoryPanel() {
    document.getElementById('categoryPanel').classList.remove('active');
}

async function toggleCategory(categoryId, element) {
    element.classList.toggle('active');
    const isVisible = element.classList.contains('active');
    
    try {
        await apiCall('/user/categories', {
            method: 'PUT',
            body: JSON.stringify({
                categories: { [categoryId]: isVisible }
            })
        });
        
        showToast(isVisible ? '已显示该类别' : '已隐藏该类别', 'success');
    } catch (error) {
        // 本地模式
        showToast(isVisible ? '已显示该类别' : '已隐藏该类别', 'success');
    }
}

// ========== 辅助函数 ==========

function getUserHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (currentUser) {
        headers['X-User-ID'] = currentUser.user_id;
    }
    return headers;
}

function formatTime(dateStr) {
    if (!dateStr) return '';
    
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60 * 1000) {
        return '刚刚';
    }
    
    // 小于1小时
    if (diff < 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 1000)) + '分钟前';
    }
    
    // 小于24小时
    if (diff < 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (60 * 60 * 1000)) + '小时前';
    }
    
    // 小于7天
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        return Math.floor(diff / (24 * 60 * 60 * 1000)) + '天前';
    }
    
    // 显示日期
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function closeMobileMenu() {
    document.getElementById('mobileMenu').classList.remove('active');
}

function showAbout() {
    alert('NewsTimeline - 全球新闻时间线聚合平台\n\n为您提供最全面的全球新闻资讯。');
}

function contactUs() {
    alert('联系我们: support@newstimeline.com');
}

function showHelp() {
    alert('帮助中心功能开发中...\n\n常见问题请查看使用文档。');
}
