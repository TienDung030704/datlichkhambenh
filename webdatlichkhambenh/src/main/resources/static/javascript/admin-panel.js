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
    doctorManagement: "Quản lý bác sĩ",
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
    case "doctorManagement":
      loadDoctorManagementData();
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

    // Fallback khi lỗi API - hiển thị 0 thay vì mock data
    document.getElementById("todayAppointments").textContent = "0";
    document.getElementById("upcomingAppointments").textContent = "0";
    document.getElementById("totalDoctors").textContent = "0";
    document.getElementById("totalPatients").textContent = "0";
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
      <td>${appointment.specialtyName || appointment.specialty || "--"}</td>
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
  fetch("/api/specialties")
    .then((res) => res.json())
    .then((data) => {
      if (!data.success) return;
      const tbody = document.getElementById("specialtyTableBody");
      if (!tbody) return;
      if (data.data.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="5" style="text-align:center;padding:30px;color:#9ca3af;">Chưa có chuyên khoa nào</td></tr>';
        return;
      }
      tbody.innerHTML = data.data
        .map(
          (s, i) => `
        <tr style="border-bottom:1px solid #f3f4f6;">
          <td style="padding:12px 14px;color:#9ca3af;">${i + 1}</td>
          <td style="padding:12px 14px;font-weight:600;color:#1f2937;">${s.name}</td>
          <td style="padding:12px 14px;text-align:right;color:#1da1f2;font-weight:700;">
            ${s.price ? s.price.toLocaleString("vi-VN") + "đ" : "150.000đ"}
          </td>
          <td style="padding:12px 14px;text-align:center;color:#6b7280;">${s.doctorCount || 0}</td>
          <td style="padding:12px 14px;text-align:center;">
            <button onclick="openEditSpecialtyModal(${s.id}, '${s.name.replace(/'/g, "\\'")}', ${s.price || 150000})"
              style="background:#eff6ff;color:#1da1f2;border:none;border-radius:7px;padding:6px 14px;font-size:13px;font-weight:600;cursor:pointer;">
              Sửa giá
            </button>
          </td>
        </tr>
      `,
        )
        .join("");
    })
    .catch((err) => console.error("Error loading specialties:", err));
}

// ===== SPECIALTY MODAL =====
let _specialtyModalMode = "edit"; // "edit" | "add"

function openEditSpecialtyModal(id, name, price) {
  _specialtyModalMode = "edit";
  document.getElementById("specialtyModalTitle").textContent =
    "Sửa giá chuyên khoa";
  document.getElementById("modalSpecialtyId").value = id;
  document.getElementById("modalSpecialtyName").value = name;
  document.getElementById("modalSpecialtyName").disabled = true;
  document.getElementById("modalSpecialtyPrice").value = price;
  document.getElementById("specialtyModal").style.display = "flex";
}

function openAddSpecialtyModal() {
  _specialtyModalMode = "add";
  document.getElementById("specialtyModalTitle").textContent =
    "Thêm chuyên khoa";
  document.getElementById("modalSpecialtyId").value = "";
  document.getElementById("modalSpecialtyName").value = "";
  document.getElementById("modalSpecialtyName").disabled = false;
  document.getElementById("modalSpecialtyPrice").value = 150000;
  document.getElementById("specialtyModal").style.display = "flex";
}

function closeSpecialtyModal() {
  document.getElementById("specialtyModal").style.display = "none";
}

function saveSpecialtyModal() {
  const name = document.getElementById("modalSpecialtyName").value.trim();
  const price = parseInt(
    document.getElementById("modalSpecialtyPrice").value,
    10,
  );

  if (!price || price < 0) {
    alert("Vui lòng nhập giá hợp lệ");
    return;
  }

  if (_specialtyModalMode === "edit") {
    const id = document.getElementById("modalSpecialtyId").value;
    fetch(`/api/specialties/${id}/price`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ price }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          closeSpecialtyModal();
          loadDoctorsData();
        } else {
          alert("Lỗi: " + data.message);
        }
      })
      .catch(() => alert("Lỗi kết nối server"));
  } else {
    if (!name) {
      alert("Vui lòng nhập tên chuyên khoa");
      return;
    }
    fetch("/api/specialties", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, price }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          closeSpecialtyModal();
          loadDoctorsData();
        } else {
          alert("Lỗi: " + data.message);
        }
      })
      .catch(() => alert("Lỗi kết nối server"));
  }
}

