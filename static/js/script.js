// Функция для определения цвета кнопки (глобально)
function getButtonColor(type) {
    const colors = {
        'Можно детям': 'green',
        'Есть инвентарь': 'blue',
        'инструктор': 'pink',
        'соревнования': 'darkblue',
        'события': 'purple',
        'Моторная тяга': 'red',
        'Яхта': 'orange',
        'Весло': 'gray',
        'Спец. оборудование': 'olive',
        // Водные виды спорта
        'paddle_sports': 'blue',
        'kayaking': 'orange',
        'sup': 'purple',
        'canoe': 'green',
        'rowing': 'red',
        'rafting': 'darkblue',
        // Парусные и другие виды
        'sailing': 'blue',
        'windsurfing': 'purple',
        'kitesurfing': 'orange',
        'yachting': 'olive'
    };
    return colors[type] || 'default';
}

document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeButtons = document.querySelectorAll('.close-button');
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');

    loginButton.addEventListener('click', function() {
        loginModal.style.display = 'block';
    });

    registerLink.addEventListener('click', function() {
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    loginLink.addEventListener('click', function() {
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target == loginModal || event.target == registerModal) {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const resultList = document.getElementById('result-list');
    const noResultsMessage = document.getElementById('no-results-message');
    const items = resultList ? Array.from(resultList.getElementsByClassName('result-item')) : [];
    let markers = [];
    let map;

    // Инициализация карты
    async function initMap() {
        map = L.map('map').setView([55.7558, 37.6173], 11);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
        try {
            // Загружаем данные мест с сервера
            const response = await fetch('/api/places');
            const data = await response.json();
            
            if (data.status === 'success') {
                // Очищаем существующие маркеры
                markers.forEach(marker => map.removeLayer(marker));
                markers = [];

                // Добавляем маркеры для каждого места
                data.data.forEach(place => {
                    if (place.latitude && place.longitude) {
                        const marker = L.marker([place.latitude, place.longitude]).addTo(map);
                        
                        // Создаем содержимое всплывающего окна
                        const popupContent = `
                            <div class="spot-popup">
                                <h3>${place.name}</h3>
                                <p>${place.full_address || ''}</p>
                                ${place.short_description ? `<p>${place.short_description}</p>` : ''}
                                ${place.categories && place.categories.length > 0 ? `
                                    <div class="categories">
                                        ${place.categories.map(category => 
                                            `<button class="button ${getButtonColor(category)}">${category}</button>`
                                        ).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `;

                        marker.bindPopup(popupContent, {
                            maxWidth: 300,
                            className: 'custom-popup'
                        });

                        // Добавляем обработчик клика
                        marker.on('click', () => {
                            // Находим соответствующую карточку в списке
                            const card = document.querySelector(`.result-item[data-id="${place.id}"]`);
                            if (card) {
                                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                card.style.backgroundColor = '#f0f0f0';
                                setTimeout(() => {
                                    card.style.backgroundColor = 'white';
                                }, 1500);
                            }
                        });

                        markers.push(marker);
                    }
                });

                // Если есть маркеры, центрируем карту по ним
                if (markers.length > 0) {
                    const group = new L.featureGroup(markers);
                    map.fitBounds(group.getBounds().pad(0.1));
                }

                // Добавим обновление тегов в карточках
                updateCategoryTagsInCards(data.data);
            } else {
                console.error('Ошибка при загрузке данных:', data.message);
            }
        } catch (error) {
            console.error('Ошибка при загрузке данных мест:', error);
        }
    }

    // После загрузки данных мест и добавления маркеров, добавим цветные теги-категории во все карточки
    function updateCategoryTagsInCards(places) {
        if (!resultList) return;
        items.forEach(item => {
            // Найдём id места по data-id или по координатам
            const lat = parseFloat(item.getAttribute('data-lat'));
            const lon = parseFloat(item.getAttribute('data-lon'));
            // Найдём соответствующее место
            const place = places.find(p => p.latitude === lat && p.longitude === lon);
            if (place && place.categories && place.categories.length > 0) {
                // Найдём контейнер для тегов или создадим его
                let catDiv = item.querySelector('.categories');
                if (!catDiv) {
                    catDiv = document.createElement('div');
                    catDiv.className = 'categories';
                    // Вставим после описания или в конец
                    const p = item.querySelector('p');
                    if (p && p.nextSibling) {
                        p.parentNode.insertBefore(catDiv, p.nextSibling);
                    } else {
                        item.querySelector('.result-text').appendChild(catDiv);
                    }
                }
                // Заполним цветными кнопками
                catDiv.innerHTML = place.categories.map(category =>
                    `<button class="button ${getButtonColor(category)}">${category}</button>`
                ).join('');
            }
        });
    }

    // Функция для фильтрации карточек
    function filterCards() {
        if (!resultList) return;
        const filters = document.querySelectorAll('input[name="filter"]:checked');
        const amenities = document.querySelectorAll('input[name="amenity"]:checked');
        const events = document.querySelectorAll('input[name="event"]:checked');

        let visibleItems = 0;

        items.forEach(item => {
            const sportFilters = filters.length ? Array.from(filters).every(filter => 
                item.getAttribute('data-sport').split(',').includes(filter.value)) : true;
            const amenityFilters = amenities.length ? Array.from(amenities).every(amenity => 
                item.getAttribute('data-amenity').split(',').includes(amenity.value)) : true;
            const eventFilters = events.length ? Array.from(events).every(event => 
                item.getAttribute('data-event').split(',').includes(event.value)) : true;

            if (sportFilters && amenityFilters && eventFilters) {
                item.style.display = 'flex';
                visibleItems++;
            } else {
                item.style.display = 'none';
            }
        });

        if (visibleItems === 0) {
            noResultsMessage.style.display = 'block';
            noResultsMessage.textContent = 'Ничего не найдено';
        } else {
            noResultsMessage.style.display = 'none';
        }

        // Обновляем маркеры после фильтрации
        addMarkers();
    }

    // Функция для поиска
    function searchCards() {
        if (!resultList) return;
        const query = document.getElementById('search-input').value.toLowerCase();
        let visibleItems = 0;

        items.forEach(item => {
            const title = item.querySelector('h2').textContent.toLowerCase();
            const description = item.querySelector('p').textContent.toLowerCase();
            if (title.includes(query) || description.includes(query)) {
                item.style.display = 'flex';
                visibleItems++;
            } else {
                item.style.display = 'none';
            }
        });

        if (visibleItems === 0) {
            noResultsMessage.style.display = 'block';
            noResultsMessage.textContent = 'Ничего не найдено';
        } else {
            noResultsMessage.style.display = 'none';
        }

        // Обновляем маркеры после поиска
        addMarkers();
    }

    // Инициализация карты при загрузке страницы
    initMap();

    // Обработчики событий
    document.querySelectorAll('input[name="filter"], input[name="amenity"], input[name="event"]').forEach(checkbox => {
        checkbox.addEventListener('change', filterCards);
    });

    document.getElementById('search-button').addEventListener('click', searchCards);
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchCards();
        }
    });

    // Добавляем обработчики событий для карточек
    if (items.length > 0) {
        items.forEach(item => {
            item.addEventListener('click', () => {
                const lat = parseFloat(item.getAttribute('data-lat'));
                const lon = parseFloat(item.getAttribute('data-lon'));
                if (lat && lon && map) {
                    map.setView([lat, lon], 14);
                    const marker = markers.find(m => 
                        m.getLatLng().lat === lat && 
                        m.getLatLng().lng === lon
                    );
                    if (marker) {
                        marker.openPopup();
                    }
                }
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeButtons = document.querySelectorAll('.close-button');
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');

    loginButton.addEventListener('click', function() {
        loginModal.style.display = 'block';
    });

    registerLink.addEventListener('click', function() {
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    loginLink.addEventListener('click', function() {
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(event) {
        if (event.target == loginModal || event.target == registerModal) {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.getElementById('login-button');
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const closeButtons = document.querySelectorAll('.close-button');
    const registerLink = document.getElementById('register-link');
    const loginLink = document.getElementById('login-link');

    // Логика для открытия модального окна входа
    loginButton.addEventListener('click', function() {
        loginModal.style.display = 'block';
    });

    // Логика для переключения на модальное окно регистрации
    registerLink.addEventListener('click', function() {
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    // Логика для переключения на модальное окно входа
    loginLink.addEventListener('click', function() {
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    // Логика для закрытия модальных окон
    closeButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    // Логика для закрытия модальных окон при клике вне их области
    window.addEventListener('click', function(event) {
        if (event.target == loginModal || event.target == registerModal) {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        }
    });

    // Инициализация карты Leaflet
    const map = L.map('map').setView([55.7558, 37.6173], 10); // Центр Москвы
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Данные о спотах
    const spots = [
        {
            name: "Яхт-клуб \"Ореховая бухта\"",
            address: "Московская область, городской округ Мытищи, деревня Волынское, Ореховая улица",
            lat: 55.8789,
            lon: 37.6543,
            rating: 4,
            image: "card/cts.png",
            amenities: ["Можно детям", "Есть инвентарь"],
            events: ["соревнования"],
            sports: ["Моторная тяга", "Весло", "Спец. оборудование"]
        },
        {
            name: "ProYachting",
            address: "Ленинградское шоссе. 39, стр. 6",
            lat: 55.8236,
            lon: 37.4849,
            rating: 5,
            image: "card/cv.png",
            amenities: ["есть инвентарь", "инструктор"],
            events: ["события"],
            sports: ["Моторная тяга"]
        },
        {
            name: "Прогулка на парусной яхте",
            address: "Московская область, г. Подльск, Улица 1 мая, д. 10",
            lat: 55.5912,
            lon: 37.3045,
            rating: 3,
            image: "card/frs.png",
            amenities: ["Можно детям", "есть инвентарь", "инструктор"],
            events: ["соревнования"],
            sports: ["Спец. оборудование"]
        },
        {
            name: "Прогулка на сапе",
            address: "г. Москва, ул. Наташкинская улица, ст.1",
            lat: 55.7558,
            lon: 37.6173,
            rating: 2,
            image: "card/rfg.png",
            events: ["соревнования"],
            sports: ["Весло", "Спец. оборудование"]
        },
        {
            name: "Royal Yacht Club",
            address: "г. Москва, ул. Никольский тупик",
            lat: 55.7522,
            lon: 37.6156,
            rating: 1,
            image: "card/XXXL.webp",
            amenities: ["Можно детям", "инструктор"],
            sports: ["Моторная тяга", "Весло", "Спец. оборудование"]
        },
        {
            name: "Подмосковная Ривьера",
            address: "г. Москва, Ленинградское шоссе, ст.1",
            lat: 55.7964,
            lon: 37.5343,
            rating: 6,
            image: "card/xdxx.webp",
            amenities: ["Можно детям"],
            events: ["события"],
            sports: ["Моторная тяга", "Яхта", "Спец. оборудование"]
        }
    ];

    // Создание маркеров и всплывающих окон
    spots.forEach(spot => {
        const marker = L.marker([spot.lat, spot.lon]).addTo(map);
        
        // Создание HTML для всплывающего окна
        const popupContent = `
            <div class="spot-popup">
                <img src="${spot.image}" alt="${spot.name}" style="width: 100%; height: 150px; object-fit: cover;">
                <h3>${spot.name}</h3>
                <p>${spot.address}</p>
                <div class="rating">
                    ${Array(5).fill().map((_, i) => 
                        `<span class="star">${i < spot.rating ? '★' : '☆'}</span>`
                    ).join('')}
                </div>
                <div class="amenities">
                    ${spot.amenities ? spot.amenities.map(amenity => 
                        `<button class="button ${getButtonColor(amenity)}">${amenity}</button>`
                    ).join('') : ''}
                </div>
                <div class="sports">
                    ${spot.sports.map(sport => 
                        `<button class="button ${getButtonColor(sport)}">${sport}</button>`
                    ).join('')}
                </div>
                ${spot.events ? `
                    <div class="events">
                        ${spot.events.map(event => 
                            `<button class="button ${getButtonColor(event)}">${event}</button>`
                        ).join('')}
                    </div>
                ` : ''}
            </div>
        `;

        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });
    });
});

// Функции для работы с авторизацией
async function registerUser(event) {
    event.preventDefault();
    const form = event.target;
    const usernameInput = form.querySelector('input[placeholder="Логин"]');
    const emailInput = form.querySelector('input[type="email"]');
    const firstNameInput = form.querySelector('input[placeholder="Имя"]');
    const lastNameInput = form.querySelector('input[placeholder="Фамилия"]');
    const roleInput = form.querySelector('input[placeholder="Роль"]');
    const passwordInput = form.querySelector('input[placeholder="Пароль"]');
    const confirmPasswordInput = form.querySelector('input[placeholder="Пароль еще раз"]');

    if (!usernameInput || !emailInput || !firstNameInput || !lastNameInput || !roleInput || !passwordInput || !confirmPasswordInput) {
        alert('Проверьте корректность заполнения всех полей формы!');
        return;
    }

    const username = usernameInput.value;
    const email = emailInput.value;
    const first_name = firstNameInput.value;
    const last_name = lastNameInput.value;
    const role = roleInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
    }

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, first_name, last_name, role, password })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            alert('Регистрация успешна!');
            document.getElementById('register-modal').style.display = 'none';
            updateAuthUI();
        } else {
            alert(data.message || 'Ошибка при регистрации');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при регистрации');
    }
}

async function loginUser(event) {
    event.preventDefault();
    const form = event.target;
    const username = form.querySelector('input[placeholder="Логин"]').value;
    const password = form.querySelector('input[placeholder="Пароль"]').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (data.status === 'success') {
            document.getElementById('login-modal').style.display = 'none';
            updateAuthUI();
        } else {
            alert(data.message || 'Ошибка при входе');
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Произошла ошибка при входе');
    }
}

async function logoutUser() {
    try {
        const response = await fetch('/logout');
        const data = await response.json();
        
        if (data.status === 'success') {
            updateAuthUI();
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function updateAuthUI() {
    try {
        const response = await fetch('/check_auth');
        const data = await response.json();
        
        const loginButton = document.getElementById('login-button');
        const userMenu = document.getElementById('user-menu');
        
        if (data.status === 'success') {
            loginButton.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'block';
                userMenu.querySelector('.username').textContent = data.user.username;
            }
        } else {
            loginButton.style.display = 'block';
            if (userMenu) {
                userMenu.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// Добавляем обработчики событий при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...

    // Обработчики форм
    const loginForm = document.querySelector('#login-modal form');
    const registerForm = document.querySelector('#register-modal form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', loginUser);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', registerUser);
    }

    // Проверяем статус авторизации при загрузке страницы
    updateAuthUI();
});
