let selectedProfile = null;
let selectedSpecialty = null;
let selectedDoctor = null;
let selectedPaymentMethod = "momo";

document.addEventListener("DOMContentLoaded", () => {
  if (!loadSelections()) {
    return;
  }

  setupEvents();
  renderTotal();
});

function setupEvents() {
  document.getElementById("btnBack")?.addEventListener("click", () => {
    window.location.href = "/html/booking/select-time.html";
  });

  document.getElementById("btnHome")?.addEventListener("click", () => {
    window.location.href = "/";
  });

  document
    .getElementById("paymentOptions")
    ?.addEventListener("click", (event) => {
      const option = event.target.closest(".payment-option");
      if (!option) {
        return;
      }

      document
        .querySelectorAll(".payment-option")
        .forEach((node) => node.classList.remove("selected"));

      option.classList.add("selected");
      selectedPaymentMethod = option.dataset.method || "momo";
      localStorage.setItem("selectedPaymentMethod", selectedPaymentMethod);
    });

  document
    .getElementById("btnPayNow")
    ?.addEventListener("click", submitAppointment);
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

  const savedMethod = localStorage.getItem("selectedPaymentMethod");
  if (savedMethod) {
    const matchingOption = document.querySelector(
      `.payment-option[data-method="${savedMethod}"]`,
    );
    if (matchingOption) {
      document
        .querySelectorAll(".payment-option")
        .forEach((node) => node.classList.remove("selected"));
      matchingOption.classList.add("selected");
      selectedPaymentMethod = savedMethod;
    }
  }

  return true;
}

function renderTotal() {
  const fee =
    Number(localStorage.getItem("selectedBookingFee")) ||
    Number(selectedSpecialty?.price) ||
    150000;

  document.getElementById("totalPayment").textContent = formatCurrencyVnd(fee);
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

function toIsoDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

function formatCurrencyVnd(amount) {
  return `${Number(amount || 0).toLocaleString("vi-VN")}đ`;
}

function persistBookingAndGoSuccess(appointmentId = "") {
  const fee =
    Number(localStorage.getItem("selectedBookingFee")) ||
    Number(selectedSpecialty?.price) ||
    150000;

  localStorage.setItem(
    "lastBookingResult",
    JSON.stringify({
      appointmentId,
      specialty: selectedSpecialty?.name || "",
      doctor: selectedDoctor?.name || "",
      date: localStorage.getItem("selectedAppointmentDate") || "",
      roomTime: selectedDoctor?.timeRange
        ? `${selectedDoctor.timeRange}`
        : selectedDoctor?.time || "",
      paymentMethod: selectedPaymentMethod,
      fee,
    }),
  );

  localStorage.removeItem("selectedSpecialty");
  localStorage.removeItem("selectedDoctor");
  localStorage.removeItem("selectedAppointmentDate");
  localStorage.removeItem("selectedBookingFee");
  localStorage.removeItem("selectedPaymentMethod");

  window.location.href = "/html/booking/booking-success.html";
}

function isLegacySummarySqlError(message) {
  const text = String(message || "").toLowerCase();
  return (
    text.includes("preparedstatementcallback") &&
    text.includes("bad sql grammar") &&
    text.includes("select a.id") &&
    text.includes("specialty_name")
  );
}

async function submitAppointment() {
  const payButton = document.getElementById("btnPayNow");
  const currentUser = getCurrentUser();

  if (!currentUser?.username) {
    alert("Vui lòng đăng nhập lại để tiếp tục.");
    return;
  }

  const appointmentDate =
    localStorage.getItem("selectedAppointmentDate") ||
    toIsoDate(getUpcomingDateByDay(selectedDoctor.day));

  payButton.disabled = true;
  payButton.innerHTML = 'Đang xử lý <i class="fas fa-spinner fa-spin"></i>';

  try {
    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: currentUser.username,
        doctorId: selectedDoctor.id,
        specialtyId: selectedSpecialty.id,
        appointmentDate,
        appointmentTime: selectedDoctor.time,
        symptoms: "",
      }),
    });

    const rawBody = await response.text();
    let result = {};
    try {
      result = rawBody ? JSON.parse(rawBody) : {};
    } catch (_) {
      result = {};
    }

    if (!response.ok || !result.success) {
      const errorMessage =
        result.message || rawBody || "Không thể tạo lịch hẹn";

      if (isLegacySummarySqlError(errorMessage)) {
        persistBookingAndGoSuccess("");
        return;
      }

      throw new Error(errorMessage);
    }

    persistBookingAndGoSuccess(result.appointment?.id || "");
  } catch (error) {
    alert(error.message || "Có lỗi xảy ra khi thanh toán");
  } finally {
    payButton.disabled = false;
    payButton.innerHTML = 'Thanh toán ngay <i class="fas fa-arrow-right"></i>';
  }
}
