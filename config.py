import os

# This is just a blueprint. The actual loading happens in app.py.
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY')
    DEBUG = False
    TESTING = False
    # Define keys to be loaded from .env
    CONFIG_KEYS = [
        'MONGO_URI',
        'ADMIN_USER',
        'ADMIN_PASSWORD',
        'MAIL_USERNAME',
        'MAIL_PASSWORD',
        'MAIL_SERVER',
        'MAIL_PORT',
        'MAIL_USE_TLS',
        'AZURE_SPEECH_KEY',
        'AZURE_SPEECH_REGION',
        'GEMINI_API_KEY'
    ]