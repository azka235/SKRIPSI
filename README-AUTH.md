# 🔐 Sistem Authentication Database

## ✅ Perubahan yang Telah Dibuat

### 1. **Tabel Database Baru**
- ✅ Ditambahkan tabel `admin_users` untuk menyimpan kredensial admin
- ✅ Password disimpan dalam bentuk hash menggunakan bcrypt (saltRounds=10)
- ✅ Includes metadata: email, full_name, is_active, last_login

### 2. **Security Improvements**
- ✅ Hapus hardcoded credentials dari `js/auth.js`
- ✅ Implement bcrypt untuk hashing password
- ✅ API endpoint `/api/auth/login` untuk authentication
- ✅ Proper error handling dan validation

### 3. **New Dependencies**
- ✅ `bcrypt ^5.1.1` ditambahkan ke package.json

## 🚀 Cara Setup Database

### **Opsi 1: Jalankan Script SQL**
```sql
-- Jalankan file update-admin.sql di MySQL
mysql -u root -p enkripsi_baru < update-admin.sql
```

### **Opsi 2: Manual Query**
```sql
USE enkripsi_baru;

-- Buat tabel admin
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

-- Insert admin default
INSERT INTO admin_users (username, password_hash, email, full_name) 
VALUES ('admin', '$2b$10$2yeK5OziKtq6jaSXxhqLquMjliznH5Du2JafTxxfo0//D2lDtDFqa', 'admin@system.local', 'System Administrator')
ON DUPLICATE KEY UPDATE 
    password_hash = VALUES(password_hash),
    email = VALUES(email),
    full_name = VALUES(full_name),
    updated_at = NOW();
```

### **Opsi 3: Gunakan API Setup**
```bash
# Pastikan server running, lalu:
curl -X POST http://localhost:3005/api/auth/setup-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin13","email":"admin@system.local","full_name":"System Administrator"}'
```

## 🔑 Default Login Credentials

- **Username:** `admin`
- **Password:** `admin13`

## 🛡️ Security Features

### **Password Hashing**
- Menggunakan bcrypt dengan salt rounds 10
- Password tidak pernah disimpan dalam plaintext
- Hash: `$2b$10$2yeK5OziKtq6jaSXxhqLquMjliznH5Du2JafTxxfo0//D2lDtDFqa`

### **API Security**
- Validasi input pada server side
- Proper error messages tanpa expose sensitive info
- Database queries menggunakan prepared statements

### **Session Management**
- Login status disimpan di sessionStorage
- Auto logout saat browser ditutup
- Clear session data saat logout

## 🔗 API Endpoints

### **POST /api/auth/login**
Login dengan username/password
```json
{
  "username": "admin",
  "password": "admin13"
}
```

Response:
```json
{
  "success": true,
  "message": "Login berhasil",
  "user": {
    "id": 1,
    "username": "admin",
    "full_name": "System Administrator"
  }
}
```

### **POST /api/auth/setup-admin**
Setup admin baru (untuk inisialisasi)
```json
{
  "username": "admin",
  "password": "admin13",
  "email": "admin@system.local", 
  "full_name": "System Administrator"
}
```

## ⚠️ PENTING!

1. **Jalankan update database** sebelum menggunakan sistem login baru
2. **Install dependencies** dengan `npm install`
3. **Restart server** setelah update
4. **Test login** dengan credentials default

## 🔄 Migration dari Sistem Lama

Sistem lama dengan hardcoded credentials telah dihapus. Semua authentication sekarang melalui database dengan keamanan yang lebih baik.