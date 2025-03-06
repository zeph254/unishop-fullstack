from flask import Flask, jsonify, request
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

# Initialize extensions
mail = Mail()
jwt = JWTManager()

# Import Blueprints
from views import user_bp, admin_bp, product_bp, cart_bp, order_bp, analytics_bp, payment_bp, auth_bp, oauth_bp, wishlist_bp

def create_app():
    app = Flask(__name__)

    # Enable CORS for all domains (change this to a specific domain in production)
    configure_cors(app)

    # Configuration settings
    app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://shopdb_475k_user:uYSh9kbllnuSOnx9vV3Kd8TdfBPwUnBT@dpg-cv4asbl2ng1s73b720i0-a.oregon-postgres.render.com/shopdb_475k"
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
    register_blueprints(app)

    # Explicitly handle OPTIONS preflight requests
    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            return _build_cors_preflight_response()

    @app.after_request
    def after_request(response):
        return _corsify_response(response)

    return app

def configure_cors(app):
    CORS(app, supports_credentials=True)

def register_blueprints(app):
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

# Helper function to handle CORS preflight responses
def _build_cors_preflight_response():
    response = jsonify({"message": "CORS preflight successful"})
    response.status_code = 200
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response

# Helper function to add CORS headers to all responses
def _corsify_response(response):
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    return response

# Run the application
if __name__ == "__main__":
    app = create_app()
    app.run(debug=True)
