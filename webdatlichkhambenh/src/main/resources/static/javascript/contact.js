document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const notification = document.getElementById('notification');

    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Disable button
            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = 'Đang gửi...';
            
            // Hide previous notification
            notification.className = 'notification';
            notification.style.display = 'none';

            // Get form data using FormData
            const formData = new FormData();
            formData.append('fullName', document.getElementById('fullName').value);
            formData.append('email', document.getElementById('email').value);
            formData.append('phoneNumber', document.getElementById('phoneNumber').value);
            formData.append('subject', document.getElementById('subject').value);
            formData.append('message', document.getElementById('message').value);
            
            const imageFile = document.getElementById('image').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    // Headers are automatically set for FormData (multipart/form-data)
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    showNotification('success', data.message);
                    contactForm.reset();
                } else {
                    showNotification('error', data.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('error', 'Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.');
            } finally {
                // Re-enable button
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        });
    }

    function showNotification(type, message) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.style.display = 'block';
        
        // Auto hide after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                notification.style.display = 'none';
            }, 5000);
        }
    }
});
