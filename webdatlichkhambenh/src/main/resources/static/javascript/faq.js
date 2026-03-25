let allFaqs = [];

// Check authentication status and update header UI
async function checkAuthStatus() {
  const isAuth = window.authManager && window.authManager.isAuthenticated();
  const authButtons = document.querySelector(".nav-auth");
  if (!authButtons) return;

  if (isAuth) {
    const { user } = window.authManager.getTokens();

    if (!user.fullName && user.username) {
      try {
        const response = await fetch(
          `/api/auth/user-info?username=${encodeURIComponent(user.username)}`,
          { method: "GET", headers: { "Content-Type": "application/json" } },
        );
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.fullName) {
            user.fullName = result.fullName;
            const storage = localStorage.getItem("currentUser")
              ? localStorage
              : sessionStorage;
            storage.setItem("currentUser", JSON.stringify(user));
          }
        }
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      }
    }

    const displayName = user.fullName || user.username || "Người dùng";
    const avatarLetter = displayName.charAt(0).toUpperCase();
    const isAdmin =
      user.role === "ADMIN" ||
      user.username === "admin" ||
      (user.username && user.username.toLowerCase().includes("admin"));

    const adminMenuItem = isAdmin
      ? `<div class="dropdown-item" onclick="window.location.href='/html/admin-panel.html'">
                <i class="fas fa-user-cog"></i><span>Quản lý</span>
               </div>`
      : "";

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
  const dropdown = document.getElementById("userDropdown");
  const arrow = document.querySelector(".dropdown-arrow");
  if (dropdown) {
    dropdown.classList.toggle("show");
    if (arrow) arrow.classList.toggle("rotated");
  }
}

async function logout() {
  if (window.authManager) {
    await window.authManager.logout();
  }
}

document.addEventListener("click", function (event) {
  const dropdown = document.getElementById("userDropdown");
  const userProfile = document.querySelector(".user-profile");
  if (
    dropdown &&
    userProfile &&
    !userProfile.contains(event.target) &&
    !dropdown.contains(event.target)
  ) {
    dropdown.classList.remove("show");
    document.querySelector(".dropdown-arrow")?.classList.remove("rotated");
  }
});

document.addEventListener("DOMContentLoaded", function () {
  checkAuthStatus();
  setupTabs();
  loadFaqs();
  loadGuide();
});

function setupTabs() {
  const tabBtns = document.querySelectorAll(".tab-btn");
  tabBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const tab = this.getAttribute("data-tab");

      tabBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      if (tab === "faq") {
        document.getElementById("faqSection").style.display = "block";
        document.getElementById("guideSection").style.display = "none";
      } else {
        document.getElementById("faqSection").style.display = "none";
        document.getElementById("guideSection").style.display = "block";
      }
    });
  });
}

function loadFaqs() {
  fetch("/api/faq")
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        allFaqs = data.faqs || [];
        renderCategoryFilters();
        renderFaqs(allFaqs);
      } else {
        showError("Không thể tải câu hỏi thường gặp");
      }
    })
    .catch((error) => {
      console.error("Error loading FAQs:", error);
      showError("Đã xảy ra lỗi khi tải dữ liệu");
    });
}

function renderCategoryFilters() {
  const categories = [
    ...new Set(allFaqs.map((faq) => faq.category).filter(Boolean)),
  ];
  const filterContainer = document.getElementById("categoryFilter");

  let html =
    '<button class="filter-btn active" data-category="all">Tất cả</button>';
  categories.forEach((category) => {
    html += `<button class="filter-btn" data-category="${category}">${category}</button>`;
  });
  filterContainer.innerHTML = html;

  filterContainer.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const category = this.getAttribute("data-category");
      filterContainer
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      filterFaqs(category);
    });
  });
}

function filterFaqs(category) {
  if (category === "all") {
    renderFaqs(allFaqs);
  } else {
    const filtered = allFaqs.filter((faq) => faq.category === category);
    renderFaqs(filtered);
  }
}

function renderFaqs(faqs) {
  const faqList = document.getElementById("faqList");

  if (!faqs || faqs.length === 0) {
    faqList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-question-circle"></i>
                <p>Chưa có câu hỏi thường gặp nào.</p>
            </div>
        `;
    return;
  }

  let html = "";
  faqs.forEach((faq, index) => {
    html += `
            <div class="faq-item" data-id="${faq.id}">
                <div class="faq-question" onclick="toggleFaq(${index})">
                    <h3>${escapeHtml(faq.question)}</h3>
                    ${faq.category ? `<span class="category-badge">${escapeHtml(faq.category)}</span>` : ""}
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
  const faqItems = document.querySelectorAll(".faq-item");
  const clickedItem = faqItems[index];

  const isOpen = clickedItem.classList.contains("open");

  document.querySelectorAll(".faq-item").forEach((item) => {
    item.classList.remove("open");
  });

  if (!isOpen) {
    clickedItem.classList.add("open");
  }
}

function showError(message) {
  const faqList = document.getElementById("faqList");
  faqList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        </div>
    `;
}

function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function loadGuide() {
  // Guide content is static in HTML, no loading needed
}