/* ===== DOCTOR MANAGEMENT ===== */
let doctorMgmtCurrentPage = 0;
const DOCTOR_MGMT_PAGE_SIZE = 10;
let doctorMgmtTotal = 0;
let doctorMgmtSearch = "";
let doctorMgmtSpecialty = "";
let allSpecialtiesForFilter = [];

// Current doctor schedule state
let scheduleCurrentDoctorId = null;
let scheduleCurrentDoctorName = "";
let scheduleCurrentWeekStart = null; // Date object (Monday)

async function loadDoctorManagementData() {
  doctorMgmtCurrentPage = 0;
  doctorMgmtSearch = "";
  doctorMgmtSpecialty = "";

  // Load specialties into filter dropdown (once)
  if (allSpecialtiesForFilter.length === 0) {
    try {
      const res = await fetch("/api/specialties");
      if (res.ok) {
        const data = await res.json();
        allSpecialtiesForFilter = data.data || [];
        const sel = document.getElementById("doctorSpecialtyFilter");
        if (sel) {
          sel.innerHTML = '<option value="">Tất cả chuyên khoa</option>';
          allSpecialtiesForFilter.forEach((s) => {
            const opt = document.createElement("option");
            opt.value = s.id;
            opt.textContent = s.name;
            sel.appendChild(opt);
          });
        }
      }
    } catch (e) {
      /* ignore */
    }
  }

  const searchInput = document.getElementById("searchDoctorsMgmt");
  const specialtySelect = document.getElementById("doctorSpecialtyFilter");
  if (searchInput) {
    searchInput.value = "";
    searchInput.addEventListener(
      "input",
      debounce(function () {
        doctorMgmtSearch = searchInput.value.trim();
        doctorMgmtCurrentPage = 0;
        fetchAndRenderDoctorsMgmt();
      }, 350),
    );
  }
  if (specialtySelect) {
    specialtySelect.value = "";
    specialtySelect.addEventListener("change", function () {
      doctorMgmtSpecialty = specialtySelect.value;
      doctorMgmtCurrentPage = 0;
      fetchAndRenderDoctorsMgmt();
    });
  }

  await fetchAndRenderDoctorsMgmt();
}

async function fetchAndRenderDoctorsMgmt() {
  showLoading(true);
  try {
    const offset = doctorMgmtCurrentPage * DOCTOR_MGMT_PAGE_SIZE;
    const res = await fetch(
      `/api/admin/doctors/list?offset=${offset}&limit=${DOCTOR_MGMT_PAGE_SIZE}`,
    );
    if (!res.ok) throw new Error("Lỗi tải danh sách bác sĩ");
    const data = await res.json();
    let doctors = data.doctors || [];
    doctorMgmtTotal = data.total || doctors.length;

    // Client-side filter by name/email/phone
    if (doctorMgmtSearch) {
      const q = doctorMgmtSearch.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          (d.fullName || "").toLowerCase().includes(q) ||
          (d.email || "").toLowerCase().includes(q) ||
          (d.phoneNumber || "").toLowerCase().includes(q),
      );
    }
    // Client-side filter by specialty
    if (doctorMgmtSpecialty) {
      const sp = allSpecialtiesForFilter.find(
        (s) => String(s.id) === String(doctorMgmtSpecialty),
      );
      if (sp) {
        doctors = doctors.filter(
          (d) =>
            (d.specialtyName || "").toLowerCase() === sp.name.toLowerCase(),
        );
      }
    }

    renderDoctorsMgmtTable(doctors, offset);
    renderDoctorsMgmtPagination();

    const badge = document.getElementById("doctorsMgmtTotalBadge");
    if (badge) badge.textContent = doctorMgmtTotal;
  } catch (err) {
    console.error("Error loading doctors:", err);
    const tbody = document.getElementById("doctorsMgmtTableBody");
    if (tbody)
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:#ef4444">Lỗi tải dữ liệu bác sĩ</td></tr>`;
  } finally {
    showLoading(false);
  }
}

