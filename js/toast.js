// Buat wadah toast saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById('toast-container')) {
        const container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
});

// Fungsi Toast Standar
window.showToast = function(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    let iconHtml = '';
    let progressColor = '#3498db'; 
    if (type === 'success') {
        iconHtml = '<i class="fa-thin fa-check-circle toast-icon success"></i>';
        progressColor = '#2ecc71';
    } else if (type === 'error') {
        iconHtml = '<i class="fa-thin fa-exclamation-circle toast-icon error"></i>';
        progressColor = '#e74c3c';
    }

    toast.innerHTML = `
        <div class="toast-content">
            ${iconHtml}
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-progress">
            <div class="toast-progress-bar" style="background: ${progressColor}; animation-duration: ${duration}ms;"></div>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    }, duration+100);
};

// Fungsi Toast Konfirmasi
window.showConfirmToast = function(message, onConfirm) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    toast.innerHTML = `
        <div class="toast-content">
            <i class="fa-thin fa-question-circle toast-icon confirm"></i>
            <div class="toast-message">${message}</div>
        </div>
        <div class="toast-actions">
            <button class="toast-btn no">Batal</button>
            <button class="toast-btn yes">Ya, Lanjutkan</button>
        </div>
        <div class="toast-progress">
            <div class="toast-progress-bar" style="background: #f39c12; animation-duration: 8000ms;"></div>
        </div>
    `;

    container.appendChild(toast);

    let isAnswered = false;
    const closeToast = () => {
        if (isAnswered) return;
        isAnswered = true;
        toast.classList.add('fade-out');
        toast.addEventListener('animationend', () => toast.remove());
    };

    toast.querySelector('.yes').addEventListener('click', () => {
        closeToast();
        onConfirm();
    });

    toast.querySelector('.no').addEventListener('click', closeToast);
    setTimeout(closeToast, 8000);
};