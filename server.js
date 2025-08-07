const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Koneksi ke database menggunakan environment variables
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'enkripsi_baru'
});

// Endpoint untuk menerima data terenkripsi
app.post('/api/penduduk', (req, res) => {
  const {
    nik,
    nama,
    alamat,
    rt_rw,
    kel_desa,
    kecamatan,
    tempatLahir,
    tanggalLahir,
    golonganDarah,
    jenisKelamin,
    agama,
    statusPerkawinan,
    pekerjaan,
    kewarganegaraan
  } = req.body;

  if (!nik || !nama || !alamat || !rt_rw || !kel_desa || !kecamatan || !tempatLahir || !tanggalLahir || !golonganDarah || !jenisKelamin || !agama || !statusPerkawinan || !pekerjaan || !kewarganegaraan) {
    return res.status(400).json({ message: 'Data tidak lengkap' });
  }

  const sql = `INSERT INTO data_penduduk (
    nik_encrypted, nama_encrypted, alamat_encrypted, rt_rw_encrypted, kel_desa_encrypted, kecamatan_encrypted, tempat_lahir_encrypted, tanggal_lahir_encrypted, golongan_darah_encrypted, jenis_kelamin_encrypted, agama_encrypted, status_perkawinan_encrypted, pekerjaan_encrypted, kewarganegaraan_encrypted
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  db.query(sql, [
    nik,
    nama,
    alamat,
    rt_rw,
    kel_desa,
    kecamatan,
    tempatLahir,
    tanggalLahir,
    golonganDarah,
    jenisKelamin,
    agama,
    statusPerkawinan,
    pekerjaan,
    kewarganegaraan
  ], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal menyimpan data' });
    }
    res.json({ message: 'Data berhasil disimpan', id: result.insertId });
  });
});

// Endpoint untuk mengambil seluruh data penduduk terenkripsi
app.get('/api/penduduk', (req, res) => {
  db.query('SELECT * FROM data_penduduk ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal mengambil data' });
    }
    res.json(results);
  });
});

app.get('/api/penduduk/:id', (req, res) => {
  const { id } = req.params;
  console.log('Mencari id:', id);
  db.query('SELECT * FROM data_penduduk WHERE id = ?', [Number(id)], (err, results) => {
    console.log('Hasil query:', results);
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal mengambil data' });
    }
    res.json(results[0] || null);
  });
});

// Endpoint untuk menghapus data berdasarkan id
app.delete('/api/penduduk/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM data_penduduk WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal menghapus data' });
    }
    res.json({ message: 'Data berhasil dihapus' });
  });
});

// Endpoint untuk update status dekripsi
app.patch('/api/penduduk/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  console.log('Update status request:', { id, status });
  
  db.query('UPDATE data_penduduk SET status = ? WHERE id = ?', [status, id], (err, result) => {
    if (err) {
      console.error('Error updating status:', err);
      return res.status(500).json({ message: 'Gagal update status', error: err.message });
    }
    console.log('Status update result:', result);
    res.json({ message: 'Status berhasil diupdate' });
  });
});

// Endpoint untuk update jenis surat
app.patch('/api/penduduk/:id/surat', (req, res) => {
  const { id } = req.params;
  const { jenisSurat } = req.body;
  
  db.query('UPDATE data_penduduk SET jenis_surat = ? WHERE id = ?', [jenisSurat, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Gagal update jenis surat' });
    }
    res.json({ message: 'Jenis surat berhasil diupdate' });
  });
});

// Endpoint untuk mengecek dan memperbaiki struktur tabel
app.get('/api/check-table', (req, res) => {
  db.query('DESCRIBE data_penduduk', (err, results) => {
    if (err) {
      console.error('Error checking table structure:', err);
      return res.status(500).json({ message: 'Gagal mengecek struktur tabel', error: err.message });
    }
    
    const columns = results.map(col => col.Field);
    console.log('Table columns:', columns);
    
    // Cek apakah kolom status dan jenis_surat sudah ada
    const hasStatus = columns.includes('status');
    const hasJenisSurat = columns.includes('jenis_surat');
    
    if (!hasStatus || !hasJenisSurat) {
      let alterQueries = [];
      if (!hasStatus) {
        alterQueries.push('ADD COLUMN status VARCHAR(50) DEFAULT "Belum Didekripsi"');
      }
      if (!hasJenisSurat) {
        alterQueries.push('ADD COLUMN jenis_surat VARCHAR(100) DEFAULT ""');
      }
      
      const alterSQL = `ALTER TABLE data_penduduk ${alterQueries.join(', ')}`;
      console.log('Executing ALTER TABLE:', alterSQL);
      
      db.query(alterSQL, (alterErr, alterResult) => {
        if (alterErr) {
          console.error('Error altering table:', alterErr);
          return res.status(500).json({ 
            message: 'Gagal menambahkan kolom', 
            error: alterErr.message,
            columns: columns 
          });
        }
        
        res.json({ 
          message: 'Kolom berhasil ditambahkan', 
          addedColumns: alterQueries,
          columns: columns 
        });
      });
    } else {
      res.json({ 
        message: 'Struktur tabel sudah benar', 
        columns: columns 
      });
    }
  });
});

// ========================================
// AUTHENTICATION ENDPOINTS
// ========================================

// Endpoint untuk login admin
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Username dan password harus diisi' 
    });
  }
  
  try {
    // Cari admin di database
    db.query(
      'SELECT id, username, password_hash, full_name, is_active FROM admin_users WHERE username = ? AND is_active = TRUE',
      [username],
      async (err, results) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Error database' 
          });
        }
        
        if (results.length === 0) {
          return res.status(401).json({ 
            success: false, 
            message: 'Username atau password salah' 
          });
        }
        
        const admin = results[0];
        
        try {
          // Verifikasi password
          const isValidPassword = await bcrypt.compare(password, admin.password_hash);
          
          if (!isValidPassword) {
            return res.status(401).json({ 
              success: false, 
              message: 'Username atau password salah' 
            });
          }
          
          // Update last login
          db.query(
            'UPDATE admin_users SET last_login = NOW() WHERE id = ?',
            [admin.id],
            (updateErr) => {
              if (updateErr) {
                console.error('Error updating last login:', updateErr);
              }
            }
          );
          
          // Login berhasil
          res.json({
            success: true,
            message: 'Login berhasil',
            user: {
              id: admin.id,
              username: admin.username,
              full_name: admin.full_name
            }
          });
          
        } catch (bcryptErr) {
          console.error('Bcrypt error:', bcryptErr);
          return res.status(500).json({ 
            success: false, 
            message: 'Error verifikasi password' 
          });
        }
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Endpoint untuk setup admin (hanya untuk inisialisasi)
app.post('/api/auth/setup-admin', async (req, res) => {
  try {
    const { 
      username = process.env.DEFAULT_ADMIN_USERNAME || 'admin', 
      password = process.env.DEFAULT_ADMIN_PASSWORD || 'admin13', 
      email = process.env.DEFAULT_ADMIN_EMAIL || 'admin@system.local', 
      full_name = process.env.DEFAULT_ADMIN_FULL_NAME || 'System Administrator' 
    } = req.body;
    
    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Insert atau update admin
    db.query(
      `INSERT INTO admin_users (username, password_hash, email, full_name) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       password_hash = VALUES(password_hash), 
       email = VALUES(email), 
       full_name = VALUES(full_name), 
       updated_at = NOW()`,
      [username, password_hash, email, full_name],
      (err, result) => {
        if (err) {
          console.error('Error setting up admin:', err);
          return res.status(500).json({ 
            success: false, 
            message: 'Gagal setup admin' 
          });
        }
        
        res.json({
          success: true,
          message: 'Admin berhasil di-setup',
          admin: { username, email, full_name }
        });
      }
    );
  } catch (error) {
    console.error('Setup admin error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

// Jalankan server menggunakan environment variable
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 