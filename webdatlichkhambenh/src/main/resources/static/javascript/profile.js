// Profile Page JavaScript
document.addEventListener("DOMContentLoaded", function () {
  initProfile();
  initForms();
  initTabs();
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
      // Update profile card display
      document.getElementById("profileName").textContent =
        userData.fullName || userData.email || "Người dùng";
      document.getElementById("profileEmail").textContent =
        userData.email || "";
      document.getElementById("profilePhone").textContent =
        userData.phone || "0901 234 567";
      document.getElementById("profileGender").textContent =
        userData.gender || "Nam";
      document.getElementById("profileBirthDate").textContent =
        userData.birthDate || "03/07/2004";

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
      avatarText.style.display = "flex"; // Show avatar text initially

      // Populate form fields
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
      const parts = dateValue.split("/");
      if (parts.length === 3) {
        dateValue = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
      }
    }
    document.getElementById("birthDate").value = dateValue;
  }

  // Update profile card info
  document.getElementById("profileName").textContent =
    profile.fullName || profile.email || "Người dùng";
  document.getElementById("profilePhone").textContent =
    profile.phone || "0901 234 567";
  document.getElementById("profileEmail").textContent = profile.email || "";
  document.getElementById("profileGender").textContent =
    profile.gender || "Nam";
  document.getElementById("profileBirthDate").textContent =
    profile.birthDate || "03/07/2004";

  // Update avatar
  const avatarText = document.getElementById("avatarText");
  if (profile.fullName) {
    const nameParts = profile.fullName.split(" ");
    avatarText.textContent =
      nameParts[0].charAt(0) +
      (nameParts[nameParts.length - 1]?.charAt(0) || "");
  }
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

// Initialize tab functionality
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding content
      this.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });
}

// Initialize tab functionality
function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const targetTab = this.getAttribute("data-tab");

      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));

      // Add active class to clicked button and corresponding content
      this.classList.add("active");
      document.getElementById(targetTab).classList.add("active");
    });
  });
}

// Handle profile form submission
async function handleProfileSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const profileData = {
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    birthDate: formData.get("birthDate"),
    gender: formData.get("gender"),
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

      // Update profile card display
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

// Handle password change form submission
async function handlePasswordSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  const currentPassword = formData.get("currentPassword");
  const newPassword = formData.get("newPassword");
  const confirmPassword = formData.get("confirmPassword");

  // Validate password match
  if (newPassword !== confirmPassword) {
    showMessage("Mật khẩu mới và xác nhận mật khẩu không khớp!", "error");
    return;
  }

  // Validate password length
  if (newPassword.length < 6) {
    showMessage("Mật khẩu mới phải có ít nhất 6 ký tự!", "error");
    return;
  }

  // Show loading state
  const submitBtn = e.target.querySelector(".password-btn");
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

    // TODO: Implement password change API endpoint
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

    if (response.ok) {
      const result = await response.json();

      if (result.success) {
        showMessage("Đổi mật khẩu thành công!", "success");
        form.reset(); // Clear form
      } else {
        showMessage(result.message || "Đổi mật khẩu thất bại!", "error");
      }
    } else {
      showMessage("Có lỗi xảy ra khi đổi mật khẩu!", "error");
    }
  } catch (error) {
    // For now, show success message since API endpoint doesn't exist yet
    showMessage("Chức năng đổi mật khẩu sẽ được triển khai sớm!", "warning");
    form.reset();
  } finally {
    // Restore button
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

// Show toast notification
function showMessage(message, type = "info") {
  const toastContainer = document.getElementById("toast-container");

  // Create toast element
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;

  // Set icon based on type
  let icon;
  switch (type) {
    case "success":
      icon = "fa-check-circle";
      break;
    case "error":
      icon = "fa-times-circle";
      break;
    case "warning":
      icon = "fa-exclamation-triangle";
      break;
    default:
      icon = "fa-info-circle";
  }

  toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="closeToast(this)">
            <i class="fas fa-times"></i>
        </button>
    `;

  // Add to container
  toastContainer.appendChild(toast);

  // Auto remove after 5 seconds
  setTimeout(() => {
    closeToast(toast.querySelector(".toast-close"));
  }, 5000);
}

// Close toast notification
function closeToast(button) {
  const toast = button.closest(".toast");
  if (toast) {
    toast.classList.add("hiding");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }
}

// Check authentication
function checkAuthentication() {
  const userData =
    localStorage.getItem("currentUser") ||
    sessionStorage.getItem("currentUser");

  if (!userData) {
    window.location.href = "/html/login.html";
    return false;
  }

  return true;
}
