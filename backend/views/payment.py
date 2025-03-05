from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, Payment, User
from datetime import datetime
import random

payment_bp = Blueprint('payment_bp', __name__, url_prefix='/payment')

# Simulate a fake payment process
@payment_bp.route('/process', methods=['POST'])
@jwt_required()
def process_payment():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Validate required fields
    if "order_id" not in data:
        return jsonify({"error": "Order ID is required"}), 400

    order_id = data["order_id"]
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()

    if not order:
        return jsonify({"error": "Order not found"}), 404

    if order.status != "Pending":
        return jsonify({"error": "Order has already been processed"}), 400

    # Simulate a fake payment process
    payment_id = f"PAY-{random.randint(100000, 999999)}"
    payment = Payment(
        order_id=order.id,
        payment_id=payment_id,
        payment_method="credit_card",  # Simulated payment method
        amount=order.total_price,
        status="completed",
        transaction_details={"simulated": True}  # Simulated transaction details
    )

    # Update order status
    order.status = "Completed"
    db.session.add(payment)
    db.session.commit()

    return jsonify({
        "message": "Payment processed successfully",
        "payment_id": payment_id,
        "order_id": order.id,
        "status": order.status
    }), 200

# Generate an invoice for a completed order
@payment_bp.route('/invoice/<int:order_id>', methods=['GET'])
@jwt_required()
def generate_invoice(order_id):
    user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()

    if not order:
        return jsonify({"error": "Order not found"}), 404

    if order.status != "Completed":
        return jsonify({"error": "Invoice can only be generated for completed orders"}), 400

    user = User.query.get(user_id)
    payment = Payment.query.filter_by(order_id=order.id).first()

    invoice = {
        "invoice_id": f"INV-{random.randint(100000, 999999)}",
        "order_id": order.id,
        "user": {
            "username": user.username,
            "email": user.email
        },
        "total_price": order.total_price,
        "payment_id": payment.payment_id,
        "payment_method": payment.payment_method,
        "payment_date": payment.payment_date,
        "items": [
            {
                "product_name": item.product.name,
                "quantity": item.quantity,
                "price": item.product.price,
                "subtotal": item.subtotal
            }
            for item in order.items
        ],
        "billing_address": "123 Fake Street, Springfield, USA",  # Replace with actual billing address logic
        "shipping_address": "123 Fake Street, Springfield, USA"  # Replace with actual shipping address logic
    }

    return jsonify(invoice), 200