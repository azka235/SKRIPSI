// Import init function
import { init, clearBody } from './main.js';

// Fungsi untuk menangani login
async function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const loginError = document.getElementById('loginError');
    
    // Reset error message
    loginError.textContent = '';
    
    // Validasi input
    if (!username || !password) {
        loginError.textContent = 'Username dan password harus diisi!';
        return;
    }
    
    // Disable form elements during login
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('button[onclick="handleLogin()"]');
    
    usernameInput.disabled = true;
    passwordInput.disabled = true;
    if (loginButton) {
        loginButton.disabled = true;
        loginButton.textContent = 'Login...';
    }
    
    try {
        // Kirim request ke API login
        const response = await fetch('http://localhost:3005/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const result = await response.json();
        
        if (result.success) {
            // Login berhasil
            sessionStorage.setItem('isLoggedIn', 'true');
            sessionStorage.setItem('adminUser', JSON.stringify(result.user));
            
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('mainContent').classList.remove('hidden');
            window.location.hash = '#home'; // Force redirect to home on login
            init(); // Inisialisasi konten utama
        } else {
            // Login gagal
            loginError.textContent = result.message || 'Login gagal!';
            passwordInput.value = '';
            passwordInput.focus();
        }
    } catch (error) {
        console.error('Login error:', error);
        loginError.textContent = 'Gagal terhubung ke server. Pastikan server berjalan!';
    } finally {
        // Re-enable form elements
        usernameInput.disabled = false;
        passwordInput.disabled = false;
        if (loginButton) {
            loginButton.disabled = false;
            loginButton.textContent = 'Login';
        }
    }
}

// Fungsi untuk menangani logout
function handleLogout() {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('adminUser');
    document.getElementById('loginPage').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');

    // Clear login form fields and any previous error messages
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('loginError').textContent = '';
    
    clearBody();
}

// Fungsi untuk mengecek status login
function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
        document.getElementById('loginPage').classList.add('hidden');
        document.getElementById('mainContent').classList.remove('hidden');
        init(); // Inisialisasi konten utama
    } else {
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('mainContent').classList.add('hidden');
    }
}

export { handleLogin, handleLogout, checkLoginStatus };
window.handleLogin = handleLogin;
window.handleLogout = handleLogout;
window.checkLoginStatus = checkLoginStatus; 