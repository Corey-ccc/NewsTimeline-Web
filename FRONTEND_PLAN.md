# 前端开发计划

> 创建日期：2026-04-24
> 更新日期：2026-04-24

## 开发原则

1. **功能优先，UI最后** - 先让功能跑起来，再美化界面
2. **小步快跑** - 每一步只做一个功能，立即测试
3. **简单直接** - 避免过度设计，保持代码简洁
4. **向后兼容** - API返回什么就展示什么，不做复杂适配

## 后端API确认

```javascript
// API基础地址
const API_BASE = 'https://newstimeline-api.onrender.com';

// 获取新闻
GET /api/news?category=科技&limit=20&offset=0
// 响应: { success: true, total: 45, has_more: true, data: [...] }

// 获取分类
GET /api/categories
// 响应: { success: true, data: ['全部', '科技', '财经', ...] }
```

---

## 开发步骤

### Step 1: 基础框架 ✅ 创建计划
**目标**：创建HTML基础结构
**文件**：`/workspace/NewsTimeline/frontend/index.html`
**内容**：
- [x] 创建HTML骨架
- [ ] 定义CSS变量（颜色、字体等）
- [ ] 创建新闻列表容器
- [ ] 引入Google字体和图标

**验收标准**：页面能正常打开，显示空白列表容器

---

### Step 2: 新闻列表展示
**目标**：从API获取并显示新闻
**文件**：`/workspace/NewsTimeline/frontend/index.html`
**内容**：
- [ ] 编写`loadNews()`函数获取API数据
- [ ] 编写`renderNews(news)`函数显示新闻卡片
- [ ] 添加简单loading状态
- [ ] 添加错误提示（API失败时显示）

**代码结构**：
```javascript
// 获取新闻
async function loadNews() {
    showLoading();
    try {
        const resp = await fetch(API_BASE + '/api/news?limit=20');
        const data = await resp.json();
        if (data.success && data.data.length > 0) {
            renderNews(data.data);
        } else {
            showError('暂无数据');
        }
    } catch (e) {
        showError('加载失败');
    }
    hideLoading();
}

// 渲染新闻列表
function renderNews(newsList) {
    const container = document.getElementById('news-list');
    container.innerHTML = newsList.map(news => `
        <div class="news-card">
            <h3>${news.title}</h3>
            <p>${news.source} · ${formatTime(news.published)}</p>
        </div>
    `).join('');
}
```

**验收标准**：
- [ ] 能显示新闻标题
- [ ] 能显示新闻来源和时间
- [ ] 加载失败时显示友好提示

---

### Step 3: 分类筛选
**目标**：添加分类标签，点击切换新闻
**文件**：`/workspace/NewsTimeline/frontend/index.html`
**内容**：
- [ ] 添加分类标签栏
- [ ] 点击标签调用`loadNews(category)`
- [ ] 高亮当前选中的分类
- [ ] 添加"全部"分类

**代码结构**：
```javascript
const categories = ['全部', '科技', '财经', '国际', '军事', '综合'];

function renderCategories() {
    const container = document.getElementById('categories');
    container.innerHTML = categories.map(cat => `
        <button class="${cat === currentCategory ? 'active' : ''}" 
                onclick="selectCategory('${cat}')">${cat}</button>
    `).join('');
}

function selectCategory(cat) {
    currentCategory = cat;
    renderCategories();
    loadNews();
}
```

**验收标准**：
- [ ] 显示所有分类标签
- [ ] 点击分类能筛选新闻
- [ ] 当前分类高亮显示

---

### Step 4: 无限滚动加载
**目标**：滚动到底部自动加载更多
**文件**：`/workspace/NewsTimeline/frontend/index.html`
**内容**：
- [ ] 添加滚动检测
- [ ] 实现分页加载（offset/limit）
- [ ] 显示"加载更多"按钮或自动加载
- [ ] 处理"没有更多数据"状态

**代码结构**：
```javascript
let offset = 0;
let isLoading = false;
let hasMore = true;

async function loadMore() {
    if (isLoading || !hasMore) return;
    isLoading = true;
    
    try {
        const resp = await fetch(`${API_BASE}/api/news?limit=20&offset=${offset}`);
        const data = await resp.json();
        
        if (data.data.length > 0) {
            appendNews(data.data);
            offset += data.data.length;
            hasMore = data.has_more;
        } else {
            hasMore = false;
            showEndMessage();
        }
    } catch (e) {
        showError('加载失败');
    }
    isLoading = false;
}

// 滚动监听
window.addEventListener('scroll', () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
        loadMore();
    }
});
```

**验收标准**：
- [ ] 滚动到底部自动加载
- [ ] 显示加载状态
- [ ] 加载完毕提示

---

