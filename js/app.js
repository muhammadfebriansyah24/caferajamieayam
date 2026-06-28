// js/app.js

const WA_ADMIN_NUMBER = "6281234567890"; 
let cart = []; // Array yang akan menyimpan objek pesanan {id, name, price, quantity}

// --- 0. PERBAIKAN 1: LOGIKA HAMBURGER MENU RESPONSIVE ---
function initNavbar() {
    const hamburger = document.getElementById('hamburger-menu');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link'); // link navigasi agar nutup pas diklik

    if (!hamburger || !navMenu) return;

    // Toggle menu saat hamburger diklik
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
    });

    // Menutup menu jika salah satu link diklik di versi mobile
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if(window.innerWidth <= 768) {
                navMenu.classList.remove('active');
            }
        });
    });
}

// --- 1. RENDER MENU & FILTER ---
let isMenuExpanded = false; // State untuk mendeteksi apakah menu sedang terbuka penuh

function renderMenu(data) {
    const container = document.getElementById('menu-container');
    container.innerHTML = ''; 

    // Batasi hanya 6 item yang tampil jika menu belum diperluas
    const maxItems = 6;
    const itemsToShow = isMenuExpanded ? data : data.slice(0, maxItems);

    itemsToShow.forEach(item => {
        const card = document.createElement('div');
        card.className = 'menu-card';
        card.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h3>${item.name}</h3>
            <p>${item.description}</p>
            <p class="price">Rp ${item.price.toLocaleString('id-ID')}</p>
            <button class="btn-add-cart" onclick="addToCart('${item.id}')">Tambah Pesanan</button>
        `;
        container.appendChild(card);
    });

    // Logika menampilkan atau menyembunyikan tombol panah
    const toggleContainer = document.getElementById('toggle-menu-container');
    const toggleBtn = document.getElementById('toggle-menu-btn');
    
    if (toggleContainer && toggleBtn) {
        if (data.length > maxItems) {
            toggleContainer.style.display = 'block';
            // Ubah panah menjadi ke atas jika menu diperluas, dan ke bawah jika ditutup
            toggleBtn.innerHTML = isMenuExpanded ? '&#9650;' : '&#9660;'; 
            
            toggleBtn.onclick = () => {
                isMenuExpanded = !isMenuExpanded; // Balikkan status
                renderMenu(data); // Render ulang layar dengan status terbaru
                
                // Kembalikan posisi scroll sedikit ke atas katalog saat menu ditutup
                if (!isMenuExpanded) {
                    document.getElementById('katalog').scrollIntoView({ behavior: 'smooth' });
                }
            };
        } else {
            toggleContainer.style.display = 'none'; // Sembunyikan tombol jika item <= 6
        }
    }
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            isMenuExpanded = false; // Reset agar kembali ke 6 item saat kategori diubah

            const category = e.target.getAttribute('data-filter');
            if (category === 'all') {
                renderMenu(menuData);
            } else {
                renderMenu(menuData.filter(item => item.category === category));
            }
        });
    });
}

// --- 2. PERBAIKAN 3: LOGIKA KERANJANG BELANJA (DENGAN KUANTITAS) ---
window.addToCart = function(itemId) {
    // Ambil data menu dari database dummy (data.js)
    const menuItem = menuData.find(m => m.id === itemId);
    if(!menuItem) return;

    // Cek apakah item sudah ada di dalam array cart
    const existingItem = cart.find(cartItem => cartItem.id === itemId);

    if (existingItem) {
        existingItem.quantity += 1; // Jika ada, tambah jumlahnya
    } else {
        // Jika belum ada, masukkan sebagai objek baru dengan quantity = 1
        cart.push({
            id: menuItem.id,
            name: menuItem.name,
            price: menuItem.price,
            quantity: 1
        });
    }

    // Hitung total Kuantitas (Jumlah seluruh barang, bukan hanya macamnya)
    const totalItemCount = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cart-count').innerText = totalItemCount;

    alert(`${menuItem.name} berhasil ditambahkan ke pesanan!`);
}

// TAMBAHAN FITUR: Fungsi Global Pengubah Kuantitas & Hapus Item
window.updateQty = function(itemId, delta) {
    const item = cart.find(cartItem => cartItem.id === itemId);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            cart = cart.filter(cartItem => cartItem.id !== itemId);
        }
    }
    // Update badge angka di navbar
    const totalItemCount = cart.reduce((total, i) => total + i.quantity, 0);
    document.getElementById('cart-count').innerText = totalItemCount;
    
    // Perbarui isi modal secara langsung
    if (typeof window.renderCartModal === 'function') {
        window.renderCartModal();
    }
};

window.removeItem = function(itemId) {
    cart = cart.filter(cartItem => cartItem.id !== itemId);
    
    const totalItemCount = cart.reduce((total, i) => total + i.quantity, 0);
    document.getElementById('cart-count').innerText = totalItemCount;
    
    if (typeof window.renderCartModal === 'function') {
        window.renderCartModal();
    }
};

// --- 3. LOGIKA SLIDER GAMBAR OTOMATIS ---
function initSlider() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    const nextBtn = document.querySelector('.next');
    const prevBtn = document.querySelector('.prev');
    let slideIndex = 0;
    let autoSlideInterval;

    function changeSlide(index) {
        slides.forEach(slide => slide.classList.remove('active'));
        slideIndex = (index + slides.length) % slides.length; 
        slides[slideIndex].classList.add('active');
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(() => { slideIndex++; changeSlide(slideIndex); }, 5000); 
    }

    function resetTimer() { clearInterval(autoSlideInterval); startAutoSlide(); }

    nextBtn.addEventListener('click', () => { slideIndex++; changeSlide(slideIndex); resetTimer(); });
    prevBtn.addEventListener('click', () => { slideIndex--; changeSlide(slideIndex); resetTimer(); });

    startAutoSlide(); 
}

// --- 4. PERBAIKAN 3: LOGIKA MODAL POPUP KERANJANG (MENAMPILKAN DETAIL TOTAL) ---
function initCartModal() {
    const cartModal = document.getElementById('cart-modal');
    const cartBtn = document.getElementById('cart-btn');
    const closeCartModal = document.getElementById('close-cart');
    const checkoutWaBtn = document.getElementById('checkout-wa');
    const resetCartBtn = document.getElementById('reset-cart-btn');
    
    // Elemen tujuan render data pesanan
    const detailsContainer = document.getElementById('cart-details-container');
    const totalPriceDisplay = document.getElementById('cart-total-price');

    if (!cartModal || !cartBtn) return;

    // Dijadikan fungsi spesifik agar tombol + dan - bisa memicu perubahan tampilan tanpa menutup modal
    window.renderCartModal = function() {
        if (cart.length === 0) {
            detailsContainer.innerHTML = '<p style="text-align:center; color:#7f8c8d;">Keranjang belanja kosong.</p>';
            totalPriceDisplay.innerText = 'Rp 0';
            checkoutWaBtn.href = "#";
            cartModal.style.display = 'none'; // Menutup modal jika item habis dihapus semua
            return;
        }

        detailsContainer.innerHTML = '';
        let totalKeseluruhan = 0;
        let waPesanText = []; 

        // Render setiap item di dalam keranjang
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            totalKeseluruhan += subtotal;

            // Membangun tampilan visual HTML dalam modal dengan tambahan tombol aksi (+, -, Hapus)
            detailsContainer.innerHTML += `
                <div class="cart-item-row">
                    <div class="cart-item-info">
                        <span class="cart-item-name">${item.name}</span>
                        <span class="cart-item-calc">@ Rp ${item.price.toLocaleString('id-ID')}</span>
                        <div class="cart-item-actions">
                            <button class="qty-btn" onclick="updateQty('${item.id}', -1)">-</button>
                            <span class="qty-display">${item.quantity}</span>
                            <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
                            <button class="remove-btn" onclick="removeItem('${item.id}')">Hapus</button>
                        </div>
                    </div>
                    <div class="cart-item-subtotal">Rp ${subtotal.toLocaleString('id-ID')}</div>
                </div>
            `;

            // Membangun teks untuk API WhatsApp
            waPesanText.push(`- ${item.name} (${item.quantity}x) = Rp ${subtotal.toLocaleString('id-ID')}`);
        });

        // Set teks total harga pada modal
        totalPriceDisplay.innerText = `Rp ${totalKeseluruhan.toLocaleString('id-ID')}`;

        // Format final link WhatsApp
        let templatePesan = `Halo Admin, saya ingin memesan menu berikut:%0A${waPesanText.join('%0A')}%0A%0A*Total Pembayaran:* Rp ${totalKeseluruhan.toLocaleString('id-ID')}%0A%0AMohon diproses ya, terima kasih!`;
        checkoutWaBtn.href = `https://wa.me/${WA_ADMIN_NUMBER}?text=${templatePesan}`;
    };

    cartBtn.addEventListener('click', () => {
        if (cart.length === 0) {
            alert("Keranjang Anda masih kosong. Silakan pilih menu terlebih dahulu!");
            return;
        }
        window.renderCartModal();
        cartModal.style.display = 'flex'; 
    });

    closeCartModal.addEventListener('click', () => { cartModal.style.display = 'none'; });

    // Fungsi Batalkan / Kosongkan Pesanan
    if (resetCartBtn) {
        resetCartBtn.addEventListener('click', () => {
            cart = []; 
            document.getElementById('cart-count').innerText = '0'; 
            cartModal.style.display = 'none'; 
            alert('Pesanan Anda telah berhasil dibatalkan.');
        });
    }
}

// --- 5. PERBAIKAN 2: LOGIKA MODAL DETAIL PROMO & BERITA ---
function initPromoModal() {
    const promoCards = document.querySelectorAll('.promo-card');
    const promoModal = document.getElementById('promo-modal');
    const closePromoModal = document.getElementById('close-promo');

    if (!promoModal || promoCards.length === 0) return;

    promoCards.forEach(card => {
        card.addEventListener('click', () => {
            // Mengambil (scrape) elemen data dari card yang diklik
            const imgSrc = card.querySelector('img').src;
            const badgeClass = card.querySelector('.promo-badge').className; 
            const badgeText = card.querySelector('.promo-badge').innerText;
            const title = card.querySelector('h3').innerText;
            const desc = card.querySelector('p').innerText;
            const date = card.querySelector('.promo-date').innerText;

            // Memasukkannya ke dalam format Modal Promo
            document.getElementById('promo-modal-img').src = imgSrc;
            const modalBadge = document.getElementById('promo-modal-badge');
            modalBadge.className = badgeClass; 
            modalBadge.innerText = badgeText;
            document.getElementById('promo-modal-title').innerText = title;
            document.getElementById('promo-modal-desc').innerText = desc;
            document.getElementById('promo-modal-date').innerText = date;

            promoModal.style.display = 'flex';
        });
    });

    closePromoModal.addEventListener('click', () => { promoModal.style.display = 'none'; });
}

// --- 6. LOGIKA FORM RESERVASI ---
function handleReservation() {
    const form = document.getElementById('form-reservasi');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault(); 
        const name = document.getElementById('res-name').value;
        const date = document.getElementById('res-date').value;
        const pax = document.getElementById('res-pax').value;

        const textMessage = `Halo Admin, saya ingin melakukan reservasi meja.%0A%0A*Nama:* ${name}%0A*Tanggal/Waktu:* ${date}%0A*Jumlah:* ${pax} Orang.%0A%0AMohon konfirmasinya, terima kasih.`;
        window.open(`https://wa.me/${WA_ADMIN_NUMBER}?text=${textMessage}`, '_blank');
    });
}

// Menutup modal apa pun jika pengguna mengklik area hitam di luarnya
window.addEventListener('click', (e) => { 
    const cartModal = document.getElementById('cart-modal');
    const promoModal = document.getElementById('promo-modal');
    if (e.target === cartModal) cartModal.style.display = 'none'; 
    if (e.target === promoModal) promoModal.style.display = 'none'; 
});

// --- INISIALISASI SAAT HALAMAN DIMUAT ---
document.addEventListener('DOMContentLoaded', () => {
    initNavbar(); // inisialisasi hamburger navbar
    
    if (typeof menuData !== 'undefined') {
        renderMenu(menuData); 
        setupFilters(); 
    }
    
    initSlider();       
    initCartModal();
    initPromoModal(); // inisialisasi klik pada promo
    handleReservation(); 
});