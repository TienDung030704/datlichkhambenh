// Xử lý form đăng nhập
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const rememberCheckbox = document.getElementById("remember");

  if (!loginForm || !emailInput || !passwordInput) {
    console.error("Required form elements not found");
    return;
  }

  const loginBtn = loginForm.querySelector(".login-btn");
  const btnLoader = loginBtn ? loginBtn.querySelector(".btn-loader") : null;
  const btnText = loginBtn ? loginBtn.querySelector("span") : null;

  if (!loginBtn) {
    console.error("Login button not found");
    return;
  }

  // Xử lý submit form
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const remember = rememberCheckbox.checked;

    // Validate form
    if (!validateForm(email, password)) {
      return;
    }

    // Hiển thị loading
    showLoading(true);

    try {
      const loginData = {
        username: email, // Có thể là username hoặc email
        password: password,
      };

      // Gọi API đăng nhập backend
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Đăng nhập thành công
        showSuccess(result.message || "Đăng nhập thành công!");

        // Lưu token và user info
        const userData = {
          username: result.username,
          token: result.token,
        };

        if (remember) {
          localStorage.setItem("authToken", result.token);
          localStorage.setItem("currentUser", JSON.stringify(userData));
        } else {
          sessionStorage.setItem("authToken", result.token);
          sessionStorage.setItem("currentUser", JSON.stringify(userData));
        }

        // Chuyển hướng sau 1.5 giây để user thấy thông báo thành công
        setTimeout(() => {
          // Redirect về trang dashboard hoặc trang chủ dành cho user đã login
          window.location.href = "../index.html";
        }, 1500);
      } else {
        // Đăng nhập thất bại
        showError(result.message || "Đăng nhập thất bại!");
      }
    } catch (error) {
      console.error("Login error:", error);
      showError("Lỗi kết nối! Vui lòng thử lại.");
    } finally {
      // Ẩn loading
      showLoading(false);
    }
  });

  // Validate form
  function validateForm(email, password) {
    clearErrors();

    let isValid = true;

    // Validate email
    if (!email) {
      showFieldError(emailInput, "Vui lòng nhập email");
      isValid = false;
    } else if (!isValidEmail(email)) {
      showFieldError(emailInput, "Email không hợp lệ");
      isValid = false;
    }

    // Validate password
    if (!password) {
      showFieldError(passwordInput, "Vui lòng nhập mật khẩu");
      isValid = false;
    } else if (password.length < 6) {
      showFieldError(passwordInput, "Mật khẩu phải có ít nhất 6 ký tự");
      isValid = false;
    }

    return isValid;
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

    const inputs = [emailInput, passwordInput];
    inputs.forEach((input) => {
      input.style.borderColor = "#E0E0E0";
    });
  }

  // Hiển thị loading
  function showLoading(show) {
    if (!loginBtn) return;

    if (show) {
      loginBtn.disabled = true;
      if (btnText) btnText.style.visibility = "hidden";
      if (btnLoader) btnLoader.style.display = "block";
    } else {
      loginBtn.disabled = false;
      if (btnText) btnText.style.visibility = "visible";
      if (btnLoader) btnLoader.style.display = "none";
    }
  }

  // Hiển thị thông báo thành công
  function showSuccess(message) {
    showNotification(message, "success");
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
  passwordInput.addEventListener("input", clearErrors);

  // Auto focus vào email khi load trang
  emailInput.focus();
});

// Toggle hiển thị password
function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.querySelector(".password-toggle");

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  }
}

// Xử lý quên mật khẩu
document.addEventListener("DOMContentLoaded", function () {
  const forgotPasswordLink = document.querySelector(".forgot-password");

  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function (e) {
      // Lấy email nếu user đã nhập
      const email = document.getElementById("email").value;
      if (email && isValidEmail(email)) {
        // Nếu đã nhập email, thêm vào URL
        e.preventDefault();
        window.location.href = `forgot-password.html?email=${encodeURIComponent(email)}`;
      }
      // Nếu chưa có email, để link hoạt động bình thường (không preventDefault)
    });
  }

  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
});

// Toggle password visibility
function togglePassword() {
  const passwordInput = document.getElementById("password");
  const toggleIcon = document.querySelector(".password-toggle");

  if (!passwordInput || !toggleIcon) return;

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    toggleIcon.classList.remove("fa-eye-slash");
    toggleIcon.classList.add("fa-eye");
  } else {
    passwordInput.type = "password";
    toggleIcon.classList.remove("fa-eye");
    toggleIcon.classList.add("fa-eye-slash");
  }
}

// Kiểm tra trạng thái đăng nhập khi load trang
document.addEventListener("DOMContentLoaded", function () {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  if (token) {
    // Nếu đã đăng nhập, chuyển hướng về trang chủ
    window.location.href = "../index.html";
  }
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

// Prevent form submission on Enter in input fields (handled by keydown listener instead)
document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll("input");
  inputs.forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
      }
    });
  });
});
