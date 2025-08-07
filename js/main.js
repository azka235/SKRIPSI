import { handleLogin, handleLogout, checkLoginStatus } from './auth.js';
import { renderEnkripsi } from './enkripsi.js';
import { renderDekripsi } from './dekripsi.js';
import { renderHome } from './pages.js';
import { renderDataEnkripsi } from './dataEnkripsi.js';
import './surat.js';

// Kosongkan halaman sebelum muat ulang
function clearBody() {
    const mainContent = document.getElementById('mainContent');
    mainContent.innerHTML = '';
}

// Tampilkan navigasi dan judul utama
function renderHeader() {
    const header = document.createElement('header');
    header.style.position = 'relative';
    header.innerHTML = `
        <button onclick="window.handleLogout()" class="logout-btn">Logout</button>
        <h1>Sistem Proteksi & Administrasi Data Kelurahan (SPARTA)</h1>
        <nav>
            <ul>
                <li><a href="#home">Beranda</a></li>
                <li><a href="#enkripsi">Enkripsi</a></li>
                <li><a href="#dekripsi">Dekripsi</a></li>
                <li><a href="#data-enkripsi">Data Enkripsi</a></li>
            </ul>
        </nav>
    `;
    document.getElementById('mainContent').appendChild(header);
}

// Fungsi router untuk memuat halaman berdasarkan URL hash
function router() {
    const mainContent = document.getElementById('mainContent');
    const currentContent = mainContent.querySelector('.container');
    if (currentContent) {
        currentContent.remove();
    }

    // Ambil hash tanpa parameter
    const hash = window.location.hash.slice(1);
    const page = hash.split('?')[0].split('&')[0] || 'home';

    switch (page) {
        case 'enkripsi':
            renderEnkripsi();
            break;
        case 'dekripsi':
            renderDekripsi();
            break;
        case 'data-enkripsi':
            renderDataEnkripsi();
            break;
        default:
            renderHome();
            break;
    }
}

// Inisialisasi aplikasi
function init() {
    clearBody();
    renderHeader();
    router();
}

// Expose functions to window object for HTML access
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.init = init;
window.clearBody = clearBody;

// Event listeners
window.addEventListener('load', checkLoginStatus);
window.addEventListener('hashchange', router);

export { init, clearBody }; 