function renderDoctorsMgmtTable(doctors, offset) {
  const tbody = document.getElementById("doctorsMgmtTableBody");
  if (!tbody) return;
  if (doctors.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:#9ca3af">Không có bác sĩ nào</td></tr>`;
    return;
  }
  tbody.innerHTML = doctors
    .map((d, i) => {
      const isActive = d.isActive == 1 || d.isActive === true;
      const status = isActive
        ? `<span class="status-badge" style="background:#dcfce7;color:#16a34a">Hoạt động</span>`
        : `<span class="status-badge" style="background:#fee2e2;color:#dc2626">Không hoạt động</span>`;
      return `<tr>
      <td>${offset + i + 1}</td>
      <td><strong>${d.fullName || "--"}</strong></td>
      <td><span style="background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:12px;font-size:12px">${d.specialtyName || "--"}</span></td>
      <td>${d.email || "--"}</td>
      <td>${d.phoneNumber || "--"}</td>
      <td style="text-align:center">${d.experience != null ? d.experience + " năm" : "--"}</td>
      <td>${status}</td>
      <td>
        <button onclick="openDoctorScheduleModal(${d.id}, '${(d.fullName || "").replace(/'/g, "\\'")}', '${(d.specialtyName || "").replace(/'/g, "\\'")}')"
          style="background:#1da1f2;color:#fff;border:none;border-radius:7px;padding:6px 14px;font-size:12px;font-weight:600;cursor:pointer">
          <i class="fas fa-calendar-alt"></i> Xem lịch
        </button>
      </td>
    </tr>`;
    })
    .join("");
}

function renderDoctorsMgmtPagination() {
  const totalPages = Math.ceil(doctorMgmtTotal / DOCTOR_MGMT_PAGE_SIZE);
  const pageNumbers = document.getElementById("doctorsMgmtPageNumbers");
  const prevBtn = document.getElementById("doctorsMgmtPrevBtn");
  const nextBtn = document.getElementById("doctorsMgmtNextBtn");
  if (prevBtn) prevBtn.disabled = doctorMgmtCurrentPage === 0;
  if (nextBtn) nextBtn.disabled = doctorMgmtCurrentPage >= totalPages - 1;
  if (!pageNumbers) return;
  pageNumbers.innerHTML = "";
  for (let i = 0; i < totalPages; i++) {
    const btn = document.createElement("button");
    btn.className = "btn-pagination";
    btn.style.cssText =
      i === doctorMgmtCurrentPage
        ? "background:#3b82f6;color:#fff;border-color:#3b82f6"
        : "";
    btn.textContent = i + 1;
    btn.onclick = () => {
      doctorMgmtCurrentPage = i;
      fetchAndRenderDoctorsMgmt();
    };
    pageNumbers.appendChild(btn);
  }
}

function changeDoctorMgmtPage(delta) {
  const totalPages = Math.ceil(doctorMgmtTotal / DOCTOR_MGMT_PAGE_SIZE);
  doctorMgmtCurrentPage = Math.max(
    0,
    Math.min(totalPages - 1, doctorMgmtCurrentPage + delta),
  );
  fetchAndRenderDoctorsMgmt();
}

/* ===== DOCTOR SCHEDULE / TIMETABLE ===== */
const TIME_SLOTS = [
  "06:30 - 07:30",
  "07:30 - 08:30",
  "08:30 - 09:30",
  "09:30 - 10:30",
  "10:30 - 11:30",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
];

const DAY_LABELS = [
  "Thứ 2",
  "Thứ 3",
  "Thứ 4",
  "Thứ 5",
  "Thứ 6",
  "Thứ 7",
  "Chủ nhật",
];

