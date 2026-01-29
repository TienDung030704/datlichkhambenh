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
      alert("❌ Vui lòng nhập họ tên!");
      return;
    }

    if (!email) {
      alert("❌ Vui lòng nhập email!");
      return;
    }

    if (!phone) {
      alert("❌ Vui lòng nhập số điện thoại!");
      return;
    }

    if (!password || password.length < 6) {
      alert("❌ Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (password !== confirmPassword) {
      alert("❌ Mật khẩu xác nhận không khớp!");
      return;
    }

    if (!terms) {
      alert("❌ Vui lòng đồng ý với điều khoản dịch vụ!");
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
        alert("✅ " + result.message);
        // Redirect to login page
        setTimeout(() => {
          window.location.href = "login.html";
        }, 1000);
      } else {
        alert("❌ " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("❌ Lỗi kết nối: " + error.message);
    } finally {
      // Re-enable submit button
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
});
