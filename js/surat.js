// ========================================
// BAGIAN 1: TEMPLATE SURAT KELURAHAN
// ========================================

import { secretKey } from './enkripsi.js';

// --- TEMPLATE-TEMPLATE SURAT ---

// Helper function to format YYYY-MM-DD to DD/MM/YYYY
function formatTanggal(tanggalISO) {
    if (!tanggalISO || !/^\d{4}-\d{2}-\d{2}$/.test(tanggalISO)) {
        return tanggalISO; // Return original if not in YYYY-MM-DD format
    }
    const [year, month, day] = tanggalISO.split('-');
    return `${day}/${month}/${year}`;
}

// Helper function untuk tanggal dan nama lurah saja
function generateCapDanTandaTangan(tempatSurat, tanggalSurat, namaKelurahan, namaLurah, nipLurah) {
    return `
        <div style="float: right; text-align: center;">
            <p>${tempatSurat}, ${tanggalSurat}</p>
            <p>Lurah ${namaKelurahan}</p>
            <br><br><br>
            <p style="text-decoration: underline;">${namaLurah}</p>
            <p>NIP: ${nipLurah}</p>
        </div>
    `;
}

function templateSuratDomisili(data) {
    // Parse the combined place/date and format the date part
    const ttlParts = data['tempat/tanggal_lahir'] ? data['tempat/tanggal_lahir'].split(',') : ['-', '-'];
    const tempatLahir = ttlParts[0].trim();
    const tanggalLahirFormatted = formatTanggal(ttlParts[1] ? ttlParts[1].trim() : '');

    const alamatLengkap = `${data.alamat || ''}, RT/RW ${data.rt_rw || ''}, Kel. ${data.kel_desa || ''}, Kec. ${data.kecamatan || ''}`;

    // Data dummy untuk surat
    const nomorSurat = '145/001/VI/2024';
    const tempatSurat = 'Bandung';
    
    // Tanggal realtime
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const tanggalSurat = today.toLocaleDateString('id-ID', options);
    
    const namaLurah = 'Drs. Ahmad Supriyadi, M.Si';
    const nipLurah = '196805151990031001';
    const namaKelurahan = 'Kelurahan Cidadap';

    return `
        <div class="page-portrait">
            <h3 style="text-align: center; text-decoration: underline; margin-bottom: 5px;">SURAT KETERANGAN DOMISILI</h3>
            <p style="text-align: center; margin-top: 0;">Nomor: ${nomorSurat}</p>
            <p>Yang bertanda tangan di bawah ini, Lurah ${namaKelurahan}, Kecamatan ${data.kecamatan || 'Cidadap'}, dengan ini menerangkan bahwa:</p>
            <br>
            <div style="display: grid; grid-template-columns: 160px auto; line-height: 1.5; margin-left: 30px;">
                <div>Nama</div>
                <div>: ${data.nama}</div>
                <div>Tempat/Tgl Lahir</div>
                <div>: ${tempatLahir}, ${tanggalLahirFormatted}</div>
                <div>Jenis Kelamin</div>
                <div>: ${data.jenis_kelamin}</div>
                <div>Agama</div>
                <div>: ${data.agama}</div>
                <div>Status Perkawinan</div>
                <div>: ${data.status_perkawinan}</div>
                <div>Pekerjaan</div>
                <div>: ${data.pekerjaan}</div>
                <div>Alamat</div>
                <div>: ${alamatLengkap}</div>
            </div>
            <br>
            <p>Berdasarkan pengamatan kami, nama tersebut di atas adalah benar penduduk yang berdomisili di lingkungan kami.</p>
            <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
            <br><br>
            ${generateCapDanTandaTangan(tempatSurat, tanggalSurat, namaKelurahan, namaLurah, nipLurah)}
            <div style="clear: both;"></div>
        </div>

    `;
}

