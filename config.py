import os
from dotenv import load_dotenv

load_dotenv()  # 載入 .env 檔案

class Config:
    """應用程式配置"""
    # MongoDB 配置
    MONGODB_URI = os.getenv('MONGODB_URI')
    if not MONGODB_URI:
        MONGODB_URI = os.getenv('MONGODB_URL_PROD')
    if not MONGODB_URI:
        MONGODB_URI = os.getenv('MONGODB_URL_DEV', 'mongodb://localhost:27017/my_website')

    # 確保URI包含數據庫名稱
    if MONGODB_URI and 'mongodb+srv' in MONGODB_URI and '/my_website' not in MONGODB_URI:
        if '?' in MONGODB_URI:
            MONGODB_URI = MONGODB_URI.replace('?', '/my_website?')
        else:
            MONGODB_URI = f"{MONGODB_URI}/my_website"
    
    # 密鑰配置
    SECRET_KEY = os.getenv('SECRET_KEY', 'your_secret_key')
    
    # 管理員配置
    ADMIN_USER = os.getenv('ADMIN_USER')
    ADMIN_PASSWORD = os.getenv('ADMIN_PASSWORD')
    
    # 其他配置
    DEBUG = os.getenv('FLASK_ENV') == 'development'
    MAIL_USERNAME = os.getenv('MAIL_USERNAME')
    MAIL_PASSWORD = os.getenv('MAIL_PASSWORD')
    MAIL_SERVER = os.getenv('MAIL_SERVER')
    MAIL_PORT = int(os.getenv('MAIL_PORT', 587))
    MAIL_USE_TLS = os.getenv('MAIL_USE_TLS', 'True') == 'True'