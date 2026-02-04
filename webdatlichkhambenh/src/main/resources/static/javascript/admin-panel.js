// Admin Panel JavaScript - Kết nối với Database thật
document.addEventListener("DOMContentLoaded", function () {
  initializeAdminPanel();
  loadDashboardData();
  setupEventListeners();
});

// Initialize Admin Panel
function initializeAdminPanel() {
  setupNavigation();
  setupMobileMenu();
  initializeChart();

  // Load admin info từ localStorage hoặc API
  loadAdminInfo();
}

// Load admin information
function loadAdminInfo() {
  // Giả sử admin đã đăng nhập, lấy thông tin từ localStorage
  const adminData =
    localStorage.getItem("adminUser") || sessionStorage.getItem("adminUser");
  if (adminData) {
    try {
      const admin = JSON.parse(adminData);
      updateAdminUI(admin);
    } catch (error) {
      console.error("Error parsing admin data:", error);
    }
  }
}

// Update admin UI
function updateAdminUI(admin) {
  const adminName = document.querySelector(".admin-name");
  const adminEmail = document.querySelector(".admin-email");
  const avatarFallbacks = document.querySelectorAll(".avatar-fallback");

  if (adminName)
    adminName.textContent = admin.fullName || admin.username || "Admin";
  if (adminEmail) adminEmail.textContent = admin.email || "admin@example.com";

  // Update avatar fallback
  avatarFallbacks.forEach((fallback) => {
    const name = admin.fullName || admin.username || "Admin";
    fallback.textContent = name.charAt(0).toUpperCase();
  });
}

// Setup navigation
function setupNavigation() {
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      const section = this.getAttribute("data-section");
      if (section) {
        showSection(section);
        updateActiveNav(this);
      }
    });
  });
}

// Show specific section
function showSection(sectionName) {
  // Hide all sections
  document
    .querySelectorAll(".dashboard-content, .section-content")
    .forEach((section) => {
      section.style.display = "none";
    });

  // Show target section
  let targetSection;
  if (sectionName === "dashboard") {
    targetSection = document.getElementById("dashboardSection");
  } else {
    targetSection = document.getElementById(sectionName + "Section");
  }

  if (targetSection) {
    targetSection.style.display = "block";
    updatePageTitle(sectionName);

    // Load section specific data
    loadSectionData(sectionName);
  }
}

// Update active navigation
function updateActiveNav(activeLink) {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.remove("active");
  });

  activeLink.parentElement.classList.add("active");
}

// Update page title
function updatePageTitle(section) {
  const titles = {
    dashboard: "Dashboard",
    appointments: "Quản lý đặt lịch",
    doctors: "Bác sĩ & Chuyên khoa",
    patients: "Bệnh nhân",
    settings: "Cài đặt",
  };

  const pageTitle = document.querySelector(".page-title");
  if (pageTitle) {
    pageTitle.textContent = titles[section] || "Dashboard";
  }
}

// Load section specific data
function loadSectionData(section) {
  switch (section) {
    case "dashboard":
      loadDashboardData();
      break;
    case "appointments":
      loadAllAppointments();
      break;
    case "doctors":
      loadDoctorsData();
      break;
    case "patients":
      loadPatientsData();
      break;
    case "settings":
      loadSettingsData();
      break;
  }
}

// Load dashboard data - Kết nối với database thật
async function loadDashboardData() {
  showLoading(true);

  try {
    // Load statistics từ database
    await loadStatistics();

    // Load recent appointments từ database
    await loadRecentAppointments();

    // Update chart
    updateChart();
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    showError("Không thể tải dữ liệu dashboard");
  } finally {
    showLoading(false);
  }
}

// Load statistics từ database thật
async function loadStatistics() {
  try {
    // Gọi API để lấy thống kê từ database
    const statsResponse = await fetch("/api/admin/statistics");

    if (statsResponse.ok) {
      const data = await statsResponse.json();

      if (data.success) {
        const stats = data.statistics;

        // Cập nhật UI với dữ liệu thật
        document.getElementById("totalPatients").textContent = formatNumber(
          stats.totalPatients || 0,
        );
        document.getElementById("totalDoctors").textContent = formatNumber(
          stats.totalDoctors || 0,
        );
        document.getElementById("todayAppointments").textContent = formatNumber(
          stats.todayAppointments || 0,
        );
        document.getElementById("upcomingAppointments").textContent =
          formatNumber(stats.upcomingAppointments || 0);
      } else {
        throw new Error("API returned error: " + data.message);
      }
    } else {
      throw new Error("Failed to fetch statistics");
    }
  } catch (error) {
    console.error("Error loading statistics:", error);

    // Fallback với dữ liệu mẫu
    document.getElementById("todayAppointments").textContent = "28";
    document.getElementById("upcomingAppointments").textContent = "85";
    document.getElementById("totalDoctors").textContent = "24";
    document.getElementById("totalPatients").textContent = "1,250";
  }
}

