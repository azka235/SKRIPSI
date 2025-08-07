// ========================================
// BAGIAN 1: KODE PROSES DEKRIPSI
// ========================================

import { secretKey, decryptAES, caesarCipher } from './enkripsi.js';

// Fungsi untuk mendekripsi Caesar Cipher (reverse dari enkripsi)
function decryptCaesar(text, shift) {
    // Dekripsi Caesar adalah enkripsi dengan shift negatif
    return caesarCipher(text, 26 - (shift % 26));
}

// ========================================
// BAGIAN 2: KODE HALAMAN DATA ENKRIPSI
// ========================================

async function renderDataEnkripsi() {
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

    // Pastikan setiap data punya status
    dataList = dataList.map(d => ({
        ...d, 
        status: d.status || 'Belum Didekripsi'
    }));

    // Filter
    let filterStatus = sessionStorage.getItem('filterStatus') || 'all';
    const filteredList = filterStatus === 'all' ? dataList : dataList.filter(d => d.status === filterStatus);

    section.innerHTML = `
        <h2 style=\"margin-bottom:1rem;\">Data Hasil Enkripsi</h2>
        <div style=\"display:flex; align-items:center; gap:1rem; margin-bottom:0.7rem; margin-top:0; flex-wrap:wrap;\">
            <label style=\"font-weight:bold;\">Filter Status:</label>
            <select id=\"filterStatus\" style=\"padding:0.5rem 1rem; border-radius:6px; border:1px solid #ccc;\">
                <option value=\"all\" ${filterStatus==='all'?'selected':''}>Semua</option>
                <option value=\"Belum Didekripsi\" ${filterStatus==='Belum Didekripsi'?'selected':''}>Belum Didekripsi</option>
                <option value=\"Sudah Didekripsi\" ${filterStatus==='Sudah Didekripsi'?'selected':''}>Sudah Didekripsi</option>
            </select>
        </div>
        <div class="table-container-enkripsi" style="overflow-x:auto; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.07); background:#fafbfc;">
        <table style="width:100%; border-collapse:separate; border-spacing:0; min-width:600px;">
            <thead style="background:#f3f6fa; position:sticky; top:0; z-index:1;">
                <tr>
                    <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">Nama (Enkripsi)</th>
                    <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">NIK (Enkripsi)</th>
                    <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:140px;">Status</th>
                    <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">Aksi</th>
                </tr>
            </thead>
            <tbody>
                ${filteredList.length === 0 ? `<tr><td colspan="4" style="text-align:center; padding:2rem; color:#888;">Tidak ada data</td></tr>` :
                filteredList.map((data, idx) => `
                    <tr style="background:${idx%2===0?'#fff':'#f7fafd'}; transition:background 0.2s; height:56px;">
                        <td style="font-family:monospace; text-align:center; vertical-align:middle; width:180px; max-width:180px; min-width:120px; padding:0 8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${data.nama_encrypted}">${data.nama_encrypted && data.nama_encrypted.length > 13 ? data.nama_encrypted.slice(0, 10) + '...' : data.nama_encrypted}</td>
                        <td style="font-family:monospace; text-align:center; vertical-align:middle; width:180px; max-width:180px; min-width:120px; padding:0 8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${data.nik_encrypted}">${data.nik_encrypted && data.nik_encrypted.length > 13 ? data.nik_encrypted.slice(0, 10) + '...' : data.nik_encrypted}</td>
                        <td style="text-align:center; vertical-align:middle; width:140px; padding:0 8px;">
                            <span style="display:inline-block; min-width:120px; text-align:center; white-space:nowrap; padding:4px 12px; border-radius:16px; font-size:0.95em; font-weight:500; background:${data.status==='Sudah Didekripsi'?'#e0f7e9':(data.status==='Belum Didekripsi'?'#fffbe0':'#fff')}; color:${data.status==='Sudah Didekripsi'?'#1a7f37':(data.status==='Belum Didekripsi'?'#b59a00':'#333')}; border:1px solid ${data.status==='Sudah Didekripsi'?'#b2e2c7':(data.status==='Belum Didekripsi'?'#f5e9b2':'#ddd')};">${data.status}</span>
                        </td>
                        <td style="text-align:center; vertical-align:middle; width:180px; padding:0 8px;">
                            <div style="display:flex; gap:8px; justify-content:center; align-items:center;">
                                <button onclick="window.showDetailEncrypted(${idx})" title="Detail" style="background:none;border:none;cursor:pointer;outline:none;">
                                    <svg width="22" height="22" fill="none" stroke="#666" stroke-width="2" viewBox="0 0 24 24">
                                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                                        <circle cx="12" cy="12" r="3"/>
                                    </svg>
                                </button>
                                <button onclick="window.dekripDataEncrypted(${idx})" title="Dekrip" style="background:none;border:none;cursor:pointer;outline:none;">
                                    ${data.status === 'Sudah Didekripsi'
                                        ? `<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#666\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 9.9-1\"></path></svg>`
                                        : `<svg width=\"22\" height=\"22\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#666\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"11\" width=\"18\" height=\"11\" rx=\"2\" ry=\"2\"></rect><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"></path></svg>`
                                    }
                                </button>
                                <button onclick="window.deleteEncryptedData(${idx})" title="Hapus" style="background:none;border:none;cursor:pointer;outline:none;">
                                    <svg width="22" height="22" fill="none" stroke="#666" stroke-width="2" viewBox="0 0 24 24">
                                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        </div>
        <div id="modalDetail" style="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(0,0,0,0.3); align-items:center; justify-content:center; z-index:1000;">
            <div style="background:#fff; padding:2rem 2.5rem; border-radius:14px; min-width:350px; max-width:95vw; max-height:90vh; overflow:auto; position:relative; box-shadow:0 8px 32px rgba(0,0,0,0.18);">
                <button onclick="window.closeModalDetail()" style="position:absolute; top:10px; right:10px; background:none; border:none; font-size:1.7rem; cursor:pointer; color:#888;">&times;</button>
                <h3 style="margin-bottom:1.2rem; color:#333;">Detail Data (Enkripsi)</h3>
                <table id="detailTable" style="width:100%; border-collapse:separate; border-spacing:0; min-width:600px;">
                </table>
            </div>
        </div>
    `;

    container.appendChild(section);
    document.getElementById('mainContent').appendChild(container);

    // Filter event dengan smooth update
    document.getElementById('filterStatus').addEventListener('change', function() {
        sessionStorage.setItem('filterStatus', this.value);
        updateTableOnlyEnkripsi(this.value);
    });

    // ========================================
    // BAGIAN 3: KODE LOGIKA BISNIS
    // ========================================

    // Expose modal functions
    window.showDetailEncrypted = (idx) => {
        const data = window.currentFilteredListEnkripsi[idx];
        const detailTable = document.getElementById('detailTable');
        detailTable.innerHTML = Object.entries(data).filter(([key])=>key!=="status"&&key!=="id"&&key!=="created_at").map(([key, val]) =>
            `<tr style="height:44px;">
                <td style="text-align:left; vertical-align:middle; font-weight:700; color:#333; background:#f3f6fa; border-radius:6px 0 0 6px; min-width:160px; max-width:220px; padding:10px 18px;">${key.replace(/_/g,' ').replace(/\b\w/g, c=>c.toUpperCase())}</td>
                <td style="text-align:left; vertical-align:middle; font-family:monospace; background:#f8fafc; border-radius:0 6px 6px 0; word-break:break-all; padding:10px 18px; max-width:380px;">${val}</td>
            </tr>`
        ).join('');
        detailTable.style.borderSpacing = '0 8px';
        document.getElementById('modalDetail').style.display = 'flex';
    };
    window.closeModalDetail = () => {
        document.getElementById('modalDetail').style.display = 'none';
    };

    // Expose dekrip function
    window.dekripDataEncrypted = (idx) => {
        const data = window.currentFilteredListEnkripsi[idx];
        if (!data || !data.id) {
            alert('Data tidak ditemukan!');
            return;
        }
        
        console.log('Dekrip data:', data);
        
        // Update status ke database menjadi 'Sudah Didekripsi'
        fetch(`http://localhost:3005/api/penduduk/${data.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'Sudah Didekripsi' })
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(err => {
                    throw new Error(err.error || 'Gagal mengupdate status');
                });
            }
            return res.json();
        })
        .then(response => {
            console.log('Status berhasil diupdate:', response);
            // Langsung redirect ke halaman dekripsi tanpa loading
        window.location.hash = '#dekripsi';
        })
        .catch(error => {
            console.error('Error updating status:', error);
            alert('Gagal mengupdate status data: ' + error.message);
        });
    };
    // Expose delete function
    window.deleteEncryptedData = (idx) => {
        if (!confirm('Yakin ingin menghapus data ini?')) return;
        
        const data = window.currentFilteredListEnkripsi[idx];
        if (!data || !data.id) {
            alert('Data tidak ditemukan!');
            return;
        }
        
        // Hapus dari database
            fetch(`http://localhost:3005/api/penduduk/${data.id}`, {
                method: 'DELETE'
            })
            .then(res => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw new Error('Gagal menghapus dari database');
                }
            })
            .then(response => {
                alert('Data berhasil dihapus');
                // Refresh tabel
                document.getElementById('mainContent').querySelector('.container').remove();
                renderDataEnkripsi();
            })
            .catch((error) => {
                console.error('Error:', error);
            alert('Gagal menghapus data dari database');
        });
    };
    
    // Simpan dataList ke global agar bisa diakses oleh button handlers
    window.dataListEnkripsi = dataList;
    window.currentFilteredListEnkripsi = filteredList;
    
    // ========================================
    // SMOOTH UPDATE FUNCTION (NO FLICKER)
    // ========================================
    
    // Function untuk update hanya bagian tabel tanpa re-render halaman
    function updateTableOnlyEnkripsi(filterValue) {
        // Filter data berdasarkan filter value
        const filteredData = filterValue === 'all' ? dataList : dataList.filter(d => d.status === filterValue);
        
        // Update global filtered list
        window.currentFilteredListEnkripsi = filteredData;
        
        // Generate table content
        const tableContent = generateTableContentEnkripsi(filteredData);
        
        // Update tabel dengan smooth transition
        const tableContainer = document.querySelector('.table-container-enkripsi');
        if (tableContainer) {
            // Fade out
            tableContainer.style.opacity = '0.3';
            tableContainer.style.transition = 'opacity 0.15s ease';
            
            setTimeout(() => {
                tableContainer.innerHTML = tableContent;
                
                // Fade in
                tableContainer.style.opacity = '1';
            }, 150);
        }
    }
    
    // Function untuk generate table content
    function generateTableContentEnkripsi(filteredData) {
        if (filteredData.length === 0) {
            return `
                <div style="text-align:center; padding:3rem; color:#666;">
                    <div style="font-size:1.2rem; margin-bottom:1rem;">Tidak ada data</div>
                    <div style="font-size:0.9rem;">Tidak ada data yang sesuai dengan filter yang dipilih.</div>
                </div>
            `;
        }
        
        return `
            <table style="width:100%; border-collapse:separate; border-spacing:0; min-width:600px;">
                <thead style="background:#f3f6fa; position:sticky; top:0; z-index:1;">
                    <tr>
                        <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">Nama (Enkripsi)</th>
                        <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">NIK (Enkripsi)</th>
                        <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:140px;">Status</th>
                        <th style="padding:14px 0; text-align:center; font-size:1rem; font-weight:600; width:180px;">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    ${filteredData.map((data, idx) => `
                        <tr style="background:${idx%2===0?'#fff':'#f7fafd'}; transition:background 0.2s; height:56px;">
                            <td style="font-family:monospace; text-align:center; vertical-align:middle; width:180px; max-width:180px; min-width:120px; padding:0 8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${data.nama_encrypted}">${data.nama_encrypted && data.nama_encrypted.length > 13 ? data.nama_encrypted.slice(0, 10) + '...' : data.nama_encrypted}</td>
                            <td style="font-family:monospace; text-align:center; vertical-align:middle; width:180px; max-width:180px; min-width:120px; padding:0 8px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${data.nik_encrypted}">${data.nik_encrypted && data.nik_encrypted.length > 13 ? data.nik_encrypted.slice(0, 10) + '...' : data.nik_encrypted}</td>
                            <td style="text-align:center; vertical-align:middle; width:140px; padding:0 8px;">
                                <span style="display:inline-block; min-width:120px; text-align:center; white-space:nowrap; padding:4px 12px; border-radius:16px; font-size:0.95em; font-weight:500; background:${data.status==='Sudah Didekripsi'?'#e0f7e9':(data.status==='Belum Didekripsi'?'#fffbe0':'#fff')}; color:${data.status==='Sudah Didekripsi'?'#1a7f37':(data.status==='Belum Didekripsi'?'#b59a00':'#333')}; border:1px solid ${data.status==='Sudah Didekripsi'?'#b2e2c7':(data.status==='Belum Didekripsi'?'#f5e9b2':'#ddd')};">${data.status}</span>
                            </td>
                            <td style="text-align:center; vertical-align:middle; width:180px; padding:0 8px;">
                                <div style="display:flex; gap:8px; justify-content:center; align-items:center;">
                                    <button onclick="window.showDetailEncrypted(${idx})" title="Detail" style="background:none;border:none;cursor:pointer;outline:none;">
                                        <svg width="22" height="22" fill="none" stroke="#666" stroke-width="2" viewBox="0 0 24 24">
                                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    </button>
                                    <button onclick="window.dekripDataEncrypted(${idx})" title="Dekrip" style="background:none;border:none;cursor:pointer;outline:none;">
                                        ${data.status === 'Sudah Didekripsi'
                                            ? `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>`
                                            : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>`
                                        }
                                    </button>
                                    <button onclick="window.deleteEncryptedData(${idx})" title="Hapus" style="background:none;border:none;cursor:pointer;outline:none;">
                                        <svg width="22" height="22" fill="none" stroke="#666" stroke-width="2" viewBox="0 0 24 24">
                                            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
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
    
    // Make functions available globally
    window.updateTableOnlyEnkripsi = updateTableOnlyEnkripsi;
}

// ========================================
// BAGIAN 4: EXPORT FUNGSI
// ========================================

export { renderDataEnkripsi }; 