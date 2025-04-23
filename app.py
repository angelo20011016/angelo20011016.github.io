from flask import Flask
from services.db_service import init_db
from routes import init_routes
from config import Config
from services.mail_service import init_mail
def create_app(config_class=Config):
    """創建並配置 Flask 應用程式"""
    app = Flask(__name__)
    
    # 載入配置
    app.config.from_object(config_class)
    app.config["MONGO_URI"] = config_class.MONGODB_URI
    app.secret_key = config_class.SECRET_KEY
    init_mail(app)
    # 初始化數據庫
    init_db(app)
    
    # 註冊路由
    init_routes(app)
    print("MAIL_USERNAME:", app.config.get("MAIL_USERNAME"))
    print("MAIL_PASSWORD:", app.config.get("MAIL_PASSWORD"))
    print("MAIL_SERVER:", app.config.get("MAIL_SERVER"))
    print("MAIL_PORT:", app.config.get("MAIL_PORT"))
    print("MAIL_USE_TLS:", app.config.get("MAIL_USE_TLS")) 
    return app

# 創建應用程式實例
app = create_app()

if __name__ == '__main__':
    try:
        # 在開發環境允許外部連接
        app.run(host='0.0.0.0', port=5001, debug=True)
   

    except Exception as e:
        print(f"Error starting server: {e}")