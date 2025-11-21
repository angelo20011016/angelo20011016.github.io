from flask import Flask
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os
import sys

# --- Robust .env Loading ---
# Construct an absolute path to the .env file to ensure it's always found.
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
else:
    print("⚠️ WARNING: .env file not found at:", dotenv_path, file=sys.stderr)

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

    # This is the critical part for Flask-PyMongo.
    # We directly get 'MONGODB_URI' from the environment and assign it to 'MONGO_URI'.
    app.config['MONGO_URI'] = os.getenv('MONGODB_URI')

    # Special handling for integer ports
    if app.config.get('MAIL_PORT'):
        try:
            app.config['MAIL_PORT'] = int(app.config['MAIL_PORT'])
        except (ValueError, TypeError):
            print(f"⚠️ WARNING: Invalid MAIL_PORT value '{app.config.get('MAIL_PORT')}'\. Using default.", file=sys.stderr)
            app.config['MAIL_PORT'] = 587 # Fallback to a default
    
    # --- Pre-boot Check ---
    mongo_uri = app.config.get('MONGO_URI')
    print("--- Final Config Loaded in App ---")
    print(f"MONGO_URI: {mongo_uri}")
    print(f"AZURE_KEY: {bool(app.config.get('AZURE_SPEECH_KEY'))}")
    print("----------------------------------")

    if not mongo_uri:
        print("\n🔴 致命錯誤：資料庫連線（MONGO_URI）未設定。", file=sys.stderr)
        print("   請檢查以下項目：", file=sys.stderr)
        print("   1. 專案根目錄下是否存在一個名為 '.env' 的檔案。", file=sys.stderr)
        print("   2. '.env' 檔案中是否包含一個名為 'MONGODB_URI' 的變數。", file=sys.stderr)
        print("   3. 範例 -> MONGODB_URI=\"mongodb+srv://user:pass@host/db\"\n", file=sys.stderr)
        sys.exit(1) # Exit the process with an error code

    # Initialize extensions AFTER config is fully loaded
    init_mail(app)
    init_db(app)
    init_routes(app)
    socketio.init_app(app, cors_allowed_origins="*")
    
    return app

if __name__ == '__main__':
    app = create_app(Config)
    # The check in create_app will prevent running a broken app
    if app:
        socketio.run(app, host='0.0.0.0', port=5001, debug=True)
