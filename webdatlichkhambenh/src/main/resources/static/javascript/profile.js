// Profile Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
  initProfile();
  initTabs();
  initForms();
  checkAuthentication();
});

// Initialize profile page
function initProfile() {
  loadUserData();
  fetchUserProfile();
}

// Load user data from localStorage/sessionStorage
function loadUserData() {
  try {
    const userData =
      JSON.parse(localStorage.getItem("currentUser")) ||
      JSON.parse(sessionStorage.getItem("currentUser"));

    if (userData) {
      // Update profile display
      document.getElementById("profileName").textContent =
        userData.fullName || userData.email || "Người dùng";
      document.getElementById("profileEmail").textContent =
        userData.email || "";
      document.getElementById("profilePhone").textContent =
        userData.phone || "0901 234 567";

      // Update avatar
      const avatarText = document.getElementById("avatarText");
      if (userData.fullName) {
        const nameParts = userData.fullName.split(" ");
        avatarText.textContent =
          nameParts[0].charAt(0) +
          (nameParts[nameParts.length - 1]?.charAt(0) || "");
      } else if (userData.email) {
        avatarText.textContent = userData.email.charAt(0).toUpperCase();
      }

      // Populate form fields - ALWAYS populate with stored data first
      document.getElementById("fullName").value = userData.fullName || "";
      document.getElementById("email").value =
        userData.email || userData.username || "";
      document.getElementById("phone").value = userData.phone || "";
      document.getElementById("birthDate").value = userData.birthDate || "";
      document.getElementById("gender").value = userData.gender || "";
    } else {
      window.location.href = "/html/login.html";
    }
  } catch (error) {
    window.location.href = "/html/login.html";
  }
}

