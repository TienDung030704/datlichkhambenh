// ===========================
// SELECT DOCTOR LOGIC
// ===========================

let selectedSpecialty = null;
let selectedDoctor = null;
let selectedDay = null;
let selectedTime = null;
let selectedSession = null;
let doctorsByDay = {};
const morningSlots = [
  "06:30 - 07:30",
  "07:30 - 08:30",
  "08:30 - 09:30",
  "09:30 - 10:30",
  "10:30 - 11:30",
];

const afternoonSlots = ["13:00 - 14:00", "14:00 - 15:00", "15:00 - 16:00"];

const dayNames = {
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
};

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  loadSelectedSpecialty();
  loadDoctorsByDay();
  setupEventListeners();
  setupSessionSwitches();
});

// Setup event listeners
function setupEventListeners() {
  const btnBack = document.getElementById("btnBack");
  const btnHome = document.getElementById("btnHome");

  if (btnBack) btnBack.addEventListener("click", goBack);
  if (btnHome) btnHome.addEventListener("click", goHome);
}

function setupSessionSwitches() {
  document.querySelectorAll(".session-btn").forEach((button) => {
    button.addEventListener("click", () => {
      if (!selectedDoctor) return;
      const session = button.dataset.session;
      selectedSession = session;
      setActiveSession(session);
      renderTimeSlotsForSession(session);
    });
  });
}

function syncSelectedDoctorToStorage(extra = {}) {
  if (!selectedDoctor) return;

  localStorage.setItem(
    "selectedDoctor",
    JSON.stringify({
      id: selectedDoctor.id,
      name: selectedDoctor.name,
      day: selectedDoctor.day,
      dayName: selectedDoctor.dayName,
      session: selectedDoctor.session,
      time: selectedDoctor.time,
      timeRange: selectedDoctor.timeRange,
      ...extra,
    }),
  );
}

// Load selected specialty
function loadSelectedSpecialty() {
  const selected = localStorage.getItem("selectedSpecialty");

  if (!selected) {
    alert("Vui lòng chọn chuyên khoa trước");
    goBack();
    return;
  }

  try {
    selectedSpecialty = JSON.parse(selected);

    const el = document.getElementById("specialtyName");

    if (el) el.textContent = selectedSpecialty.name;
  } catch (e) {
    console.error("Error loading specialty", e);
    goBack();
  }
}

// Load doctors from API
function loadDoctorsByDay() {
  if (!selectedSpecialty) return;

  const url = `/api/specialties/${selectedSpecialty.id}/doctors-by-days`;

  fetch(url)
    .then((res) => {
      if (!res.ok) throw new Error("API error");

      return res.json();
    })

    .then((data) => {
      if (data.success && data.doctors_by_day) {
        doctorsByDay = data.doctors_by_day;

        displayDayTabs();
        selectPreferredOrFirstDay();
      } else {
        showError("Không thể tải danh sách bác sĩ");
      }
    })

    .catch((err) => {
      console.error(err);

      showError("Lỗi tải bác sĩ");
    });
}

function selectPreferredOrFirstDay() {
  const savedDay = localStorage.getItem("selectedDay");
  if (savedDay) {
    const savedIndex = Object.entries(dayNames).find(
      ([, value]) => value === savedDay,
    )?.[0];
    const dayNum = savedIndex ? Number(savedIndex) : null;

    if (dayNum && (doctorsByDay[savedDay] || []).length > 0) {
      selectDay(dayNum);
      return;
    }
  }

  selectFirstDay();
}

// Render day tabs
function displayDayTabs() {
  const container = document.getElementById("daysTabs");

  if (!container) return;

  let html = "";

  [2, 3, 4, 5, 6, 7].forEach((day) => {
    const name = dayNames[day];

    const doctors = doctorsByDay[name] || [];

    const disabled = doctors.length === 0;

    html += `
        <button 
            class="day-tab ${disabled ? "disabled" : ""}" 
            data-day="${day}"
            onclick="selectDay(${day})"
            ${disabled ? "disabled" : ""}
        >
            ${name}
            <span style="font-size:11px;opacity:.7">(${doctors.length})</span>
        </button>
        `;
  });

  container.innerHTML = html;
}

// Auto select first available day
function selectFirstDay() {
  for (let d of [2, 3, 4, 5, 6, 7]) {
    const name = dayNames[d];

    if (doctorsByDay[name] && doctorsByDay[name].length > 0) {
      selectDay(d);

      return;
    }
  }
}

// When selecting day
function selectDay(dayNum) {
  selectedDay = dayNum;
  selectedTime = null;
  selectedSession = null;

  const dayName = dayNames[dayNum];

  document.querySelectorAll(".day-tab").forEach((tab) => {
    if (parseInt(tab.dataset.day) === dayNum) tab.classList.add("active");
    else tab.classList.remove("active");
  });

  displayDoctors(doctorsByDay[dayName] || []);

  const inlineTimeSlotSection = document.getElementById(
    "inlineTimeSlotSection",
  );
  const inlineNextBtn = document.getElementById("inlineNextBtn");
  const selectedTimeText = document.getElementById("selectedTimeText");

  if (inlineTimeSlotSection) inlineTimeSlotSection.style.display = "none";
  if (inlineNextBtn) inlineNextBtn.style.display = "none";
  if (selectedTimeText) {
    selectedTimeText.textContent =
      "Vui lòng chọn buổi và khung giờ trước khi tiếp tục.";
  }
  document
    .querySelectorAll(".session-btn")
    .forEach((button) => button.classList.remove("active"));

  selectedDoctor = null;
}

