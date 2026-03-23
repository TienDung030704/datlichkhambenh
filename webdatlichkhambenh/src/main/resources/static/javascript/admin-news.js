// Admin News Management JavaScript
let currentPage = 0;
let currentKeyword = '';
const pageSize = 10;
let currentEditingId = null;

// DOM Elements
const newsTableBody = document.getElementById('newsTableBody');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const addNewsBtn = document.getElementById('addNewsBtn');
const newsModal = document.getElementById('newsModal');
const deleteModal = document.getElementById('deleteModal');
const newsForm = document.getElementById('newsForm');
const loadingSpinner = document.getElementById('loadingSpinner');

// Stats elements
const totalNewsElement = document.getElementById('totalNews');
const featuredNewsElement = document.getElementById('featuredNews');
const totalViewsElement = document.getElementById('totalViews');
const todayNewsElement = document.getElementById('todayNews');

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isLoggedIn() || !isAdmin()) {
        window.location.href = 'login.html';
        return;
    }
    
    loadStats();
    loadNews();
    
    // Event listeners
    searchBtn.addEventListener('click', handleSearch);
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
    
    addNewsBtn.addEventListener('click', function() {
        openAddModal();
    });
    
    newsForm.addEventListener('submit', handleFormSubmit);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === newsModal) {
            closeModal();
        }
        if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        logout();
        window.location.href = 'login.html';
    });
});

