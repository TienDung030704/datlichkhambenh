document.getElementById("btnSave").addEventListener("click", function () {

  const lastname = document.getElementById("lastname").value.trim();
  const firstname = document.getElementById("firstname").value.trim();
  const birthday = document.getElementById("birthday").value;
  const ethnic = document.getElementById("ethnic").value;
  const job = document.getElementById("job").value;
  const phone = document.getElementById("phone").value.trim();
  const address = document.getElementById("address").value.trim();

  const gender = document.querySelector('input[name="gender"]:checked')?.value;

  if (!lastname || !firstname || !birthday || !gender || !ethnic || !job || !phone || !address) {
    alert("Vui lòng nhập đầy đủ thông tin!");
    return;
  }

  const newProfile = {
    id: Date.now(),
    lastname,
    firstname,
    fullname: lastname + " " + firstname,
    birthday,
    gender,
    ethnic,
    job,
    phone,
    address
  };

  let profiles = JSON.parse(localStorage.getItem("profiles")) || [];
  profiles.push(newProfile);
  localStorage.setItem("profiles", JSON.stringify(profiles));

  alert("Tạo hồ sơ bệnh nhân thành công!");
  window.location.href = "booking.html";
});