function templateSuratTidakMampu(data) {
    // Parse the combined place/date and format the date part
    const ttlParts = data['tempat/tanggal_lahir'] ? data['tempat/tanggal_lahir'].split(',') : ['-', '-'];
    const tempatLahir = ttlParts[0].trim();
    const tanggalLahirFormatted = formatTanggal(ttlParts[1] ? ttlParts[1].trim() : '');

    const alamatLengkap = `${data.alamat || ''}, RT/RW ${data.rt_rw || ''}, Kel. ${data.kel_desa || ''}, Kec. ${data.kecamatan || ''}`;

    // Data dummy untuk surat
    const nomorSurat = '474/002/VI/2024';
    const tempatSurat = 'Bandung';
    
    // Tanggal realtime
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const tanggalSurat = today.toLocaleDateString('id-ID', options);
    
    const namaLurah = 'Drs. Ahmad Supriyadi, M.Si';
    const nipLurah = '196805151990031001';
    const namaKelurahan = 'Kelurahan Cidadap';

    return `
        <div class="page-portrait">
            <h3 style="text-align: center; text-decoration: underline; margin-bottom: 5px;">SURAT KETERANGAN TIDAK MAMPU</h3>
            <p style="text-align: center; margin-top: 0;">Nomor: ${nomorSurat}</p>
            <p>Yang bertanda tangan di bawah ini, Lurah ${namaKelurahan}, Kecamatan ${data.kecamatan || 'Cidadap'}, dengan ini menerangkan bahwa:</p>
            <br>
            <div style="display: grid; grid-template-columns: 160px auto; line-height: 1.5; margin-left: 30px;">
                <div>Nama</div>
                <div>: ${data.nama}</div>
                <div>NIK</div>
                <div>: ${data.nik}</div>
                <div>Tempat/Tgl Lahir</div>
                <div>: ${tempatLahir}, ${tanggalLahirFormatted}</div>
                <div>Jenis Kelamin</div>
                <div>: ${data.jenis_kelamin}</div>
                <div>Pekerjaan</div>
                <div>: ${data.pekerjaan}</div>
                <div>Alamat</div>
                <div>: ${alamatLengkap}</div>
            </div>
            <br>
            <p>Nama tersebut di atas adalah benar warga kami yang menurut data dan sepengetahuan kami termasuk dalam keluarga yang tidak mampu/pra-sejahtera.</p>
            <p>Surat keterangan ini dibuat untuk keperluan pengajuan beasiswa dan bantuan sosial.</p>
            <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
            <br><br>
            ${generateCapDanTandaTangan(tempatSurat, tanggalSurat, namaKelurahan, namaLurah, nipLurah)}
            <div style="clear: both;"></div>
        </div>

    `;
}

function templateSuratUsaha(data) {
    // Parse the combined place/date and format the date part
    const ttlParts = data['tempat/tanggal_lahir'] ? data['tempat/tanggal_lahir'].split(',') : ['-', '-'];
    const tempatLahir = ttlParts[0].trim();
    const tanggalLahirFormatted = formatTanggal(ttlParts[1] ? ttlParts[1].trim() : '');

    const alamatLengkap = `${data.alamat || ''}, RT/RW ${data.rt_rw || ''}, Kel. ${data.kel_desa || ''}, Kec. ${data.kecamatan || ''}`;

    // Data dummy untuk surat
    const nomorSurat = '503/003/VI/2024';
    const tempatSurat = 'Bandung';
    
    // Tanggal realtime
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const tanggalSurat = today.toLocaleDateString('id-ID', options);
    
    const namaLurah = 'Drs. Ahmad Supriyadi, M.Si';
    const nipLurah = '196805151990031001';
    const namaKelurahan = 'Kelurahan Cidadap';
    const namaUsaha = 'Warung Makan Sederhana';

    return `
        <div class="page-portrait">
            <h3 style="text-align: center; text-decoration: underline; margin-bottom: 5px;">SURAT KETERANGAN USAHA</h3>
            <p style="text-align: center; margin-top: 0;">Nomor: ${nomorSurat}</p>
            <p>Yang bertanda tangan di bawah ini, Lurah ${namaKelurahan}, Kecamatan ${data.kecamatan || 'Cidadap'}, dengan ini menerangkan bahwa:</p>
            <br>
            <div style="display: grid; grid-template-columns: 160px auto; line-height: 1.5; margin-left: 30px;">
                <div>Nama</div>
                <div>: ${data.nama}</div>
                <div>Tempat/Tgl Lahir</div>
                <div>: ${tempatLahir}, ${tanggalLahirFormatted}</div>
                <div>NIK</div>
                <div>: ${data.nik}</div>
                <div>Alamat</div>
                <div>: ${alamatLengkap}</div>
            </div>
            <br>
            <p>Bahwa nama tersebut di atas adalah benar memiliki usaha "${namaUsaha}" yang berlokasi di wilayah kami.</p>
            <p>Surat keterangan ini dibuat sebagai kelengkapan administrasi untuk pengurusan izin usaha dan keperluan lainnya.</p>
            <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
            <br><br>
            ${generateCapDanTandaTangan(tempatSurat, tanggalSurat, namaKelurahan, namaLurah, nipLurah)}
            <div style="clear: both;"></div>
        </div>

    `;
}

