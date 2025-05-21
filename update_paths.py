import os
import re

def update_file_paths(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        content = file.read()

    # Обновляем пути к CSS файлам
    content = re.sub(r'href="([^"]+\.css)"', r'href="{{ url_for(\'static\', filename=\'css/\1\') }}"', content)
    
    # Обновляем пути к JS файлам
    content = re.sub(r'src="([^"]+\.js)"', r'src="{{ url_for(\'static\', filename=\'js/\1\') }}"', content)
    
    # Обновляем пути к изображениям
    content = re.sub(r'src="card/([^"]+)"', r'src="{{ url_for(\'static\', filename=\'card/\1\') }}"', content)
    
    # Обновляем ссылки на страницы
    content = re.sub(r'href="([^"]+\.html)"', lambda m: f'href="{{ url_for(\'{os.path.splitext(m.group(1))[0]}\') }}"', content)
    
    with open(file_path, 'w', encoding='utf-8') as file:
        file.write(content)

def process_directory(directory):
    for filename in os.listdir(directory):
        if filename.endswith('.html'):
            file_path = os.path.join(directory, filename)
            update_file_paths(file_path)
            print(f'Обновлен файл: {filename}')

if __name__ == '__main__':
    templates_dir = 'templates'
    process_directory(templates_dir) 