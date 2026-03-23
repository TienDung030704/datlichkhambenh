// News Page JavaScript
let currentPage = 0;
let currentCategory = '';
let currentKeyword = '';
const pageSize = 9;

// DOM Elements
const newsList = document.getElementById('newsList');
const featuredNewsList = document.getElementById('featuredNewsList');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const categoryFilter = document.getElementById('categoryFilter');
const newsModal = document.getElementById('newsModal');
const newsDetail = document.getElementById('newsDetail');
const loadingSpinner = document.getElementById('loadingSpinner');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    loadCategories();
    loadFeaturedNews();
    loadNews();
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    categoryFilter.addEventListener('change', function() {
        currentCategory = this.value;
        currentPage = 0;
        loadNews();
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === newsModal) {
            closeModal();
        }
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
});

// Load categories for filter dropdown
async function loadCategories() {
    try {
        const response = await fetch('/api/news/categories');
        const result = await response.json();
        
        if (result.success) {
            categoryFilter.innerHTML = '<option value="">Tất cả danh mục</option>';
            result.data.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Load featured news
async function loadFeaturedNews() {
    try {
        showLoading();
        const response = await fetch('/api/news/featured?limit=3');
        const result = await response.json();
        
        if (result.success && result.data.length > 0) {
            renderFeaturedNews(result.data);
            document.querySelector('.featured-news-section').style.display = 'block';
        } else {
            document.querySelector('.featured-news-section').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading featured news:', error);
        document.querySelector('.featured-news-section').style.display = 'none';
    } finally {
        hideLoading();
    }
}

// Load regular news with pagination
async function loadNews() {
    try {
        showLoading();
        
        let url = `/api/news/public?page=${currentPage}&size=${pageSize}`;
        
        if (currentKeyword) {
            url = `/api/news/search?keyword=${encodeURIComponent(currentKeyword)}&page=${currentPage}&size=${pageSize}`;
        } else if (currentCategory) {
            url = `/api/news/public/category/${encodeURIComponent(currentCategory)}?page=${currentPage}&size=${pageSize}`;
        }
        
        const response = await fetch(url);
        const result = await response.json();
        
        if (result.success) {
            renderNews(result.data);
            if (result.pagination) {
                renderPagination(result.pagination);
            }
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error loading news:', error);
        showEmptyState();
    } finally {
        hideLoading();
    }
}

// Render featured news
function renderFeaturedNews(newsItems) {
    featuredNewsList.innerHTML = '';
    
    newsItems.forEach(news => {
        const newsElement = createFeaturedNewsElement(news);
        featuredNewsList.appendChild(newsElement);
    });
}

// Create featured news element
function createFeaturedNewsElement(news) {
    const newsElement = document.createElement('div');
    newsElement.className = 'featured-news-item';
    newsElement.onclick = () => openNewsDetail(news.id);
    
    const imageUrl = news.imageUrl || '../image/default-news.jpg';
    const publishedDate = formatDate(news.publishedAt);
    
    newsElement.innerHTML = `
        <div class="news-image" style="background-image: url('${imageUrl}')">
            <div class="featured-badge">Nổi bật</div>
        </div>
        <div class="news-content">
            <h3 class="news-title">${news.title}</h3>
            <p class="news-summary">${news.summary || ''}</p>
            <div class="news-meta">
                <span><i class="fas fa-calendar"></i> ${publishedDate}</span>
                <span><i class="fas fa-user"></i> ${news.author}</span>
                <span><i class="fas fa-eye"></i> ${news.viewCount}</span>
            </div>
        </div>
    `;
    
    return newsElement;
}

// Render regular news
function renderNews(newsItems) {
    newsList.innerHTML = '';
    
    if (newsItems.length === 0) {
        showEmptyState();
        return;
    }
    
    newsItems.forEach(news => {
        const newsElement = createNewsElement(news);
        newsList.appendChild(newsElement);
    });
}

// Create news element
function createNewsElement(news) {
    const newsElement = document.createElement('div');
    newsElement.className = 'news-item';
    newsElement.onclick = () => openNewsDetail(news.id);
    
    const imageUrl = news.imageUrl || '../image/default-news.jpg';
    const publishedDate = formatDate(news.publishedAt);
    
    newsElement.innerHTML = `
        <div class="news-image" style="background-image: url('${imageUrl}')"></div>
        <div class="news-content">
            <h3 class="news-title">${news.title}</h3>
            <p class="news-summary">${news.summary || ''}</p>
            <div class="news-meta">
                <div>
                    <span class="news-category">${news.category}</span>
                    <span><i class="fas fa-calendar"></i> ${publishedDate}</span>
                </div>
                <span><i class="fas fa-eye"></i> ${news.viewCount}</span>
            </div>
        </div>
    `;
    
    return newsElement;
}

// Render pagination
function renderPagination(pagination) {
    pagination.innerHTML = '';
    
    const totalPages = pagination.totalPages;
    const currentPageNum = pagination.page;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPageNum === 0;
    prevBtn.onclick = () => {
        if (currentPageNum > 0) {
            currentPage = currentPageNum - 1;
            loadNews();
        }
    };
    pagination.appendChild(prevBtn);
    
    // Page numbers
    for (let i = 0; i < totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i + 1;
        pageBtn.className = i === currentPageNum ? 'active' : '';
        pageBtn.onclick = () => {
            currentPage = i;
            loadNews();
        };
        pagination.appendChild(pageBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPageNum === totalPages - 1;
    nextBtn.onclick = () => {
        if (currentPageNum < totalPages - 1) {
            currentPage = currentPageNum + 1;
            loadNews();
        }
    };
    pagination.appendChild(nextBtn);
}

// Handle search
function handleSearch() {
    currentKeyword = searchInput.value.trim();
    currentPage = 0;
    currentCategory = '';
    categoryFilter.value = '';
    loadNews();
}

// Open news detail modal
async function openNewsDetail(newsId) {
    try {
        showLoading();
        const response = await fetch(`/api/news/public/${newsId}`);
        const result = await response.json();
        
        if (result.success) {
            renderNewsDetail(result.data);
            newsModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } else {
            alert('Không thể tải chi tiết tin tức');
        }
    } catch (error) {
        console.error('Error loading news detail:', error);
        alert('Đã xảy ra lỗi khi tải tin tức');
    } finally {
        hideLoading();
    }
}

// Render news detail
function renderNewsDetail(news) {
    const publishedDate = formatDate(news.publishedAt);
    const imageHtml = news.imageUrl ? `<div class="news-image" style="background-image: url('${news.imageUrl}')"></div>` : '';
    
    newsDetail.innerHTML = `
        <div class="news-detail">
            <div class="news-header">
                <h1 class="news-title">${news.title}</h1>
                <div class="news-meta">
                    <span><i class="fas fa-user"></i> ${news.author}</span> |
                    <span><i class="fas fa-calendar"></i> ${publishedDate}</span> |
                    <span><i class="fas fa-folder"></i> ${news.category}</span> |
                    <span><i class="fas fa-eye"></i> ${news.viewCount} lượt xem</span>
                </div>
            </div>
            ${imageHtml}
            <div class="news-content">
                ${formatNewsContent(news.content)}
            </div>
        </div>
    `;
}

// Format news content
function formatNewsContent(content) {
    return content.split('\n').map(paragraph => 
        paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
    ).join('');
}

// Close modal
function closeModal() {
    newsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Show loading spinner
function showLoading() {
    loadingSpinner.style.display = 'block';
}

// Hide loading spinner
function hideLoading() {
    loadingSpinner.style.display = 'none';
}

// Show empty state
function showEmptyState() {
    newsList.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <i class="fas fa-newspaper"></i>
            <h3>Không tìm thấy tin tức</h3>
            <p>Hãy thử tìm kiếm với từ khóa khác hoặc chọn danh mục khác.</p>
        </div>
    `;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        timeZone: 'Asia/Ho_Chi_Minh'
    };
    
    return date.toLocaleDateString('vi-VN', options);
}

// Close modal when clicking close button
document.querySelector('.close').onclick = function() {
    closeModal();
}

// Skeleton loading for better UX
function showSkeletonLoading() {
    const skeletonHtml = `
        ${Array(6).fill().map(() => `
            <div class="skeleton-news-item">
                <div class="skeleton-image"></div>
                <div class="skeleton-content">
                    <div class="skeleton-title"></div>
                    <div class="skeleton-text"></div>
                    <div class="skeleton-text medium"></div>
                    <div class="skeleton-text short"></div>
                </div>
            </div>
        `).join('')}
    `;
    newsList.innerHTML = skeletonHtml;
}

// Utility function to truncate text
function truncateText(text, length = 150) {
    if (!text) return '';
    return text.length > length ? text.substring(0, length) + '...' : text;
}

// Scroll to top when changing page
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Update pagination to include scroll to top
function renderPagination(paginationData) {
    pagination.innerHTML = '';
    
    const totalPages = paginationData.totalPages;
    const currentPageNum = paginationData.page;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPageNum === 0;
    prevBtn.onclick = () => {
        if (currentPageNum > 0) {
            currentPage = currentPageNum - 1;
            loadNews();
            scrollToTop();
        }
    };
    pagination.appendChild(prevBtn);
    
    // Calculate visible page range
    let startPage = Math.max(0, currentPageNum - 2);
    let endPage = Math.min(totalPages - 1, currentPageNum + 2);
    
    // Show first page if not in range
    if (startPage > 0) {
        const firstBtn = document.createElement('button');
        firstBtn.textContent = '1';
        firstBtn.onclick = () => {
            currentPage = 0;
            loadNews();
            scrollToTop();
        };
        pagination.appendChild(firstBtn);
        
        if (startPage > 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'pagination-dots';
            pagination.appendChild(dots);
        }
    }
    
    // Page numbers in range
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i + 1;
        pageBtn.className = i === currentPageNum ? 'active' : '';
        pageBtn.onclick = () => {
            currentPage = i;
            loadNews();
            scrollToTop();
        };
        pagination.appendChild(pageBtn);
    }
    
    // Show last page if not in range
    if (endPage < totalPages - 1) {
        if (endPage < totalPages - 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.className = 'pagination-dots';
            pagination.appendChild(dots);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.textContent = totalPages;
        lastBtn.onclick = () => {
            currentPage = totalPages - 1;
            loadNews();
            scrollToTop();
        };
        pagination.appendChild(lastBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPageNum === totalPages - 1;
    nextBtn.onclick = () => {
        if (currentPageNum < totalPages - 1) {
            currentPage = currentPageNum + 1;
            loadNews();
            scrollToTop();
        }
    };
    pagination.appendChild(nextBtn);
}