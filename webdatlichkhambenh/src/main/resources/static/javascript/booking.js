/* ================= STATE ================= */
let selectedSpecialtyId = null;
let selectedSpecialty = null;

const specialtyIcons = {
  1: "🩹",   // Da Liễu
  2: "💉",   // Nội Tiết
  3: "🦴",   // Xương Khớp
  4: "🏥",   // Tổng Quát
  5: "🤰",   // Sản - Phụ Khoa
  6: "👂",   // Tai Mũi Họng
  7: "🍽️",  // Tiêu Hóa Gan Mật
  8: "🔬",   // Ung Bướu
  9: "⚠️",   // Viêm Gan
  10: "👶", // Nhi Khoa
};

document.addEventListener("DOMContentLoaded", function () {
  /* ===== NAV ===== */
  document.getElementById("btnBack")?.addEventListener("click", () => {
    const step2Container = document.getElementById("step2Container");
    if (step2Container.style.display !== "none") {
      goBackToProfile();
    } else {
      history.back();
    }
  });

  document.getElementById("btnHome")?.addEventListener("click", () => {
    window.location.href = "/";
  });

  document.getElementById("btnAddProfile")?.addEventListener("click", () => {
    window.location.href = "add-profile.html";
  });

  document.getElementById("btnProfileNext")?.addEventListener("click", () => {
    const selectedProfile = JSON.parse(
      localStorage.getItem("selectedProfile")
    );
    if (selectedProfile) {
      goToSpecialty();
    } else {
      alert("Vui lòng chọn hồ sơ");
    }
  });

  document.getElementById("btnSpecialtyNext")?.addEventListener("click", () => {
    if (selectedSpecialtyId) {
      window.location.href = "/html/booking/select-doctor.html";
    } else {
      alert("Vui lòng chọn chuyên khoa");
    }
  });

  /* ===== LOAD DATA ===== */
  renderProfiles();
});

/* ================= HELPERS ================= */
function maskPhone(phone) {
  if (!phone) return "Chưa có";
  const digits = String(phone).replace(/\D/g, "");
  const len = digits.length;
  if (len <= 4) return digits;

  const startLen = Math.floor((len - 4) / 2);
  const first = digits.slice(0, startLen);
  const last = digits.slice(startLen + 4);
  return first + "****" + last;
}

/* ================= RENDER PROFILE CARDS ================= */
function renderProfiles() {
  const detailCardsContainer = document.getElementById("profileDetailCards");
  const profiles = JSON.parse(localStorage.getItem("profiles")) || [];

  if (!detailCardsContainer) return;

  if (profiles.length === 0) {
    alert("Chưa có hồ sơ nào. Vui lòng thêm hồ sơ.");
    window.location.href = "add-profile.html";
    return;
  }

  detailCardsContainer.innerHTML = "";

  profiles.forEach((profile) => {
    const card = document.createElement("div");
    card.className = "profile-detail-card";

    const phone = profile.phone || "Chưa có";
    const id = profile.cccd || profile.id || "N/A";
    const maskedPhone = maskPhone(phone);
    const age = profile.birthDate ? calculateAge(profile.birthDate) : "N/A";

    card.innerHTML = `
      <div class="profile-detail-icon">
        <i class="fas fa-user"></i>
      </div>
      <div class="profile-detail-info">
        <div class="profile-detail-name">${profile.fullName || "Chưa có tên"}</div>
        <div class="profile-detail-meta">
          <div class="profile-detail-id">
            <i class="fas fa-id-card"></i>
            <span>${id}</span>
          </div>
          <div class="profile-detail-phone">
            <i class="fas fa-phone"></i>
            <span>${maskedPhone}</span>
          </div>
        </div>
      </div>
      <div class="profile-detail-arrow">
        <i class="fas fa-chevron-right"></i>
      </div>
    `;

    card.addEventListener("click", () => {
      selectProfile(card, profile);
    });

    detailCardsContainer.appendChild(card);
  });
}

function selectProfile(cardElement, profile) {
  document.querySelectorAll(".profile-detail-card").forEach(el => el.classList.remove("active"));
  cardElement.classList.add("active");
  localStorage.setItem("selectedProfile", JSON.stringify(profile));
}

function calculateAge(birthDate) {
  if (!birthDate) return "N/A";
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
}

/* ================= STEP NAVIGATION ================= */
function goToSpecialty() {
  const step1Container = document.getElementById("step1Container");
  const step2Container = document.getElementById("step2Container");
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const headerTitle = document.getElementById("headerTitle");

  // Hide step 1, show step 2
  step1Container.style.display = "none";
  step2Container.style.display = "block";

  // Update stepper
  step1.classList.remove("active");
  step2.classList.add("active");

  // Update header
  headerTitle.textContent = "Chọn chuyên khoa";

  // Load specialties
  loadProfileInfoForSpecialty();
  loadSpecialties();

  // Scroll to top
  window.scrollTo(0, 0);
}

