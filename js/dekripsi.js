// ========================================
// BAGIAN 1: KODE PROSES DEKRIPSI
// ========================================

import { secretKey, decryptAES, caesarCipher } from './enkripsi.js';
import { templateSuratDomisili, templateSuratTidakMampu, templateSuratUsaha, templateSuratKelakuanBaik, templateSuratBelumMenikah } from './surat.js';

// Fungsi untuk mendekripsi Caesar Cipher (reverse dari enkripsi)
function decryptCaesar(text, shift) {
    // Dekripsi Caesar adalah enkripsi dengan shift negatif
    return caesarCipher(text, 26 - (shift % 26));
}

function getIdFromHash() {
    const hash = window.location.hash;
    const match = hash.match(/id=(\d+)/);
    return match ? match[1] : null;
}

// ========================================
// BAGIAN 2: KODE HALAMAN DEKRIPSI
// ========================================

// Halaman Dekripsi
async function renderDekripsi() {
    // Preload library PDF di awal untuk memastikan siap
    if (!document.getElementById('jspdf-cdn')) {
        const script = document.createElement('script');
        script.id = 'jspdf-cdn';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
        document.head.appendChild(script);
    }
    if (!document.getElementById('html2canvas-cdn')) {
        const script = document.createElement('script');
        script.id = 'html2canvas-cdn';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
        document.head.appendChild(script);
    }

    const container = document.createElement('div');
    container.className = 'container';
    const section = document.createElement('div');
    section.className = 'section';

    // Ambil data dari backend
    let dataList = [];
    try {
        const res = await fetch('http://localhost:3005/api/penduduk');
        dataList = await res.json();
    } catch (e) {
        section.innerHTML = '<div style="color:red;">Gagal mengambil data dari server</div>';
        container.appendChild(section);
        document.getElementById('mainContent').appendChild(container);
        return;
    }

    // Proses dekripsi data
    const decryptedList = dataList.map(data => {
        const decrypted = {};
        try {
            decrypted.id = data.id;
            decrypted.nama = decryptCaesar(decryptAES(data.nama_encrypted, secretKey), 3);
            decrypted.nik = decryptCaesar(decryptAES(data.nik_encrypted, secretKey), 3);
            decrypted.alamat = decryptCaesar(decryptAES(data.alamat_encrypted, secretKey), 3);
            decrypted.rt_rw = decryptCaesar(decryptAES(data.rt_rw_encrypted, secretKey), 3);
            decrypted.kel_desa = decryptCaesar(decryptAES(data.kel_desa_encrypted, secretKey), 3);
            decrypted.kecamatan = decryptCaesar(decryptAES(data.kecamatan_encrypted, secretKey), 3);
            decrypted.tempatLahir = decryptCaesar(decryptAES(data.tempat_lahir_encrypted, secretKey), 3);
            decrypted.tanggalLahir = decryptCaesar(decryptAES(data.tanggal_lahir_encrypted, secretKey), 3);
            decrypted.golonganDarah = decryptCaesar(decryptAES(data.golongan_darah_encrypted, secretKey), 3);
            decrypted.jenisKelamin = decryptCaesar(decryptAES(data.jenis_kelamin_encrypted, secretKey), 3);
            decrypted.agama = decryptCaesar(decryptAES(data.agama_encrypted, secretKey), 3);
            decrypted.statusPerkawinan = decryptCaesar(decryptAES(data.status_perkawinan_encrypted, secretKey), 3);
            decrypted.pekerjaan = decryptCaesar(decryptAES(data.pekerjaan_encrypted, secretKey), 3);
            decrypted.kewarganegaraan = decryptCaesar(decryptAES(data.kewarganegaraan_encrypted, secretKey), 3);
            decrypted.status = data.status || 'Belum Didekripsi';
            decrypted.jenisSurat = data.jenis_surat || '';
        } catch (e) {}
        return decrypted;
    });

    // Filter hanya data yang sudah didekripsi
    const decryptedOnlyList = decryptedList.filter(data => data.status === 'Sudah Didekripsi');

    // Filter berdasarkan search (nama atau NIK)
    let searchName = sessionStorage.getItem('searchNameDekrip') || '';
    const filteredList = searchName ? decryptedOnlyList.filter(data => {
        const searchLower = searchName.toLowerCase();
        const namaMatch = data.nama && data.nama.toLowerCase().includes(searchLower);
        const nikMatch = data.nik && data.nik.toLowerCase().includes(searchLower);
        return namaMatch || nikMatch;
    }) : decryptedOnlyList;

    // Tampilkan hasil dekripsi dalam format tabel
    section.innerHTML = `
        <h2 style="margin-bottom:0.3rem;">Tabel Hasil Dekripsi Data</h2>
        
        <!-- Search input selalu tampil -->
        ${decryptedOnlyList.length > 0 ? `
        <div style="display:flex; align-items:center; gap:1rem; margin-bottom:0.7rem; margin-top:0; flex-wrap:wrap;">
            <label style="font-weight:bold;">Cari Nama/NIK:</label>
            <input type="text" id="searchNameDekrip" placeholder="Masukkan nama atau NIK..." value="${searchName}" style="padding:0.5rem 1rem; border-radius:6px; border:1px solid #ccc; min-width:200px;">
            <button id="btnClearSearch" style="padding:0.5rem 1rem; border-radius:6px; border:1px solid #ccc; background:#fff; color:#333; cursor:pointer;">Hapus</button>
            ${searchName ? `<span class="search-result-span" style="margin-left:1rem; color:#666; font-size:0.9rem;">Ditemukan: ${filteredList.length} data</span>` : ''}
        </div>
        ` : ''}
        
        ${filteredList.length === 0 ? `
            <div style="text-align:center; padding:3rem; color:#666;">
                <div style="font-size:1.2rem; margin-bottom:1rem;">
                    ${decryptedOnlyList.length === 0 ? 'Belum ada data yang didekripsi' : 'Data tidak ditemukan'}
                </div>
                <div style="font-size:0.9rem;">
                    ${decryptedOnlyList.length === 0 
                        ? 'Silakan pilih data di halaman "Data Enkripsi" dan klik tombol dekrip untuk melihat hasil dekripsi di sini.'
                        : searchName 
                            ? `Tidak ada data dengan nama atau NIK "${searchName}". Coba kata kunci lain.`
                            : 'Tidak ada data yang sesuai dengan filter.'
                    }
                </div>
            </div>
        ` : `
        <div class="table-container" style="overflow-x:auto; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.07); background:#fafbfc;">
        <table style="width:100%; border-collapse:separate; border-spacing:0; min-width:800px;">
            <thead style="background:#f3f6fa; position:sticky; top:0; z-index:1;">
                <tr>
                    <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">Nama</th>
                    <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">NIK</th>
                    <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:140px;">Status</th>
                    <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">Jenis Surat</th>
                    <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600;">Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${filteredList.map((data, idx) => `
                                         <tr style="background:${idx%2===0?'#fff':'#f7fafd'}; height:56px;">
                        <td style="font-family:monospace; text-align:center; vertical-align:middle; width:180px; max-width:180px; min-width:120px; padding:0 8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${data.nama}">${data.nama && data.nama.length > 13 ? data.nama.slice(0, 10) + '...' : data.nama}</td>
                        <td style="font-family:monospace; text-align:center; vertical-align:middle; width:180px; max-width:180px; min-width:120px; padding:0 8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${data.nik}">${data.nik && data.nik.length > 13 ? data.nik.slice(0, 10) + '...' : data.nik}</td>
                        <td style="text-align:center; vertical-align:middle; width:140px; padding:0 8px;">
                            <span style="display:inline-block; min-width:120px; text-align:center; white-space:nowrap; padding:4px 12px; border-radius:16px; font-size:0.95em; font-weight:500; background:#e0f7e9; color:#1a7f37; border:1px solid #b2e2c7;">${data.status}</span>
                        </td>
                        <td style="text-align:center; vertical-align:middle; width:180px; padding:0 8px;">
                            <select class="jenisSuratDropdown" data-idx="${idx}" style="padding:6px 12px; border-radius:6px; border:1px solid #ccc;">
                    <option value="">Pilih jenis surat...</option>
                                <option value="domisili" ${data.jenisSurat==='domisili'?'selected':''}>Surat Keterangan Domisili</option>
                                <option value="tidak_mampu" ${data.jenisSurat==='tidak_mampu'?'selected':''}>Surat Keterangan Tidak Mampu</option>
                                <option value="usaha" ${data.jenisSurat==='usaha'?'selected':''}>Surat Keterangan Usaha</option>
                                <option value="kelakuan_baik" ${data.jenisSurat==='kelakuan_baik'?'selected':''}>Surat Keterangan Kelakuan Baik</option>
                                <option value="belum_menikah" ${data.jenisSurat==='belum_menikah'?'selected':''}>Surat Keterangan Belum Menikah</option>
                </select>
                        </td>
                        <td style="text-align:center; vertical-align:middle; padding:0 8px;">
                            <div style="display:flex; gap:8px; justify-content:center; align-items:center;">
                                <button onclick="window.showDetailDekrip(${idx})" title="Detail" style="background:none;border:none;cursor:pointer;outline:none;">
                                    <svg width="22" height="22" fill="none" stroke="#666" stroke-width="2" viewBox="0 0 24 24">
                                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                                <button onclick="window.cetakSuratDekrip(${idx})" title="Cetak Surat" style="background:none;border:none;cursor:pointer;outline:none;">
                                    <svg width="22" height="22" fill="none" stroke="#666" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                        <rect x="6" y="14" width="12" height="8"></rect>
                                    </svg>
                                </button>
                                <button onclick="window.cetakPDFDekrip(${idx})" title="Cetak PDF" style="background:none;border:none;cursor:pointer;outline:none;">
                                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
        `}
        <div id="modalDetailDekrip" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.3); align-items:center; justify-content:center; z-index:1000;">
            <div id="modalContentDekrip" style="background:#fff; padding:2.2rem 2.2rem 1.5rem 2.2rem; border-radius:14px; min-width:480px; max-width:700px; max-height:90vh; overflow:auto; position:relative; box-shadow:0 8px 32px rgba(0,0,0,0.18);">
                <button onclick="window.closeModalDetailDekrip()" style="position:absolute; top:10px; right:10px; background:none; border:none; font-size:1.7rem; cursor:pointer; color:#888;">&times;</button>
                <h3 style="margin-bottom:1.2rem; color:#333; text-align:left; font-size:1.5rem; font-weight:700;">Detail Data (Dekripsi)</h3>
                <table id="detailTableDekrip" style="width:100%; border-collapse:separate; border-spacing:0 8px; font-size:1.08rem;"></table>
            </div>
        </div>
    `;

    container.appendChild(section);
    document.getElementById('mainContent').appendChild(container);

    // ========================================
    // SETUP EVENT LISTENERS YANG ROBUST
    // ========================================

    // Function untuk attach event listeners
    function attachSearchListeners() {
    let searchTimeout;
    const searchInput = document.getElementById('searchNameDekrip');
        const btnClearSearch = document.getElementById('btnClearSearch');
        
        // Event listener untuk search input
        if (searchInput) {
            // Remove existing listeners untuk prevent duplicate
            searchInput.removeEventListener('input', searchInput._inputHandler);
            searchInput.removeEventListener('keypress', searchInput._keypressHandler);
            
            // Input handler
            searchInput._inputHandler = function(e) {
                // Izinkan huruf, angka, dan spasi (untuk nama dan NIK)
                this.value = this.value.replace(/[^A-Za-z0-9\s]/g, '');
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            sessionStorage.setItem('searchNameDekrip', this.value);
                    updateTableOnly(this.value);
        }, 300);
            };

            // Keypress handler
            searchInput._keypressHandler = function(e) {
        if (e.key === 'Enter') {
            clearTimeout(searchTimeout);
            sessionStorage.setItem('searchNameDekrip', this.value);
                    updateTableOnly(this.value);
                }
            };
            
            // Attach listeners
            searchInput.addEventListener('input', searchInput._inputHandler);
            searchInput.addEventListener('keypress', searchInput._keypressHandler);
        }
        
        // Event listener untuk clear button
        if (btnClearSearch) {
            // Remove existing listener
            btnClearSearch.removeEventListener('click', btnClearSearch._clickHandler);
            
            // Click handler
            btnClearSearch._clickHandler = function() {
                sessionStorage.removeItem('searchNameDekrip');
                // Clear input field
            const searchInput = document.getElementById('searchNameDekrip');
            if (searchInput) {
                    searchInput.value = '';
                }
                updateTableOnly('');
            };
            
            // Attach listener
            btnClearSearch.addEventListener('click', btnClearSearch._clickHandler);
        }
    }
    
    // Delay sedikit untuk memastikan DOM ready, kemudian attach listeners
    setTimeout(attachSearchListeners, 0);
    
    // ========================================
    // SMOOTH UPDATE FUNCTION (NO FLICKER)
    // ========================================
    
    // Function untuk update hanya bagian tabel tanpa re-render halaman
    function updateTableOnly(searchValue) {
        // Filter data berdasarkan search value
        const filteredData = searchValue ? decryptedOnlyList.filter(data => {
            const searchLower = searchValue.toLowerCase();
            const namaMatch = data.nama && data.nama.toLowerCase().includes(searchLower);
            const nikMatch = data.nik && data.nik.toLowerCase().includes(searchLower);
            return namaMatch || nikMatch;
        }) : decryptedOnlyList;
        
        // Update global filtered list
        window.currentFilteredList = filteredData;
        
        // Update search result counter
        const searchResultSpan = document.querySelector('.search-result-span');
        if (searchResultSpan) {
            searchResultSpan.textContent = `Ditemukan: ${filteredData.length} data`;
        }
        
        // Generate table content
        const tableContent = generateTableContent(filteredData, searchValue);
        
        // Update tabel dengan smooth transition
        const tableContainer = document.querySelector('.table-container');
        if (tableContainer) {
            // Fade out
            tableContainer.style.opacity = '0.3';
            tableContainer.style.transition = 'opacity 0.15s ease';
            
            setTimeout(() => {
                tableContainer.innerHTML = tableContent;
                
                // Re-attach dropdown listeners
                attachDropdownListeners(filteredData);
                
                // Fade in
                tableContainer.style.opacity = '1';
            }, 150);
        }
    }
    
    // Function untuk generate table content
    function generateTableContent(filteredData, searchValue) {
        if (filteredData.length === 0) {
            return `
                <div style="text-align:center; padding:3rem; color:#666;">
                    <div style="font-size:1.2rem; margin-bottom:1rem;">Data tidak ditemukan</div>
                    <div style="font-size:0.9rem;">
                        ${searchValue 
                            ? `Tidak ada data dengan nama atau NIK "${searchValue}". Coba kata kunci lain.`
                            : 'Tidak ada data yang sesuai dengan filter.'
                        }
                    </div>
                </div>
            `;
        }
        
        return `
            <table style="width:100%; border-collapse:separate; border-spacing:0; min-width:800px;">
                <thead style="background:#f3f6fa; position:sticky; top:0; z-index:1;">
                    <tr>
                        <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">Nama</th>
                        <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">NIK</th>
                        <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:140px;">Status</th>
                        <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">Jenis Surat</th>
                        <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredData.map((data, idx) => `
                        <tr style="background:${idx%2===0?'#fff':'#f7fafd'}; height:56px;">
                            <td style="font-family:monospace; text-align:center; vertical-align:middle; width:180px; max-width:180px; min-width:120px; padding:0 8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${data.nama}">${data.nama && data.nama.length > 13 ? data.nama.slice(0, 10) + '...' : data.nama}</td>
                            <td style="font-family:monospace; text-align:center; vertical-align:middle; width:180px; max-width:180px; min-width:120px; padding:0 8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${data.nik}">${data.nik && data.nik.length > 13 ? data.nik.slice(0, 10) + '...' : data.nik}</td>
                            <td style="text-align:center; vertical-align:middle; width:140px; padding:0 8px;">
                                <span style="display:inline-block; min-width:120px; text-align:center; white-space:nowrap; padding:4px 12px; border-radius:16px; font-size:0.95em; font-weight:500; background:#e0f7e9; color:#1a7f37; border:1px solid #b2e2c7;">${data.status}</span>
                            </td>
                            <td style="text-align:center; vertical-align:middle; width:180px; padding:0 8px;">
                                <select class="jenisSuratDropdown" data-idx="${idx}" style="padding:6px 12px; border-radius:6px; border:1px solid #ccc;">
                                    <option value="">Pilih jenis surat...</option>
                                    <option value="domisili" ${data.jenisSurat==='domisili'?'selected':''}>Surat Keterangan Domisili</option>
                                    <option value="tidak_mampu" ${data.jenisSurat==='tidak_mampu'?'selected':''}>Surat Keterangan Tidak Mampu</option>
                                    <option value="usaha" ${data.jenisSurat==='usaha'?'selected':''}>Surat Keterangan Usaha</option>
                                    <option value="kelakuan_baik" ${data.jenisSurat==='kelakuan_baik'?'selected':''}>Surat Keterangan Kelakuan Baik</option>
                                    <option value="belum_menikah" ${data.jenisSurat==='belum_menikah'?'selected':''}>Surat Keterangan Belum Menikah</option>
                                </select>
                            </td>
                            <td style="text-align:center; vertical-align:middle; padding:0 8px;">
                                <div style="display:flex; gap:8px; justify-content:center; align-items:center;">
                                    <button onclick="window.showDetailDekrip(${idx})" title="Detail" style="background:none;border:none;cursor:pointer;outline:none;">
                                        <svg width="22" height="22" fill="none" stroke="#666" stroke-width="2" viewBox="0 0 24 24">
                                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </button>
                                    <button onclick="window.cetakSuratDekrip(${idx})" title="Cetak Surat" style="background:none;border:none;cursor:pointer;outline:none;">
                                        <svg width="22" height="22" fill="none" stroke="#666" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
                                            <polyline points="6 9 6 2 18 2 18 9"></polyline>
                                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                                            <rect x="6" y="14" width="12" height="8"></rect>
                                        </svg>
                                    </button>
                                    <button onclick="window.cetakPDFDekrip(${idx})" title="Cetak PDF" style="background:none;border:none;cursor:pointer;outline:none;">
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                            <polyline points="10 9 9 9 8 9"></polyline>
                                        </svg>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }
    
    // Function untuk re-attach dropdown listeners
    function attachDropdownListeners(filteredData) {
        document.querySelectorAll('.jenisSuratDropdown').forEach(el => {
            el.addEventListener('change', function() {
                const idx = this.getAttribute('data-idx');
                const data = filteredData[idx];
                if (!data || !data.id) return;

                // Update in filteredData and decryptedList
                filteredData[idx].jenisSurat = this.value;
                const originalIndex = decryptedOnlyList.findIndex(d => d.id === data.id);
                if (originalIndex !== -1) {
                    decryptedOnlyList[originalIndex].jenisSurat = this.value;
                }

                // Update to database
                fetch(`http://localhost:3005/api/penduduk/${data.id}/surat`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jenisSurat: this.value })
                })
                .then(res => res.json())
                .then(response => {
                    console.log('Jenis surat berhasil diupdate');
                })
                .catch(error => {
                    console.error('Error updating jenis surat:', error);
                });
            });
        });
    }
    
    // Make updateTableOnly available globally for button handlers
    window.updateTableOnly = updateTableOnly;
    
    // Store current filtered data globally for button handlers
    window.currentFilteredList = filteredList;

    // Expose modal detail function
    window.showDetailDekrip = (idx) => {
        const data = window.currentFilteredList[idx]; // Use current filtered list
        const fields = [
            ['Nama', data.nama],
            ['NIK', data.nik],
            ['Alamat', data.alamat],
            ['RT/RW', data.rt_rw],
            ['Kel/Desa', data.kel_desa],
            ['Kecamatan', data.kecamatan],
            ['Tempat Lahir', data.tempatLahir],
            ['Tanggal Lahir', data.tanggalLahir],
            ['Golongan Darah', data.golonganDarah],
            ['Jenis Kelamin', data.jenisKelamin],
            ['Agama', data.agama],
            ['Status Perkawinan', data.statusPerkawinan],
            ['Pekerjaan', data.pekerjaan],
            ['Kewarganegaraan', data.kewarganegaraan]
        ];
        const detailTable = document.getElementById('detailTableDekrip');
        detailTable.innerHTML = fields.map(([label, val]) => {
            const formattedLabel = label.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase());
            return `<tr style="height:44px;">
                <td style="text-align:left; vertical-align:middle; font-weight:700; color:#333; background:#f3f6fa; border-radius:6px 0 0 6px; min-width:160px; max-width:220px; padding:10px 18px; margin-bottom:6px;">${formattedLabel}</td>
                <td style="text-align:left; vertical-align:middle; font-family:monospace; background:#f8fafc; border-radius:0 6px 6px 0; word-break:break-all; padding:10px 18px; max-width:380px; margin-bottom:6px;">${val || '-'}</td>
            </tr>`;
        }).join('');
        document.getElementById('modalDetailDekrip').style.display = 'flex';
    };
    window.closeModalDetailDekrip = () => {
        document.getElementById('modalDetailDekrip').style.display = 'none';
    };

    // Event listener untuk dropdown jenis surat
    setTimeout(() => {
        if (filteredList.length > 0) {
        document.querySelectorAll('.jenisSuratDropdown').forEach(el => {
            el.addEventListener('change', function() {
                const idx = this.getAttribute('data-idx');
                    const data = filteredList[idx];
                    if (!data || !data.id) return;
                    
                    // Update di filteredList dan decryptedList
                    filteredList[idx].jenisSurat = this.value;
                    const originalIndex = decryptedList.findIndex(d => d.id === data.id);
                    if (originalIndex !== -1) {
                        decryptedList[originalIndex].jenisSurat = this.value;
                    }
                    
                    // Update ke database
                    fetch(`http://localhost:3005/api/penduduk/${data.id}/surat`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ jenisSurat: this.value })
                    })
                    .then(res => res.json())
                    .then(response => {
                        console.log('Jenis surat berhasil diupdate');
                    })
                    .catch(error => {
                        console.error('Error updating jenis surat:', error);
                    });
                });
            });
        }
    }, 0);

    // Simpan dataList ke global agar bisa diakses oleh cetakPDFDekrip
    window.dataListDekripsi = filteredList.length > 0 ? filteredList : [];
}

