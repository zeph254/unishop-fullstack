from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Product
from extensions import db

admin_bp = Blueprint('admin_bp', __name__, url_prefix='/admin')

# --- User Management ---

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    users = User.query.all()
    user_list = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "created_at": user.created_at
        }
        for user in users
    ]
    return jsonify(user_list), 200

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_by_id(user_id):
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    user = User.query.get_or_404(user_id)  # Returns 404 if not found
    return jsonify({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "created_at": user.created_at
    }), 200


@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
def delete_user(user_id):
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    user = User.query.get_or_404(user_id)
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])  # Update User Role
@jwt_required()
def update_user_role(user_id):
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    user = User.query.get_or_404(user_id)
    data = request.get_json()
    new_role = data.get('role')

    if not new_role or new_role not in ['admin', 'customer']:
        return jsonify({"error": "Invalid role provided"}), 400

    user.role = new_role
    db.session.commit()
    return jsonify({"message": f"User role updated to {new_role}"}), 200


# --- Product Management ---

@admin_bp.route('/products', methods=['GET'])
@jwt_required()
def get_all_products_admin(): #for admin view
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403
    products = Product.query.all()
    product_list = [{
        "id": p.id, "name": p.name, "description": p.description,
        "price": p.price, "stock": p.stock, "category": p.category,
        "image_url": p.image_url, "created_at": p.created_at
    } for p in products]
    return jsonify(product_list), 200

@admin_bp.route('/products/<int:product_id>', methods=['PUT'])
@jwt_required()
def update_product_admin(product_id):
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    product = Product.query.get_or_404(product_id)
    data = request.get_json()

    # Update product fields (similar to your existing product update)
    if "name" in data: product.name = data["name"]
    if "description" in data: product.description = data["description"]
    if "price" in data: product.price = data["price"]
    if "stock" in data: product.stock = data["stock"]
    if "category" in data: product.category = data["category"]
    if "image_url" in data: product.image_url = data["image_url"]

    db.session.commit()
    return jsonify({"message": "Product updated successfully"}), 200

@admin_bp.route('/products/<int:product_id>', methods=['DELETE'])
@jwt_required()
def delete_product_admin(product_id):
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    product = Product.query.get_or_404(product_id)
    db.session.delete(product)
    db.session.commit()
    return jsonify({"message": "Product deleted successfully"}), 200


# --- Analytics (Basic Example) ---

@admin_bp.route('/analytics/products', methods=['GET'])
@jwt_required()
def get_product_analytics():
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    # Basic analytics: total sales per product
    product_analytics = []
    for product in Product.query.all():
        total_sales = sum(item.quantity for item in product.order_items) #sum up the quantity of each product for total sales
        product_analytics.append({
            "product_id": product.id,
            "product_name": product.name,
            "total_sales": total_sales
        })
    return jsonify(product_analytics), 200

# ... (Add more analytics endpoints as needed)