// ===========================
// SELECT DOCTOR LOGIC
// ===========================

let selectedSpecialty = null;
let selectedDoctor = null;
let selectedDay = null;
let doctorsByDay = {};

const dayNames = {
    2: 'Thứ 2',
    3: 'Thứ 3',
    4: 'Thứ 4',
    5: 'Thứ 5',
    6: 'Thứ 6',
    7: 'Thứ 7'
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
    loadSelectedSpecialty();
    loadDoctorsByDay();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const btnBack = document.getElementById('btnBack');
    const btnHome = document.getElementById('btnHome');

    if (btnBack) btnBack.addEventListener('click', goBack);
    if (btnHome) btnHome.addEventListener('click', goHome);
}

// Load selected specialty
function loadSelectedSpecialty() {

    const selected = localStorage.getItem('selectedSpecialty');

    if (!selected) {
        alert('Vui lòng chọn chuyên khoa trước');
        goBack();
        return;
    }

    try {

        selectedSpecialty = JSON.parse(selected);

        const el = document.getElementById('specialtyName');

        if (el) el.textContent = selectedSpecialty.name;

    } catch (e) {

        console.error('Error loading specialty', e);
        goBack();

    }
}

// Load doctors from API
function loadDoctorsByDay() {

    if (!selectedSpecialty) return;

    const url = `/api/specialties/${selectedSpecialty.id}/doctors-by-days`;

    fetch(url)

        .then(res => {

            if (!res.ok) throw new Error("API error");

            return res.json();

        })

        .then(data => {

            if (data.success && data.doctors_by_day) {

                doctorsByDay = data.doctors_by_day;

                displayDayTabs();

                selectFirstDay();

            } else {

                showError("Không thể tải danh sách bác sĩ");

            }

        })

        .catch(err => {

            console.error(err);

            showError("Lỗi tải bác sĩ");

        });
}

// Render day tabs
function displayDayTabs() {

    const container = document.getElementById('daysTabs');

    if (!container) return;

    let html = "";

    [2, 3, 4, 5, 6, 7].forEach(day => {

        const name = dayNames[day];

        const doctors = doctorsByDay[name] || [];

        const disabled = doctors.length === 0;

        html += `
        <button 
            class="day-tab ${disabled ? 'disabled' : ''}" 
            data-day="${day}"
            onclick="selectDay(${day})"
            ${disabled ? 'disabled' : ''}
        >
            ${name}
            <span style="font-size:11px;opacity:.7">(${doctors.length})</span>
        </button>
        `;

    });

    container.innerHTML = html;
}

// Auto select first available day
function selectFirstDay() {

    for (let d of [2, 3, 4, 5, 6, 7]) {

        const name = dayNames[d];

        if (doctorsByDay[name] && doctorsByDay[name].length > 0) {

            selectDay(d);

            return;

        }
    }
}

// When selecting day
function selectDay(dayNum) {

    selectedDay = dayNum;

    const dayName = dayNames[dayNum];

    document.querySelectorAll('.day-tab').forEach(tab => {

        if (parseInt(tab.dataset.day) === dayNum)

            tab.classList.add('active');

        else

            tab.classList.remove('active');

    });

    displayDoctors(doctorsByDay[dayName] || []);

    document.getElementById('selectedInfo').style.display = 'none';

    selectedDoctor = null;
}

// Render doctors
function displayDoctors(doctors) {

    const container = document.getElementById('doctorsList');

    if (!container) return;

    if (doctors.length === 0) {

        container.innerHTML = `<div class="empty-message">Không có bác sĩ</div>`;

        return;
    }

    let html = "";

    doctors.forEach(doctor => {

        const name = doctor.fullName || "";

        const initials = getInitials(name);

        const rating = Math.floor(Math.random() * 2) + 4;

        const stars = renderStars(rating);

        html += `
        <div 
            class="doctor-card"
            data-doctor-id="${doctor.id}"
            data-doctor-name="${name}"
            onclick="selectDoctor(${doctor.id})"
        >

            <div class="doctor-avatar">${initials}</div>

            <div class="doctor-name">${name}</div>

            <div class="doctor-experience">${doctor.experience || 5} năm</div>

            <div class="doctor-rating">${stars}</div>

        </div>
        `;
    });

    container.innerHTML = html;
}

// Get initials
function getInitials(name) {

    if (!name) return "?";

    const parts = name.trim().split(" ");

    if (parts.length === 1) return parts[0][0].toUpperCase();

    return (
        parts[parts.length - 2][0] +
        parts[parts.length - 1][0]
    ).toUpperCase();
}

// Render stars
function renderStars(r) {

    let html = "";

    for (let i = 1; i <= 5; i++) {

        html += `<span class="star ${i <= r ? '' : 'empty'}">★</span>`;
    }

    return html;
}

// Select doctor
function selectDoctor(doctorId) {

    const card = document.querySelector(`.doctor-card[data-doctor-id="${doctorId}"]`);

    const doctorName = card.getAttribute("data-doctor-name");

    selectedDoctor = {

        id: doctorId,
        name: doctorName,
        day: selectedDay

    };

    document.querySelectorAll(".doctor-card").forEach(c => c.classList.remove("selected"));

    card.classList.add("selected");

    document.getElementById("selectedSpecialtyName").textContent = selectedSpecialty.name;

    document.getElementById("selectedDoctorName").textContent = doctorName;

    document.getElementById("selectedDay").textContent = dayNames[selectedDay];

    const info = document.getElementById("selectedInfo");

    info.style.display = "block";

    localStorage.setItem("selectedDoctor", JSON.stringify({

        id: doctorId,
        name: doctorName,
        day: selectedDay,
        dayName: dayNames[selectedDay]

    }));
}

// Next step
function proceedToNextStep() {

    if (!selectedDoctor) {

        alert("Vui lòng chọn bác sĩ");

        return;
    }

    window.location.href = "/html/booking/select-time.html";
}

// Error UI
function showError(msg) {

    const el = document.getElementById("doctorsList");

    if (el)

        el.innerHTML = `<div class="error-message">${msg}</div>`;
}

// Navigation
function goBack() {

    window.location.href = "/html/booking/select-specialty.html";
}

function goHome() {

    window.location.href = "/index.html";
}

// Global error log
window.addEventListener("error", function (e) {

    console.error("Global error:", e.error);

});