// Render doctors
function displayDoctors(doctors) {
  const container = document.getElementById("doctorsList");

  if (!container) return;

  if (doctors.length === 0) {
    container.innerHTML = `<div class="empty-message">Không có bác sĩ</div>`;

    return;
  }

  let html = "";

  doctors.forEach((doctor) => {
    const name = doctor.fullName || "";
    const initials = getInitials(name);
    const rating = Math.floor(Math.random() * 2) + 4;
    const stars = renderStars(rating);

    html += `
      <div
        class="doctor-card"
        data-doctor-id="${doctor.id}"
        data-doctor-name="${name}"
        onclick="selectDoctor(${doctor.id})"
      >
        <div class="doctor-avatar">${initials}</div>
        <div class="doctor-name">${name}</div>
        <div class="doctor-experience">${doctor.experience || 5} năm</div>
        <div class="doctor-rating">${stars}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// Get initials
function getInitials(name) {
  if (!name) return "?";

  const parts = name.trim().split(" ");

  if (parts.length === 1) return parts[0][0].toUpperCase();

  return (
    parts[parts.length - 2][0] + parts[parts.length - 1][0]
  ).toUpperCase();
}

function renderStars(rating) {
  let html = "";
  for (let i = 1; i <= 5; i++) {
    html += `<span class="star ${i <= rating ? "" : "empty"}">★</span>`;
  }
  return html;
}

function setActiveSession(session) {
  document.querySelectorAll(".session-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.session === session);
  });
}

function renderTimeSlotsForSession(session) {
  const grid = document.getElementById("timeSlotGrid");
  if (!grid) return;

  const slots = session === "afternoon" ? afternoonSlots : morningSlots;

  grid.innerHTML = slots
    .map(
      (slot) => `
        <button
          type="button"
          class="time-range-btn"
          data-time-range="${slot}"
          onclick="selectTimeRange('${slot}')"
        >
          ${slot}
        </button>
      `,
    )
    .join("");
}

function selectDoctor(doctorId) {
  const card = document.querySelector(
    `.doctor-card[data-doctor-id="${doctorId}"]`,
  );

  if (!card) return;

  const doctorName = card.getAttribute("data-doctor-name") || "";

  selectedDoctor = {
    id: doctorId,
    name: doctorName,
    day: selectedDay,
    dayName: dayNames[selectedDay],
  };

  selectedTime = null;
  selectedSession = null;

  document
    .querySelectorAll(".doctor-card")
    .forEach((item) => item.classList.remove("selected"));
  card.classList.add("selected");

  const inlineTimeSlotSection = document.getElementById(
    "inlineTimeSlotSection",
  );
  const inlineNextBtn = document.getElementById("inlineNextBtn");

  if (inlineTimeSlotSection) inlineTimeSlotSection.style.display = "block";
  if (inlineNextBtn) inlineNextBtn.style.display = "flex";

  setActiveSession("morning");
  selectedSession = "morning";
  renderTimeSlotsForSession("morning");

  syncSelectedDoctorToStorage({
    id: doctorId,
    name: doctorName,
    day: selectedDay,
    dayName: dayNames[selectedDay],
  });
}

function selectTimeRange(timeRange) {
  if (!selectedDoctor) return;

  const sessionLabel =
    selectedSession === "afternoon" ? "Buổi chiều" : "Buổi sáng";
  const startTime = timeRange.split("-")[0].trim();

  selectedTime = startTime;

  document
    .querySelectorAll("#timeSlotGrid .time-range-btn")
    .forEach((button) => button.classList.remove("active"));

  const activeButton = document.querySelector(
    `#timeSlotGrid .time-range-btn[data-time-range="${timeRange}"]`,
  );
  if (activeButton) activeButton.classList.add("active");

  selectedDoctor.session = selectedSession;
  selectedDoctor.sessionLabel = sessionLabel;
  selectedDoctor.time = startTime;
  selectedDoctor.timeRange = timeRange;

  syncSelectedDoctorToStorage();

  const returnTo = localStorage.getItem("returnTo");
  if (returnTo === "chon-thong-tin-kham") {
    window.location.href = "/html/booking/chon-thong-tin-kham.html";
  }
}

// Next step
function proceedToNextStep() {
  if (!selectedDoctor) {
    alert("Vui lòng chọn bác sĩ");

    return;
  }

  if (!selectedTime) {
    alert("Vui lòng chọn khung giờ khám");

    return;
  }

  const returnTo = localStorage.getItem("returnTo");
  if (returnTo === "chon-thong-tin-kham") {
    window.location.href = "/html/booking/chon-thong-tin-kham.html";
  } else {
    window.location.href = "/html/booking/select-time.html";
  }
}

// Error UI
function showError(msg) {
  const el = document.getElementById("doctorsList");

  if (el) el.innerHTML = `<div class="error-message">${msg}</div>`;
}

// Navigation
function goBack() {
  const returnTo = localStorage.getItem("returnTo");
  if (returnTo === "chon-thong-tin-kham") {
    window.location.href = "/html/booking/chon-thong-tin-kham.html";
  } else {
    window.location.href = "/html/booking/book-appointment.html";
  }
}

function goHome() {
  window.location.href = "/index.html";
}

// Global error log
window.addEventListener("error", function (e) {
  console.error("Global error:", e.error);
});

window.selectDoctor = selectDoctor;
window.selectTimeRange = selectTimeRange;
