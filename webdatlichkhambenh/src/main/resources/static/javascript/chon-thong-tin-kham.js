// ===========================
// CHON THONG TIN KHAM - HUB
// ===========================

let insuranceState = { bhyt: null, bhtn: null };

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("btnBack").addEventListener("click", () => {
    window.location.href = "/html/booking/book-appointment.html";
  });

  document.getElementById("btnHome").addEventListener("click", () => {
    window.location.href = "/";
  });

  // Clear returnTo flag when landing back on hub
  localStorage.removeItem("returnTo");

  loadAndRender();
  setupInsurance();
});

function loadAndRender() {
  // Chuyên khoa
  try {
    const sp = JSON.parse(localStorage.getItem("selectedSpecialty"));
    if (sp && sp.name) {
      setRow("valSpecialty", sp.name, "checkSpecialty", true);
    }
  } catch (e) {}

  // Doctor / Date / Time
  try {
    const doc = JSON.parse(localStorage.getItem("selectedDoctor"));
    if (doc) {
      if (doc.day) {
        const date = getUpcomingDateByDay(Number(doc.day));
        const dayName = doc.dayName || "";
        setRow(
          "valDate",
          dayName + " - " + formatDdMmYyyy(date),
          "checkDate",
          true,
        );
      }
      if (doc.timeRange) {
        const isMorning =
          doc.session === "morning" ||
          doc.session === "Buổi sáng" ||
          doc.sessionLabel === "Buổi sáng";
        const session = isMorning ? "Buổi sáng" : "Buổi chiều";
        setRow(
          "valTime",
          session + " (" + doc.timeRange + ")",
          "checkTime",
          true,
        );
      }
      if (doc.name) {
        setRow("valDoctor", doc.name, "checkDoctor", true);
      }
    }
  } catch (e) {}

  // Insurance
  try {
    const ins = JSON.parse(localStorage.getItem("bookingInsurance"));
    if (ins && typeof ins === "object") {
      insuranceState = {
        bhyt: ins.bhyt === true ? true : ins.bhyt === false ? false : null,
        bhtn: ins.bhtn === true ? true : ins.bhtn === false ? false : null,
      };
    }
  } catch (e) {}

  // Nếu bhyt chưa được người dùng chọn, tự động set dựa vào ảnh BHYT trong hồ sơ
  if (insuranceState.bhyt === null) {
    try {
      const profile = JSON.parse(localStorage.getItem("selectedProfile"));
      insuranceState.bhyt = !!(profile && profile.baoHiemAnh);
    } catch (e) {
      insuranceState.bhyt = false;
    }
    saveInsurance();
  }

  updateInsuranceUI();
}

function setRow(valId, value, checkId, done) {
  const valEl = document.getElementById(valId);
  const checkEl = document.getElementById(checkId);
  if (valEl) {
    valEl.textContent = value;
    valEl.classList.toggle("empty", !done);
  }
  if (checkEl) {
    checkEl.innerHTML = done ? '<i class="fas fa-check-circle"></i>' : "";
  }
}

function setupInsurance() {
  document.querySelectorAll(".ins-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const ins = btn.dataset.ins;
      const val = btn.dataset.val === "true";
      insuranceState[ins] = val;
      updateInsuranceUI();
      saveInsurance();
    });
  });
}

function updateInsuranceUI() {
  document.querySelectorAll(".ins-btn").forEach((btn) => {
    const ins = btn.dataset.ins;
    const val = btn.dataset.val === "true";
    btn.classList.toggle("active", insuranceState[ins] === val);
  });
}

function saveInsurance() {
  localStorage.setItem("bookingInsurance", JSON.stringify(insuranceState));
  // Sync into selectedDoctor
  try {
    const doc = JSON.parse(localStorage.getItem("selectedDoctor"));
    if (doc) {
      doc.bhyt = insuranceState.bhyt;
      doc.bhtn = insuranceState.bhtn;
      localStorage.setItem("selectedDoctor", JSON.stringify(doc));
    }
  } catch (e) {}
}

function goSelectSpecialty() {
  localStorage.setItem("returnTo", "chon-thong-tin-kham");
  window.location.href = "/html/booking/select-specialty.html";
}

function goSelectDoctor() {
  if (!localStorage.getItem("selectedSpecialty")) {
    alert("Vui lòng chọn chuyên khoa trước");
    return;
  }
  localStorage.setItem("returnTo", "chon-thong-tin-kham");
  window.location.href = "/html/booking/select-doctor.html";
}

function proceedToConfirm() {
  const sp = JSON.parse(localStorage.getItem("selectedSpecialty"));
  const doc = JSON.parse(localStorage.getItem("selectedDoctor"));
  if (!sp) {
    alert("Vui lòng chọn chuyên khoa");
    return;
  }
  if (!doc || !doc.timeRange) {
    alert("Vui lòng chọn bác sĩ và giờ khám");
    return;
  }
  saveInsurance();
  window.location.href = "/html/booking/select-time.html";
}

// ========== DATE HELPERS ==========

function getUpcomingDateByDay(dayNum) {
  // dayNum: 2=Mon, 3=Tue, 4=Wed, 5=Thu, 6=Fri, 7=Sat
  // JS getDay(): 0=Sun,1=Mon,...,6=Sat → convert to our format
  const today = new Date();
  const jsDay = today.getDay(); // 0=Sun
  // our dayNum mapping: Mon=2,Tue=3,...,Sat=7 → jsDay: Mon=1,...,Sat=6
  // ourDay = jsDay === 0 ? 8 : jsDay + 1
  const todayOur = jsDay === 0 ? 8 : jsDay + 1;
  let diff = dayNum - todayOur;
  if (diff <= 0) diff += 7;
  const result = new Date(today);
  result.setDate(today.getDate() + diff);
  return result;
}

function formatDdMmYyyy(date) {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}