### Step 5: 搜索功能
**目标**：搜索框输入关键词过滤新闻
**文件**：`/workspace/NewsTimeline/frontend/index.html`
**内容**：
- [ ] 添加搜索输入框
- [ ] 实现搜索逻辑（标题匹配）
- [ ] 添加防抖处理
- [ ] 显示搜索结果数量

**代码结构**：
```javascript
let searchTimeout;

function handleSearch(keyword) {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        if (keyword.trim()) {
            // 调用后端搜索API或前端过滤
            searchNews(keyword);
        } else {
            loadNews(); // 加载全部
        }
    }, 300);
}
```

**验收标准**：
- [ ] 输入关键词能搜索
- [ ] 显示搜索结果数量
- [ ] 空搜索显示全部

---

### Step 6: 时间线页面
**目标**：点击标签进入该标签的新闻时间线
**文件**：`/workspace/NewsTimeline/frontend/timeline.html`
**内容**：
- [ ] 创建时间线页面
- [ ] 显示该标签的所有新闻（按时间排序）
- [ ] 添加返回按钮

**验收标准**：
- [ ] 能从主页跳转时间线
- [ ] 时间线显示该标签的新闻

---

### Step 7: 新闻详情弹窗
**目标**：点击新闻卡片显示详情
**文件**：`/workspace/NewsTimeline/frontend/index.html`
**内容**：
- [ ] 点击新闻打开弹窗
- [ ] 显示完整标题、内容、来源
- [ ] 添加关闭按钮
- [ ] 支持点击外部关闭

**验收标准**：
- [ ] 点击新闻显示详情
- [ ] 能关闭弹窗

---

### Step 8: 收藏功能
**目标**：收藏新闻到本地存储
**文件**：`/workspace/NewsTimeline/frontend/index.html`
**内容**：
- [ ] 添加收藏按钮
- [ ] 使用localStorage存储
- [ ] 显示收藏列表

**验收标准**：
- [ ] 能收藏新闻
- [ ] 刷新页面收藏保留

---

### Step 9-12: UI美化（UI优先顺序）
**目标**：提升视觉效果

#### Step 9: 响应式布局
- [ ] 适配手机/平板/桌面
- [ ] 调整卡片宽度和间距

#### Step 10: 主题切换
- [ ] 亮色/暗色模式
- [ ] 保存用户偏好

#### Step 11: 动画效果
- [ ] 卡片悬停效果
- [ ] 加载动画
- [ ] 过渡效果

#### Step 12: 图标和图片
- [ ] 添加来源图标
- [ ] 优化字体排版

---

## 文件结构

```
/workspace/NewsTimeline/frontend/
├── index.html        # 主页（开发中）
├── timeline.html     # 时间线页（Step 6）
├── styles.css        # 样式文件（Step 9）
├── app.js            # 主逻辑（各Step整合）
└── FRONTEND_PLAN.md  # 本文件
```

## 当前状态

| Step | 状态 | 说明 |
|------|------|------|
| Step 1 基础框架 | ✅ | HTML骨架 + CSS变量 |
| Step 2 新闻列表 | ✅ | API调用 + 渲染 |
| Step 3 分类筛选 | ✅ | 分类标签 + 高亮 |
| Step 4 无限滚动 | ✅ | 加载更多按钮 |
| Step 5 搜索功能 | ✅ | 防抖搜索 + 结果统计 |
| Step 6 时间线页面 | ⏳ | 待开发 |
| Step 7 新闻详情弹窗 | ⏳ | 待开发 |
| Step 8 收藏功能 | ⏳ | 待开发 |
| Step 9-12 UI美化 | 📋 | 待做 |

## 部署地址

| 服务 | 地址 | 状态 |
|------|------|------|
| 前端 | https://54cucsl760yv.space.minimaxi.com | 🟢 运行中 |
| 后端API | https://newstimeline-api.onrender.com | 🟢 运行中 |

## 每日目标

| 日期 | 目标 | 实际 |
|------|------|------|
| 2026-04-24 | 完成Step 1-4 | 进行中 |

---

## 参考：后端API完整响应

```json
{
  "success": true,
  "total": 45,
  "has_more": true,
  "source": "rss+demo",
  "category": "全部",
  "data": [
    {
      "id": "rss_7c14a56ca3f1",
      "title": "市占率全球第一却持续亏损，XREAL上市能否破局？",
      "source": "钛媒体",
      "category": "科技",
      "published": "2026-04-24T10:03:00+08:00",
      "content": "何时才是AR眼镜的iPhone时刻？",
      "url": "https://www.tmtpost.com/7965005.html",
      "tags": ["综合"],
      "language": "zh"
    }
  ]
}
```

## 参考：后端测试页面成功经验

1. **代码极简**：36行代码，无复杂逻辑
2. **无超时处理**：信任浏览器默认行为
3. **直接显示**：API返回什么显示什么
4. **简单错误处理**：出错就显示错误信息
5. **使用内联CSS**：快速开发，不用单独文件
