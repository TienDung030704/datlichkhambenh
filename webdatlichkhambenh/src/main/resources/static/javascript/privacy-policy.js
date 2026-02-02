// ====================== PRIVACY POLICY PAGE FUNCTIONALITY ======================

document.addEventListener("DOMContentLoaded", function () {
  initPrivacyPage();
});

// Initialize page functionality
function initPrivacyPage() {
  initAcceptButton();
  initAnimations();
  initScrollEffects();
  initUserDropdown();
  console.log("Privacy policy page initialized");
}

// ====================== USER DROPDOWN FUNCTIONALITY ======================
function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  const arrow = document.querySelector(".dropdown-arrow");

  if (dropdown) {
    dropdown.classList.toggle("show");
    if (arrow) arrow.classList.toggle("rotated");
  }
}

function showUserInfo() {
  window.location.href = "../html/profile.html";
  toggleUserDropdown();
}

function showTerms() {
  window.location.href = "../html/terms-of-service.html";
  toggleUserDropdown();
}

function showPolicies() {
  window.location.href = "../html/service-terms.html";
  toggleUserDropdown();
}

function showPrivacyPolicy() {
  window.location.href = "../html/privacy-policy.html";
  toggleUserDropdown();
}

function logout() {
  window.location.href = "../html/login.html";
}

function initUserDropdown() {
  // Close dropdown when clicking outside
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
}

// ====================== ACCEPT BUTTON FUNCTIONALITY ======================
function initAcceptButton() {
  const acceptBtn = document.querySelector(".accept-btn");

  if (acceptBtn) {
    acceptBtn.addEventListener("click", handleAcceptPrivacyPolicy);
  }
}

function handleAcceptPrivacyPolicy() {
  // Show loading state
  const btn = document.querySelector(".accept-btn");
  const originalText = btn.innerHTML;

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
  btn.disabled = true;

  // Simulate acceptance process
  setTimeout(() => {
    // Show success message
    showNotification("Bạn đã hiểu và chấp nhận chính sách bảo mật!", "success");

    // Reset button
    btn.innerHTML = originalText;
    btn.disabled = false;

    // Redirect after 2 seconds
    setTimeout(() => {
      window.location.href = "/"; // Redirect to home page
    }, 2000);
  }, 1500);
}

// ====================== ANIMATIONS ======================
function initAnimations() {
  // Animate privacy sections on scroll
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
          }, index * 200);
        }
      });
    },
    {
      threshold: 0.1,
    },
  );

  document.querySelectorAll(".privacy-section").forEach((section) => {
    section.style.opacity = "0";
    section.style.transform = "translateY(30px)";
    section.style.transition = "all 0.6s ease";
    observer.observe(section);
  });

  // Animate title
  const title = document.querySelector(".privacy-title");
  if (title) {
    title.style.opacity = "0";
    title.style.transform = "translateY(-20px)";
    title.style.transition = "all 0.8s ease";

    setTimeout(() => {
      title.style.opacity = "1";
      title.style.transform = "translateY(0)";
    }, 300);
  }
}

// ====================== SCROLL EFFECTS ======================
function initScrollEffects() {
  let ticking = false;

  function updateOnScroll() {
    const scrolled = window.pageYOffset;
    const privacySections = document.querySelectorAll(".privacy-section");

    // Add subtle parallax effect to sections
    privacySections.forEach((section, index) => {
      const speed = 0.02 + index * 0.01;
      const yPos = -(scrolled * speed);
      section.style.transform = `translateY(${yPos}px)`;
    });

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      requestAnimationFrame(updateOnScroll);
      ticking = true;
    }
  }

  window.addEventListener("scroll", requestTick);

  // Highlight current section in navigation
  initSectionHighlight();
}

function initSectionHighlight() {
  const sections = document.querySelectorAll(".privacy-section");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active-section");
        } else {
          entry.target.classList.remove("active-section");
        }
      });
    },
    {
      threshold: 0.3,
      rootMargin: "-20% 0px -20% 0px",
    },
  );

  sections.forEach((section) => observer.observe(section));
}