// Load statistics
async function loadStats() {
    try {
        const response = await fetch('/api/news/admin?page=0&size=1000', {
            headers: getAuthHeaders()
        });
        const result = await response.json();
        
        if (result.success) {
            const allNews = result.data;
            const featuredCount = allNews.filter(news => news.featured).length;
            const totalViews = allNews.reduce((sum, news) => sum + news.viewCount, 0);
            
            // Today's news (assuming we want news published today)
            const today = new Date().toDateString();
            const todayCount = allNews.filter(news => 
                new Date(news.publishedAt).toDateString() === today
            ).length;
            
            totalNewsElement.textContent = allNews.length;
            featuredNewsElement.textContent = featuredCount;
            totalViewsElement.textContent = totalViews.toLocaleString();
            todayNewsElement.textContent = todayCount;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load news with pagination
async function loadNews() {
    try {
        showLoading();
        
        let url = `/api/news/admin?page=${currentPage}&size=${pageSize}`;
        
        if (currentKeyword) {
            url = `/api/news/search?keyword=${encodeURIComponent(currentKeyword)}&page=${currentPage}&size=${pageSize}`;
        }
        
        const response = await fetch(url, {
            headers: getAuthHeaders()
        });
        const result = await response.json();
        
        if (result.success) {
            renderNewsTable(result.data);
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

// Render news table
function renderNewsTable(newsItems) {
    newsTableBody.innerHTML = '';
    
    if (newsItems.length === 0) {
        showEmptyState();
        return;
    }
    
    newsItems.forEach(news => {
        const row = createNewsRow(news);
        newsTableBody.appendChild(row);
    });
}

// Create news table row
function createNewsRow(news) {
    const row = document.createElement('tr');
    
    const statusClass = news.published ? 'status-published' : 'status-draft';
    const statusText = news.published ? 'Đã xuất bản' : 'Nháp';
    const featuredBadge = news.featured ? ' <span class="status-badge status-featured">Nổi bật</span>' : '';
    
    row.innerHTML = `
        <td>${news.id}</td>
        <td class="news-title-cell" title="${news.title}">${news.title}</td>
        <td>${news.author}</td>
        <td>${news.category}</td>
        <td>
            <span class="view-count">
                <i class="fas fa-eye"></i> ${news.viewCount}
            </span>
        </td>
        <td>
            <span class="status-badge ${statusClass}">${statusText}</span>
            ${featuredBadge}
        </td>
        <td class="date-cell">${formatDate(news.createdAt)}</td>
        <td>
            <div class="action-buttons">
                <button class="action-btn btn-view" onclick="viewNews(${news.id})" title="Xem">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn btn-edit" onclick="editNews(${news.id})" title="Sửa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn btn-delete" onclick="deleteNews(${news.id})" title="Xóa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Handle search
function handleSearch() {
    currentKeyword = searchInput.value.trim();
    currentPage = 0;
    loadNews();
}

// Open add modal
function openAddModal() {
    currentEditingId = null;
    document.getElementById('modalTitle').textContent = 'Thêm Tin Tức Mới';
    newsForm.reset();
    document.getElementById('isPublished').checked = true;
    newsModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// View news
function viewNews(id) {
    window.open(`news.html?id=${id}`, '_blank');
}

// Edit news
async function editNews(id) {
    try {
        showLoading();
        const response = await fetch(`/api/news/admin/${id}`, {
            headers: getAuthHeaders()
        });
        const result = await response.json();
        
        if (result.success) {
            currentEditingId = id;
            populateForm(result.data);
            document.getElementById('modalTitle').textContent = 'Chỉnh Sửa Tin Tức';
            newsModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        } else {
            alert('Không thể tải thông tin tin tức');
        }
    } catch (error) {
        console.error('Error loading news for edit:', error);
        alert('Đã xảy ra lỗi khi tải tin tức');
    } finally {
        hideLoading();
    }
}

// Delete news
function deleteNews(id) {
    // Find news in current page data to get title
    const newsRows = newsTableBody.querySelectorAll('tr');
    let newsTitle = '';
    
    newsRows.forEach(row => {
        const firstCell = row.querySelector('td');
        if (firstCell && firstCell.textContent === id.toString()) {
            newsTitle = row.querySelector('.news-title-cell').textContent;
        }
    });
    
    document.getElementById('deleteNewsTitle').textContent = newsTitle;
    deleteModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    
    document.getElementById('confirmDeleteBtn').onclick = function() {
        confirmDelete(id);
    };
}

// Confirm delete
async function confirmDelete(id) {
    try {
        showLoading();
        const response = await fetch(`/api/news/admin/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        const result = await response.json();
        
        if (result.success) {
            closeDeleteModal();
            loadNews(); // Reload the news list
            loadStats(); // Update stats
            showNotification('Xóa tin tức thành công!', 'success');
        } else {
            alert('Không thể xóa tin tức: ' + result.message);
        }
    } catch (error) {
        console.error('Error deleting news:', error);
        alert('Đã xảy ra lỗi khi xóa tin tức');
    } finally {
        hideLoading();
    }
}

// Populate form for editing
function populateForm(news) {
    document.getElementById('newsId').value = news.id;
    document.getElementById('title').value = news.title;
    document.getElementById('author').value = news.author;
    document.getElementById('category').value = news.category;
    document.getElementById('imageUrl').value = news.imageUrl || '';
    document.getElementById('summary').value = news.summary || '';
    document.getElementById('content').value = news.content;
    document.getElementById('isFeatured').checked = news.featured;
    document.getElementById('isPublished').checked = news.published;
}

// Handle form submit
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = {
        title: document.getElementById('title').value.trim(),
        author: document.getElementById('author').value.trim(),
        category: document.getElementById('category').value,
        imageUrl: document.getElementById('imageUrl').value.trim(),
        summary: document.getElementById('summary').value.trim(),
        content: document.getElementById('content').value.trim(),
        isFeatured: document.getElementById('isFeatured').checked,
        isPublished: document.getElementById('isPublished').checked
    };
    
    // Validation
    if (!formData.title || !formData.author || !formData.category || !formData.content) {
        alert('Vui lòng điền đầy đủ các trường bắt buộc');
        return;
    }
    
    try {
        showLoading();
        
        let url, method;
        if (currentEditingId) {
            url = `/api/news/admin/${currentEditingId}`;
            method = 'PUT';
        } else {
            url = '/api/news/admin';
            method = 'POST';
        }
        
        const response = await fetch(url, {
            method: method,
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            closeModal();
            loadNews(); // Reload the news list
            loadStats(); // Update stats
            showNotification(
                currentEditingId ? 'Cập nhật tin tức thành công!' : 'Thêm tin tức mới thành công!',
                'success'
            );
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (error) {
        console.error('Error saving news:', error);
        alert('Đã xảy ra lỗi khi lưu tin tức');
    } finally {
        hideLoading();
    }
}

// Close modal
function closeModal() {
    newsModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    currentEditingId = null;
    newsForm.reset();
}

// Close delete modal
function closeDeleteModal() {
    deleteModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Render pagination
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
        }
    };
    pagination.appendChild(nextBtn);
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
    newsTableBody.innerHTML = `
        <tr>
            <td colspan="8" style="text-align: center; padding: 60px 20px; color: #7f8c8d;">
                <i class="fas fa-newspaper" style="font-size: 3em; color: #ddd; margin-bottom: 15px; display: block;"></i>
                <h3 style="color: #95a5a6; margin-bottom: 10px;">Không có tin tức</h3>
                <p style="color: #bdc3c7;">Chưa có tin tức nào được tạo hoặc không tìm thấy kết quả phù hợp.</p>
            </td>
        </tr>
    `;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#4a90e2'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 1001;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        font-weight: 500;
    `;
    notification.textContent = message;
    
    // Add to document
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);

// Close modal when clicking close button
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.onclick = function() {
        if (this.closest('#newsModal')) {
            closeModal();
        } else if (this.closest('#deleteModal')) {
            closeDeleteModal();
        }
    };
});

// Auto-resize textarea
document.getElementById('content').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
});