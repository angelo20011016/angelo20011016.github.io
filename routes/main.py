from flask import Blueprint, render_template, redirect

main = Blueprint('main', __name__)

@main.route('/')
def home():
    return redirect('about.html')  # 這確保訪問根路徑時會重定向到 about.html

@main.route('/about.html')
def about():
    return render_template('about.html')

@main.route('/freeresource.html')
def freeresource():
    return render_template('freeresource.html')

@main.route('/new_took.html')
def new_took():
    return render_template('new_took.html')

@main.route('/service.html')
def service():
    return render_template('service.html')