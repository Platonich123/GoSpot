document.getElementById('popular').addEventListener('change', function() {
    const sortBy = 'popular';
    const cards = Array.from(document.querySelectorAll('.result-item'));

    cards.sort((a, b) => {
        if (sortBy === 'popular') {
            return b.dataset.popularity - a.dataset.popularity;
        } else if (sortBy === 'rating') {
            return b.dataset.rating - a.dataset.rating;
        }
    });

    const container = document.querySelector('.result-list');
    cards.forEach(card => container.appendChild(card)); // Перемещаем карточки в новый порядок
});

document.getElementById('rating').addEventListener('change', function() {
    const sortBy = 'rating';
    const cards = Array.from(document.querySelectorAll('.result-item'));

    cards.sort((a, b) => {
        if (sortBy === 'popular') {
            return b.dataset.popularity - a.dataset.popularity;
        } else if (sortBy === 'rating') {
            return b.dataset.rating - a.dataset.rating;
        }
    });

    const container = document.querySelector('.result-list');
    cards.forEach(card => container.appendChild(card)); // Перемещаем карточки в новый порядок
});
