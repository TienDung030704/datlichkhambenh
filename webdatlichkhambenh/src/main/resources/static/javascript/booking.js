document.addEventListener("DOMContentLoaded", function () {

  const btnBack = document.getElementById("btnBack");
  if (btnBack) {
    btnBack.addEventListener("click", function () {
      window.history.back();
    });
  }

  const btnHome = document.getElementById("btnHome");
  if (btnHome) {
    btnHome.addEventListener("click", function () {
      window.location.href = "/";
    });
  }

  const btnAddProfile = document.getElementById("btnAddProfile");
  if (btnAddProfile) {
    btnAddProfile.addEventListener("click", function () {
      window.location.href = "add-profile.html";
    });
  }

});
