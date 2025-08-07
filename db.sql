CREATE DATABASE IF NOT EXISTS enkripsi_baru;
USE enkripsi_baru;

CREATE TABLE IF NOT EXISTS data_penduduk (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nik_encrypted VARCHAR(255) NOT NULL,
    nama_encrypted VARCHAR(255) NOT NULL,
    alamat_encrypted VARCHAR(255) NOT NULL,
    rt_rw_encrypted VARCHAR(255) NOT NULL,
    kel_desa_encrypted VARCHAR(255) NOT NULL,
    kecamatan_encrypted VARCHAR(255) NOT NULL,
    tempat_lahir_encrypted VARCHAR(255) NOT NULL,
    tanggal_lahir_encrypted VARCHAR(255) NOT NULL,
    golongan_darah_encrypted VARCHAR(255) NOT NULL,
    jenis_kelamin_encrypted VARCHAR(255) NOT NULL,
    agama_encrypted VARCHAR(255) NOT NULL,
    status_perkawinan_encrypted VARCHAR(255) NOT NULL,
    pekerjaan_encrypted VARCHAR(255) NOT NULL,
    kewarganegaraan_encrypted VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabel untuk menyimpan kredensial admin
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    full_name VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert admin default dengan password yang sudah di-hash
-- Password default: admin13 (di-hash dengan bcrypt saltRounds=10)
INSERT INTO admin_users (username, password_hash, email, full_name) 
VALUES ('admin', '$2b$10$2yeK5OziKtq6jaSXxhqLquMjliznH5Du2JafTxxfo0//D2lDtDFqa', 'admin@system.local', 'System Administrator')
ON DUPLICATE KEY UPDATE username = username; 