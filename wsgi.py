from app import create_app
from config import Config

# Create the Flask app instance using the factory pattern
app = create_app(Config)

if __name__ == "__main__":
    app.run()
