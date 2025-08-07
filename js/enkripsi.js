// ========================================
// BAGIAN 1: KODE PROSES ENKRIPSI
// ========================================

// Secret key untuk AES (akan diambil dari server)
let secretKey = 'mySecretKey12345'; // Fallback default

// Fungsi untuk mengambil secret key dari server
async function loadSecretKey() {
  try {
    const response = await fetch('http://localhost:3005/api/config/aes-key');
    if (response.ok) {
      const data = await response.json();
      secretKey = data.aesKey;
      console.log('AES Secret Key loaded from server');
    } else {
      console.warn('Failed to load AES key from server, using fallback');
    }
  } catch (error) {
    console.warn('Error loading AES key:', error);
  }
}

// Load secret key saat modul dimuat
loadSecretKey();

// Fungsi untuk generate random Initialization Vector (IV)
function generateIV() {
    // Generate 16 bytes (128 bits) IV untuk AES-128
    const ivLength = 16;
    const array = new Uint8Array(ivLength);
    window.crypto.getRandomValues(array);
    return array;
}

// Fungsi untuk mengkonversi array buffer ke string hex
function bufferToHex(buffer) {
    return Array.from(new Uint8Array(buffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
}

// Fungsi untuk mengkonversi hex string ke array buffer
function hexToBuffer(hex) {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return bytes;
}

// Fungsi untuk enkripsi data dengan Caesar Cipher
function caesarCipher(text, shift) {
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const char = text.charAt(i);
        if (char.match(/[a-z]/i)) {
            const code = text.charCodeAt(i);
            const base = char >= 'a' && char <= 'z' ? 97 : 65;
            result += String.fromCharCode((code - base + shift) % 26 + base);
        } else {
            result += char;
        }
    }
    return result;
}

// Fungsi untuk enkripsi dengan AES-128 dengan IV kustom
function encryptAES(text, key, iv) {
    // Konversi IV ke format yang dibutuhkan CryptoJS
    const ivWordArray = CryptoJS.lib.WordArray.create(iv);
    
    // Tetapkan mode AES ke CBC dan pad dengan PKCS7
    const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(key), {
        iv: ivWordArray,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    
    // Konversi ciphertext ke format hex daripada base64
    const ciphertextHex = encrypted.ciphertext.toString(CryptoJS.enc.Hex);
    
    // Hasil: IV (hex) + '.' + ciphertext (hex)
    return bufferToHex(iv) + '.' + ciphertextHex;
}

// Fungsi untuk dekripsi AES dengan IV kustom
function decryptAES(ciphertext, key) {
    try {
        // Gunakan logger jika tersedia
        if (window.aesLogger) {
            window.aesLogger.info('DecryptAES called', {
                ciphertextLength: ciphertext ? ciphertext.length : 0,
                keyLength: key ? key.length : 0
            });
        }

        // Validasi input
        if (!ciphertext || typeof ciphertext !== 'string') {
            if (window.aesLogger) {
                window.aesLogger.warn('Invalid ciphertext input', {
                    ciphertext: ciphertext,
                    type: typeof ciphertext
                });
            }
            return '';
        }

        // Validasi format ciphertext menggunakan logger
        if (window.aesLogger) {
            window.aesLogger.validateCiphertext(ciphertext, 'decryptAES');
        }

        // Pisahkan IV dan ciphertext
        const parts = ciphertext.split('.');
        
        if (parts.length !== 2) {
            if (window.aesLogger) {
                window.aesLogger.error('Invalid ciphertext format', {
                    parts: parts,
                    partsLength: parts.length,
                    ciphertext: ciphertext
                });
            }
            throw new Error('Format ciphertext tidak valid');
        }

        const iv = hexToBuffer(parts[0]);
        const actualCiphertext = parts[1];

        if (window.aesLogger) {
            window.aesLogger.info('Ciphertext parsed successfully', {
                ivLength: parts[0].length,
                ciphertextLength: actualCiphertext.length
            });
        }

        // Konversi IV ke format CryptoJS
        const ivWordArray = CryptoJS.lib.WordArray.create(iv);
        
        // Parse ciphertext dari hex ke WordArray
        const ciphertextWordArray = CryptoJS.enc.Hex.parse(actualCiphertext);
        
        // Buat CipherParams object yang dibutuhkan untuk dekripsi
        const cipherParams = CryptoJS.lib.CipherParams.create({
            ciphertext: ciphertextWordArray
        });

        // Dekripsi dengan IV kustom
        const decrypted = CryptoJS.AES.decrypt(cipherParams, CryptoJS.enc.Utf8.parse(key), {
            iv: ivWordArray,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });

        const result = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (window.aesLogger) {
            window.aesLogger.info('Decryption successful', {
                resultLength: result.length
            });
        }
        
        return result;
    } catch (error) {
        if (window.aesLogger) {
            window.aesLogger.error('Decryption failed', {
                error: error.message,
                ciphertext: ciphertext
            });
        }
        console.error('Dekripsi error:', error);
        return '';
    }
}

// ========================================
// BAGIAN 2: KODE HALAMAN ENKRIPSI
// ========================================

// Halaman Enkripsi
function renderEnkripsi() {
    const styleId = 'custom-form-style';
    if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .date-input-wrapper {
                position: relative;
                flex: 1;
            }
            .date-input-wrapper input[type="date"] {
                width: 100%;
                box-sizing: border-box;
                padding-right: 40px; /* Space for icon */
            }
            .date-input-wrapper input[type="date"]::-webkit-calendar-picker-indicator {
                display: none;
                -webkit-appearance: none;
            }
            .calendar-button {
                position: absolute;
                right: 10px;
                top: 50%;
                transform: translateY(-50%);
                background-color: transparent;
                border: none;
                cursor: pointer;
                padding: 0;
                outline: none;
                box-shadow: none;
                -webkit-tap-highlight-color: transparent; /* Remove tap highlight */
                display: inline-flex; /* Use flex to help center the SVG */
                align-items: center; /* Vertically center the SVG inside */
            }
            .calendar-button:focus, .calendar-button:active {
                background-color: transparent;
                outline: none;
                box-shadow: none;
            }
        `;
        document.head.appendChild(style);
    }
    const container = document.createElement('div');
    container.className = 'container';
    const section = document.createElement('div');
    section.className = 'section';

    // Form input data penduduk
    section.innerHTML = `
        <h2 style="margin-bottom:1rem;">Enkripsi Data Penduduk</h2>
        <form id="identitasForm" style="margin-top:0;margin-bottom:0.7rem;display:grid;gap:1rem;">
            <label>Nama:</label>
            <input type="text" id="nama" required pattern="[A-Za-z\s]+" title="Hanya huruf yang diperbolehkan">
            <label>NIK:</label>
            <input type="text" id="nik" required pattern="[0-9]+" title="Hanya angka yang diperbolehkan" maxlength="16">
            <label>Alamat:</label>
            <input type="text" id="alamat" required>
            <label>RT/RW:</label>
            <div style="display: flex; align-items: center; gap: 5px;">
                <input type="text" id="rt" required style="width: 60px; text-align: center;">
                <span style="font-weight: bold;">/</span>
                <input type="text" id="rw" required style="width: 60px; text-align: center;">
            </div>
            <label>Kel/Desa:</label>
            <input type="text" id="kel_desa" required>
            <label>Kecamatan:</label>
            <input type="text" id="kecamatan" required>
            <label>Tempat/Tanggal Lahir:</label>
            <div style="display: flex; gap: 10px;">
                <input type="text" id="tempatLahir" required style="flex: 1;">
                <div class="date-input-wrapper">
                    <input type="date" id="tanggalLahir" required onkeydown="return false;">
                    <span role="button" tabindex="0" class="calendar-button" onclick="document.getElementById('tanggalLahir').showPicker()" onkeydown="if(event.key==='Enter' || event.key===' ') document.getElementById('tanggalLahir').showPicker()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #6c757d;">
                            <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z" stroke="currentColor" stroke-width="1.5" stroke-miterlimit="10" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </span>
                </div>
            </div>
            <label>Golongan Darah:</label>
            <select id="golonganDarah">
                <option value="">Pilih Golongan Darah</option>
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
            </select>
            <label>Jenis Kelamin:</label>
            <select id="jenisKelamin">
                <option value="">Pilih Jenis Kelamin</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
            </select>
            <label>Agama:</label>
            <select id="agama">
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
            </select>
            <label>Status Perkawinan:</label>
            <select id="statusPerkawinan">
                <option value="">Pilih Status Perkawinan</option>
                <option value="Belum Kawin">Belum Kawin</option>
                <option value="Kawin">Kawin</option>
                <option value="Cerai Hidup">Cerai Hidup</option>
                <option value="Cerai Mati">Cerai Mati</option>
            </select>
            <label>Pekerjaan:</label>
            <input type="text" id="pekerjaan" required>
            <label>Kewarganegaraan:</label>
            <select id="kewarganegaraan">
                <option value="">Pilih Kewarganegaraan</option>
                <option value="WNI">WNI</option>
                <option value="WNA">WNA</option>
            </select>
            <button type="button" id="btnEnkripsi">Enkripsi Data</button>
        </form>
    `;

    container.appendChild(section);
    document.getElementById('mainContent').appendChild(container);

    // Event listener untuk tombol enkripsi
    document.getElementById('btnEnkripsi').addEventListener('click', handleEnkripsi);

    // Add input validation listeners
    const namaInput = document.getElementById('nama');
    const nikInput = document.getElementById('nik');
    const alamatInput = document.getElementById('alamat');

    // Helper function to capitalize the first letter of each word
    const capitalizeWords = (value) => {
        if (!value) return '';
        return value.replace(/\b\w/g, char => char.toUpperCase());
    };

    // Nama validation - only letters & capitalize
    namaInput.addEventListener('input', function(e) {
        this.value = capitalizeWords(this.value.replace(/[^A-Za-z\s]/g, ''));
    });

    // Alamat validation - capitalize words
    alamatInput.addEventListener('input', function(e) {
        this.value = capitalizeWords(this.value);
    });

    // NIK validation - only numbers
    nikInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Validation for new fields
    const rtInput = document.getElementById('rt');
    const rwInput = document.getElementById('rw');
    const kelDesaInput = document.getElementById('kel_desa');
    const kecamatanInput = document.getElementById('kecamatan');
    const tempatLahirInput = document.getElementById('tempatLahir');
    const pekerjaanInput = document.getElementById('pekerjaan');

    // RT validation - only numbers, 3 digits, pad with zero on blur
    rtInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '').substring(0, 3);
    });
    rtInput.addEventListener('blur', function(e) {
        if (this.value) {
            this.value = this.value.padStart(3, '0');
        }
    });

    // RW validation - only numbers, 3 digits, pad with zero on blur
    rwInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '').substring(0, 3);
    });
    rwInput.addEventListener('blur', function(e) {
        if (this.value) {
            this.value = this.value.padStart(3, '0');
        }
    });

    // Kel/Desa validation - only letters and space
    kelDesaInput.addEventListener('input', function(e) {
        this.value = capitalizeWords(this.value.replace(/[^A-Za-z\s]/g, ''));
    });

    // Kecamatan validation - only letters and space
    kecamatanInput.addEventListener('input', function(e) {
        this.value = capitalizeWords(this.value.replace(/[^A-Za-z\s]/g, ''));
    });

    // Tempat Lahir validation - only letters and space
    tempatLahirInput.addEventListener('input', function(e) {
        this.value = capitalizeWords(this.value.replace(/[^A-Za-z\s]/g, ''));
    });

    // Pekerjaan validation - only letters and space
    pekerjaanInput.addEventListener('input', function(e) {
        this.value = capitalizeWords(this.value.replace(/[^A-Za-z\s]/g, ''));
    });
}

// ========================================
// BAGIAN 3: KODE LOGIKA BISNIS
// ========================================

// Fungsi untuk menangani proses enkripsi
function handleEnkripsi() {
    const data = {
        nama: document.getElementById('nama').value,
        nik: document.getElementById('nik').value,
        alamat: document.getElementById('alamat').value,
        rt_rw: `${document.getElementById('rt').value}/${document.getElementById('rw').value}`,
        kel_desa: document.getElementById('kel_desa').value,
        kecamatan: document.getElementById('kecamatan').value,
        tempatLahir: document.getElementById('tempatLahir').value,
        tanggalLahir: document.getElementById('tanggalLahir').value,
        golonganDarah: document.getElementById('golonganDarah').value,
        jenisKelamin: document.getElementById('jenisKelamin').value,
        agama: document.getElementById('agama').value,
        statusPerkawinan: document.getElementById('statusPerkawinan').value,
        pekerjaan: document.getElementById('pekerjaan').value,
        kewarganegaraan: document.getElementById('kewarganegaraan').value,
    };

    // Validasi form
    for (let key in data) {
        if (!data[key]) {
            alert('Mohon lengkapi semua data!');
            return;
        }
    }

    // Validate NIK length
    if (data.nik.length !== 16) {
        alert('NIK harus terdiri dari 16 digit.');
        return;
    }

    const teksGabung = `
Nama: ${data.nama}
NIK: ${data.nik}
Alamat: ${data.alamat}
RT/RW: ${data.rt_rw}
Kel/Desa: ${data.kel_desa}
Kecamatan: ${data.kecamatan}
Tempat/Tanggal Lahir: ${data.tempatLahir}, ${data.tanggalLahir}
Golongan Darah: ${data.golonganDarah}
Jenis Kelamin: ${data.jenisKelamin}
Agama: ${data.agama}
Status Perkawinan: ${data.statusPerkawinan}
Pekerjaan: ${data.pekerjaan}
Kewarganegaraan: ${data.kewarganegaraan}`.trim();

    // Step 1: Enkripsi dengan Caesar Cipher shift 3
    const caesarResult = caesarCipher(teksGabung, 3);

    // Step 2: Enkripsi dengan AES-128 menggunakan manual IV
    const mainIV = generateIV();
    const aesResult = encryptAES(caesarResult, secretKey, mainIV);

    // Enkripsi per field dengan IV unik untuk masing-masing field
    const encryptedFields = {};
    for (const key in data) {
        const fieldIV = generateIV();
        // Enkripsi dua tahap: Caesar → AES
        const caesarField = caesarCipher(data[key], 3);
        encryptedFields[key] = encryptAES(caesarField, secretKey, fieldIV);
    }

    // Kirim data terenkripsi ke backend
    fetch('http://localhost:3005/api/penduduk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encryptedFields)
    })
    .then(res => res.json())
    .then(response => {
        if (response.id) {
            // Tambahkan id ke encryptedFields sebelum simpan ke localStorage
            encryptedFields.id = response.id;
        }
        // Pindah ke halaman data enkripsi
        window.location.hash = '#data-enkripsi';
    })
    .catch(() => alert('Gagal menghubungi server backend!'));
}

// ========================================
// BAGIAN 4: EXPORT FUNGSI
// ========================================

export { renderEnkripsi, secretKey, decryptAES, caesarCipher, loadSecretKey }; 