// Biến toàn cục
let danhSachGoc = []; // Toàn bộ lịch hẹn từ server
let boLocHienTai = "all"; // Bộ lọc đang chọn
const authManager = new AuthManager();

// ====================== KHỞI TẠO ======================
document.addEventListener("DOMContentLoaded", function () {
  kiemTraDangNhap();
  hienThiThongTinUser();
  taiDanhSachLichHen();
  ganSuKienLocTab();

  document.getElementById("btnLamMoi").addEventListener("click", function () {
    this.querySelector("i").classList.add("fa-spin");
    taiDanhSachLichHen().finally(() => {
      setTimeout(() => {
        this.querySelector("i").classList.remove("fa-spin");
      }, 500);
    });
  });
});

// ====================== KIỂM TRA ĐĂNG NHẬP ======================
function kiemTraDangNhap() {
  const { accessToken } = authManager.getTokens();
  if (!accessToken) {
    window.location.href = "/html/login.html";
  }
}

function layToken() {
  return authManager.getTokens().accessToken;
}

// ====================== HIỂN THỊ THÔNG TIN USER ======================
function hienThiThongTinUser() {
  try {
    const userData =
      JSON.parse(localStorage.getItem("currentUser")) ||
      JSON.parse(sessionStorage.getItem("currentUser"));

    if (userData) {
      const ten = userData.fullName || userData.username || "Người dùng";
      document.getElementById("tenNguoiDung").textContent = ten;
      document.getElementById("emailNguoiDung").textContent =
        userData.email || "--";

      const avatarEl = document.getElementById("avatarText");
      const nameParts = ten.split(" ");
      avatarEl.textContent =
        (nameParts[0]?.charAt(0) || "") +
        (nameParts[nameParts.length - 1]?.charAt(0) || "");
    }
  } catch (_) {}
}

// ====================== TẢI DANH SÁCH LỊCH HẸN ======================
async function taiDanhSachLichHen() {
  const container = document.getElementById("danhSachLichHen");
  container.innerHTML = `
    <div class="state-loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải lịch hẹn...</p>
    </div>`;

  try {
    if (!layToken()) return;

    const response = await authManager.authenticatedFetch(
      "/api/appointments/my",
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      },
    );

    const result = await response.json();

    if (!result.success) {
      container.innerHTML = `
        <div class="state-error">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Không thể tải lịch hẹn. Vui lòng thử lại.</p>
        </div>`;
      return;
    }

    danhSachGoc = result.appointments || [];
    capNhatThongKe(danhSachGoc);
    hienThiDanhSach(boLocHienTai);
  } catch (error) {
    const container = document.getElementById("danhSachLichHen");
    container.innerHTML = `
      <div class="state-error">
        <i class="fas fa-wifi"></i>
        <p>Lỗi kết nối. Vui lòng thử lại.</p>
      </div>`;
  }
}

// ====================== CẬP NHẬT THỐNG KÊ ======================
function capNhatThongKe(danhSach) {
  const tong = danhSach.length;
  const cho = danhSach.filter(
    (a) => a.status?.toLowerCase() === "booked",
  ).length;
  const hoanThanh = danhSach.filter(
    (a) => a.status?.toLowerCase() === "examined",
  ).length;
  const daHuy = danhSach.filter(
    (a) => a.status?.toLowerCase() === "cancelled",
  ).length;

  document.getElementById("statTongSo").textContent = tong;
  document.getElementById("statChoDuyet").textContent = cho;
  document.getElementById("statHoanThanh").textContent = hoanThanh;
  document.getElementById("statDaHuy").textContent = daHuy;
}

// ====================== LỌC VÀ HIỂN THỊ ======================
function ganSuKienLocTab() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      boLocHienTai = this.getAttribute("data-filter");
      hienThiDanhSach(boLocHienTai);
    });
  });
}

