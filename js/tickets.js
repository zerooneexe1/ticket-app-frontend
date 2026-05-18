const API_URL = 'https://ticket-app-backend-production-c69a.up.railway.app/api';

// Load semua tiket yang tersedia
export async function loadTickets(containerId, limit_count = null) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
        container.innerHTML = '<div class="loading"><p style="margin-bottom: 3vh;">Memuat tiket...</p></div>';
        
        // Panggil API backend Node.js
        const response = await fetch(`${API_URL}/tickets`);
        let tickets = await response.json();
        
        if (!response.ok) {
            throw new Error(tickets.message || 'Gagal mengambil tiket');
        }
        
        // Fitur limit untuk di halaman home (preview)
        if (limit_count && tickets.length > limit_count) {
            tickets = tickets.slice(0, limit_count);
        }
        
        if (tickets.length === 0) {
            container.innerHTML = '<p class="no-tickets">Belum ada tiket tersedia</p>';
            return;
        }
        
        container.innerHTML = '';
        tickets.forEach((ticket) => {
            container.appendChild(createTicketCard(ticket));
        });
    } catch (error) {
        console.error("Error loading tickets:", error);
        container.innerHTML = '<p class="error">Gagal memuat tiket</p>';
    }
}

// Membuat elemen HTML untuk setiap tiket
function createTicketCard(ticket) {
    const card = document.createElement('div');
    const dateFor = new Date(ticket.event_date);
    const dateFormatted = dateFor.toLocaleDateString('id-ID', { 
        day: 'numeric', month: 'short', year: 'numeric'
    });

    card.className = 'event-card';
    
    card.innerHTML = `
        <div class="event-image">
            <img src="${ticket.image || 'https://via.placeholder.com/300x200'}" alt="${ticket.name}">
        </div>
        <div class="event-info">
            <h3>${ticket.name}</h3>
            <div class="price">Rp ${ticket.price.toLocaleString('id-ID')}</div>
            <div class="quantity">Sisa: ${ticket.quantity} tiket</div>
            <div class="location">Lokasi: ${ticket.location}</div>
            <div class="date">Tanggal: ${dateFormatted}</div>
            <p class="description">${ticket.description || ''}</p>
            <button class="btn-beli" data-id="${ticket.id}"><i class="fa-solid fa-cart-shopping"></i> Beli Tiket</button>
        </div>
    `;
    
    card.querySelector('.btn-beli').addEventListener('click', () => buyTicket(ticket));
    
    return card;
}

// Fungsi untuk memproses tombol beli
async function buyTicket(ticket) {
    const token = localStorage.getItem('ticketAppToken');
    const userStr = localStorage.getItem('ticketAppUser');

    // Logika cek ketersediaan tiket dan memastikan user login
    if (ticket.quantity <= 0) {
        window.showToast('Maaf, tiket sudah habis!', 'error');
        return;
    }

    if (!token || !userStr) {
        window.showToast('Silakan login terlebih dahulu untuk membeli tiket!', 'error');
        setTimeout(() => {
            window.location.href = './login.html';}, 4000
        );
        return;
    }
       
    const user = JSON.parse(userStr);

    try {
        // Tembak API Node.js untuk membuat pesanan
        const response = await fetch(`${API_URL}/payments/create`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({
                userId: user.id,
                ticketId: ticket.id
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        // Jika sukses, lempar user ke halaman pembayaran membawa ID payment
        window.location.href = `./payment.html?id=${data.paymentCode}`;
        
    } catch (error) {
        window.showToast('Gagal memproses tiket: ' + error.message, 'error');
        console.error(error);
    }
}

// Ganti fungsi dummy completePayment dengan kode ini
export async function completePayment(paymentCode) {
    try {
        // Kita panggil endpoint backend untuk mengecek status pembayaran terbaru
        const response = await fetch(`${API_URL}/payments/${paymentCode}`);
        
        if (!response.ok) {
            throw new Error('Gagal mengambil data status pembayaran');
        }

        const data = await response.json();
        
        /**
         * 'data' berisi objek payment dari database.
         * Kita cek apakah statusnya sudah 'completed' (diupdate oleh Webhook)
         */
        if (data.status === 'completed') {
            return {
                success: true,
                message: "Pembayaran telah terverifikasi!",
                data: data
            };
        } else {
            return {
                success: false,
                message: "Pembayaran masih diproses atau belum selesai.",
                status: data.status
            };
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return {
            success: false,
            message: "Terjadi kesalahan koneksi saat verifikasi."
        };
    }
}
// Tambahkan/sesuaikan fungsi ini di public/js/tickets.js

export async function getTicketByCode(code) {
    try {
        // Panggil endpoint baru dari tabel tickets_sold
        const response = await fetch(`${API_URL}/tickets/sold/${code}`);
        if (!response.ok) {
            return null; 
        }
        
        const data = await response.json();
        
        return {
            ticketCode: data.ticket_code, // Ini sekarang TIX-XXXXXX
            ticketName: data.ticket_name,
            userEmail: data.user_name || data.user_email,
            price: data.price,
            createdAt: data.created_at,
            expiresAt: data.expires_at,
            status: data.ticket_status // 'active', 'used', dll
        };
    } catch (error) {
        console.error("Error fetching ticket:", error);
        return null;
    }
}
