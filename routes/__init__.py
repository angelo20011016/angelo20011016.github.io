from routes.main import main
from routes.portfolio import portfolio_bp
from routes.blog import blog_bp
from routes.contact import contact_bp
from routes.admin import admin_bp
from routes.user import user_bp
from routes.translator import translator_bp

def init_routes(app):
    """註冊所有路由藍圖"""
    app.register_blueprint(main)
    app.register_blueprint(portfolio_bp)
    app.register_blueprint(blog_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(translator_bp)