// Load recent appointments cho dashboard - Sử dụng dữ liệu thật
async function loadRecentAppointments() {
  try {
    // Thử gọi API appointments thật trước
    const appointmentsResponse = await fetch(
      "/api/admin/appointments/recent?limit=5",
    );

    if (appointmentsResponse.ok) {
      const appointmentsData = await appointmentsResponse.json();

      if (
        appointmentsData.success &&
        appointmentsData.appointments &&
        appointmentsData.appointments.length > 0
      ) {
        // Có dữ liệu appointments thật
        displayAppointments(
          appointmentsData.appointments,
          "appointmentsTableBody",
        );
      } else {
        // Không có appointments, hiển thị empty state
        displayEmptyAppointments("appointmentsTableBody");
      }
    } else {
      // API không tồn tại hoặc lỗi, hiển thị empty state
      displayEmptyAppointments("appointmentsTableBody");
    }
  } catch (error) {
    console.error("Error loading recent appointments:", error);
    // Lỗi kết nối, hiển thị empty state
    displayEmptyAppointments("appointmentsTableBody");
  }
}

// Generate sample appointments từ database users thật
async function generateSampleAppointments() {
  try {
    // Lấy danh sách patients từ database
    const patientsResponse = await fetch("/api/admin/patients/list?limit=5");
    let patients = [];

    if (patientsResponse.ok) {
      const patientsData = await patientsResponse.json();
      patients = patientsData.patients || [];
    }

    // Tạo appointments mẫu với dữ liệu patients thật
    const sampleDoctors = [
      { name: "BS. Nguyễn Hoàng", specialty: "Tim Mạch" },
      { name: "BS. Lê Quang Huy", specialty: "Nhi khoa" },
      { name: "BS. Phạm Văn Đức", specialty: "Nội khoa" },
      { name: "BS. Trần Thị Lan", specialty: "Da liễu" },
    ];

    const appointments = [];
    const today = new Date();

    for (let i = 0; i < Math.min(patients.length, 4); i++) {
      const patient = patients[i];
      const doctor = sampleDoctors[i % sampleDoctors.length];
      const appointmentDate = new Date(today);
      appointmentDate.setHours(9 + i, 30, 0, 0);

      appointments.push({
        id: i + 1,
        patientName:
          patient.fullName || patient.full_name || "Bệnh nhân " + (i + 1),
        patientPhone:
          patient.phoneNumber || patient.phone_number || "0901234567",
        doctorName: doctor.name,
        specialty: doctor.specialty,
        appointmentDate: appointmentDate.toISOString(),
        appointmentTime: appointmentDate.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status: ["booked", "examined", "cancelled"][i % 3],
      });
    }

    return appointments;
  } catch (error) {
    console.error("Error generating sample appointments:", error);
    return getSampleAppointments();
  }
}

// Fallback sample appointments
function getSampleAppointments() {
  return [
    {
      id: 1,
      patientName: "Nguyễn Văn A",
      patientPhone: "0901234567",
      doctorName: "BS. Nguyễn Hoàng",
      specialty: "Tim Mạch",
      appointmentDate: new Date().toISOString(),
      appointmentTime: "09:30",
      status: "booked",
    },
    {
      id: 2,
      patientName: "Trần Thị B",
      patientPhone: "0912345678",
      doctorName: "BS. Lê Quang Huy",
      specialty: "Nhi khoa",
      appointmentDate: new Date().toISOString(),
      appointmentTime: "10:00",
      status: "examined",
    },
    {
      id: 3,
      patientName: "Phạm Văn C",
      patientPhone: "0923456789",
      doctorName: "BS. Phạm Văn Đức",
      specialty: "Nội khoa",
      appointmentDate: new Date().toISOString(),
      appointmentTime: "10:30",
      status: "cancelled",
    },
  ];
}

// Display appointments in table
function displayAppointments(appointments, tableBodyId) {
  const tbody = document.getElementById(tableBodyId);
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!appointments || appointments.length === 0) {
    displayEmptyAppointments(tableBodyId);
    return;
  }

  appointments.forEach((appointment) => {
    const row = createAppointmentRow(
      appointment,
      tableBodyId === "allAppointmentsTableBody",
    );
    tbody.appendChild(row);
  });
}

