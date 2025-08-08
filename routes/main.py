from flask import Blueprint, render_template, redirect, session

main_bp = Blueprint('main', __name__)

@main_bp.route('/')
def home():
    return redirect('about.html')  # 這確保訪問根路徑時會重定向到 about.html

@main_bp.route('/about.html')
def about():
    user_email = session.get('user_email')
    return render_template('about.html', user_email=user_email)

@main_bp.route('/freeresource.html')
def freeresource():
    return render_template('freeresource.html')

@main_bp.route('/new_took.html')
def new_took():
    return render_template('new_took.html')

@main_bp.route('/service.html')
def service():
    return render_template('service.html')