function getMondayOfCurrentWeek() {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function formatDateVN(date) {
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function toISODateString(date) {
  // Use local date components to avoid UTC timezone shift (e.g. UTC+7)
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function openDoctorScheduleModal(doctorId, doctorName, specialtyName) {
  scheduleCurrentDoctorId = doctorId;
  scheduleCurrentDoctorName = doctorName;
  scheduleCurrentWeekStart = getMondayOfCurrentWeek();

  document.getElementById("scheduleModalDoctorName").textContent =
    "Lịch khám: " + doctorName;
  document.getElementById("scheduleModalSpecialty").textContent =
    specialtyName || "";
  document.getElementById("doctorScheduleModal").style.display = "flex";
  fetchAndRenderTimetable();
}

function closeDoctorScheduleModal() {
  document.getElementById("doctorScheduleModal").style.display = "none";
  scheduleCurrentDoctorId = null;
  scheduleCurrentWeekStart = null;
}

function navigateDoctorWeek(delta) {
  if (!scheduleCurrentWeekStart) return;
  scheduleCurrentWeekStart = new Date(scheduleCurrentWeekStart);
  scheduleCurrentWeekStart.setDate(
    scheduleCurrentWeekStart.getDate() + delta * 7,
  );
  fetchAndRenderTimetable();
}

async function fetchAndRenderTimetable() {
  const weekStartStr = toISODateString(scheduleCurrentWeekStart);
  const weekEnd = new Date(scheduleCurrentWeekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  document.getElementById("scheduleWeekLabel").textContent =
    `Từ ${formatDateVN(scheduleCurrentWeekStart)} đến ${formatDateVN(weekEnd)}`;

  const table = document.getElementById("doctorTimetableGrid");
  if (!table) return;
  table.innerHTML = `<tbody><tr><td colspan="9" style="text-align:center;padding:40px;color:#6b7280;font-size:13px"><i class="fas fa-spinner fa-spin" style="color:#1e3a8a;font-size:20px;margin-bottom:10px;display:block"></i>Đang tải lịch trực...</td></tr></tbody>`;

  try {
    const res = await fetch(
      `/api/admin/doctors/${scheduleCurrentDoctorId}/duty?weekStart=${weekStartStr}`,
    );
    if (!res.ok) throw new Error("HTTP " + res.status);
    const data = await res.json();
    if (!data.success && !data.dutySlots)
      throw new Error(data.message || "Lỗi dữ liệu");
    renderTimetableGrid(table, data.dutySlots || [], scheduleCurrentWeekStart);
  } catch (err) {
    console.error("fetchAndRenderTimetable error:", err);
    table.innerHTML = `<tbody><tr><td colspan="9" style="text-align:center;padding:32px">
      <div style="color:#ef4444;font-size:14px;font-weight:600;margin-bottom:12px"><i class="fas fa-exclamation-circle"></i> Không thể tải lịch trực</div>
      <div style="color:#6b7280;font-size:12px;margin-bottom:16px">${err.message}</div>
      <button onclick="fetchAndRenderTimetable()" style="background:#1e3a8a;color:#fff;border:none;border-radius:6px;padding:8px 20px;font-size:13px;cursor:pointer;font-weight:600">
        <i class="fas fa-redo"></i> Tải lại
      </button>
    </td></tr></tbody>`;
  }
}

async function toggleDutySlot(doctorId, dateStr, timeSlot, isOnDuty) {
  try {
    await fetch(`/api/admin/doctors/${doctorId}/duty`, {
      method: isOnDuty ? "DELETE" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateStr, timeSlot }),
    });
    fetchAndRenderTimetable();
  } catch (e) {
    console.error("toggleDutySlot error", e);
  }
}

function renderTimetableGrid(table, dutySlots, weekMonday) {
  // Build duty set: key = "YYYY-MM-DD|HH:MM"
  const dutySet = new Set();
  for (const s of dutySlots) {
    const d = (s.scheduleDate || s.schedule_date || "").split("T")[0];
    const t = (s.timeSlot || s.time_slot || "").substring(0, 5);
    if (d && t) dutySet.add(`${d}|${t}`);
  }

  // Column dates Mon → Sun
  const colDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekMonday);
    d.setDate(weekMonday.getDate() + i);
    colDates.push(d);
  }

  // Styles
  const HDR_S = `background:#1e3a8a;color:#fff;padding:11px 8px;border:1px solid #2d4fa8;font-weight:700;text-align:center;font-size:12px;white-space:nowrap`;
  const TIME_S = `background:#1e3a8a;color:#fff;padding:0 8px;border:1px solid #2d4fa8;font-weight:600;text-align:center;font-size:11px;white-space:nowrap;min-width:95px;vertical-align:middle`;
  const EMPTY_S = `background:#fff;border:1px solid #dee2e6;vertical-align:middle;text-align:center;cursor:pointer;transition:background .15s`;
  const DUTY_S = `background:#f0fdf4;border:1px solid #86efac;vertical-align:middle;text-align:center;cursor:pointer;transition:background .15s`;

  // ── Header ──
  let html = `<thead><tr>
    <th style="${HDR_S};min-width:95px">Giờ khám</th>`;
  for (let i = 0; i < 7; i++) {
    const d = colDates[i];
    const isToday = toISODateString(d) === toISODateString(new Date());
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const todayBorder = isToday ? "border-bottom:3px solid #facc15;" : "";
    html += `<th style="${HDR_S};min-width:130px;${todayBorder}">${DAY_LABELS[i]}${isToday ? " <span style='font-size:9px;background:#facc15;color:#1e3a8a;padding:1px 4px;border-radius:3px;font-weight:700'>HÔM NAY</span>" : ""}<br><span style="font-size:11px;font-weight:400;opacity:0.85">${dd}/${mm}</span></th>`;
  }
  html += `<th style="${HDR_S};min-width:95px">Giờ khám</th>
  </tr></thead><tbody>`;

  // ── Rows ──
  TIME_SLOTS.forEach((slot, rowIdx) => {
    // Section separators
    if (rowIdx === 0) {
      html += `<tr><td colspan="9" style="background:#eff6ff;text-align:center;padding:5px 0;color:#1e40af;font-size:11px;font-weight:700;border:1px solid #bfdbfe;letter-spacing:1px">
        ☀ BUỔI SÁNG
      </td></tr>`;
    } else if (rowIdx === 5) {
      html += `<tr><td colspan="9" style="background:#f0fdf4;text-align:center;padding:5px 0;color:#166534;font-size:11px;font-weight:700;border:1px solid #bbf7d0;letter-spacing:1px">
        ⛅ BUỔI CHIỀU
      </td></tr>`;
    }

    const [startPart, endPart] = slot.split(" - ");
    const slotStart = startPart.trim();
    const rowH = "height:62px";

    html += `<tr style="${rowH}">
      <td style="${TIME_S}">
        <div style="font-size:12px;font-weight:700">${slotStart}</div>
        <div style="font-size:10px;opacity:0.75;margin-top:2px">${endPart ? "→ " + endPart.trim() : ""}</div>
      </td>`;

    for (let i = 0; i < 7; i++) {
      const dateStr = toISODateString(colDates[i]);
      const key = `${dateStr}|${slotStart}`;
      const isOnDuty = dutySet.has(key);

      if (isOnDuty) {
        html += `<td onclick="toggleDutySlot(${scheduleCurrentDoctorId},'${dateStr}','${slot}',true)"
             style="${DUTY_S};padding:8px"
             title="Đang trực – click để bỏ phân công">
          <div style="display:inline-block;width:8px;height:8px;background:#22c55e;border-radius:50%;margin-bottom:4px"></div>
          <div style="font-size:11px;color:#16a34a;font-weight:600">Đang trực</div>
          <div style="font-size:10px;color:#9ca3af;margin-top:2px">Chưa có BN</div>
        </td>`;
      } else {
        html += `<td onclick="toggleDutySlot(${scheduleCurrentDoctorId},'${dateStr}','${slot}',false)"
             style="${EMPTY_S};padding:8px"
             title="Click để phân công trực">
          <span style="color:#d1d5db;font-size:20px;line-height:1">+</span>
        </td>`;
      }
    }

    html += `<td style="${TIME_S}">
      <div style="font-size:12px;font-weight:700">${slotStart}</div>
      <div style="font-size:10px;opacity:0.75;margin-top:2px">${endPart ? "→ " + endPart.trim() : ""}</div>
    </td></tr>`;
  });

  // ── Footer ──
  html += `</tbody><tfoot><tr>
    <th style="${HDR_S}">Giờ khám</th>`;
  for (let i = 0; i < 7; i++) {
    const d = colDates[i];
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    html += `<th style="${HDR_S}">${DAY_LABELS[i]}<br><span style="font-size:11px;font-weight:400;opacity:0.85">${dd}/${mm}</span></th>`;
  }
  html += `<th style="${HDR_S}">Giờ khám</th>
  </tr></tfoot>`;

  table.innerHTML = html;
}

