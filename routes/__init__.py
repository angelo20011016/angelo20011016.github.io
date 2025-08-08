from flask import Flask

def init_routes(app: Flask):
    from routes.main import main_bp
    from routes.user import user_bp
    from routes.admin import admin_bp
    from routes.portfolio import portfolio_bp
    from routes.blog import blog_bp
    from routes.contact import contact_bp
    from routes.translator import translator_bp

    app.register_blueprint(main_bp)
    app.register_blueprint(user_bp, url_prefix='/user')
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(portfolio_bp)
    app.register_blueprint(blog_bp)
    app.register_blueprint(contact_bp)
    app.register_blueprint(translator_bp)
