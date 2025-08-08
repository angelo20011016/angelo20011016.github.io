from flask import Flask
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os

# Load environment variables from .env file FIRST
load_dotenv()

socketio = SocketIO()

from services.db_service import init_db
from routes import init_routes
from config import Config
from services.mail_service import init_mail

def create_app(config_class=Config):
    """Create and configure the Flask application."""
    app = Flask(__name__)
    
    # --- Centralized Configuration Loading ---
    app.config.from_object(config_class)
    
    # Manually load every key from .env into app.config
    for key in app.config['CONFIG_KEYS']:
        app.config[key] = os.getenv(key)

    # 修正：確保 MONGO_URI 被設定
    if app.config.get('MONGODB_URI'):
        app.config['MONGO_URI'] = app.config['MONGODB_URI']

    # Special handling for integer ports
    if app.config.get('MAIL_PORT'):
        app.config['MAIL_PORT'] = int(app.config['MAIL_PORT'])
    
    # --- End of Centralized Loading ---

    # Debugging: Check final config values
    print("--- Final Config Loaded in App ---")
    print(f"MONGO_URI: {app.config.get('MONGODB_URI')}")
    print(f"AZURE_KEY: {bool(app.config.get('AZURE_SPEECH_KEY'))}")
    print("----------------------------------")

    # Initialize extensions AFTER config is fully loaded
    init_mail(app)
    init_db(app)
    init_routes(app)
    socketio.init_app(app, cors_allowed_origins="*")
    
    return app

if __name__ == '__main__':
    app = create_app(Config)
    socketio.run(app, host='0.0.0.0', port=5001, debug=True)
