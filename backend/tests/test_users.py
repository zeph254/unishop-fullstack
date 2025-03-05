import unittest
from flask import Flask
from flask_jwt_extended import create_access_token, JWTManager
from models import db, User
from werkzeug.security import generate_password_hash

# Import the Blueprint from user.py
from app import user_bp

class UserTestCase(unittest.TestCase):

    def setUp(self):
        # Create a test Flask application
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        self.app.config['JWT_SECRET_KEY'] = 'test_secret_key'

        # Initialize the database and bind it to the app
        db.init_app(self.app)

        # Initialize JWTManager for the app
        jwt = JWTManager(self.app)

        # Register the Blueprint
        self.app.register_blueprint(user_bp)

        # Create the database and tables
        with self.app.app_context():
            db.create_all()

        # Create a test client
        self.client = self.app.test_client()

        # Add test data
        with self.app.app_context():
            # Create an admin user
            self.admin_user = User(
                username='admin',
                email='admin@example.com',
                password=generate_password_hash('admin123')  # Hash the password
            )
            self.admin_user.is_admin = True  # Simulate admin
            db.session.add(self.admin_user)

            # Create a regular user
            self.regular_user = User(
                username='regular',
                email='regular@example.com',
                password=generate_password_hash('regular123')  # Hash the password
            )
            self.regular_user.is_admin = False  # Simulate regular user
            db.session.add(self.regular_user)
            db.session.commit()

            # Generate JWT tokens for the users
            self.admin_token = create_access_token(identity=self.admin_user.id)
            self.regular_token = create_access_token(identity=self.regular_user.id)

    def tearDown(self):
        # Clean up the database after each test
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    # Helper method to set headers with JWT token
    def _get_headers(self, token):
        return {
            'Authorization': f'Bearer {token}'
        }

    # Test: Get all users (Admin Only)
    def test_get_users_admin(self):
        headers = self._get_headers(self.admin_token)
        response = self.client.get('/users/', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIsInstance(response.json, list)
        self.assertEqual(len(response.json), 2)  # Admin and regular user

    def test_get_users_regular_user(self):
        headers = self._get_headers(self.regular_token)
        response = self.client.get('/users/', headers=headers)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Unauthorized access", response.json['error'])

    # Test: Get a single user (Admin or the user themselves)
    def test_get_user_admin(self):
        headers = self._get_headers(self.admin_token)
        response = self.client.get(f'/users/{self.regular_user.id}', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['username'], 'regular')

    def test_get_user_self(self):
        headers = self._get_headers(self.regular_token)
        response = self.client.get(f'/users/{self.regular_user.id}', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json['username'], 'regular')

    def test_get_user_unauthorized(self):
        headers = self._get_headers(self.regular_token)
        response = self.client.get(f'/users/{self.admin_user.id}', headers=headers)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Unauthorized access", response.json['error'])

    def test_get_user_not_found(self):
        headers = self._get_headers(self.admin_token)
        response = self.client.get('/users/999', headers=headers)
        self.assertEqual(response.status_code, 404)
        self.assertIn("User not found", response.json['error'])

    # Test: Update user profile (Admin or the user themselves)
    def test_update_user_admin(self):
        headers = self._get_headers(self.admin_token)
        data = {
            "username": "updated_regular",
            "email": "updated_regular@example.com"
        }
        response = self.client.put(f'/users/{self.regular_user.id}', json=data, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("User updated successfully", response.json['message'])

    def test_update_user_self(self):
        headers = self._get_headers(self.regular_token)
        data = {
            "username": "updated_regular",
            "email": "updated_regular@example.com"
        }
        response = self.client.put(f'/users/{self.regular_user.id}', json=data, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("User updated successfully", response.json['message'])

    def test_update_user_unauthorized(self):
        headers = self._get_headers(self.regular_token)
        data = {
            "username": "updated_admin",
            "email": "updated_admin@example.com"
        }
        response = self.client.put(f'/users/{self.admin_user.id}', json=data, headers=headers)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Unauthorized action", response.json['error'])

    def test_update_user_not_found(self):
        headers = self._get_headers(self.admin_token)
        data = {
            "username": "updated_user",
            "email": "updated_user@example.com"
        }
        response = self.client.put('/users/999', json=data, headers=headers)
        self.assertEqual(response.status_code, 404)
        self.assertIn("User not found", response.json['error'])

    # Test: Delete user account (Admin or the user themselves)
    def test_delete_user_admin(self):
        headers = self._get_headers(self.admin_token)
        response = self.client.delete(f'/users/{self.regular_user.id}', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("User deleted successfully", response.json['message'])

    def test_delete_user_self(self):
        headers = self._get_headers(self.regular_token)
        response = self.client.delete(f'/users/{self.regular_user.id}', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("User deleted successfully", response.json['message'])

    def test_delete_user_unauthorized(self):
        headers = self._get_headers(self.regular_token)
        response = self.client.delete(f'/users/{self.admin_user.id}', headers=headers)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Unauthorized action", response.json['error'])

    def test_delete_user_not_found(self):
        headers = self._get_headers(self.admin_token)
        response = self.client.delete('/users/999', headers=headers)
        self.assertEqual(response.status_code, 404)
        self.assertIn("User not found", response.json['error'])

    # Test: Promote a user to admin (Admin Only)
    def test_promote_user_admin(self):
        headers = self._get_headers(self.admin_token)
        response = self.client.put(f'/users/{self.regular_user.id}/promote', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("User promoted to admin successfully", response.json['message'])

    def test_promote_user_unauthorized(self):
        headers = self._get_headers(self.regular_token)
        response = self.client.put(f'/users/{self.regular_user.id}/promote', headers=headers)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Unauthorized access", response.json['error'])

    def test_promote_user_not_found(self):
        headers = self._get_headers(self.admin_token)
        response = self.client.put('/users/999/promote', headers=headers)
        self.assertEqual(response.status_code, 404)
        self.assertIn("User not found", response.json['error'])

if __name__ == '__main__':
    unittest.main()