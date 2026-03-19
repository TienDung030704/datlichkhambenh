let allFaqs = [];

document.addEventListener('DOMContentLoaded', function() {
    setupTabs();
    loadFaqs();
    loadGuide();
});

function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');

            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            if (tab === 'faq') {
                document.getElementById('faqSection').style.display = 'block';
                document.getElementById('guideSection').style.display = 'none';
            } else {
                document.getElementById('faqSection').style.display = 'none';
                document.getElementById('guideSection').style.display = 'block';
            }
        });
    });
}

function loadFaqs() {
    fetch('/api/faq')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                allFaqs = data.faqs || [];
                renderCategoryFilters();
                renderFaqs(allFaqs);
            } else {
                showError('Không thể tải câu hỏi thường gặp');
            }
        })
        .catch(error => {
            console.error('Error loading FAQs:', error);
            showError('Đã xảy ra lỗi khi tải dữ liệu');
        });
}

function renderCategoryFilters() {
    const categories = [...new Set(allFaqs.map(faq => faq.category).filter(Boolean))];
    const filterContainer = document.getElementById('categoryFilter');

    let html = '<button class="filter-btn active" data-category="all">Tất cả</button>';
    categories.forEach(category => {
        html += `<button class="filter-btn" data-category="${category}">${category}</button>`;
    });
    filterContainer.innerHTML = html;

    filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            filterContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filterFaqs(category);
        });
    });
}

function filterFaqs(category) {
    if (category === 'all') {
        renderFaqs(allFaqs);
    } else {
        const filtered = allFaqs.filter(faq => faq.category === category);
        renderFaqs(filtered);
    }
}

function renderFaqs(faqs) {
    const faqList = document.getElementById('faqList');

    if (!faqs || faqs.length === 0) {
        faqList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <p>Chưa có câu hỏi thường gặp nào.</p>
            </div>
        `;
        return;
    }

    let html = '';
    faqs.forEach((faq, index) => {
        html += `
            <div class="faq-item" data-id="${faq.id}">
                <div class="faq-question" onclick="toggleFaq(${index})">
                    <h3>${escapeHtml(faq.question)}</h3>
                    ${faq.category ? `<span class="category-badge">${escapeHtml(faq.category)}</span>` : ''}
                    <div class="faq-toggle">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="faq-answer">
                    <div class="faq-answer-content">
                        ${escapeHtml(faq.answer)}
                    </div>
                </div>
            </div>
        `;
    });

    faqList.innerHTML = html;
}

function toggleFaq(index) {
    const faqItems = document.querySelectorAll('.faq-item');
    const clickedItem = faqItems[index];

    const isOpen = clickedItem.classList.contains('open');

    document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('open');
    });

    if (!isOpen) {
        clickedItem.classList.add('open');
    }
}

function showError(message) {
    const faqList = document.getElementById('faqList');
    faqList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function loadGuide() {
    // Guide content is static in HTML, no loading needed
}
