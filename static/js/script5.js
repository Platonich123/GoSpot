document.addEventListener('DOMContentLoaded', function() {
    const sortButtons = document.querySelectorAll('.sort-button');
    const blogPosts = document.querySelectorAll('.blog-post');
    const toggleAuthorsButton = document.querySelector('.toggle-authors');
    const authorsList = document.querySelector('.authors-list');
    const authorCheckboxes = document.querySelectorAll('.authors-list input[type="checkbox"]');

    // Функция для фильтрации постов по авторам
    function filterPostsByAuthors() {
        const selectedAuthors = Array.from(authorCheckboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.id.replace('filter-author-', ''));

        blogPosts.forEach(post => {
            const postAuthor = post.querySelector('.post-author').textContent;
            const isAuthorSelected = selectedAuthors.some(authorId => {
                const authorLabel = document.querySelector(`label[for="filter-author-${authorId}"]`);
                return authorLabel && authorLabel.textContent === postAuthor;
            });

            if (selectedAuthors.length === 0 || isAuthorSelected) {
                post.style.display = 'block';
            } else {
                post.style.display = 'none';
            }
        });
    }

    // Обработчик для кнопок сортировки
    sortButtons.forEach(button => {
        button.addEventListener('click', function() {
            sortButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            const category = this.getAttribute('data-category');
            blogPosts.forEach(post => {
                if (category === 'all' || post.classList.contains(category)) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    });

    // Обработчик для кнопки переключения списка авторов
    toggleAuthorsButton.addEventListener('click', function() {
        this.classList.toggle('active');
        authorsList.classList.toggle('active');
    });

    // Обработчики для чекбоксов авторов
    authorCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', filterPostsByAuthors);
    });

    // Закрытие списка авторов при клике вне его
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.authors-list') && !event.target.closest('.toggle-authors')) {
            authorsList.classList.remove('active');
            toggleAuthorsButton.classList.remove('active');
        }
    });
});

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