function templateSuratKelakuanBaik(data) {
    // Parse the combined place/date and format the date part
    const ttlParts = data['tempat/tanggal_lahir'] ? data['tempat/tanggal_lahir'].split(',') : ['-', '-'];
    const tempatLahir = ttlParts[0].trim();
    const tanggalLahirFormatted = formatTanggal(ttlParts[1] ? ttlParts[1].trim() : '');

    const alamatLengkap = `${data.alamat || ''}, RT/RW ${data.rt_rw || ''}, Kel. ${data.kel_desa || ''}, Kec. ${data.kecamatan || ''}`;

    // Data dummy untuk surat
    const nomorSurat = '612/004/VI/2024';
    const tempatSurat = 'Bandung';
    
    // Tanggal realtime
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const tanggalSurat = today.toLocaleDateString('id-ID', options);
    
    const namaLurah = 'Drs. Ahmad Supriyadi, M.Si';
    const nipLurah = '196805151990031001';
    const namaKelurahan = 'Kelurahan Cidadap';

    return `
        <div class="page-portrait">
            <h3 style="text-align: center; text-decoration: underline; margin-bottom: 5px;">SURAT KETERANGAN KELAKUAN BAIK</h3>
            <p style="text-align: center; margin-top: 0;">Nomor: ${nomorSurat}</p>
            <p>Yang bertanda tangan di bawah ini, Lurah ${namaKelurahan}, Kecamatan ${data.kecamatan || 'Cidadap'}, dengan ini menerangkan bahwa:</p>
            <br>
            <div style="display: grid; grid-template-columns: 160px auto; line-height: 1.5; margin-left: 30px;">
                <div>Nama</div>
                <div>: ${data.nama}</div>
                <div>NIK</div>
                <div>: ${data.nik}</div>
                <div>Tempat/Tgl Lahir</div>
                <div>: ${tempatLahir}, ${tanggalLahirFormatted}</div>
                <div>Jenis Kelamin</div>
                <div>: ${data.jenis_kelamin}</div>
                <div>Agama</div>
                <div>: ${data.agama}</div>
                <div>Status Perkawinan</div>
                <div>: ${data.status_perkawinan}</div>
                <div>Pekerjaan</div>
                <div>: ${data.pekerjaan}</div>
                <div>Alamat</div>
                <div>: ${alamatLengkap}</div>
            </div>
            <br>
            <p>Berdasarkan data yang ada dan sepengetahuan kami, nama tersebut di atas adalah benar warga kami yang selama ini berkelakuan baik dan tidak pernah terlibat dalam tindakan kriminal atau hal-hal yang melanggar hukum.</p>
            <p>Surat keterangan ini dibuat untuk keperluan melamar kerja dan beasiswa.</p>
            <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
            <br><br>
            ${generateCapDanTandaTangan(tempatSurat, tanggalSurat, namaKelurahan, namaLurah, nipLurah)}
            <div style="clear: both;"></div>
        </div>

    `;
}

function templateSuratBelumMenikah(data) {
    // Parse the combined place/date and format the date part
    const ttlParts = data['tempat/tanggal_lahir'] ? data['tempat/tanggal_lahir'].split(',') : ['-', '-'];
    const tempatLahir = ttlParts[0].trim();
    const tanggalLahirFormatted = formatTanggal(ttlParts[1] ? ttlParts[1].trim() : '');

    const alamatLengkap = `${data.alamat || ''}, RT/RW ${data.rt_rw || ''}, Kel. ${data.kel_desa || ''}, Kec. ${data.kecamatan || ''}`;

    // Data dummy untuk surat
    const nomorSurat = '789/005/VI/2024';
    const tempatSurat = 'Bandung';
    
    // Tanggal realtime
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const tanggalSurat = today.toLocaleDateString('id-ID', options);
    
    const namaLurah = 'Drs. Ahmad Supriyadi, M.Si';
    const nipLurah = '196805151990031001';
    const namaKelurahan = 'Kelurahan Cidadap';

    return `
        <div class="page-portrait">
            <h3 style="text-align: center; text-decoration: underline; margin-bottom: 5px;">SURAT KETERANGAN BELUM MENIKAH</h3>
            <p style="text-align: center; margin-top: 0;">Nomor: ${nomorSurat}</p>
            <p>Yang bertanda tangan di bawah ini, Lurah ${namaKelurahan}, Kecamatan ${data.kecamatan || 'Cidadap'}, dengan ini menerangkan bahwa:</p>
            <br>
            <div style="display: grid; grid-template-columns: 160px auto; line-height: 1.5; margin-left: 30px;">
                <div>Nama</div>
                <div>: ${data.nama}</div>
                <div>NIK</div>
                <div>: ${data.nik}</div>
                <div>Tempat/Tgl Lahir</div>
                <div>: ${tempatLahir}, ${tanggalLahirFormatted}</div>
                <div>Jenis Kelamin</div>
                <div>: ${data.jenis_kelamin}</div>
                <div>Agama</div>
                <div>: ${data.agama}</div>
                <div>Pekerjaan</div>
                <div>: ${data.pekerjaan}</div>
                <div>Alamat</div>
                <div>: ${alamatLengkap}</div>
            </div>
            <br>
            <p>Berdasarkan data yang ada dan sepengetahuan kami, nama tersebut di atas adalah benar warga kami yang sampai saat ini belum pernah menikah (belum kawin).</p>
            <p>Surat keterangan ini dibuat untuk keperluan administrasi dan beasiswa.</p>
            <p>Demikian surat keterangan ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
            <br><br>
            ${generateCapDanTandaTangan(tempatSurat, tanggalSurat, namaKelurahan, namaLurah, nipLurah)}
            <div style="clear: both;"></div>
        </div>

    `;
}

// Expose fungsi ke window object agar bisa dipanggil dari HTML
window.templateSuratDomisili = templateSuratDomisili;
window.templateSuratTidakMampu = templateSuratTidakMampu;
window.templateSuratUsaha = templateSuratUsaha;
window.templateSuratKelakuanBaik = templateSuratKelakuanBaik;
window.templateSuratBelumMenikah = templateSuratBelumMenikah;

export { templateSuratDomisili, templateSuratTidakMampu, templateSuratUsaha, templateSuratKelakuanBaik, templateSuratBelumMenikah }; 