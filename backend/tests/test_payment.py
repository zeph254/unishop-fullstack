import unittest
from flask import Flask
from flask_jwt_extended import create_access_token, JWTManager
from models import db, Order, Payment, User, Product, OrderItem
from datetime import datetime
from app import payment_bp
from werkzeug.security import generate_password_hash


class PaymentTestCase(unittest.TestCase):

    def setUp(self):
        # Create a test Flask application
        self.app = Flask(__name__)
        self.app.config['TESTING'] = True
        self.app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
        self.app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
        self.app.config['JWT_SECRET_KEY'] = 'test_secret_key'

        # Initialize the database
        db.init_app(self.app)

        # Initialize JWTManager with the app
        jwt = JWTManager(self.app)

        # Register the Blueprint for payments
        self.app.register_blueprint(payment_bp)

        # Create the database and tables
        with self.app.app_context():
            db.create_all()

        # Create a test client
        self.client = self.app.test_client()

        # Add test data
        with self.app.app_context():
            # Create a user with password (hashed)
            password = 'password123'  # Example password for the user
            self.user = User(username='testuser', email='test@example.com', password=generate_password_hash(password))
            db.session.add(self.user)
            db.session.commit()

            # Create a product with a category
            self.product = Product(name='Test Product', price=100.0, category='Test Category')
            db.session.add(self.product)
            db.session.commit()

            # Create an order for the user
            self.order = Order(user_id=self.user.id, total_price=100.0, status='Pending')
            db.session.add(self.order)
            db.session.commit()

            # Create an order item associated with the order
            self.order_item = OrderItem(order_id=self.order.id, product_id=self.product.id, quantity=1, subtotal=100.0)
            db.session.add(self.order_item)
            db.session.commit()

            # Generate a JWT token for the test user
            self.token = create_access_token(identity=self.user.id)

            # Ensure the order is merged into the session (even after commit)
            with self.app.app_context():
                self.order = db.session.merge(self.order)

    def tearDown(self):
        # Clean up the database after each test
        with self.app.app_context():
            db.session.remove()
            db.drop_all()

    def ensure_order_in_session(self):
        # Ensure the order is attached to the session before interacting with it
        with self.app.app_context():
            self.order = db.session.merge(self.order)

    def test_process_payment(self):
        # Test the payment process endpoint
        headers = {
            'Authorization': f'Bearer {self.token}'
        }
        data = {
            "order_id": self.order.id
        }

        # Ensure the order is merged into the session before using it
        self.ensure_order_in_session()

        response = self.client.post('/payment/process', json=data, headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("Payment processed successfully", response.json['message'])
        self.assertEqual(response.json['status'], 'Completed')

    def test_generate_invoice(self):
        # First, process the payment to set the order status to "Completed"
        headers = {
            'Authorization': f'Bearer {self.token}'
        }
        data = {
            "order_id": self.order.id
        }

        # Ensure the order is merged into the session before using it
        self.ensure_order_in_session()

        self.client.post('/payment/process', json=data, headers=headers)

        # Now, test the invoice generation endpoint
        response = self.client.get(f'/payment/invoice/{self.order.id}', headers=headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("invoice_id", response.json)
        self.assertEqual(response.json['order_id'], self.order.id)
        self.assertEqual(response.json['user']['username'], 'testuser')
        self.assertEqual(response.json['total_price'], 100.0)

    def test_process_payment_invalid_order(self):
        # Test payment process with an invalid order ID
        headers = {
            'Authorization': f'Bearer {self.token}'
        }
        data = {
            "order_id": 999  # Invalid order ID
        }

        # Ensure the order is merged into the session before using it
        self.ensure_order_in_session()

        response = self.client.post('/payment/process', json=data, headers=headers)
        self.assertEqual(response.status_code, 404)
        self.assertIn("Order not found", response.json['error'])

    def test_generate_invoice_invalid_order(self):
        # Test invoice generation with an invalid order ID
        headers = {
            'Authorization': f'Bearer {self.token}'
        }
        response = self.client.get('/payment/invoice/999', headers=headers)
        self.assertEqual(response.status_code, 404)
        self.assertIn("Order not found", response.json['error'])

    def test_generate_invoice_unprocessed_order(self):
        # Test invoice generation for an order that hasn't been processed
        headers = {
            'Authorization': f'Bearer {self.token}'
        }

        # Ensure the order is merged into the session before using it
        self.ensure_order_in_session()

        response = self.client.get(f'/payment/invoice/{self.order.id}', headers=headers)
        self.assertEqual(response.status_code, 400)
        self.assertIn("Invoice can only be generated for completed orders", response.json['error'])


if __name__ == '__main__':
    unittest.main()