// Fetch user profile from server
async function fetchUserProfile() {
  try {
    const userData =
      JSON.parse(localStorage.getItem("currentUser")) ||
      JSON.parse(sessionStorage.getItem("currentUser"));

    if (!userData) {
      return;
    }

    // Use email or username for API call
    const identifier = userData.email || userData.username;
    if (!identifier) {
      return;
    }

    const response = await fetch(
      `/api/auth/profile?username=${encodeURIComponent(identifier)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      const result = await response.json();

      if (result.success && result.profile) {
        populateProfile(result.profile);

        // Update stored user data
        const updatedUserData = { ...userData, ...result.profile };
        const storage = localStorage.getItem("currentUser")
          ? localStorage
          : sessionStorage;
        storage.setItem("currentUser", JSON.stringify(updatedUserData));
      }
    }
  } catch (error) {
    // Continue with stored data if fetch fails
  }
}

// Populate form with profile data
function populateProfile(profile) {
  // Update form fields
  document.getElementById("fullName").value = profile.fullName || "";
  document.getElementById("email").value = profile.email || "";
  document.getElementById("phone").value = profile.phone || "";
  document.getElementById("gender").value = profile.gender || "";

  // Handle date format
  if (profile.birthDate) {
    let dateValue = profile.birthDate;
    if (typeof dateValue === "string" && !dateValue.includes("-")) {
      // Convert DD/MM/YYYY to YYYY-MM-DD
      const parts = dateValue.split("/");
      if (parts.length === 3) {
        dateValue = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }
    document.getElementById("birthDate").value = dateValue;
  }

  // Update sidebar info
  document.getElementById("profileName").textContent =
    profile.fullName || profile.email || "Người dùng";
  document.getElementById("profilePhone").textContent =
    profile.phone || "0901 234 567";
  document.getElementById("profileEmail").textContent = profile.email || "";

  // Update avatar
  const avatarText = document.getElementById("avatarText");
  if (profile.fullName) {
    const nameParts = profile.fullName.split(" ");
    avatarText.textContent =
      nameParts[0].charAt(0) +
      (nameParts[nameParts.length - 1]?.charAt(0) || "");
  }
}

// Initialize tabs functionality
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab");

      // Remove active class from all tabs
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked tab
      button.classList.add("active");
      document.getElementById(`${tabId}-tab`).classList.add("active");
    });
  });
}

// Initialize form handlers
function initForms() {
  const profileForm = document.getElementById("profileForm");
  const passwordForm = document.getElementById("passwordForm");

  if (profileForm) {
    profileForm.addEventListener("submit", handleProfileSubmit);
  }

  if (passwordForm) {
    passwordForm.addEventListener("submit", handlePasswordSubmit);
  }
}

// Handle profile form submission
async function handleProfileSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);

  // Validate required fields
  const fullName = formData.get("fullName");
  const phone = formData.get("phone");
  const gender = formData.get("gender");

  if (!fullName || !phone || !gender) {
    showMessage("Vui lòng điền đầy đủ thông tin bắt buộc!", "error");
    return;
  }

  const profileData = {
    fullName: fullName,
    email: formData.get("email"),
    phone: phone,
    birthDate: formData.get("birthDate"),
    gender: gender,
  };

  // Show loading state
  const submitBtn = e.target.querySelector(".save-btn");
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
  submitBtn.disabled = true;

  try {
    const userData =
      JSON.parse(localStorage.getItem("currentUser")) ||
      JSON.parse(sessionStorage.getItem("currentUser"));

    if (!userData || !userData.email) {
      showMessage("Không tìm thấy thông tin đăng nhập!", "error");
      return;
    }

    const response = await fetch("/api/auth/profile", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userData.email,
        ...profileData,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("Cập nhật thông tin thành công!", "success");

      // Update user data in storage
      const updatedUserData = { ...userData, ...profileData };
      const storage = localStorage.getItem("currentUser")
        ? localStorage
        : sessionStorage;
      storage.setItem("currentUser", JSON.stringify(updatedUserData));

      // Update sidebar display
      populateProfile(profileData);
    } else {
      showMessage(
        result.message || "Cập nhật thất bại! Vui lòng thử lại.",
        "error",
      );
    }
  } catch (error) {
    showMessage("Có lỗi xảy ra! Vui lòng thử lại.", "error");
  } finally {
    // Restore button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Handle password form submission
async function handlePasswordSubmit(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  // Validate password
  if (newPassword !== confirmPassword) {
    showMessage("Mật khẩu xác nhận không khớp!", "error");
    return;
  }

  if (newPassword.length < 6) {
    showMessage("Mật khẩu mới phải có ít nhất 6 ký tự!", "error");
    return;
  }

  // Show loading state
  const submitBtn = e.target.querySelector(".save-btn");
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đổi...';
  submitBtn.disabled = true;

  try {
    const userData =
      JSON.parse(localStorage.getItem("currentUser")) ||
      JSON.parse(sessionStorage.getItem("currentUser"));

    if (!userData || !userData.email) {
      showMessage("Không tìm thấy thông tin đăng nhập!", "error");
      return;
    }

    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userData.email,
        currentPassword: currentPassword,
        newPassword: newPassword,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      showMessage("Đổi mật khẩu thành công!", "success");

      // Clear form
      e.target.reset();
    } else {
      showMessage(result.message || "Đổi mật khẩu thất bại!", "error");
    }
  } catch (error) {
    showMessage("Có lỗi xảy ra! Vui lòng thử lại.", "error");
  } finally {
    // Restore button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Show message to user
function showMessage(message, type) {
  // Remove existing messages
  const existingMessages = document.querySelectorAll(
    ".success-message, .error-message, .warning-message",
  );
  existingMessages.forEach((msg) => msg.remove());

  // Create new message
  const messageDiv = document.createElement("div");
  let iconClass;

  switch (type) {
    case "success":
      messageDiv.className = "success-message";
      iconClass = "fa-check-circle";
      break;
    case "warning":
      messageDiv.className = "warning-message";
      iconClass = "fa-exclamation-triangle";
      break;
    default:
      messageDiv.className = "error-message";
      iconClass = "fa-exclamation-circle";
      break;
  }

  messageDiv.innerHTML = `
        <i class="fas ${iconClass}"></i>
        <span>${message}</span>
    `;

  // Insert message
  const contentBody = document.querySelector(".content-body");
  contentBody.insertBefore(messageDiv, contentBody.firstChild);

  // Auto remove after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Check authentication
function checkAuthentication() {
  const userData =
    JSON.parse(localStorage.getItem("currentUser")) ||
    JSON.parse(sessionStorage.getItem("currentUser"));

  if (!userData) {
    window.location.href = "/html/login.html";
    return;
  }
}

// Logout function
function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    sessionStorage.setItem("logoutSuccess", "true");
    window.location.href = "/";
  }
}
