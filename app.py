from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, session
from dotenv import load_dotenv
import os
from models import db, User, Station, Place, Event, Trainer, Article
from sqlalchemy import text
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash

# Загрузка переменных окружения
load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)  # Для сессий
app.config['SQLALCHEMY_DATABASE_URI'] = f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}?client_encoding=utf8"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Инициализация базы данных
db.init_app(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/test_db')
def test_db():
    try:
        # Пробуем выполнить простой запрос
        db.session.execute(text('SELECT 1'))
        return jsonify({
            'status': 'success',
            'message': 'Подключение к базе данных успешно установлено!'
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Ошибка подключения к базе данных: {str(e)}'
        }), 500

@app.route('/api/check_db', methods=['GET'])
def check_db():
    try:
        # Проверяем существование таблиц
        result = db.session.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        """))
        tables = [row[0] for row in result]
        
        # Проверяем количество записей в каждой таблице
        table_counts = {}
        for table in tables:
            count = db.session.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            table_counts[table] = count
            
        return jsonify({
            'status': 'success',
            'data': {
                'tables': tables,
                'counts': table_counts
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Ошибка при проверке базы данных: {str(e)}'
        }), 500

@app.route('/api/check_stations', methods=['GET'])
def check_stations():
    try:
        # Прямой SQL-запрос для проверки данных
        result = db.session.execute(text("SELECT * FROM stations LIMIT 5"))
        stations = []
        for row in result:
            station_dict = dict(row._mapping)
            # Преобразуем Decimal в float для JSON
            if 'rating' in station_dict and station_dict['rating'] is not None:
                station_dict['rating'] = float(station_dict['rating'])
            stations.append(station_dict)
            
        return jsonify({
            'status': 'success',
            'data': stations
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Ошибка при проверке станций: {str(e)}'
        }), 500

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/help')
def help():
    return render_template('help.html')

@app.route('/blog')
def blog():
    return render_template('blog.html')

@app.route('/instructor')
def instructor():
    return render_template('instructor.html')

@app.route('/kart')
def kart():
    return render_template('kart.html')

@app.route('/poisk')
def poisk():
    return render_template('poisk.html')

@app.route('/windy')
def windy():
    return render_template('windy.html')

@app.route('/favorites')
def favorites():
    return render_template('favorites.html')

@app.route('/shop')
def shop():
    return render_template('shop.html')

@app.route('/events')
def events():
    return render_template('events.html')

@app.route('/encyclopedia')
def encyclopedia():
    return render_template('encyclopedia.html')

@app.route('/encyclopedia/<category_name>')
def encyclopedia_category(category_name):
    return render_template(f'enc_card_{category_name}.html')

@app.route('/api/stations', methods=['GET'])
def get_stations():
    try:
        # Сначала проверим количество записей
        count = Station.query.count()
        
        # Получаем все станции
        stations = Station.query.all()
        
        # Преобразуем в список словарей
        stations_list = []
        for station in stations:
            station_dict = {
                'id': station.id,
                'name': station.name,
                'address': station.address,
                'latitude': station.latitude,
                'longitude': station.longitude,
                'rating': float(station.rating) if station.rating else None,
                'sports': station.sports,
                'activities': station.activities,
                'photos': station.photos
            }
            stations_list.append(station_dict)
            
        return jsonify({
            'status': 'success',
            'count': count,
            'data': stations_list
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Ошибка при получении данных: {str(e)}',
            'error_type': type(e).__name__
        }), 500

@app.route('/api/stations/<int:station_id>', methods=['GET'])
def get_station(station_id):
    try:
        station = Station.query.get_or_404(station_id)
        return jsonify({
            'status': 'success',
            'data': {
                'id': station.id,
                'name': station.name,
                'address': station.address,
                'latitude': station.latitude,
                'longitude': station.longitude,
                'rating': float(station.rating) if station.rating else None,
                'sports': station.sports,
                'activities': station.activities,
                'photos': station.photos,
                'description': station.description,
                'contact_phone': station.contact_phone,
                'contact_email': station.contact_email,
                'work_schedule': station.work_schedule
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Ошибка при получении данных: {str(e)}'
        }), 500

@app.route('/api/places', methods=['GET'])
def get_places():
    try:
        # Получаем все места
        places = Place.query.all()
        
        # Преобразуем в список словарей
        places_list = []
        for place in places:
            place_dict = {
                'id': place.id,
                'name': place.name,
                'short_description': place.short_description,
                'infrastructure': place.infrastructure,
                'seasons': place.seasons,
                'how_to_get_there': place.how_to_get_there,
                'difficulty_level': place.difficulty_level,
                'latitude': place.latitude,
                'longitude': place.longitude,
                'country': place.country,
                'region': place.region,
                'city': place.city,
                'full_address': place.full_address,
                'categories': place.categories,
                'show_weather_widget': place.show_weather_widget
            }
            places_list.append(place_dict)
            
        return jsonify({
            'status': 'success',
            'count': len(places_list),
            'data': places_list
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Ошибка при получении данных: {str(e)}',
            'error_type': type(e).__name__
        }), 500

@app.route('/api/places/<int:place_id>', methods=['GET'])
def get_place(place_id):
    try:
        place = Place.query.get_or_404(place_id)
        return jsonify({
            'status': 'success',
            'data': {
                'id': place.id,
                'name': place.name,
                'short_description': place.short_description,
                'infrastructure': place.infrastructure,
                'seasons': place.seasons,
                'how_to_get_there': place.how_to_get_there,
                'difficulty_level': place.difficulty_level,
                'latitude': place.latitude,
                'longitude': place.longitude,
                'country': place.country,
                'region': place.region,
                'city': place.city,
                'full_address': place.full_address,
                'categories': place.categories,
                'show_weather_widget': place.show_weather_widget
            }
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Ошибка при получении данных: {str(e)}'
        }), 500

@app.route('/api/places/check', methods=['GET'])
def check_places():
    try:
        # Прямой SQL-запрос для проверки данных
        result = db.session.execute(text("SELECT * FROM places LIMIT 5"))
        places = []
        for row in result:
            place_dict = dict(row._mapping)
            places.append(place_dict)
            
        return jsonify({
            'status': 'success',
            'data': places
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'Ошибка при проверке мест: {str(e)}'
        }), 500

# Маршрут для регистрации
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    role = data.get('role')
    password = data.get('password')
    
    if User.query.filter_by(username=username).first():
        return jsonify({'status': 'error', 'message': 'Пользователь с таким именем уже существует'}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({'status': 'error', 'message': 'Пользователь с таким email уже существует'}), 400
    
    user = User(username=username, email=email, first_name=first_name, last_name=last_name, role=role)
    user.set_password(password)
    
    try:
        db.session.add(user)
        db.session.commit()
        login_user(user)
        return jsonify({'status': 'success', 'message': 'Регистрация успешна'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': 'Ошибка при регистрации'}), 500

# Маршрут для входа
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    user = User.query.filter_by(username=username).first()
    
    if user and user.check_password(password):
        login_user(user)
        return jsonify({'status': 'success', 'message': 'Вход выполнен успешно'})
    
    return jsonify({'status': 'error', 'message': 'Неверное имя пользователя или пароль'}), 401

# Маршрут для выхода
@app.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({'status': 'success', 'message': 'Выход выполнен успешно'})

# Маршрут для проверки статуса авторизации
@app.route('/check_auth')
def check_auth():
    if current_user.is_authenticated:
        return jsonify({
            'status': 'success',
            'user': {
                'id': current_user.id,
                'username': current_user.username,
                'email': current_user.email
            }
        })
    return jsonify({'status': 'error', 'message': 'Пользователь не авторизован'}), 401

if __name__ == '__main__':
    app.run(debug=True) 