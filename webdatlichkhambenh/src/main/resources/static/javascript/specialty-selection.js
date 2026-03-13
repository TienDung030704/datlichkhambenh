// ===========================
// SPECIALTY SELECTION LOGIC
// ===========================

let selectedSpecialtyId = null;
let selectedSpecialty = null;
let _specialtiesData = [];

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  loadProfileInfo();
  loadSpecialties();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  const btnBack = document.getElementById("btnBack");
  const btnHome = document.getElementById("btnHome");

  if (btnBack) {
    btnBack.addEventListener("click", goBack);
  }

  if (btnHome) {
    btnHome.addEventListener("click", goHome);
  }
}

// Load profile info from localStorage
function loadProfileInfo() {
  // Profile info loading removed as selected profile section is hidden
}

// Load specialties from API
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

// Display specialties
function displaySpecialties(specialties) {
  _specialtiesData = specialties;
  const specialtyListElement = document.getElementById("specialtyList");

  if (specialties.length === 0) {
    specialtyListElement.innerHTML =
      '<div class="empty-message">Không có chuyên khoa nào</div>';
    return;
  }

  let html =
    '<div class="specialty-tip"><i class="fas fa-info-circle"></i> Nhấn vào biểu tượng để xem chức năng chuyên khoa</div>';
  specialties.forEach((specialty, index) => {
    const doctorCount = specialty.doctorCount || specialty.totalDoctors || 10;
    const price = specialty.price
      ? specialty.price.toLocaleString("vi-VN") + "đ"
      : "150.000đ";
    const descHtml = specialty.description
      ? `<div class="specialty-description">${specialty.description}</div>`
      : "";

    html += `
            <div class="specialty-item" data-specialty-id="${specialty.id}" onclick="selectSpecialty(${specialty.id}, '${specialty.name}', ${doctorCount})">
                <div class="specialty-info-btn" title="Thông tin chuyên khoa"
                    onclick="event.stopPropagation(); showSpecialtyInfo(${specialty.id})"
                >
                    <strong>i</strong>
                </div>
                <div class="specialty-info">
                    <div class="specialty-name">${specialty.name}</div>
                    ${descHtml}
                </div>
                <span class="specialty-price">${price}</span>
                <span class="specialty-arrow"><i class="fas fa-chevron-right"></i></span>
            </div>
        `;
  });

  specialtyListElement.innerHTML = html;
}

// Show specialty info
function showSpecialtyInfo(specialtyId) {
  const specialty = _specialtiesData.find((s) => s.id === specialtyId);
  if (!specialty) return;
  const doctorCount = specialty.doctorCount || specialty.totalDoctors || 10;

  document.getElementById("infoSpecialtyName").textContent =
    specialty.name.toUpperCase();
  document.getElementById("infoSpecialtyDesc").textContent =
    specialty.description || "Chưa có mô tả.";
  document.getElementById("infoSelectBtn").onclick = function () {
    closeSpecialtyInfo();
    selectSpecialty(specialty.id, specialty.name, doctorCount);
  };
  const overlay = document.getElementById("specialtyInfoOverlay");
  overlay.style.display = "flex";
  requestAnimationFrame(() => overlay.classList.add("visible"));
}

function closeSpecialtyInfo() {
  const overlay = document.getElementById("specialtyInfoOverlay");
  overlay.classList.remove("visible");
  setTimeout(() => {
    overlay.style.display = "none";
  }, 300);
}

// Select specialty
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
    `.specialty-item[data-specialty-id="${specialtyId}"]`,
  );
  if (selectedItem) {
    selectedItem.classList.add("selected");
  }

  // Show selected info
  const selectedInfoElement = document.getElementById("selectedInfo");
  if (selectedInfoElement) {
    document.getElementById("selectedSpecialtyName").textContent =
      specialtyName;
    document.getElementById("selectedDoctorCount").textContent = doctorCount;
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
    }),
  );

  const returnTo = localStorage.getItem("returnTo");
  if (returnTo === "chon-thong-tin-kham") {
    setTimeout(() => {
      window.location.href = "/html/booking/chon-thong-tin-kham.html";
    }, 120);
    return;
  }

  console.log("Selected specialty:", selectedSpecialty);
}

// Proceed to next step
function proceedToNextStep() {
  if (!selectedSpecialtyId) {
    alert("Vui lòng chọn chuyên khoa");
    return;
  }
  const returnTo = localStorage.getItem("returnTo");
  if (returnTo === "chon-thong-tin-kham") {
    window.location.href = "/html/booking/chon-thong-tin-kham.html";
  } else {
    window.location.href = "/html/booking/select-doctor.html";
  }
}

// Go back
function goBack() {
  const returnTo = localStorage.getItem("returnTo");
  if (returnTo === "chon-thong-tin-kham") {
    window.location.href = "/html/booking/chon-thong-tin-kham.html";
  } else {
    window.location.href = "/html/booking/patient-profile.html";
  }
}

// Go home
function goHome() {
  window.location.href = "/index.html";
}

// Error handling
window.addEventListener("error", function (event) {
  console.error("Global error:", event.error);
});