function goBackToProfile() {
  const step1Container = document.getElementById("step1Container");
  const step2Container = document.getElementById("step2Container");
  const step1 = document.getElementById("step1");
  const step2 = document.getElementById("step2");
  const headerTitle = document.getElementById("headerTitle");

  // Show step 1, hide step 2
  step1Container.style.display = "block";
  step2Container.style.display = "none";

  // Update stepper
  step1.classList.add("active");
  step2.classList.remove("active");

  // Update header
  headerTitle.textContent = "Chọn hồ sơ";

  // Reset specialty selection
  selectedSpecialtyId = null;
  selectedSpecialty = null;
  document.getElementById("selectedInfo").style.display = "none";

  // Scroll to top
  window.scrollTo(0, 0);
}

/* ================= SPECIALTY SELECTION ================= */
function loadProfileInfoForSpecialty() {
  const selectedProfile = localStorage.getItem("selectedProfile");

  if (selectedProfile) {
    try {
      const profile = JSON.parse(selectedProfile);
      const profileNameElement = document.getElementById("profileNameDisplay");
      if (profileNameElement) {
        profileNameElement.textContent = profile.fullName || "---";
      }
    } catch (e) {
      console.error("Error loading profile info:", e);
    }
  }
}

function loadSpecialties() {
  const specialtyListElement = document.getElementById("specialtyList");

  if (!specialtyListElement) {
    console.error("Specialty list element not found");
    return;
  }

  fetch("/api/specialties")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      if (data.success && data.data) {
        displaySpecialties(data.data);
      } else {
        specialtyListElement.innerHTML =
          '<div class="error-message">Không thể tải danh sách chuyên khoa</div>';
      }
    })
    .catch((error) => {
      console.error("Error loading specialties:", error);
      specialtyListElement.innerHTML =
        '<div class="error-message">Lỗi khi tải danh sách chuyên khoa</div>';
    });
}

function displaySpecialties(specialties) {
  const specialtyListElement = document.getElementById("specialtyList");

  if (specialties.length === 0) {
    specialtyListElement.innerHTML =
      '<div class="empty-message">Không có chuyên khoa nào</div>';
    return;
  }

  let html = "";
  specialties.forEach((specialty) => {
    const doctorCount = specialty.doctorCount || specialty.totalDoctors || 10;
    const icon = specialtyIcons[specialty.id] || "🏥";

    html += `
      <div class="specialty-item" data-specialty-id="${specialty.id}" onclick="selectSpecialty(${specialty.id}, '${specialty.name}', ${doctorCount})" style="cursor: pointer;">
        <div class="specialty-icon" onclick="event.stopPropagation(); viewSpecialtyDetail(${specialty.id})" style="cursor: pointer;" title="Xem chi tiết">
          <i class="fas fa-circle-info"></i>
        </div>
        <div class="specialty-info">
          <div class="specialty-name">${specialty.name}</div>
        </div>
        <span class="specialty-arrow">→</span>
      </div>
    `;
  });

  specialtyListElement.innerHTML = html;
}

function viewSpecialtyDetail(specialtyId) {
  window.location.href = `specialty-detail.html?id=${specialtyId}`;
}

function selectSpecialty(specialtyId, specialtyName, doctorCount) {
  selectedSpecialtyId = specialtyId;
  selectedSpecialty = {
    id: specialtyId,
    name: specialtyName,
    doctorCount: doctorCount,
  };

  // Update UI
  const specialtyItems = document.querySelectorAll(".specialty-item");
  specialtyItems.forEach((item) => {
    item.classList.remove("selected");
  });

  const selectedItem = document.querySelector(
    `.specialty-item[data-specialty-id="${specialtyId}"]`
  );
  if (selectedItem) {
    selectedItem.classList.add("selected");
  }

  // Show selected info
  const selectedInfoElement = document.getElementById("selectedInfo");
  if (selectedInfoElement) {
    document.getElementById("selectedSpecialtyName").textContent =
      specialtyName;
    selectedInfoElement.style.display = "block";
    // Scroll to selected info
    setTimeout(() => {
      selectedInfoElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 100);
  }

  // Save to localStorage
  localStorage.setItem(
    "selectedSpecialty",
    JSON.stringify({
      id: specialtyId,
      name: specialtyName,
      doctorCount: doctorCount,
    })
  );

  console.log("Selected specialty:", selectedSpecialty);
}