// Load patients data từ database thật
/* ===== PATIENTS MANAGEMENT ===== */
let patientCurrentPage = 0;
const PATIENT_PAGE_SIZE = 10;
let patientTotalCount = 0;
let patientSearchQuery = "";
let patientStatusFilter = "";

async function loadPatientsData() {
  patientCurrentPage = 0;
  patientSearchQuery = "";
  patientStatusFilter = "";

  const searchInput = document.getElementById("searchPatients");
  const statusSelect = document.getElementById("patientStatusFilter");
  if (searchInput) {
    searchInput.value = "";
    searchInput.addEventListener(
      "input",
      debounce(function () {
        patientSearchQuery = searchInput.value.trim();
        patientCurrentPage = 0;
        fetchAndRenderPatients();
      }, 350),
    );
  }
  if (statusSelect) {
    statusSelect.value = "";
    statusSelect.addEventListener("change", function () {
      patientStatusFilter = statusSelect.value;
      patientCurrentPage = 0;
      fetchAndRenderPatients();
    });
  }

  await fetchAndRenderPatients();
}

async function fetchAndRenderPatients() {
  showLoading(true);
  try {
    let url;
    const offset = patientCurrentPage * PATIENT_PAGE_SIZE;

    if (patientSearchQuery) {
      url = `/api/admin/patients/search?query=${encodeURIComponent(patientSearchQuery)}&offset=${offset}&limit=${PATIENT_PAGE_SIZE}`;
    } else {
      url = `/api/admin/patients/list?offset=${offset}&limit=${PATIENT_PAGE_SIZE}`;
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error("Không thể tải danh sách bệnh nhân");

    const data = await response.json();
    let patients = data.patients || [];
    patientTotalCount = data.total || patients.length;

    // Filter by status on client side (search endpoint doesn't support it)
    if (patientStatusFilter === "active") {
      patients = patients.filter((p) => p.isActive == 1 || p.isActive === true);
    } else if (patientStatusFilter === "inactive") {
      patients = patients.filter(
        (p) => p.isActive == 0 || p.isActive === false,
      );
    }

    renderPatientsTable(patients);
    renderPatientsPagination();

    const badge = document.getElementById("patientsTotalBadge");
    if (badge) badge.textContent = patientTotalCount;
  } catch (error) {
    console.error("Error loading patients:", error);
    const tbody = document.getElementById("patientsTableBody");
    if (tbody)
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:#ef4444">Lỗi tải dữ liệu bệnh nhân</td></tr>`;
  } finally {
    showLoading(false);
  }
}

function renderPatientsTable(patients) {
  const tbody = document.getElementById("patientsTableBody");
  if (!tbody) return;

  if (patients.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:32px;color:#9ca3af">Không có bệnh nhân nào</td></tr>`;
    return;
  }

  const offset = patientCurrentPage * PATIENT_PAGE_SIZE;
  tbody.innerHTML = patients
    .map((p, i) => {
      const isActive = p.isActive == 1 || p.isActive === true;
      const statusBadge = isActive
        ? `<span class="status-badge" style="background:#dcfce7;color:#16a34a">Hoạt động</span>`
        : `<span class="status-badge" style="background:#fee2e2;color:#dc2626">Bị khóa</span>`;

      const dob = p.dateOfBirth
        ? new Date(p.dateOfBirth).toLocaleDateString("vi-VN")
        : "--";
      const createdAt = p.createdAt
        ? new Date(p.createdAt).toLocaleDateString("vi-VN")
        : "--";
      const gender =
        p.gender === "MALE"
          ? "Nam"
          : p.gender === "FEMALE"
            ? "Nữ"
            : p.gender || "--";
      const fullName = p.fullName || p.username || "--";
      const email = p.email || "--";
      const phone = p.phoneNumber || "--";

      return `<tr>
      <td>${offset + i + 1}</td>
      <td><strong>${fullName}</strong><br><span style="color:#6b7280;font-size:12px">@${p.username || ""}</span></td>
      <td>${email}</td>
      <td>${phone}</td>
      <td>${gender}</td>
      <td>${dob}</td>
      <td>${createdAt}</td>
      <td>${statusBadge}</td>
    </tr>`;
    })
    .join("");
}

function renderPatientsPagination() {
  const totalPages = Math.ceil(patientTotalCount / PATIENT_PAGE_SIZE);
  const pageNumbers = document.getElementById("patientsPageNumbers");
  const prevBtn = document.getElementById("patientsPrevBtn");
  const nextBtn = document.getElementById("patientsNextBtn");

  if (prevBtn) prevBtn.disabled = patientCurrentPage === 0;
  if (nextBtn) nextBtn.disabled = patientCurrentPage >= totalPages - 1;

  if (!pageNumbers) return;
  pageNumbers.innerHTML = "";
  for (let i = 0; i < totalPages; i++) {
    const btn = document.createElement("button");
    btn.className =
      "btn-pagination" + (i === patientCurrentPage ? " active" : "");
    btn.style.cssText =
      i === patientCurrentPage
        ? "background:#3b82f6;color:#fff;border-color:#3b82f6"
        : "";
    btn.textContent = i + 1;
    btn.onclick = () => {
      patientCurrentPage = i;
      fetchAndRenderPatients();
    };
    pageNumbers.appendChild(btn);
  }
}

function changePatientPage(delta) {
  const totalPages = Math.ceil(patientTotalCount / PATIENT_PAGE_SIZE);
  patientCurrentPage = Math.max(
    0,
    Math.min(totalPages - 1, patientCurrentPage + delta),
  );
  fetchAndRenderPatients();
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
    localStorage.removeItem("currentUser");
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    sessionStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("refreshToken");
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
