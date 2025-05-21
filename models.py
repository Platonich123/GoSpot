from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable=False)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)
    profile_picture = db.Column(db.String)
    phone_number = db.Column(db.String)
    address = db.Column(db.String)
    birthdate = db.Column(db.Date)
    gender = db.Column(db.String)
    last_login = db.Column(db.DateTime)
    is_verified = db.Column(db.Boolean, default=False)
    username = db.Column(db.String(80), unique=True, nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Station(db.Model):
    __tablename__ = 'stations'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    contact_phone = db.Column(db.String)
    contact_email = db.Column(db.String)
    contact_messengers = db.Column(db.String)
    description = db.Column(db.Text)
    sports = db.Column(db.ARRAY(db.String))
    activities = db.Column(db.ARRAY(db.String))
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    address = db.Column(db.String, nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Numeric(2, 1))
    work_schedule = db.Column(db.String)
    is_owner = db.Column(db.Boolean)
    photos = db.Column(db.ARRAY(db.String))
    station_services = db.Column(db.ARRAY(db.String))
    accessibility = db.Column(db.String)
    access_features = db.Column(db.String)
    transfer_available = db.Column(db.Boolean)
    equipment = db.Column(db.ARRAY(db.String))
    has_rental = db.Column(db.Boolean)
    has_training = db.Column(db.Boolean)
    has_rescue = db.Column(db.Boolean)
    has_food_delivery = db.Column(db.Boolean)
    station_facilities = db.Column(db.ARRAY(db.String))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    owner_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

class Place(db.Model):
    __tablename__ = 'places'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, nullable=False)
    short_description = db.Column(db.String(500))
    infrastructure = db.Column(db.Text)
    seasons = db.Column(db.String)
    how_to_get_there = db.Column(db.Text)
    difficulty_level = db.Column(db.Integer)
    admin_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    show_weather_widget = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id'))
    latitude = db.Column(db.Float)
    longitude = db.Column(db.Float)
    country = db.Column(db.String)
    region = db.Column(db.String)
    city = db.Column(db.String)
    full_address = db.Column(db.String)
    categories = db.Column(db.ARRAY(db.String))

class Event(db.Model):
    __tablename__ = 'events'
    
    id = db.Column(db.Integer, primary_key=True)
    event_types = db.Column(db.ARRAY(db.String), nullable=False)
    title = db.Column(db.String, nullable=False)
    event_date = db.Column(db.Date, nullable=False)
    start_time = db.Column(db.Time, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    requires_registration = db.Column(db.Boolean)
    description = db.Column(db.Text, nullable=False)
    photos = db.Column(db.ARRAY(db.String))
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id'))
    organizer_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))

class Trainer(db.Model):
    __tablename__ = 'trainers'
    
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String, nullable=False)
    last_name = db.Column(db.String, nullable=False)
    nickname = db.Column(db.String)
    about = db.Column(db.Text)
    photo = db.Column(db.String)
    sports = db.Column(db.ARRAY(db.String), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Numeric(2, 1))
    experience_start = db.Column(db.Date)
    achievements = db.Column(db.Text)
    certification_info = db.Column(db.Text)
    certification_files = db.Column(db.ARRAY(db.String))
    spot_location = db.Column(db.String)
    station_id = db.Column(db.Integer, db.ForeignKey('stations.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), unique=True)
    place_id = db.Column(db.Integer, db.ForeignKey('places.id'))
    contacts = db.Column(db.String)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Article(db.Model):
    __tablename__ = 'articles'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String, nullable=False)
    published_at = db.Column(db.Date, nullable=False)
    cover_image = db.Column(db.String, nullable=False)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    sponsor = db.Column(db.String)
    short_description = db.Column(db.Text, nullable=False)
    full_description = db.Column(db.Text, nullable=False)
    tag = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow) 