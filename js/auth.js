const API_URL = 'https://ticket-app-backend-production-63b5.up.railway.app/api/auth';

// Login dengan API Node.js
export async function loginWithEmail(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message);
        }
        
        // Simpan token sesi (JWT) di localStorage browser
        localStorage.setItem('ticketAppToken', data.token);
        localStorage.setItem('ticketAppUser', JSON.stringify(data.user));
        
        window.showToast("Berhasil masuk!", "success");
        setTimeout(() => {
            window.location.href = './';
        }, 3000);
    } catch (error) {
        window.showToast(error.message, "error");
    }
}

// Register dengan API Node.js (Akun Langsung Aktif)
export async function registerWithEmail(email, password, name) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message);
        }

        window.showToast(data.message, "success");
        return true; // Register sukses, akun langsung aktif!
    } catch (error) {
        window.showToast(error.message, "error");
        return false;
    }
}

// Fungsi Logout
export function logout() {
    // Hapus token dari memory browser
    localStorage.removeItem('ticketAppToken');
    localStorage.removeItem('ticketAppUser');
    window.location.href = './';
}

// Cek status login
export function initAuth(callback) {
    const token = localStorage.getItem('ticketAppToken');
    const userStr = localStorage.getItem('ticketAppUser');

    if (token && userStr) {
        const userData = JSON.parse(userStr);
        const isAdmin = userData.role === 'admin'; 
        
        callback({ user: userData, userData: userData, isAdmin: isAdmin });
    } else {
        callback(null);
    }
}
