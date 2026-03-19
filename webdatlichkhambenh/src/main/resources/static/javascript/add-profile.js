document.addEventListener("DOMContentLoaded", function () {
  const btnSave = document.getElementById("btnSave");
  if (!btnSave) {
    console.error("Không tìm thấy nút btnSave");
    return;
  }

  btnSave.addEventListener("click", async function (e) {
    e.preventDefault();

    // === Lấy input ===
    const lastnameEl = document.getElementById("lastname");
    const firstnameEl = document.getElementById("firstname");
    const emailEl = document.getElementById("email");
    const addressEl = document.getElementById("fullAddress");
    const phoneEl = document.getElementById("phone");
    const birthdayEl = document.getElementById("birthday");
    const cccdEl = document.getElementById("cccd");

    if (
      !lastnameEl ||
      !firstnameEl ||
      !emailEl ||
      !addressEl ||
      !phoneEl ||
      !birthdayEl ||
      !cccdEl
    ) {
      alert("Thiếu input trong form (check lại id HTML)");
      return;
    }

    const lastname = lastnameEl.value.trim();
    const firstname = firstnameEl.value.trim();
    const email = emailEl.value.trim();
    const address = addressEl.value.trim();
    const phone = phoneEl.value.trim();
    const birthday = normalizeBirthday(birthdayEl.value.trim());
    const cccd = cccdEl.value.trim();

    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender = genderEl ? genderEl.value : "";

    // === Validate ===
    if (!lastname || !firstname || !gender || !phone) {
      alert("Vui lòng nhập đầy đủ Họ, Tên, Giới tính và Số điện thoại");
      return;
    }

    const hoTen = `${lastname} ${firstname}`;

    // === Lưu vào DB qua API ===
    const authManager = new AuthManager();
    try {
      btnSave.disabled = true;
      btnSave.textContent = "Đang lưu...";

      const response = await authManager.authenticatedFetch("/api/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hoTen,
          ngaySinh: birthday || null,
          gioiTinh: gender,
          soDienThoai: phone || null,
          diaChi: address || null,
          baoHiem: null,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Lưu vào localStorage để booking.js dùng được ngay
        const newProfile = {
          id: result.id,
          fullName: hoTen,
          gender,
          email,
          address,
          phone,
          birthDate: birthday,
          cccd,
          isAccountProfile: false,
          fromDB: true,
        };
        saveProfile(newProfile);
        localStorage.setItem("selectedProfile", JSON.stringify(newProfile));
        window.location.href = "book-appointment.html";
      } else {
        alert(result.message || "Không thể lưu hồ sơ. Vui lòng thử lại.");
      }
    } catch (error) {
      console.error("Lỗi lưu hồ sơ:", error);
      // Fallback: lưu localStorage nếu API lỗi
      const newProfile = {
        id: Date.now(),
        fullName: hoTen,
        gender,
        email,
        address,
        phone,
        birthDate: birthday,
        cccd,
        isAccountProfile: false,
      };
      saveProfile(newProfile);
      localStorage.setItem("selectedProfile", JSON.stringify(newProfile));
      window.location.href = "book-appointment.html";
    } finally {
      btnSave.disabled = false;
      btnSave.textContent = "Lưu hồ sơ";
    }
  });
});

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

function getProfileStorageKey() {
  const currentUser = getCurrentUser();
  return currentUser?.username
    ? `profiles:${currentUser.username}`
    : "profiles";
}

function saveProfile(profile) {
  const profiles =
    JSON.parse(localStorage.getItem(getProfileStorageKey())) || [];
  const filteredProfiles = profiles.filter(
    (item) => item.email !== profile.email,
  );
  filteredProfiles.unshift(profile);
  localStorage.setItem(
    getProfileStorageKey(),
    JSON.stringify(filteredProfiles),
  );
}

function normalizeBirthday(input) {
  if (!input) {
    return "";
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return input;
  }

  const parts = input.split("/");
  if (parts.length !== 3) {
    return "";
  }

  const [day, month, year] = parts;
  if (!day || !month || !year) {
    return "";
  }

  return `${year.padStart(4, "0")}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
