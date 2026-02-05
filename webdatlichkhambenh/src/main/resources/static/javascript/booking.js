document.addEventListener("DOMContentLoaded", function () {

  // ===== NAV =====
  const btnBack = document.getElementById("btnBack");
  btnBack?.addEventListener("click", () => history.back());

  const btnHome = document.getElementById("btnHome");
  btnHome?.addEventListener("click", () => window.location.href = "/");

  const btnAddProfile = document.getElementById("btnAddProfile");
  btnAddProfile?.addEventListener("click", () => {
    window.location.href = "add-profile.html";
  });

  // ===== LOAD PROFILES =====
  renderProfiles();
});

/* ========================= */

function renderProfiles() {
  const profileList = document.getElementById("profileList");
  if (!profileList) return;

  const profiles = JSON.parse(localStorage.getItem("profiles")) || [];
  const selectedProfile = JSON.parse(localStorage.getItem("selectedProfile"));

  profileList.innerHTML = "";

  profiles.forEach(profile => {
    const div = document.createElement("div");
    div.className = "profile-item";

    if (selectedProfile && profile.id === selectedProfile.id) {
      div.classList.add("active");
    }

    div.innerHTML = `
      <div class="avatar">
        <i class="fas fa-user"></i>
      </div>
      <p>${profile.fullname}</p>
    `;

    div.addEventListener("click", () => {
      document
        .querySelectorAll(".profile-item")
        .forEach(el => el.classList.remove("active"));

      div.classList.add("active");
      localStorage.setItem("selectedProfile", JSON.stringify(profile));
    });

    profileList.appendChild(div);
  });
}