// ====================== NOTIFICATION SYSTEM ======================
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;

  // Set icon based on type
  let icon = "fas fa-info-circle";
  if (type === "success") icon = "fas fa-check-circle";
  if (type === "error") icon = "fas fa-exclamation-circle";
  if (type === "warning") icon = "fas fa-exclamation-triangle";

  notification.innerHTML = `
        <div class="notification-content">
            <i class="${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;

  // Add styles
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#4CAF50" : type === "error" ? "#f44336" : type === "warning" ? "#ff9800" : "#2196F3"};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 15px;
        min-width: 300px;
        max-width: 500px;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

  // Style notification content
  const content = notification.querySelector(".notification-content");
  content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        flex: 1;
    `;

  // Style close button
  const closeBtn = notification.querySelector(".notification-close");
  closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 5px;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s ease;
    `;

  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.background = "rgba(255,255,255,0.2)";
  });

  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.background = "none";
  });

  // Add to page
  document.body.appendChild(notification);

  // Show notification
  requestAnimationFrame(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0)";
  });

  // Auto remove after 5 seconds
  const autoRemoveTimer = setTimeout(() => {
    removeNotification(notification);
  }, 5000);

  // Close button functionality
  closeBtn.addEventListener("click", () => {
    clearTimeout(autoRemoveTimer);
    removeNotification(notification);
  });
}

function removeNotification(notification) {
  notification.style.opacity = "0";
  notification.style.transform = "translateX(100%)";

  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  }, 300);
}

// ====================== PRIVACY SPECIFIC FUNCTIONS ======================

// Toggle section visibility
function toggleSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.toggle("collapsed");
  }
}

// Search functionality for privacy content
function searchPrivacyContent(query) {
  const sections = document.querySelectorAll(".privacy-section");
  let found = false;

  sections.forEach((section) => {
    const content = section.textContent.toLowerCase();
    if (content.includes(query.toLowerCase())) {
      section.style.display = "block";
      section.classList.add("search-highlight");
      found = true;
    } else {
      section.style.display = "none";
      section.classList.remove("search-highlight");
    }
  });

  if (!found) {
    showNotification(
      "Không tìm thấy nội dung phù hợp với từ khóa tìm kiếm.",
      "warning",
    );
  }
}

// Reset search results
function resetSearch() {
  const sections = document.querySelectorAll(".privacy-section");
  sections.forEach((section) => {
    section.style.display = "block";
    section.classList.remove("search-highlight");
  });
}

// Print privacy policy
function printPrivacyPolicy() {
  window.print();
}

// Export privacy policy as PDF (placeholder)
function exportToPDF() {
  showNotification("Chức năng xuất PDF đang được phát triển.", "info");
}

// ====================== UTILITY FUNCTIONS ======================

// Smooth scroll to section
function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
}

// Check if element is in viewport
function isElementInViewport(el) {
  const rect = el.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Add loading animation to buttons
function addLoadingState(button, originalText = "") {
  if (!originalText) {
    originalText = button.innerHTML;
  }

  button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
  button.disabled = true;

  return () => {
    button.innerHTML = originalText;
    button.disabled = false;
  };
}

// Format date to Vietnamese
function formatDateToVietnamese(date) {
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  };
  return new Intl.DateTimeFormat("vi-VN", options).format(date);
}

// Debounce function
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction() {
    const context = this;
    const args = arguments;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

// Throttle function
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ====================== GLOBAL ERROR HANDLING ======================
window.addEventListener("error", function (event) {
  console.error("JavaScript error in privacy-policy:", event.error);
  showNotification("Có lỗi xảy ra. Vui lòng thử lại.", "error");
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", function (event) {
  console.error("Unhandled promise rejection in privacy-policy:", event.reason);
  showNotification("Có lỗi xảy ra. Vui lòng thử lại.", "error");
  event.preventDefault();
});

// ====================== ACCESSIBILITY IMPROVEMENTS ======================

// Keyboard navigation support
document.addEventListener("keydown", function (event) {
  // ESC key to close dropdown
  if (event.key === "Escape") {
    const dropdown = document.getElementById("userDropdown");
    if (dropdown && dropdown.classList.contains("show")) {
      toggleUserDropdown();
    }
  }

  // Enter key to trigger buttons
  if (event.key === "Enter" && event.target.matches(".accept-btn")) {
    handleAcceptPrivacyPolicy();
  }
});

// Focus management
function manageFocus() {
  const focusableElements = document.querySelectorAll(
    'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
  );

  focusableElements.forEach((element) => {
    element.addEventListener("focus", function () {
      this.setAttribute("data-focused", "true");
    });

    element.addEventListener("blur", function () {
      this.removeAttribute("data-focused");
    });
  });
}

// Initialize accessibility features
function initAccessibility() {
  manageFocus();

  // Add skip to content link
  const skipLink = document.createElement("a");
  skipLink.href = "#main-content";
  skipLink.textContent = "Bỏ qua đến nội dung chính";
  skipLink.className = "skip-link";
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: #1976d2;
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 10001;
    transition: top 0.3s;
  `;

  skipLink.addEventListener("focus", function () {
    this.style.top = "6px";
  });

  skipLink.addEventListener("blur", function () {
    this.style.top = "-40px";
  });

  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add main content ID
  const mainContent = document.querySelector(".privacy-container");
  if (mainContent) {
    mainContent.id = "main-content";
    mainContent.setAttribute("tabindex", "-1");
  }
}

// Initialize accessibility when page loads
document.addEventListener("DOMContentLoaded", initAccessibility);
