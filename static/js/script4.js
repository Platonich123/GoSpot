function toggleContent(id) {
    const content = document.getElementById(id);
    const isVisible = content.style.display === "block";

    // Скрываем все открытые блоки
    document.querySelectorAll('.faq-content').forEach(item => {
        item.style.display = "none";
    });

    // Показываем или скрываем текущий блок
    if (!isVisible) {
        content.style.display = "block";
    }
}

// Логика для модальных окон
const loginButton = document.getElementById('login-button');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const registerLink = document.getElementById('register-link');
const loginLink = document.getElementById('login-link');

loginButton.onclick = function() {
    loginModal.style.display = "block";
}

registerLink.onclick = function() {
    loginModal.style.display = "none";
    registerModal.style.display = "block";
}

loginLink.onclick = function() {
    registerModal.style.display = "none";
    loginModal.style.display = "block";
}

window.onclick = function(event) {
    if (event.target == loginModal || event.target == registerModal) {
        loginModal.style.display = "none";
        registerModal.style.display = "none";
    }
}
