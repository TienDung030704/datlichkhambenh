document.addEventListener("DOMContentLoaded", function () {

  const btnSave = document.getElementById("btnSave");
  if (!btnSave) {
    console.error("Không tìm thấy nút btnSave");
    return;
  }

  btnSave.addEventListener("click", function (e) {
    e.preventDefault();

    // === Lấy input ===
    const lastnameEl = document.getElementById("lastname");
    const firstnameEl = document.getElementById("firstname");
    const emailEl = document.getElementById("email");
    const addressEl = document.getElementById("fullAddress");

    if (!lastnameEl || !firstnameEl || !emailEl || !addressEl) {
      alert("Thiếu input trong form (check lại id HTML)");
      return;
    }

    const lastname = lastnameEl.value.trim();
    const firstname = firstnameEl.value.trim();
    const email = emailEl.value.trim();
    const address = addressEl.value.trim();

    const genderEl = document.querySelector('input[name="gender"]:checked');
    const gender = genderEl ? genderEl.value : "";

    // === Validate ===
    if (!lastname || !firstname || !gender) {
      alert("Vui lòng nhập đầy đủ Họ, Tên và Giới tính");
      return;
    }

    // === Tạo hồ sơ mới ===
    const newProfile = {
      id: Date.now(),
      fullName: `${lastname} ${firstname}`,
      gender,
      email,
      address
    };

    // === Lưu localStorage ===
    const profiles = JSON.parse(localStorage.getItem("profiles")) || [];
    profiles.push(newProfile);

    localStorage.setItem("profiles", JSON.stringify(profiles));

    // Lưu ID hồ sơ vừa tạo (để trang đặt lịch auto chọn)
    localStorage.setItem("selectedProfile", JSON.stringify(newProfile));

    // === Quay về trang đặt lịch ===
    window.location.href = "book-appointment.html";
  });

});
