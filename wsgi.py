import os
from dotenv import load_dotenv
from app import app

# Загрузка переменных окружения
load_dotenv()

if __name__ == "__main__":
    app.run() 