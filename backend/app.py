from flask import Flask
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from datetime import timedelta
import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import cloudinary.api
from flask_cors import CORS
from extensions import db

# Load environment variables
load_dotenv()

# Initialize extensions (without attaching to app)
# db = SQLAlchemy()
mail = Mail()
jwt = JWTManager()

# Import Blueprints
from views import user_bp, admin_bp, product_bp, cart_bp, order_bp, analytics_bp, payment_bp, auth_bp, oauth_bp, wishlist_bp

def create_app():
    app = Flask(__name__)

    # Enable CORS for all routes and allow specific headers and methods
    CORS(app, resources={
        r"/*": {
            "origins": "http://localhost:5173",
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }
    })

    # Configuration settings
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///shop.db"
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'wouhsdjlahljxnlsqehouefhouuel')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=24)
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME', 'owuor.ulare@student.moringaschool.com')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD', 'ihbj btnx luqy trek')

    # Set the SECRET_KEY for session management
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'jhlughjhnkluhik')  # Add this line

    # Cloudinary configuration
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME', 'dpdi0tain'),
        api_key=os.getenv('CLOUDINARY_API_KEY', '144782431176298'),
        api_secret=os.getenv('CLOUDINARY_API_SECRET', 'WuEOYoxDevKu0q2wSWLQbsrQwGE')
    )

    # Initialize extensions with the app
    db.init_app(app)
    mail.init_app(app)
    jwt.init_app(app)
    Migrate(app, db)

    # Register Blueprints
    app.register_blueprint(user_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(product_bp)
    app.register_blueprint(cart_bp)
    app.register_blueprint(order_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(payment_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(oauth_bp)
    app.register_blueprint(wishlist_bp)

    return app

# Export Blueprints for testing
__all__ = ['user_bp', 'admin_bp', 'product_bp', 'cart_bp', 'order_bp', 'analytics_bp', 'payment_bp', 'auth_bp', 'oauth_bp', 'wishlist_bp']

# Run the application
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)