from flask import Flask, render_template, request

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(debug=True) 