// ===========================
// SPECIALTY SELECTION LOGIC
// ===========================

let selectedSpecialtyId = null;
let selectedSpecialty = null;


// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadProfileInfo();
    loadSpecialties();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    const btnBack = document.getElementById('btnBack');
    const btnHome = document.getElementById('btnHome');
    
    if (btnBack) {
        btnBack.addEventListener('click', goBack);
    }
    
    if (btnHome) {
        btnHome.addEventListener('click', goHome);
    }
}

// Load profile info from localStorage
function loadProfileInfo() {
    // Profile info loading removed as selected profile section is hidden
}

// Load specialties from API
function loadSpecialties() {
    const specialtyListElement = document.getElementById('specialtyList');
    
    if (!specialtyListElement) {
        console.error('Specialty list element not found');
        return;
    }

    fetch('/api/specialties')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.success && data.data) {
                displaySpecialties(data.data);
            } else {
                specialtyListElement.innerHTML = '<div class="error-message">Không thể tải danh sách chuyên khoa</div>';
            }
        })
        .catch(error => {
            console.error('Error loading specialties:', error);
            specialtyListElement.innerHTML = '<div class="error-message">Lỗi khi tải danh sách chuyên khoa</div>';
        });
}

// Display specialties
function displaySpecialties(specialties) {
    const specialtyListElement = document.getElementById('specialtyList');
    
    if (specialties.length === 0) {
        specialtyListElement.innerHTML = '<div class="empty-message">Không có chuyên khoa nào</div>';
        return;
    }

    let html = '';
    specialties.forEach((specialty, index) => {
        const doctorCount = specialty.doctorCount || specialty.totalDoctors || 10;
        
        html += `
            <div class="specialty-item" data-specialty-id="${specialty.id}" onclick="selectSpecialty(${specialty.id}, '${specialty.name}', ${doctorCount})">
                <div class="specialty-info">
                    <div class="specialty-name">${specialty.name}</div>
                </div>
                <div class="specialty-info-btn" data-specialty-id="${specialty.id}" title="Thông tin chuyên khoa" onclick="event.stopPropagation(); showSpecialtyInfo(${specialty.id}, '${specialty.name}', ${doctorCount})">
                    <strong>i</strong>
                </div>
                <span class="specialty-arrow">→</span>
            </div>
        `;
    });

    specialtyListElement.innerHTML = html;
}

// Show specialty info
function showSpecialtyInfo(specialtyId, specialtyName, doctorCount) {
    alert(`Chuyên khoa: ${specialtyName}\nSố bác sĩ: ${doctorCount}`);
}

// Select specialty
function selectSpecialty(specialtyId, specialtyName, doctorCount) {
    selectedSpecialtyId = specialtyId;
    selectedSpecialty = {
        id: specialtyId,
        name: specialtyName,
        doctorCount: doctorCount
    };

    // Update UI
    const specialtyItems = document.querySelectorAll('.specialty-item');
    specialtyItems.forEach(item => {
        item.classList.remove('selected');
    });

    const selectedItem = document.querySelector(`.specialty-item[data-specialty-id="${specialtyId}"]`);
    if (selectedItem) {
        selectedItem.classList.add('selected');
    }

    // Show selected info
    const selectedInfoElement = document.getElementById('selectedInfo');
    if (selectedInfoElement) {
        document.getElementById('selectedSpecialtyName').textContent = specialtyName;
        document.getElementById('selectedDoctorCount').textContent = doctorCount;
        selectedInfoElement.style.display = 'block';
        // Scroll to selected info
        setTimeout(() => {
            selectedInfoElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }

    // Save to localStorage
    localStorage.setItem('selectedSpecialty', JSON.stringify({
        id: specialtyId,
        name: specialtyName,
        doctorCount: doctorCount
    }));

    console.log('Selected specialty:', selectedSpecialty);
}

// Proceed to next step
function proceedToNextStep() {
    if (!selectedSpecialtyId) {
        alert('Vui lòng chọn chuyên khoa');
        return;
    }

    // Navigate to select doctors/days
    window.location.href = '/html/booking/select-doctor.html';
}

// Go back
function goBack() {
    window.location.href = '/html/booking/patient-profile.html';
}

// Go home
function goHome() {
    window.location.href = '/index.html';
}

// Error handling
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
});
