document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('admin-login-form');
    if (!loginForm) return;

    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('error-message');
    const togglePassword = document.getElementById('togglePassword');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (usernameInput.value === 'aniruddh_joshi' && passwordInput.value === 'ssb121@') {
            sessionStorage.setItem('isAdminLoggedIn', 'true');
            window.location.href = 'admin-dashboard.html';
        } else {
            errorMessage.textContent = 'Invalid username or password.';
        }
    });

    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye-slash');
            togglePassword.classList.toggle('fa-eye');
        });
    }
});