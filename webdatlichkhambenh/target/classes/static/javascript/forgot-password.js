// Xử lý form quên mật khẩu
document.addEventListener("DOMContentLoaded", function () {
  const forgotPasswordForm = document.getElementById("forgotPasswordForm");
  const emailInput = document.getElementById("email");
  const loginBtn = forgotPasswordForm.querySelector(".login-btn");
  const btnLoader = loginBtn.querySelector(".btn-loader");
  const btnText = loginBtn.querySelector("span");
  const successMessage = document.getElementById("successMessage");
  const loginForm = document.querySelector(".login-form");

  // Pre-fill email from URL parameter
  const urlParams = new URLSearchParams(window.location.search);
  const emailParam = urlParams.get("email");
  if (emailParam) {
    emailInput.value = decodeURIComponent(emailParam);
  }

  // Xử lý submit form
  forgotPasswordForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();

    // Validate form
    if (!validateForm(email)) {
      return;
    }

    // Hiển thị loading
    showLoading(true);

    try {
      // Simulate API call
      await simulateResetPasswordRequest(email);

      // Hiển thị thông báo thành công
      showSuccessMessage();
    } catch (error) {
      console.error("Forgot password error:", error);
      showError(error.message || "Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      showLoading(false);
    }
  });

  // Simulate reset password API call
  async function simulateResetPasswordRequest(email) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success for demo
        if (email && isValidEmail(email)) {
          resolve({ success: true });
        } else {
          reject(new Error("Email không hợp lệ!"));
        }
      }, 2000);
    });
  }

  // Validate form
  function validateForm(email) {
    clearErrors();

    if (!email) {
      showFieldError(emailInput, "Vui lòng nhập địa chỉ email");
      return false;
    }

    if (!isValidEmail(email)) {
      showFieldError(emailInput, "Địa chỉ email không hợp lệ");
      return false;
    }

    return true;
  }

  // Kiểm tra email hợp lệ
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Hiển thị lỗi cho field
  function showFieldError(input, message) {
    const wrapper = input.closest(".input-wrapper");
    const existing = wrapper.querySelector(".error-message");
    if (existing) {
      existing.remove();
    }

    input.style.borderColor = "#f44336";

    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.style.cssText = `
            color: #f44336;
            font-size: 12px;
            margin-top: 4px;
            margin-left: 4px;
        `;
    errorDiv.textContent = message;

    wrapper.appendChild(errorDiv);
  }

  // Xóa tất cả lỗi
  function clearErrors() {
    const errorMessages = document.querySelectorAll(".error-message");
    errorMessages.forEach((msg) => msg.remove());

    emailInput.style.borderColor = "#E0E0E0";
  }

  // Hiển thị loading
  function showLoading(show) {
    if (show) {
      loginBtn.disabled = true;
      btnText.style.visibility = "hidden";
      btnLoader.style.display = "block";
    } else {
      loginBtn.disabled = false;
      btnText.style.visibility = "visible";
      btnLoader.style.display = "none";
    }
  }

  // Hiển thị thông báo thành công
  function showSuccessMessage() {
    loginForm.style.display = "none";
    successMessage.style.display = "block";

    // Start countdown
    startCountdown();
  }

  // Bắt đầu đếm ngược
  function startCountdown() {
    let seconds = 10;
    const countdownElement = document.getElementById("countdown");

    const interval = setInterval(() => {
      seconds--;
      countdownElement.textContent = seconds;

      if (seconds <= 0) {
        clearInterval(interval);
        window.location.href = "login.html";
      }
    }, 1000);
  }

  // Hiển thị thông báo lỗi
  function showError(message) {
    showNotification(message, "error");
  }

  // Hiển thị thông báo
  function showNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelector(".notification");
    if (existing) {
      existing.remove();
    }

    const notification = document.createElement("div");
    notification.className = "notification";
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            ${
              type === "success"
                ? "background: linear-gradient(135deg, #4CAF50, #45a049);"
                : "background: linear-gradient(135deg, #f44336, #da190b);"
            }
        `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Animate in
    requestAnimationFrame(() => {
      notification.style.opacity = "1";
      notification.style.transform = "translateX(0)";
    });

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = "0";
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  // Xóa lỗi khi user bắt đầu nhập
  emailInput.addEventListener("input", clearErrors);

  // Auto focus vào email khi load trang
  emailInput.focus();
});

// Xử lý enter key
document.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const loginBtn = document.querySelector(".login-btn");
    if (loginBtn && !loginBtn.disabled) {
      loginBtn.click();
    }
  }
});

// Animation cho floating icons
document.addEventListener("DOMContentLoaded", function () {
  const floatingIcons = document.querySelectorAll(".floating-icons i");

  floatingIcons.forEach((icon, index) => {
    // Random animation delay
    const delay = Math.random() * 2;
    icon.style.animationDelay = `-${delay}s`;

    // Random animation duration
    const duration = 2 + Math.random() * 2; // 2-4 seconds
    icon.style.animationDuration = `${duration}s`;
  });
});
