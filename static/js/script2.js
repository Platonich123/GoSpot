document.addEventListener('DOMContentLoaded', function() {
    if (typeof L === 'undefined') {
        console.error('Leaflet не загружен!');
        return;
    }
    // --- Проверки на существование элементов ---
    const showMoreButton = document.getElementById('show-more-button');
    const categoryGrid = document.getElementById('category-grid');
    if (!showMoreButton || !categoryGrid) return;
    const hiddenItems = categoryGrid.querySelectorAll('.hidden');
    let isExpanded = false;

    showMoreButton.addEventListener('click', function() {
        if (!isExpanded) {
            hiddenItems.forEach(item => item.classList.remove('hidden'));
            showMoreButton.textContent = 'Свернуть ';
            showMoreButton.innerHTML = 'Свернуть <span>&#9650;</span>';
        } else {
            hiddenItems.forEach(item => item.classList.add('hidden'));
            showMoreButton.textContent = 'Показать еще ';
            showMoreButton.innerHTML = 'Показать еще <span>&#9660;</span>';
        }
        isExpanded = !isExpanded;
    });

    // --- Инициализация карты ---
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;
    let map = L.map('map').setView([55.7558, 37.6173], 10); // Центр на Москве
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Массив с данными о спотах
    const spots = [
        {
            name: "Яхт-клуб 'Ветер'",
            coordinates: [55.7558, 37.6173],
            type: "яхта",
            description: "Школа яхтинга для начинающих",
            amenities: ["есть инвентарь", "инструктор"]
        },
        {
            name: "Серф-спот 'Волна'",
            coordinates: [55.7608, 37.6273],
            type: "ветер",
            description: "Идеальное место для серфинга",
            amenities: ["есть инвентарь", "Можно детям"]
        },
        {
            name: "Клуб 'Весло'",
            coordinates: [55.7508, 37.6073],
            type: "весло",
            description: "Гребной клуб",
            amenities: ["есть инвентарь", "инструктор"]
        }
    ];

    // Функция для создания HTML-содержимого попапа
    function createPopupContent(spot) {
        return `
            <div class="spot-popup">
                <h3>${spot.name}</h3>
                <p>${spot.description}</p>
                <p><strong>Тип:</strong> ${spot.type}</p>
                <p><strong>Удобства:</strong> ${spot.amenities.join(', ')}</p>
            </div>
        `;
    }

    // Добавление маркеров на карту
    spots.forEach(spot => {
        const marker = L.marker(spot.coordinates)
            .bindPopup(createPopupContent(spot))
            .addTo(map);
    });

    // Функция для фильтрации спотов
    function filterSpots(filters) {
        // Удаляем все существующие маркеры
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                map.removeLayer(layer);
            }
        });

        // Фильтруем и добавляем подходящие споты
        spots.forEach(spot => {
            let shouldShow = true;
            // Проверяем соответствие фильтрам
            if (filters.type && !filters.type.includes(spot.type)) {
                shouldShow = false;
            }
            if (filters.amenities) {
                const hasRequiredAmenities = filters.amenities.every(amenity => 
                    spot.amenities.includes(amenity)
                );
                if (!hasRequiredAmenities) {
                    shouldShow = false;
                }
            }
            if (shouldShow) {
                const marker = L.marker(spot.coordinates)
                    .bindPopup(createPopupContent(spot))
                    .addTo(map);
            }
        });
    }

    // Обработчики событий для фильтров
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            const filters = {
                type: Array.from(document.querySelectorAll('input[name="filter"]:checked')).map(cb => cb.value),
                amenities: Array.from(document.querySelectorAll('input[name="amenity"]:checked')).map(cb => cb.value)
            };
            filterSpots(filters);
        });
    });
});
