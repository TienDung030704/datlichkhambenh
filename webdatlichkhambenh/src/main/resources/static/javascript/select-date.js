let selectedSpecialty = null;
let doctorsByDay = {};
let visibleMonth = new Date();
const vietnamHolidayDates = new Set(["30-04", "01-05"]);

const dayNames = {
  1: "CN",
  2: "Thứ 2",
  3: "Thứ 3",
  4: "Thứ 4",
  5: "Thứ 5",
  6: "Thứ 6",
  7: "Thứ 7",
};

document.addEventListener("DOMContentLoaded", function () {
  bindEvents();
  if (!loadSelectedSpecialty()) {
    return;
  }

  loadDoctorsByDay();
});

function bindEvents() {
  document.getElementById("btnBack")?.addEventListener("click", () => {
    window.location.href = "/html/booking/book-appointment.html";
  });

  document.getElementById("btnHome")?.addEventListener("click", () => {
    window.location.href = "/";
  });

  document.getElementById("prevMonth")?.addEventListener("click", () => {
    visibleMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() - 1,
      1,
    );
    renderCalendar();
  });

  document.getElementById("nextMonth")?.addEventListener("click", () => {
    visibleMonth = new Date(
      visibleMonth.getFullYear(),
      visibleMonth.getMonth() + 1,
      1,
    );
    renderCalendar();
  });
}

function loadSelectedSpecialty() {
  try {
    selectedSpecialty = JSON.parse(localStorage.getItem("selectedSpecialty"));
  } catch (error) {
    selectedSpecialty = null;
  }

  if (!selectedSpecialty?.id) {
    alert("Vui lòng chọn chuyên khoa trước");
    window.location.href = "/html/booking/book-appointment.html";
    return false;
  }

  return true;
}

async function loadDoctorsByDay() {
  try {
    const res = await fetch(
      `/api/specialties/${selectedSpecialty.id}/doctors-by-days`,
    );
    if (!res.ok) throw new Error("Không tải được dữ liệu bác sĩ");

    const data = await res.json();
    if (!data.success || !data.doctors_by_day) {
      throw new Error(data.message || "Không tải được dữ liệu bác sĩ");
    }

    doctorsByDay = data.doctors_by_day;
    renderCalendar();
  } catch (error) {
    console.error(error);
    const grid = document.getElementById("calendarGrid");
    if (grid) {
      grid.innerHTML =
        '<div class="calendar-error">Lỗi tải lịch khám. Vui lòng thử lại.</div>';
    }
  }
}

function renderCalendar() {
  const monthTitle = document.getElementById("monthTitle");
  const calendarGrid = document.getElementById("calendarGrid");
  if (!monthTitle || !calendarGrid) return;

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const today = new Date();
  const todayOnly = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  monthTitle.textContent = `Tháng ${String(month + 1).padStart(2, "0")} - ${year}`;
  calendarGrid.innerHTML = "";

  const startOffset = firstDay.getDay();
  for (let i = 0; i < startOffset; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "day-cell empty";
    calendarGrid.appendChild(emptyCell);
  }

  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    const currentDateOnly = new Date(year, month, day);

    const jsDay = currentDate.getDay(); // 0..6
    const mappedDay = jsDay === 0 ? 1 : jsDay + 1; // 1..7
    const mappedName = dayNames[mappedDay];
    const isPastDate = currentDateOnly < todayOnly;
    const isSunday = mappedDay === 1;
    const isHoliday = isVietnamHoliday(currentDateOnly);
    const isSelectable = !isPastDate && !isHoliday && !isSunday;

    const dayCell = document.createElement("button");
    dayCell.type = "button";
    dayCell.className = "day-cell";
    dayCell.innerHTML = `<span class="day-number">${day}</span>`;

    if (isPastDate) {
      dayCell.classList.add("disabled");
      dayCell.disabled = true;
    } else if (isHoliday) {
      dayCell.classList.add("holiday");
      dayCell.innerHTML += '<span class="day-sub">Ngày lễ</span>';
      dayCell.disabled = true;
    } else if (isSunday) {
      dayCell.classList.add("disabled");
      dayCell.disabled = true;
    } else if (isSelectable) {
      dayCell.classList.add("available");
      dayCell.addEventListener("click", () =>
        selectDate(currentDateOnly, mappedName),
      );
    } else {
      dayCell.classList.add("disabled");
      dayCell.disabled = true;
    }

    calendarGrid.appendChild(dayCell);
  }
}

function selectDate(dateObj, dayName) {
  localStorage.setItem("selectedDay", dayName);
  localStorage.setItem("selectedDate", formatDate(dateObj));
  window.location.href = "/html/booking/select-doctor.html";
}

function formatDate(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isVietnamHoliday(dateObj) {
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  return vietnamHolidayDates.has(`${day}-${month}`);
}
