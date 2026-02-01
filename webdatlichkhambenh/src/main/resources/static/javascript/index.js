// Check authentication status and update UI
async function checkAuthStatus() {
  // Check if authManager is available and user is authenticated
  const isAuth = window.authManager && window.authManager.isAuthenticated();
  const authButtons = document.querySelector(".nav-auth");

  if (isAuth) {
    // User đã đăng nhập
    const { user } = window.authManager.getTokens();

    // Nếu chưa có fullName, fetch từ server
    if (!user.fullName && user.username) {
      try {
        const response = await fetch(
          `/api/auth/user-info?username=${encodeURIComponent(user.username)}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();

        if (result.success && result.fullName) {
          user.fullName = result.fullName;

          // Lưu lại vào storage
          const storage = localStorage.getItem("currentUser")
            ? localStorage
            : sessionStorage;
          storage.setItem("currentUser", JSON.stringify(user));

          // Force update UI immediately
          const displayName = result.fullName;
          const avatarLetter = displayName.charAt(0).toUpperCase();

          authButtons.innerHTML = `
            <div class="user-menu">
              <div class="user-profile" onclick="toggleUserDropdown()">
                <div class="user-avatar">${avatarLetter}</div>
                <span class="user-name">${displayName}</span>
                <i class="fas fa-chevron-down dropdown-arrow"></i>
              </div>
              <div class="user-dropdown" id="userDropdown">
                <div class="dropdown-item" onclick="showUserInfo()">
                  <i class="fas fa-user"></i>
                  <span>Thông tin cá nhân</span>
                </div>
                <div class="dropdown-item" onclick="showTerms()">
                  <i class="fas fa-file-contract"></i>
                  <span>Điều khoản dịch vụ</span>
                </div>
                <div class="dropdown-item" onclick="showPolicies()">
                  <i class="fas fa-shield-alt"></i>
                  <span>Quy định chung</span>
                </div>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item logout-item" onclick="logout()">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>Đăng xuất</span>
                </div>
              </div>
            </div>
          `;

          return; // Exit early after updating UI
        }
      } catch (error) {
        console.error("❌ Failed to fetch user info:", error);
      }
    }

    // Get display name - prioritize fullName
    const displayName = user.fullName || user.username || "Người dùng";
    const avatarLetter = displayName.charAt(0).toUpperCase();

    // Cập nhật UI cho user đã đăng nhập với avatar và tên thật
    authButtons.innerHTML = `
      <div class="user-menu">
        <div class="user-profile" onclick="toggleUserDropdown()">
          <div class="user-avatar">${avatarLetter}</div>
          <span class="user-name">${displayName}</span>
          <i class="fas fa-chevron-down dropdown-arrow"></i>
        </div>
        <div class="user-dropdown" id="userDropdown">
          <div class="dropdown-item" onclick="showUserInfo()">
            <i class="fas fa-user"></i>
            <span>Thông tin cá nhân</span>
          </div>
          <div class="dropdown-item" onclick="showTerms()">
            <i class="fas fa-file-contract"></i>
            <span>Điều khoản dịch vụ</span>
          </div>
          <div class="dropdown-item" onclick="showPolicies()">
            <i class="fas fa-shield-alt"></i>
            <span>Quy định chung</span>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-item logout-item" onclick="logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Đăng xuất</span>
          </div>
        </div>
      </div>
    `;
  } else {
    // User chưa đăng nhập - hiển thị nút đăng nhập/đăng ký
    authButtons.innerHTML = `
      <a href="html/login.html" class="btn-outline">Đăng Nhập</a>
      <a href="html/register.html" class="btn-primary">Đăng Ký</a>
    `;
  }
}

// User dropdown functions
function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  const arrow = document.querySelector(".dropdown-arrow");

  if (dropdown) {
    dropdown.classList.toggle("show");
    arrow.classList.toggle("rotated");
  }
}

function showUserInfo() {
  window.location.href = "/html/profile.html";
  toggleUserDropdown();
}

function showTerms() {
  alert("Chức năng Điều khoản dịch vụ đang được phát triển!");
  toggleUserDropdown();
}

function showPolicies() {
  alert("Chức năng Quy định chung đang được phát triển!");
  toggleUserDropdown();
}

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

// Logout function
async function logout() {
  if (window.authManager) {
    await window.authManager.logout();
  } else {
    // Fallback for old logout logic
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("currentUser");

    // Set logout success flag for login page
    sessionStorage.setItem("justLoggedOut", "true");

    // Redirect to login
    window.location.href = "html/login.html";
  }
}

// Mobile menu toggle
function toggleMobileMenu() {
  const navMenu = document.querySelector(".nav-menu");
  navMenu.classList.toggle("active");
}

// Appointment form handling
document.addEventListener("DOMContentLoaded", function () {
  // Kiểm tra trạng thái đăng nhập khi trang load
  checkAuthStatus();

  const appointmentForm = document.getElementById("appointmentForm");

  if (appointmentForm) {
    appointmentForm.addEventListener("submit", function (e) {
      e.preventDefault();
      handleAppointmentBooking();
    });
  }

  // Initialize date picker with today's date as minimum
  const dateInput = document.getElementById("appointmentDate");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  // Specialty selection
  const specialtyCards = document.querySelectorAll(".specialty-card");
  specialtyCards.forEach((card) => {
    card.addEventListener("click", function () {
      const specialty = this.querySelector("h3").textContent;
      selectSpecialty(specialty);
    });
  });

  // Doctor booking
  const doctorBookBtns = document.querySelectorAll(".btn-book-doctor");
  doctorBookBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const doctorCard = this.closest(".doctor-card");
      const doctorName = doctorCard.querySelector(".doctor-name").textContent;
      bookDoctor(doctorName);
    });
  });

  // Smooth scrolling for navigation links
  const navLinks = document.querySelectorAll('a[href^="#"]');
  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      const targetSection = document.querySelector(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
});

// Appointment booking function
function handleAppointmentBooking() {
  // Check authentication first
  if (!window.authManager || !window.authManager.requireAuth()) {
    showNotificationWithAction(
      "Vui lòng đăng nhập để đặt lịch khám!",
      "warning",
      "Đăng nhập",
      () => {
        window.location.href = "html/login.html";
      },
    );
    return;
  }

  const formData = {
    specialty: document.getElementById("specialty").value,
    doctor: document.getElementById("doctor").value,
    date: document.getElementById("appointmentDate").value,
    time: document.getElementById("appointmentTime").value,
  };

  // Validate form
  if (
    !formData.specialty ||
    !formData.doctor ||
    !formData.date ||
    !formData.time
  ) {
    showNotification("Vui lòng điền đầy đủ thông tin!", "error");
    return;
  }

  // Show loading
  const submitBtn = document.querySelector(".btn-book");
  const originalText = submitBtn.textContent;
  submitBtn.textContent = "Đang xử lý...";
  submitBtn.disabled = true;

  // Simulate API call
  setTimeout(() => {
    // Reset button
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    // Show success message
    showNotification(
      "Đặt lịch thành công! Chúng tôi sẽ liên hệ với bạn sớm.",
      "success",
    );

    // Reset form
    document.getElementById("appointmentForm").reset();

    // No need to redirect - user is already authenticated
  }, 2000);
}

// Specialty selection
function selectSpecialty(specialty) {
  const specialtySelect = document.getElementById("specialty");
  if (specialtySelect) {
    // Find matching option
    const options = specialtySelect.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].text.includes(specialty)) {
        specialtySelect.selectedIndex = i;
        break;
      }
    }

    // Update doctors based on specialty
    updateDoctorsList(specialty);

    // Scroll to appointment form
    document.querySelector(".appointment-form").scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}

// Update doctors list based on specialty
function updateDoctorsList(specialty) {
  const doctorSelect = document.getElementById("doctor");
  if (!doctorSelect) return;

  // Clear existing options except the first one
  doctorSelect.innerHTML = '<option value="">Chọn Bác Sĩ</option>';

  // Sample doctors data based on specialty
  const doctorsBySpecialty = {
    "Nhi Khoa": ["BS. Nguyễn Văn A", "BS. Trần Thị B", "BS. Lê Văn C"],
    "Sản Phụ Khoa": ["BS. Hoàng Thị D", "BS. Phạm Văn E", "BS. Vũ Thị F"],
    "Tim Mạch": ["BS. Đặng Văn G", "BS. Bùi Thị H", "BS. Lý Văn I"],
    "Răng Hàm Mặt": ["BS. Tôn Thị J", "BS. Đỗ Văn K", "BS. Chu Thị L"],
  };

  const doctors = doctorsBySpecialty[specialty] || [];
  doctors.forEach((doctor) => {
    const option = document.createElement("option");
    option.value = doctor;
    option.textContent = doctor;
    doctorSelect.appendChild(option);
  });
}

// Book specific doctor
function bookDoctor(doctorName) {
  // Check if user is authenticated using authManager
  if (!window.authManager || !window.authManager.requireAuth()) {
    showNotificationWithAction(
      "Vui lòng đăng nhập để đặt lịch khám!",
      "warning",
      "Đăng nhập",
      () => {
        window.location.href = "html/login.html";
      },
    );
    return;
  }

  // Pre-fill form with doctor
  const doctorSelect = document.getElementById("doctor");
  if (doctorSelect) {
    // Find and select the doctor
    const options = doctorSelect.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].text === doctorName) {
        doctorSelect.selectedIndex = i;
        break;
      }
    }
  }

  // Scroll to appointment form
  document.querySelector(".appointment-form").scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  showNotification(
    `Đã chọn ${doctorName}. Vui lòng hoàn thành thông tin đặt lịch.`,
    "info",
  );
}

// Show notification
function showNotification(message, type = "info") {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

  // Add notification styles if not already present
  if (!document.querySelector("#notification-styles")) {
    const styles = document.createElement("style");
    styles.id = "notification-styles";
    styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 400px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease-out;
            }
            
            .notification-success {
                background: #4CAF50;
                color: white;
            }
            
            .notification-error {
                background: #F44336;
                color: white;
            }
            
            .notification-warning {
                background: #FF9800;
                color: white;
            }
            
            .notification-info {
                background: #2196F3;
                color: white;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                padding: 15px 20px;
                gap: 10px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                margin-left: auto;
                padding: 5px;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(notification);

  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 5000);
}

// Get notification icon based on type
function getNotificationIcon(type) {
  const icons = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  };
  return icons[type] || "info-circle";
}

// Show notification with action button
function showNotificationWithAction(
  message,
  type = "info",
  buttonText = "",
  buttonAction = null,
) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll(".notification");
  existingNotifications.forEach((notification) => notification.remove());

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;

  const actionButton =
    buttonAction && buttonText
      ? `<button class="notification-action-btn" onclick="this.handleAction()" style="
        background: rgba(255,255,255,0.2);
        border: 1px solid rgba(255,255,255,0.3);
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        margin-left: 10px;
        font-size: 14px;
        transition: background 0.2s ease;
      ">${buttonText}</button>`
      : "";

  notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            ${actionButton}
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;

  // Add action event listener if provided
  if (buttonAction && buttonText) {
    const actionBtn = notification.querySelector(".notification-action-btn");
    if (actionBtn) {
      actionBtn.handleAction = buttonAction;
      actionBtn.addEventListener("mouseover", function () {
        this.style.background = "rgba(255,255,255,0.3)";
      });
      actionBtn.addEventListener("mouseout", function () {
        this.style.background = "rgba(255,255,255,0.2)";
      });
    }
  }

  // Add styles if not already added
  if (!document.querySelector("#notification-styles")) {
    const styles = document.createElement("style");
    styles.id = "notification-styles";
    styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 1000;
                max-width: 400px;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease-out;
            }
            
            .notification-success {
                background: #4CAF50;
                color: white;
            }
            
            .notification-error {
                background: #F44336;
                color: white;
            }
            
            .notification-warning {
                background: #FF9800;
                color: white;
            }
            
            .notification-info {
                background: #2196F3;
                color: white;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                padding: 15px 20px;
                gap: 10px;
            }
            
            .notification-close {
                background: none;
                border: none;
                color: inherit;
                cursor: pointer;
                margin-left: auto;
                padding: 5px;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(notification);

  // Auto remove after 8 seconds (longer for actionable notifications)
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 8000);
}

// Initialize animations
function initAnimations() {
  // Animate elements on scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  // Observe elements for animation
  const animatedElements = document.querySelectorAll(
    ".specialty-card, .doctor-card, .step-card",
  );
  animatedElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(30px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
    observer.observe(el);
  });
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  initAnimations();

  // Add floating animation to hero icons
  const floatingIcons = document.querySelectorAll(".floating-icon");
  floatingIcons.forEach((icon, index) => {
    icon.style.animationDelay = `${index * 0.5}s`;
  });
});

// Handle navigation to different pages
function navigateToPage(page) {
  const pages = {
    login: "html/login.html",
    register: "html/register.html",
    appointments: "html/appointments.html",
    doctors: "html/doctors.html",
  };

  if (pages[page]) {
    window.location.href = pages[page];
  }
}

function initSlider() {
  let currentSlide = 0;
  let interval;

  const slides = document.querySelectorAll(".slide");
  const dotsContainer = document.querySelector(".slider-dots");

  if (!slides.length || !dotsContainer) return;

  // Tạo dots
  slides.forEach((_, index) => {
    const dot = document.createElement("span");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");

    dot.addEventListener("click", () => {
      showSlide(index);
      resetAuto();
    });

    dotsContainer.appendChild(dot);
  });

  const dots = document.querySelectorAll(".dot");

  function showSlide(index) {
    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");

    currentSlide = index;

    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  window.prevSlide = () => {
    showSlide((currentSlide - 1 + slides.length) % slides.length);
    resetAuto();
  };

  window.nextSlide = () => {
    showSlide((currentSlide + 1) % slides.length);
    resetAuto();
  };

  function startAuto() {
    interval = setInterval(() => {
      showSlide((currentSlide + 1) % slides.length);
    }, 8000);
  }

  function resetAuto() {
    clearInterval(interval);
    startAuto();
  }

  startAuto();
}

// Initialize when page loads
document.addEventListener("DOMContentLoaded", function () {
  // Initialize slider
  initSlider();

  // Check authentication status and update UI
  if (typeof checkAuthStatus === "function") {
    checkAuthStatus();
  }
});
