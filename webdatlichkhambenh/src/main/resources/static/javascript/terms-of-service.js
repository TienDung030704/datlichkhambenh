// ====================== TERMS OF SERVICE PAGE FUNCTIONALITY ======================

document.addEventListener("DOMContentLoaded", function () {
  initTermsPage();
});

// Initialize page functionality
function initTermsPage() {
  initAcceptButton();
  initAnimations();
  initScrollEffects();
  initUserDropdown();
  checkAdminRole();
  loadUserInfo();
}

function loadUserInfo() {
  // Get user from localStorage or sessionStorage
  const userData =
    JSON.parse(localStorage.getItem("currentUser")) ||
    JSON.parse(sessionStorage.getItem("currentUser"));

  if (userData) {
    const displayName = userData.fullName || userData.username || "User";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    // Update avatar and name
    const userAvatar = document.getElementById("userAvatar");
    const userName = document.getElementById("userName");

    if (userAvatar) userAvatar.textContent = avatarLetter;
    if (userName) userName.textContent = displayName;
  } else {
    // If no user data, redirect to login
    window.location.href = "../html/login.html";
  }
}

function checkAdminRole() {
  const userData =
    JSON.parse(localStorage.getItem("currentUser")) ||
    JSON.parse(sessionStorage.getItem("currentUser"));
  if (userData) {
    const isAdmin =
      userData.role === "ADMIN" ||
      userData.username === "admin" ||
      (userData.username && userData.username.toLowerCase().includes("admin"));
    if (isAdmin) {
      const adminMenuItem = document.querySelector(".admin-only");
      if (adminMenuItem) {
        adminMenuItem.style.display = "flex";
      }
    }
  }
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
  window.location.href = "../html/service-terms.html";
  toggleUserDropdown();
}

function showPolicies() {
  window.location.href = "../html/terms-of-service.html";
  toggleUserDropdown();
}

function showPrivacyPolicy() {
  window.location.href = "../html/privacy-policy.html";
  toggleUserDropdown();
}

function showAdminPanel() {
  window.location.href = "../html/admin-panel.html";
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
    acceptBtn.addEventListener("click", handleAcceptTerms);
  }
}

function handleAcceptTerms() {
  // Show loading state
  const btn = document.querySelector(".accept-btn");
  const originalText = btn.innerHTML;

  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
  btn.disabled = true;

  // Simulate acceptance process
  setTimeout(() => {
    // Show success message
    showNotification(
      "Bạn đã chấp nhận điều khoản sử dụng thành công!",
      "success",
    );

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
  // Animate terms items on scroll
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

  document.querySelectorAll(".terms-item").forEach((item) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(30px)";
    item.style.transition = "all 0.6s ease";
    observer.observe(item);
  });

  // Animate illustration elements
  animateIllustrationElements();
}

function animateIllustrationElements() {
  const clipboard = document.querySelector(".clipboard");
  const securityBadge = document.querySelector(".security-badge");
  const documents = document.querySelectorAll(".document");

  // Clipboard hover animation
  if (clipboard) {
    clipboard.addEventListener("mouseenter", () => {
      clipboard.style.transform = "rotate(-5deg) scale(1.05)";
    });

    clipboard.addEventListener("mouseleave", () => {
      clipboard.style.transform = "rotate(-5deg) scale(1)";
    });
  }

  // Security badge pulse animation
  if (securityBadge) {
    setInterval(() => {
      securityBadge.style.transform = "rotate(15deg) scale(1.1)";
      setTimeout(() => {
        securityBadge.style.transform = "rotate(15deg) scale(1)";
      }, 500);
    }, 3000);
  }

  // Documents shuffle animation
  documents.forEach((doc, index) => {
    setInterval(
      () => {
        const randomRotation = -20 + Math.random() * 10;
        const randomTranslateY = -50 + Math.random() * 10;
        const randomTranslateX = 10 + Math.random() * 5;

        doc.style.transform = `rotate(${randomRotation}deg) translateY(${randomTranslateY}px) translateX(${randomTranslateX}px)`;
      },
      4000 + index * 1000,
    );
  });
}

// ====================== SCROLL EFFECTS ======================
function initScrollEffects() {
  let ticking = false;

  function updateOnScroll() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll(
      ".decoration-elements .element",
    );

    parallaxElements.forEach((element, index) => {
      const speed = 0.1 + index * 0.05;
      const yPos = -(scrolled * speed);
      element.style.transform = `translateY(${yPos}px) rotate(${scrolled * 0.1}deg)`;
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
  console.error("JavaScript error in terms-of-service:", event.error);
  showNotification("Có lỗi xảy ra. Vui lòng thử lại.", "error");
});

// Handle unhandled promise rejections
window.addEventListener("unhandledrejection", function (event) {
  console.error(
    "Unhandled promise rejection in terms-of-service:",
    event.reason,
  );
  showNotification("Có lỗi xảy ra. Vui lòng thử lại.", "error");
  event.preventDefault();
});
