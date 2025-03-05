from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, OrderItem, Product, User, Order
from sqlalchemy import func, desc

analytics_bp = Blueprint('analytics_bp', __name__, url_prefix='/analytics')

@analytics_bp.route('/best_selling', methods=['GET'])
@jwt_required()
def best_selling_products():
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    best_selling = (
        db.session.query(Product.id, Product.name, func.sum(OrderItem.quantity).label('total_sold'))
        .join(OrderItem, Product.id == OrderItem.product_id)
        .group_by(Product.id, Product.name)
        .order_by(desc('total_sold'))
        .limit(10)  # Get top 10 best-selling products (adjust as needed)
        .all()
    )

    result = [
        {
            "product_id": product_id,
            "product_name": name,
            "total_sold": total_sold
        }
        for product_id, name, total_sold in best_selling
    ]
    return jsonify(result), 200

@analytics_bp.route('/revenue', methods=['GET'])
@jwt_required()
def revenue_analytics():
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    # Calculate total revenue
    total_revenue = db.session.query(func.coalesce(func.sum(Order.total_price), 0)).scalar()

    # Calculate revenue by category
    revenue_by_category = (
        db.session.query(Product.category, func.coalesce(func.sum(Order.total_price), 0).label('revenue'))
        .join(OrderItem, Product.id == OrderItem.product_id)
        .join(Order, OrderItem.order_id == Order.id)
        .group_by(Product.category)
        .all()
    )

    # Format the response
    category_breakdown = [
        {"category": cat, "revenue": rev} for cat, rev in revenue_by_category
    ]

    return jsonify({
        "totalRevenue": total_revenue,
        "revenueByCategory": category_breakdown
    }), 200


@analytics_bp.route('/customer_trends', methods=['GET'])
@jwt_required()
def customer_purchase_trends():
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    # Example: Number of orders per user (can be expanded)
    orders_per_user = (
        db.session.query(User.id, User.username, func.count(Order.id).label('order_count'))
        .outerjoin(Order, User.id == Order.user_id)  # Use outerjoin to include users with no orders
        .group_by(User.id, User.username)
        .order_by(desc('order_count'))
        .all()
    )

    trends = [
        {"user_id": user_id, "username": username, "order_count": order_count}
        for user_id, username, order_count in orders_per_user
    ]

    return jsonify(trends), 200



# Example of more detailed customer trends (average order value)
@analytics_bp.route('/customer_avg_order', methods=['GET'])
@jwt_required()
def customer_avg_order():
    current_user = User.query.get(get_jwt_identity())
    if current_user.role != 'admin':
        return jsonify({"error": "Unauthorized access"}), 403

    avg_order_value_per_user = (
        db.session.query(User.id, User.username, func.avg(Order.total_price).label('avg_order_value'))
        .outerjoin(Order, User.id == Order.user_id)
        .group_by(User.id, User.username)
        .all()
    )

    trends = [
        {"user_id": user_id, "username": username, "avg_order_value": avg}
        for user_id, username, avg in avg_order_value_per_user
    ]

    return jsonify(trends), 200