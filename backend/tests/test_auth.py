import unittest
from flask import Flask, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt
from models import db, User
from app import auth_bp

class AuthTestCase(unittest.TestCase):

    def setUp(self):
        # Create a test Flask application
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        self.app.config['JWT_SECRET_KEY'] = 'test_secret_key'
        self.app.config['JWT_TOKEN_LOCATION'] = ['headers']
        self.app.config['JWT_HEADER_NAME'] = 'Authorization'
        self.app.config['JWT_HEADER_TYPE'] = 'Bearer'

        # Initialize the database and bind it to the app
        db.init_app(self.app)
        self.jwt = JWTManager(self.app)
        self.app.register_blueprint(auth_bp)

        # Create the database and tables
        with self.app.app_context():
            db.create_all()

        # Create a test client
        self.client = self.app.test_client()

        # Add a test user to the database within the application context
        with self.app.app_context():
            self.test_user = User(
                username='testuser',
                email='test@example.com',
                password=generate_password_hash('testpassword')  # Ensure password is hashed
            )
            db.session.add(self.test_user)
            db.session.commit()

    def tearDown(self):
        # Clean up the database after each test
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def test_register_user(self):
        # Test registering a new user
        data = {
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "newpassword"
        }
        response = self.client.post('/auth/register', json=data)
        self.assertEqual(response.status_code, 201)
        self.assertIn("User registered successfully", response.json['message'])

    def test_register_user_missing_fields(self):
        # Test registering a user with missing fields
        data = {
            "username": "newuser",
            "email": "newuser@example.com"
        }
        response = self.client.post('/auth/register', json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Username, email, and password are required", response.json['error'])

    def test_register_user_duplicate_email(self):
        # Test registering a user with a duplicate email
        data = {
            "username": "testuser2",
            "email": "test@example.com",  # Duplicate email
            "password": "testpassword2"
        }
        response = self.client.post('/auth/register', json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("User with this email already exists", response.json['error'])

    def test_login_user(self):
        # Test logging in a user
        data = {
            "email": "test@example.com",
            "password": "testpassword"
        }
        response = self.client.post('/auth/login', json=data)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Login successful", response.json['message'])
        self.assertIn("access_token", response.json)
        self.assertIn("refresh_token", response.json)

    def test_login_user_invalid_credentials(self):
        # Test logging in with invalid credentials
        data = {
            "email": "test@example.com",
            "password": "wrongpassword"
        }
        response = self.client.post('/auth/login', json=data)
        self.assertEqual(response.status_code, 401)
        self.assertIn("Invalid email or password", response.json['error'])

    def test_login_user_missing_fields(self):
        # Test logging in with missing fields
        data = {
            "email": "test@example.com"
        }
        response = self.client.post('/auth/login', json=data)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Email and password are required", response.json['error'])

    def test_logout_user(self):
        # Test logging out a user
        # First, log in to get a valid token
        login_data = {
            "email": "test@example.com",
            "password": "testpassword"
        }
        login_response = self.client.post('/auth/login', json=login_data)
        access_token = login_response.json['access_token']

        # Now, log out
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        response = self.client.post('/auth/logout', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Logout successful", response.json['message'])

    def test_logout_user_without_token(self):
        # Test logging out without a token (should fail)
        response = self.client.post('/auth/logout')
        self.assertEqual(response.status_code, 401)  # Unauthorized

if __name__ == '__main__':
    unittest.main()