function hienThiDanhSach(filter) {
  const container = document.getElementById("danhSachLichHen");

  let dsLoc = danhSachGoc;
  if (filter !== "all") {
    dsLoc = danhSachGoc.filter((a) => a.status?.toLowerCase() === filter);
  }

  if (dsLoc.length === 0) {
    const tenTrangThai = {
      booked: "chờ khám",
      examined: "đã hoàn thành",
      cancelled: "đã hủy",
    };
    const moTa =
      filter === "all"
        ? "Bạn chưa có lịch hẹn nào."
        : `Không có lịch hẹn nào ${tenTrangThai[filter] || ""}.`;
    container.innerHTML = `
      <div class="state-empty">
        <i class="fas fa-calendar-times"></i>
        <p>${moTa}</p>
        ${filter === "all" ? '<a href="/" class="btn-dat-lich"><i class="fas fa-plus"></i> Đặt lịch ngay</a>' : ""}
      </div>`;
    return;
  }

  container.innerHTML = dsLoc.map((lh) => taoCardHTML(lh)).join("");

  // Gắn sự kiện
  container.querySelectorAll(".btn-chi-tiet").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.getAttribute("data-id"));
      const lichHen = danhSachGoc.find((a) => a.id === id);
      if (lichHen) moModal(lichHen);
    });
  });

  container.querySelectorAll(".btn-huy-lich").forEach((btn) => {
    btn.addEventListener("click", function () {
      const id = parseInt(this.getAttribute("data-id"));
      xacNhanHuy(id, this);
    });
  });
}

// ====================== TẠO HTML CHO MỘT CARD ======================
function taoCardHTML(lh) {
  const status = (lh.status || "").toLowerCase();
  const badgeClass =
    {
      booked: "badge-booked",
      examined: "badge-completed",
      cancelled: "badge-cancelled",
    }[status] || "badge-booked";
  const badgeTen =
    { booked: "Chờ khám", examined: "Đã hoàn thành", cancelled: "Đã hủy" }[
      status
    ] || lh.status;

  const ngay = lh.appointment_date
    ? new Date(lh.appointment_date).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--";
  const gio = lh.appointment_time ? lh.appointment_time.substring(0, 5) : "--";

  const nutHuy =
    status === "booked"
      ? `<button class="btn-huy-lich" data-id="${lh.id}"><i class="fas fa-times-circle"></i> Hủy lịch</button>`
      : "";

  return `
    <div class="appointment-card">
      <div class="card-header">
        <span class="card-ma">Mã #${lh.id}</span>
        <span class="badge ${badgeClass}">${badgeTen}</span>
      </div>
      <div class="card-body">
        <div class="card-row">
          <i class="fas fa-stethoscope"></i>
          <span><strong>${lh.ten_chuyen_khoa || "--"}</strong></span>
        </div>
        <div class="card-row">
          <i class="fas fa-user-md"></i>
          <span>${lh.ten_bac_si || "--"}</span>
        </div>
        <div class="card-row">
          <i class="fas fa-calendar-alt"></i>
          <span>${ngay} &bull; <strong>${gio}</strong></span>
        </div>
        ${lh.symptoms ? `<div class="card-row"><i class="fas fa-notes-medical"></i><span>${lh.symptoms}</span></div>` : ""}
      </div>
      <div class="card-footer">
        ${nutHuy}
        <button class="btn-chi-tiet" data-id="${lh.id}">
          <i class="fas fa-eye"></i> Xem chi tiết
        </button>
      </div>
    </div>`;
}

