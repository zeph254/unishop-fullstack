from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Order, OrderItem, CartItem, Product
from datetime import datetime, timedelta
from flask_cors import CORS

order_bp = Blueprint("order_bp", __name__)

# Enable CORS for the order_bp blueprint
CORS(
    order_bp,
    origins="http://localhost:5173",  # Allow requests from this origin
    supports_credentials=True,  # Allow credentials (e.g., cookies, authorization headers)
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],  # Allow these HTTP methods
    allow_headers=["Content-Type", "Authorization"],  # Allow these headers
)

# Add a global after_request handler to include CORS headers
@order_bp.after_request
def after_request(response):
    response.headers.add("Access-Control-Allow-Origin", "http://localhost:5173")
    response.headers.add("Access-Control-Allow-Credentials", "true")
    response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
    response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    return response

@order_bp.route("/create", methods=["POST"])
@jwt_required()
def create_order():
    user_id = get_jwt_identity()
    data = request.get_json()

    if "cart_items" not in data:
        return jsonify({"message": "cart_items is required"}), 400

    cart_items = data["cart_items"]
    if not cart_items:
        return jsonify({"message": "Cart is empty"}), 400

    total_price = sum(item["product"].get("price", 0) * item["quantity"] for item in cart_items)

    # Ensure estimated_delivery is set properly
    estimated_delivery = datetime.utcnow() + timedelta(days=1)

    order = Order(
        user_id=user_id,
        total_price=total_price,
        status="Pending",
        estimated_delivery=estimated_delivery,
        shipping_status="Processing"
    )
    db.session.add(order)
    db.session.flush()

    for item in cart_items:
        subtotal = item["product"].get("price", 0) * item["quantity"]
        order_item = OrderItem(
            order_id=order.id,
            product_id=item["product_id"],
            quantity=item["quantity"],
            subtotal=subtotal
        )
        db.session.add(order_item)

    db.session.commit()
    return jsonify({"message": "Order placed successfully", "order_id": order.id}), 201

@order_bp.route("/history", methods=["GET", "OPTIONS"])  
@jwt_required()
def order_history():
    if request.method == "OPTIONS":
        return jsonify(), 200

    user_id = get_jwt_identity()
    orders = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc()).all()
    
    return jsonify([{
        "id": order.id,
        "total_price": order.total_price,
        "status": order.status,
        "shipping_status": order.shipping_status,
        "created_at": order.created_at.isoformat(),  
        "estimated_delivery": order.estimated_delivery.isoformat() if order.estimated_delivery else None,  
        "items": [{
            "product": item.product.name,
            "quantity": item.quantity,
            "subtotal": item.subtotal
        } for item in order.items]
    } for order in orders])

@order_bp.route("/track/<int:order_id>", methods=["GET", "OPTIONS"])
@jwt_required()
def track_order(order_id):
    if request.method == "OPTIONS":
        return jsonify(), 200

    user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()

    if not order:
        return jsonify({"message": "Order not found"}), 404

    # Ensure valid estimated_delivery
    if not order.estimated_delivery:
        order.estimated_delivery = order.created_at + timedelta(days=1)
        db.session.commit()

    # Update shipping status based on order progress
    if order.shipping_status == "Processing" and datetime.utcnow() > order.created_at + timedelta(hours=2):
        order.shipping_status = "Shipped"
        db.session.commit()

    if order.shipping_status == "Shipped" and datetime.utcnow() > order.estimated_delivery:
        order.shipping_status = "Delivered"
        order.status = "Completed"
        db.session.commit()

    return jsonify({
        "id": order.id,
        "status": order.status,
        "shipping_status": order.shipping_status,
        "estimated_delivery": order.estimated_delivery.isoformat()
    })

@order_bp.route("/update/<int:order_id>", methods=["PUT"])
@jwt_required()
def update_order_status(order_id):
    user_id = get_jwt_identity()
    data = request.json
    
    if "status" not in data:
        return jsonify({"message": "Status is required"}), 400
    
    order = Order.query.get(order_id)
    if not order:
        return jsonify({"message": "Order not found"}), 404
    
    order.status = data["status"]
    db.session.commit()
    
    return jsonify({"message": "Order status updated", "new_status": order.status}) 

# One-time script to fix missing estimated_delivery in database
def fix_estimated_delivery():
    orders = Order.query.filter(Order.estimated_delivery == None).all()
    for order in orders:
        order.estimated_delivery = order.created_at + timedelta(days=1)
    db.session.commit()
