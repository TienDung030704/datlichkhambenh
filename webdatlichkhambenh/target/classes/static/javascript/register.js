// Simple Register Form Handler
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");

  if (!form) {
    console.error("Form not found!");
    return;
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Get form data
    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const terms = document.getElementById("terms").checked;

    // Simple validation
    if (!fullName) {
      showError("Vui lòng nhập họ tên!");
      return;
    }

    if (!email) {
      showError("Vui lòng nhập email!");
      return;
    }

    if (!phone) {
      showError("Vui lòng nhập số điện thoại!");
      return;
    }

    if (!password || password.length < 6) {
      showError("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (password !== confirmPassword) {
      showError("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!terms) {
      showError("Vui lòng đồng ý với điều khoản dịch vụ!");
      return;
    }

    // Disable submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Đang xử lý...";
    submitBtn.disabled = true;

    // Prepare data for API
    const registerData = {
      username: fullName, // Use fullName as username
      password: password,
      email: email,
      fullName: fullName,
      phoneNumber: phone,
    };

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (result.success) {
        // Hiển thị thông báo thành công
        showSuccess(result.message);

        // Không lưu token tự động - để user tự đăng nhập lại để kiểm tra
        // Always redirect to login page after successful registration
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1500);
      } else {
        showError(result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Lỗi kết nối: " + error.message);
    } finally {
      // Re-enable submit button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });

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
});

// Toggle hiển thị password
function togglePassword(fieldId) {
  const passwordInput = document.getElementById(fieldId);
  const toggleIcon =
    passwordInput.parentElement.querySelector(".password-toggle");

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