// ====================== MODAL CHI TIẾT ======================
function moModal(lh) {
  const status = (lh.status || "").toLowerCase();
  const badgeClass =
    {
      booked: "badge-booked",
      examined: "badge-completed",
      cancelled: "badge-cancelled",
    }[status] || "badge-booked";
  const badgeTen =
    { booked: "Chờ khám", examined: "Đã hoàn thành", cancelled: "Đã hủy" }[
      status
    ] || lh.status;

  const ngay = lh.appointment_date
    ? new Date(lh.appointment_date).toLocaleDateString("vi-VN", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "--";
  const gio = lh.appointment_time ? lh.appointment_time.substring(0, 5) : "--";
  const taoLuc = lh.created_at
    ? new Date(lh.created_at).toLocaleString("vi-VN")
    : "--";

  document.getElementById("modalNoidung").innerHTML = `
    <div class="modal-section">
      <div class="modal-section-title">Thông tin lịch hẹn</div>
      <div class="modal-detail-row">
        <span class="lbl"><i class="fas fa-hashtag"></i> Mã lịch hẹn</span>
        <span class="val">#${lh.id}</span>
      </div>
      <div class="modal-detail-row">
        <span class="lbl"><i class="fas fa-info-circle"></i> Trạng thái</span>
        <span class="val"><span class="badge ${badgeClass}">${badgeTen}</span></span>
      </div>
      <div class="modal-detail-row">
        <span class="lbl"><i class="fas fa-clock"></i> Đặt lúc</span>
        <span class="val">${taoLuc}</span>
      </div>
    </div>

    <div class="modal-section">
      <div class="modal-section-title">Thông tin khám</div>
      <div class="modal-detail-row">
        <span class="lbl"><i class="fas fa-stethoscope"></i> Chuyên khoa</span>
        <span class="val">${lh.ten_chuyen_khoa || "--"}</span>
      </div>
      <div class="modal-detail-row">
        <span class="lbl"><i class="fas fa-user-md"></i> Bác sĩ</span>
        <span class="val">${lh.ten_bac_si || "--"}</span>
      </div>
      <div class="modal-detail-row">
        <span class="lbl"><i class="fas fa-calendar-day"></i> Ngày khám</span>
        <span class="val">${ngay}</span>
      </div>
      <div class="modal-detail-row">
        <span class="lbl"><i class="fas fa-clock"></i> Giờ khám</span>
        <span class="val">${gio}</span>
      </div>
      ${
        lh.symptoms
          ? `
      <div class="modal-detail-row">
        <span class="lbl"><i class="fas fa-notes-medical"></i> Triệu chứng</span>
        <span class="val" style="max-width:60%;text-align:right;">${lh.symptoms}</span>
      </div>`
          : ""
      }
    </div>`;

  const modalFooter = document.getElementById("modalFooter");
  if (status === "booked") {
    modalFooter.innerHTML = `
      <button class="btn-huy-lich-modal" id="btnHuyTrongModal" data-id="${lh.id}">
        <i class="fas fa-times-circle"></i> Hủy lịch hẹn này
      </button>`;
    document
      .getElementById("btnHuyTrongModal")
      .addEventListener("click", function () {
        const id = parseInt(this.getAttribute("data-id"));
        xacNhanHuy(id, this, true);
      });
  } else {
    modalFooter.innerHTML = "";
  }

  document.getElementById("modalChiTiet").classList.add("show");
  document.body.style.overflow = "hidden";
}

function dongModal(event) {
  if (event.target === document.getElementById("modalChiTiet")) {
    dongModalBtn();
  }
}

function dongModalBtn() {
  document.getElementById("modalChiTiet").classList.remove("show");
  document.body.style.overflow = "";
}

// ====================== HỦY LỊCH HẸN ======================
async function xacNhanHuy(id, btn, tuModal = false) {
  if (!confirm("Bạn có chắc muốn hủy lịch hẹn này không?")) return;

  const originalHTML = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang hủy...';
  btn.disabled = true;

  try {
    const response = await authManager.authenticatedFetch(
      `/api/appointments/${id}/huy`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      },
    );

    const result = await response.json();

    if (result.success) {
      hienThiToast("Hủy lịch hẹn thành công!", "success");
      if (tuModal) dongModalBtn();
      await taiDanhSachLichHen();
    } else {
      hienThiToast(
        result.message || "Hủy thất bại. Vui lòng thử lại.",
        "error",
      );
      btn.innerHTML = originalHTML;
      btn.disabled = false;
    }
  } catch (_) {
    hienThiToast("Lỗi kết nối. Vui lòng thử lại.", "error");
    btn.innerHTML = originalHTML;
    btn.disabled = false;
  }
}

// ====================== TOAST ======================
function hienThiToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}
