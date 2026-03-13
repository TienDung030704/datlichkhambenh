let selectedProfile = null;
let selectedSpecialty = null;
let selectedDoctor = null;

document.addEventListener("DOMContentLoaded", function () {
  if (!loadSelections()) {
    return;
  }

  setupEventListeners();
  renderConfirmation();
});

function setupEventListeners() {
  document.getElementById("btnBack")?.addEventListener("click", () => {
    window.location.href = "/html/booking/chon-thong-tin-kham.html";
  });

  document.getElementById("btnHome")?.addEventListener("click", () => {
    window.location.href = "/";
  });

  document.getElementById("btnAddSpecialty")?.addEventListener("click", () => {
    window.location.href = "/html/booking/book-appointment.html";
  });

  document
    .getElementById("btnSubmit")
    ?.addEventListener("click", goToPaymentPage);
}

function loadSelections() {
  try {
    selectedProfile = JSON.parse(localStorage.getItem("selectedProfile"));
    selectedSpecialty = JSON.parse(localStorage.getItem("selectedSpecialty"));
    selectedDoctor = JSON.parse(localStorage.getItem("selectedDoctor"));
  } catch (error) {
    console.error("Error reading booking selections:", error);
  }

  const currentUser = getCurrentUser();
  if (!currentUser?.username) {
    alert("Vui lòng đăng nhập để hoàn tất đặt lịch.");
    window.location.href = "/login";
    return false;
  }

  if (!selectedProfile || !selectedSpecialty || !selectedDoctor) {
    alert("Thiếu thông tin đặt lịch. Vui lòng chọn lại từ đầu.");
    window.location.href = "/html/booking/book-appointment.html";
    return false;
  }

  if (!selectedDoctor.time || !selectedDoctor.timeRange) {
    alert("Vui lòng chọn khung giờ khám trước khi xác nhận.");
    window.location.href = "/html/booking/select-doctor.html";
    return false;
  }

  return true;
}

function getCurrentUser() {
  try {
    return (
      JSON.parse(localStorage.getItem("currentUser")) ||
      JSON.parse(sessionStorage.getItem("currentUser"))
    );
  } catch (error) {
    return null;
  }
}

function renderConfirmation() {
  const appointmentDate = getUpcomingDateByDay(selectedDoctor.day);
  const formattedDate = formatDdMmYyyy(appointmentDate);
  const roomNo = 20 + (selectedDoctor.id % 20 || 20);
  const consultationFee = Number(selectedSpecialty?.price) || 150000;
  const formattedFee = formatCurrencyVnd(consultationFee);

  document.getElementById("summarySpecialty").textContent =
    selectedSpecialty?.name || "--";
  document.getElementById("summaryDate").textContent = formattedDate;
  document.getElementById("summaryRoomTime").textContent =
    `${selectedDoctor.timeRange}, Phòng ${roomNo} - Lầu 1 khu A`;
  document.getElementById("summaryFee").textContent = formattedFee;
  document.getElementById("summaryTotal").textContent = formattedFee;

  localStorage.setItem("selectedAppointmentDate", toIsoDate(appointmentDate));
  localStorage.setItem("selectedBookingFee", String(consultationFee));
}

function getUpcomingDateByDay(dayNum) {
  const today = new Date();
  const date = new Date(today);

  if (!dayNum) {
    return date;
  }

  const targetJsDay = dayNum === 7 ? 6 : dayNum - 1;

  while (date.getDay() !== targetJsDay) {
    date.setDate(date.getDate() + 1);
  }

  return date;
}

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDdMmYyyy(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrencyVnd(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")}đ`;
}

function goToPaymentPage() {
  window.location.href = "/html/booking/payment-method.html";
}
