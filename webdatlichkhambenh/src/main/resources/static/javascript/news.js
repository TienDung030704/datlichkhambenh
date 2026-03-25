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

// Check authentication status and update header UI
async function checkAuthStatus() {
    const isAuth = window.authManager && window.authManager.isAuthenticated();
    const authButtons = document.querySelector('.nav-auth');
    if (!authButtons) return;

    if (isAuth) {
        const { user } = window.authManager.getTokens();

        if (!user.fullName && user.username) {
            try {
                const response = await fetch(
                    `/api/auth/user-info?username=${encodeURIComponent(user.username)}`,
                    { method: 'GET', headers: { 'Content-Type': 'application/json' } }
                );
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.fullName) {
                        user.fullName = result.fullName;
                        const storage = localStorage.getItem('currentUser') ? localStorage : sessionStorage;
                        storage.setItem('currentUser', JSON.stringify(user));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            }
        }

        const displayName = user.fullName || user.username || 'Người dùng';
        const avatarLetter = displayName.charAt(0).toUpperCase();
        const isAdmin = user.role === 'ADMIN' || user.username === 'admin' ||
            (user.username && user.username.toLowerCase().includes('admin'));

        const adminMenuItem = isAdmin
            ? `<div class="dropdown-item" onclick="window.location.href='/html/admin-panel.html'">
                <i class="fas fa-user-cog"></i><span>Quản lý</span>
               </div>`
            : '';

        authButtons.innerHTML = `
            <div class="user-menu">
                <div class="user-profile" onclick="toggleUserDropdown()">
                    <div class="user-avatar">${avatarLetter}</div>
                    <span class="user-name">${displayName}</span>
                    <i class="fas fa-chevron-down dropdown-arrow"></i>
                </div>
                <div class="user-dropdown" id="userDropdown">
                    <div class="dropdown-item" onclick="window.location.href='/html/profile.html'">
                        <i class="fas fa-user"></i><span>Thông tin cá nhân</span>
                    </div>
                    <div class="dropdown-item" onclick="window.location.href='/html/appointments.html'">
                        <i class="fas fa-calendar-check"></i><span>Lịch hẹn của tôi</span>
                    </div>
                    ${adminMenuItem}
                    <div class="dropdown-item" onclick="window.location.href='/html/service-terms.html'">
                        <i class="fas fa-file-contract"></i><span>Điều khoản dịch vụ</span>
                    </div>
                    <div class="dropdown-item" onclick="window.location.href='/html/privacy-policy.html'">
                        <i class="fas fa-shield-alt"></i><span>Chính sách bảo mật</span>
                    </div>
                    <div class="dropdown-item" onclick="window.location.href='/html/terms-of-service.html'">
                        <i class="fas fa-gavel"></i><span>Quy định chung</span>
                    </div>
                    <div class="dropdown-divider"></div>
                    <div class="dropdown-item logout-item" onclick="logout()">
                        <i class="fas fa-sign-out-alt"></i><span>Đăng xuất</span>
                    </div>
                </div>
            </div>
        `;
    } else {
        authButtons.innerHTML = `
            <a href="login.html" class="btn-outline">Đăng Nhập</a>
            <a href="register.html" class="btn-primary">Đăng Ký</a>
        `;
    }
}

function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    const arrow = document.querySelector('.dropdown-arrow');
    if (dropdown) {
        dropdown.classList.toggle('show');
        if (arrow) arrow.classList.toggle('rotated');
    }
}

async function logout() {
    if (window.authManager) {
        await window.authManager.logout();
    }
}

// Close user dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('userDropdown');
    const userProfile = document.querySelector('.user-profile');
    if (dropdown && userProfile &&
        !userProfile.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
        document.querySelector('.dropdown-arrow')?.classList.remove('rotated');
    }
});

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    checkAuthStatus();
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