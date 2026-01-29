// Register form functionality

// Toggle password visibility
function togglePassword(fieldId) {
  const passwordInput = document.getElementById(fieldId);
  if (!passwordInput) return;

  const toggleIcon =
    passwordInput.parentElement.querySelector(".password-toggle");
  if (!toggleIcon) return;

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

// Simple form validation
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone) {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s+/g, ""));
}

function validatePassword(password) {
  return password.length >= 6;
}

// Show simple alert instead of complex notification
function showMessage(message, isError = false) {
  if (isError) {
    alert("❌ " + message);
  } else {
    alert("✅ " + message);
  }
}

// Simple form validation
function validateForm() {
  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const password = document.getElementById("password");
  const confirmPassword = document.getElementById("confirmPassword");
  const terms = document.getElementById("terms");

  // Clear previous errors
  document.querySelectorAll(".input-wrapper").forEach((wrapper) => {
    wrapper.classList.remove("error");
  });
  document.querySelectorAll(".field-error").forEach((error) => {
    error.remove();
  });

  let isValid = true;

  // Validate full name
  if (!fullName || !fullName.value.trim()) {
    showFieldError("fullName", "Vui lòng nhập họ và tên");
    isValid = false;
  } else if (fullName.value.trim().length < 2) {
    showFieldError("fullName", "Họ và tên phải có ít nhất 2 ký tự");
    isValid = false;
  }

  // Validate email
  if (!email || !email.value.trim()) {
    showFieldError("email", "Vui lòng nhập email");
    isValid = false;
  } else if (!validateEmail(email.value.trim())) {
    showFieldError("email", "Email không hợp lệ");
    isValid = false;
  }

  // Validate phone
  if (!phone || !phone.value.trim()) {
    showFieldError("phone", "Vui lòng nhập số điện thoại");
    isValid = false;
  } else if (!validatePhone(phone.value.trim())) {
    showFieldError("phone", "Số điện thoại không hợp lệ (10 chữ số)");
    isValid = false;
  }

  // Validate password
  if (!password || !password.value) {
    showFieldError("password", "Vui lòng nhập mật khẩu");
    isValid = false;
  } else if (!validatePassword(password.value)) {
    showFieldError("password", "Mật khẩu phải có ít nhất 6 ký tự");
    isValid = false;
  }

  // Validate confirm password
  if (!confirmPassword || !confirmPassword.value) {
    showFieldError("confirmPassword", "Vui lòng xác nhận mật khẩu");
    isValid = false;
  } else if (password && password.value !== confirmPassword.value) {
    showFieldError("confirmPassword", "Mật khẩu xác nhận không khớp");
    isValid = false;
  }

  // Validate terms
  if (!terms || !terms.checked) {
    showMessage("Vui lòng đồng ý với điều khoản dịch vụ", true);
    isValid = false;
  }

  return isValid;
}

// Show field-specific error
function showFieldError(fieldId, message) {
  const field = document.getElementById(fieldId);
  if (!field) return;

  const inputWrapper = field.closest(".input-wrapper");
  if (!inputWrapper) return;

  // Add error class
  inputWrapper.classList.add("error");

  // Create error element
  const errorElement = document.createElement("div");
  errorElement.className = "field-error";
  errorElement.textContent = message;

  // Insert after input wrapper
  inputWrapper.parentNode.insertBefore(errorElement, inputWrapper.nextSibling);
}

// Initialize register page
document.addEventListener("DOMContentLoaded", function () {
  const registerForm = document.getElementById("registerForm");

  if (!registerForm) {
    return;
  }

  registerForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (validateForm()) {
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        const originalText = submitBtn.textContent;
        submitBtn.textContent = "Đang xử lý...";
        submitBtn.disabled = true;

        // Simulate processing
        setTimeout(() => {
          showMessage("Đăng ký thành công!");

          // Store basic user info
          const fullName = document.getElementById("fullName");
          const email = document.getElementById("email");
          if (fullName && email) {
            localStorage.setItem(
              "registeredUser",
              JSON.stringify({
                name: fullName.value,
                email: email.value,
              }),
            );
          }

          // Redirect to login
          setTimeout(() => {
            window.location.href = "login.html";
          }, 1000);
        }, 2000);
      }
    }
  });
});