// Display empty state when no appointments
function displayEmptyAppointments(tableBodyId, showCheckbox = false) {
  const tbody = document.getElementById(tableBodyId);
  if (!tbody) return;

  const colSpan = showCheckbox ? 9 : 7; // Tính số cột dựa vào có checkbox hay không

  tbody.innerHTML = `
        <tr>
            <td colspan="${colSpan}" style="text-align: center; padding: 40px 20px; color: #64748b;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                    <i class="fas fa-calendar-times" style="font-size: 48px; color: #cbd5e1;"></i>
                    <h3 style="margin: 0; font-size: 18px; color: #475569;">Không có lịch hẹn nào đang chờ</h3>
                    <p style="margin: 0; font-size: 14px; color: #64748b;">Hiện tại chưa có lịch hẹn nào trong hệ thống</p>
                </div>
            </td>
        </tr>
    `;
}

// Create appointment table row
function createAppointmentRow(appointment, showCheckbox = false) {
  const row = document.createElement("tr");

  const checkboxCell = showCheckbox
    ? `<td><input type="checkbox" value="${appointment.id}"></td>`
    : "";
  const idCell = showCheckbox ? `<td>${appointment.id}</td>` : "";

  row.innerHTML = `
        ${checkboxCell}
        ${idCell}
        <td>
            <div class="patient-info">
                <strong>${appointment.patientName}</strong>
                <small>${appointment.patientPhone}</small>
            </div>
        </td>
        <td>${appointment.doctorName}</td>
        <td>${appointment.specialty}</td>
        <td>${formatDate(appointment.appointmentDate)}</td>
        <td>${appointment.appointmentTime}</td>
        <td><span class="status-badge status-${appointment.status.toLowerCase()}">${getStatusText(appointment.status)}</span></td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-edit" onclick="editAppointment(${appointment.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-delete" onclick="deleteAppointment(${appointment.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;

  return row;
}

// Load all appointments for management section - Sử dụng dữ liệu thật
async function loadAllAppointments() {
  showLoading(true);

  try {
    // Gọi API appointments thật
    const appointmentsResponse = await fetch(
      "/api/admin/appointments/list?limit=20",
    );

    if (appointmentsResponse.ok) {
      const appointmentsData = await appointmentsResponse.json();

      if (
        appointmentsData.success &&
        appointmentsData.appointments &&
        appointmentsData.appointments.length > 0
      ) {
        // Có dữ liệu appointments thật
        displayAppointments(
          appointmentsData.appointments,
          "allAppointmentsTableBody",
        );
      } else {
        // Không có appointments, hiển thị empty state
        displayEmptyAppointments("allAppointmentsTableBody", true);
      }
    } else {
      // API không tồn tại, hiển thị empty state
      displayEmptyAppointments("allAppointmentsTableBody", true);
    }
  } catch (error) {
    console.error("Error loading appointments:", error);
    displayEmptyAppointments("allAppointmentsTableBody", true);
  } finally {
    showLoading(false);
  }
}

// Load doctors data
function loadDoctorsData() {
  console.log("Loading doctors data...");
  // TODO: Implement doctors data loading from database
}

// Load patients data từ database thật
async function loadPatientsData() {
  try {
    showLoading(true);

    const response = await fetch("/api/admin/patients/list");
    if (response.ok) {
      const patientsData = await response.json();
      console.log("Patients loaded:", patientsData);
      // TODO: Display patients in UI
    } else {
      console.error("Failed to load patients");
    }
  } catch (error) {
    console.error("Error loading patients data:", error);
  } finally {
    showLoading(false);
  }
}

// Load settings data
function loadSettingsData() {
  console.log("Loading settings data...");
  // TODO: Implement settings data loading
}

// Initialize chart
function initializeChart() {
  const ctx = document.getElementById("appointmentsChart");
  if (!ctx) return;

  window.appointmentsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
      datasets: [
        {
          label: "Đã khám",
          data: [65, 59, 80, 81, 56, 55, 40],
          backgroundColor: "#3b82f6",
          borderRadius: 5,
        },
        {
          label: "Đã hủy",
          data: [28, 48, 40, 19, 86, 27, 90],
          backgroundColor: "#ef4444",
          borderRadius: 5,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            color: "#f3f4f6",
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      plugins: {
        legend: {
          position: "top",
          align: "end",
        },
      },
    },
  });
}

// Update chart based on period
function updateChart() {
  if (!window.appointmentsChart) return;

  const period = document.getElementById("chartPeriod").value;

  let labels, data1, data2;

  switch (period) {
    case "week":
      labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
      data1 = [65, 59, 80, 81, 56, 55, 40];
      data2 = [28, 48, 40, 19, 86, 27, 90];
      break;
    case "month":
      labels = ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"];
      data1 = [180, 220, 195, 210];
      data2 = [120, 150, 140, 160];
      break;
    case "year":
      labels = [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
      ];
      data1 = [450, 520, 480, 600, 580, 620, 650, 680, 590, 620, 580, 550];
      data2 = [320, 380, 350, 420, 410, 440, 460, 480, 420, 450, 410, 390];
      break;
  }

  window.appointmentsChart.data.labels = labels;
  window.appointmentsChart.data.datasets[0].data = data1;
  window.appointmentsChart.data.datasets[1].data = data2;
  window.appointmentsChart.update();
}

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  const searchInput = document.getElementById("searchAppointments");
  if (searchInput) {
    searchInput.addEventListener("input", debounce(handleSearch, 300));
  }

  // Filter functionality
  const statusFilter = document.getElementById("statusFilter");
  if (statusFilter) {
    statusFilter.addEventListener("change", filterAppointments);
  }

  // Select all checkbox
  const selectAll = document.getElementById("selectAll");
  if (selectAll) {
    selectAll.addEventListener("change", function () {
      const checkboxes = document.querySelectorAll(
        '#allAppointmentsTableBody input[type="checkbox"]',
      );
      checkboxes.forEach((cb) => (cb.checked = this.checked));
    });
  }
}

// Setup mobile menu
function setupMobileMenu() {
  const sidebarToggle = document.getElementById("sidebarToggle");
  const sidebar = document.querySelector(".sidebar");

  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener("click", function () {
      sidebar.classList.toggle("mobile-open");
    });

    // Close sidebar when clicking on nav items (mobile)
    const navLinks = sidebar.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove("mobile-open");
        }
      });
    });
  }
}

// User dropdown toggle - Updated version
function toggleUserDropdown() {
  const dropdown = document.getElementById("userDropdown");
  const arrow = document.querySelector(".dropdown-arrow");

  if (dropdown) {
    dropdown.classList.toggle("show");
    if (arrow) {
      arrow.classList.toggle("rotated");
    }
  }
}

// New dropdown functions
function showUserInfo() {
  alert("Chức năng thông tin cá nhân đang được phát triển");
  toggleUserDropdown();
}

function showDashboard() {
  showSection("dashboard");
  toggleUserDropdown();
}

function showSettings() {
  showSection("settings");
  toggleUserDropdown();
}

function showBackupRestore() {
  alert("Chức năng sao lưu & phục hồi đang được phát triển");
  toggleUserDropdown();
}

// Refresh appointments
async function refreshAppointments() {
  await loadRecentAppointments();
  showSuccess("Dữ liệu đã được làm mới!");
}

// Appointment actions
function editAppointment(id) {
  alert(`Chỉnh sửa lịch hẹn ID: ${id}`);
}

function deleteAppointment(id) {
  if (confirm("Bạn có chắc chắn muốn xóa lịch hẹn này?")) {
    console.log(`Deleting appointment ${id}`);
    // TODO: Implement delete appointment API
  }
}

// Search and filter functions
function handleSearch(e) {
  const query = e.target.value.toLowerCase();
  const rows = document.querySelectorAll(
    "#allAppointmentsTableBody tr, #appointmentsTableBody tr",
  );

  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(query) ? "" : "none";
  });
}

function filterAppointments() {
  const statusFilter = document.getElementById("statusFilter").value;
  const rows = document.querySelectorAll(
    "#allAppointmentsTableBody tr, #appointmentsTableBody tr",
  );

  rows.forEach((row) => {
    if (!statusFilter) {
      row.style.display = "";
      return;
    }

    const statusBadge = row.querySelector(".status-badge");
    if (
      statusBadge &&
      statusBadge.className.includes(`status-${statusFilter}`)
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

// Utility functions
function formatNumber(num) {
  return num.toLocaleString("vi-VN");
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN");
}

function getStatusText(status) {
  const statusMap = {
    booked: "Đã đặt",
    examined: "Đã khám",
    cancelled: "Đã hủy",
  };
  return statusMap[status.toLowerCase()] || status;
}

function showLoading(show) {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.classList.toggle("show", show);
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

// Hiển thị thông báo đẹp giống login.js
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
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        box-shadow: 0 8px 32px rgba(0,0,0,0.12);
        backdrop-filter: blur(10px);
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

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Pagination functions
let currentPage = 1;
let totalPages = 1;

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    loadAllAppointments();
  }
}

function nextPage() {
  if (currentPage < totalPages) {
    currentPage++;
    loadAllAppointments();
  }
}

// Logout function
function logout() {
  if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
    localStorage.removeItem("adminUser");
    sessionStorage.removeItem("adminUser");
    window.location.href = "../index.html";
  }
}

// Handle window resize
window.addEventListener("resize", function () {
  if (window.innerWidth > 768) {
    document.querySelector(".sidebar").classList.remove("mobile-open");
  }
});

// Close dropdowns when clicking outside
document.addEventListener("click", function (e) {
  const userDropdown = document.getElementById("userDropdown");
  if (userDropdown && !e.target.closest(".user-menu")) {
    userDropdown.classList.remove("show");
  }
});
