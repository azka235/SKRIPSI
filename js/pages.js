// Halaman beranda (home)
function renderHome() {
    const container = document.createElement('div');
    container.className = 'container';
    const section = document.createElement('div');
    section.className = 'section';
    section.innerHTML = `
        <h2 style="text-align: center; margin-bottom: 1.5rem;">Selamat Datang di Sistem Enkripsi Data Kependudukan</h2>
        <p style="text-align: justify; margin-bottom: 1rem;">
            Aplikasi ini dirancang untuk memberikan lapisan keamanan tambahan bagi data identitas kependudukan Anda. Dengan menggunakan kombinasi metode enkripsi Caesar Cipher dan AES (Advanced Encryption Standard), kami memastikan bahwa informasi sensitif Anda terlindungi dari akses yang tidak sah.
        </p>
        <p style="text-align: justify; margin-bottom: 1rem;">
            Proses enkripsi mengubah data pribadi Anda seperti nama, NIK, dan alamat menjadi format acak yang tidak dapat dibaca. Ini adalah langkah penting untuk menjaga privasi dan keamanan data di era digital.
        </p>
        <p style="margin-top: 2rem; text-align: center; font-weight: bold;">
            Silakan gunakan menu navigasi di atas untuk mulai melakukan enkripsi atau dekripsi data Anda.
        </p>
    `;
    container.appendChild(section);
    document.getElementById('mainContent').appendChild(container);
}

export { renderHome }; 