// ========================================
// BAGIAN 4: KODE FUNGSI CETAK SURAT
// ========================================

// Tambahkan fungsi cetak surat dekripsi
window.cetakSuratDekrip = (idx) => {
    const dataList = window.dataListDekripsi || [];
    const data = dataList[idx];
    if (!data) return alert('Data tidak ditemukan!');
    if (!data.jenisSurat) return alert('Pilih jenis surat terlebih dahulu!');

    // Mapping ke format yang dibutuhkan template surat.js
    const suratData = {
        nama: data.nama,
        nik: data.nik,
        alamat: data.alamat,
        rt_rw: data.rt_rw,
        kel_desa: data.kel_desa,
        kecamatan: data.kecamatan,
        'tempat/tanggal_lahir': `${data.tempatLahir}, ${data.tanggalLahir}`,
        golongan_darah: data.golonganDarah,
        jenis_kelamin: data.jenisKelamin,
        agama: data.agama,
        status_perkawinan: data.statusPerkawinan,
        pekerjaan: data.pekerjaan,
        kewarganegaraan: data.kewarganegaraan,
        nama_kelurahan: data.kel_desa
    };

    let html = '';
            if (data.jenisSurat === 'domisili') {
            html = templateSuratDomisili(suratData);
        } else if (data.jenisSurat === 'tidak_mampu') {
            html = templateSuratTidakMampu(suratData);
        } else if (data.jenisSurat === 'usaha') {
            html = templateSuratUsaha(suratData);
        } else if (data.jenisSurat === 'kelakuan_baik') {
            html = templateSuratKelakuanBaik(suratData);
        } else if (data.jenisSurat === 'belum_menikah') {
            html = templateSuratBelumMenikah(suratData);
        } else {
            return alert('Jenis surat tidak valid!');
        }

    // Buat iframe tersembunyi untuk print
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.left = '-9999px';
    iframe.style.top = '-9999px';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Cetak Surat</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { 
                    font-family: Arial, sans-serif; 
                    background: white;
                    color: black;
                }
                .page-portrait {
                    background: white;
                    width: 21cm;
                    min-height: 29.7cm;
                    padding: 2.54cm;
                    box-sizing: border-box;
                    font-family: 'Times New Roman', Times, serif;
                }
                @media print {
                    * { -webkit-print-color-adjust: exact; }
                    body { margin: 0; }
                    .page-portrait {
                        margin: 0;
                        box-shadow: none;
                        width: 21cm;
                        min-height: 29.7cm;
                        padding: 2.54cm;
                        page-break-inside: avoid;
                    }
                    @page { 
                        size: A4;
                        margin: 0;
                    }
                }
            </style>
        </head>
        <body>
            ${html}
        </body>
        </html>
    `);
    doc.close();
    
    // Print dari iframe dan cleanup
    setTimeout(() => {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);
    }, 100);
};

window.cetakPDFDekrip = async (idx) => {
    const dataList = window.dataListDekripsi || [];
    const data = dataList[idx];
    if (!data) return alert('Data tidak ditemukan!');
    if (!data.jenisSurat) {
        return alert('Pilih jenis surat terlebih dahulu!');
    }
    
    // Tunggu library selesai dimuat
    let attempts = 0;
    const maxAttempts = 50; // 5 detik maksimal
    
    while (!(window.jspdf && window.jspdf.jsPDF && window.html2canvas) && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100)); // tunggu 100ms
        attempts++;
    }
    
    if (!(window.jspdf && window.jspdf.jsPDF && window.html2canvas)) {
        alert('Gagal memuat library PDF. Silakan refresh halaman dan coba lagi.');
        return;
    }
    
    try {
        // Mapping ke format yang dibutuhkan template surat.js
        const suratData = {
            nama: data.nama,
            nik: data.nik,
            alamat: data.alamat,
            rt_rw: data.rt_rw,
            kel_desa: data.kel_desa,
            kecamatan: data.kecamatan,
            'tempat/tanggal_lahir': `${data.tempatLahir}, ${data.tanggalLahir}`,
            golongan_darah: data.golonganDarah,
            jenis_kelamin: data.jenisKelamin,
            agama: data.agama,
            status_perkawinan: data.statusPerkawinan,
            pekerjaan: data.pekerjaan,
            kewarganegaraan: data.kewarganegaraan,
            nama_kelurahan: data.kel_desa
        };
        
        let html = '';
        if (data.jenisSurat === 'domisili') {
            html = templateSuratDomisili(suratData);
        } else if (data.jenisSurat === 'tidak_mampu') {
            html = templateSuratTidakMampu(suratData);
        } else if (data.jenisSurat === 'usaha') {
            html = templateSuratUsaha(suratData);
        } else if (data.jenisSurat === 'kelakuan_baik') {
            html = templateSuratKelakuanBaik(suratData);
        } else if (data.jenisSurat === 'belum_menikah') {
            html = templateSuratBelumMenikah(suratData);
        }
        
        if (!html) return alert('Template surat tidak ditemukan!');
        
        // Buat elemen sementara untuk render surat
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'fixed';
        tempDiv.style.left = '-9999px';
        tempDiv.style.top = '0';
        tempDiv.style.width = '21cm';
        tempDiv.innerHTML = html;
        document.body.appendChild(tempDiv);
        
        await window.html2canvas(tempDiv.querySelector('.page-portrait') || tempDiv, {scale:2}).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new window.jspdf.jsPDF({orientation:'portrait', unit:'mm', format:'a4'});
            const pageWidth = 210; // A4 width in mm
            const pageHeight = 297; // A4 height in mm
            const imgWidth = pageWidth;
            const imgHeight = canvas.height * (imgWidth / canvas.width);
            
            // Pastikan tinggi tidak melebihi halaman A4
            if (imgHeight > pageHeight) {
                const scale = pageHeight / imgHeight;
                pdf.addImage(imgData, 'PNG', 0, 0, imgWidth * scale, pageHeight);
            } else {
            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            }
            pdf.save('surat-'+data.nama+'.pdf');
        });
        document.body.removeChild(tempDiv);
    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Gagal membuat PDF. Silakan cek konsol untuk detail error.");
    }
};

// ========================================
// BAGIAN 5: EXPORT FUNGSI
// ========================================

export { renderDekripsi }; 