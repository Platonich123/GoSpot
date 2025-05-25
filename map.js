// Инициализация карты
var mymap = L.map('mapid').setView([55.7558, 37.6176], 10); // Координаты центра карты (например, Москва) и уровень зума

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
}).addTo(mymap);

// Получение данных о станциях с API
fetch('/api/stations')
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('Received data:', data);
        if (data.status === 'success' && Array.isArray(data.data)) {
            data.data.forEach(station => {
                // Проверяем наличие координат
                if (station.latitude && station.longitude) {
                    // Создание метки для каждой станции
                    L.marker([station.latitude, station.longitude]).addTo(mymap)
                        .bindPopup(`<b>${station.name}</b><br>${station.address}`); // Добавление всплывающего окна
                } else {
                    console.warn('Станция без координат:', station);
                }
            });
        } else {
            console.error('Неожиданный формат данных API:', data);
        }
    })
    .catch(error => {
        console.error('Ошибка при выполнении запроса или обработке данных:', error);
    }); 