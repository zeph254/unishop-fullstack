from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity, unset_jwt_cookies
from models import User
from flask_mail import Message
from flask import url_for
from itsdangerous import URLSafeTimedSerializer
from app import mail, db  # Import the db and mail instances from app.py
from sqlalchemy.exc import IntegrityError
from flask import current_app
from flask import request, jsonify
import cloudinary.uploader

auth_bp = Blueprint('auth_bp', __name__, url_prefix='/auth')

serializer = URLSafeTimedSerializer("your_secret_key")

@auth_bp.route('/register', methods=['POST'])
def register():
    
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role', 'customer')  # Default role is 'customer'

    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "User with this email already exists"}), 400

    new_user = User(username=username, email=email, password=password )
    new_user.role = role
    db.session.add(new_user)
    
    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "A user with this username or email already exists"}), 400

    return jsonify({"message": "User registered successfully", "user_id": new_user.id}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role
        }
    }), 200

@auth_bp.route('/login_with_google', methods=['POST'])
def login_with_google():
    data = request.get_json()
    email = data.get('email')


    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "Invalid email"}), 401

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify({
        "message": "Login successful",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    response = jsonify({"message": "Logout successful"})
    unset_jwt_cookies(response)
    return response, 200

@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Generate a password reset token
    token = serializer.dumps(email, salt="password-reset")

    # Create the reset link pointing to the frontend
    reset_link = f"https://run-sigma.vercel.app/auth/reset-password/{token}"

    # Send the email with the reset link
    msg = Message("Password Reset Request", sender="noreply@example.com", recipients=[email])
    msg.body = f"Click the link to reset your password: {reset_link}"
    mail.send(msg)

    return jsonify({"message": "Password reset email sent"}), 200

@auth_bp.route('/reset-password/<token>', methods=['POST'])
def reset_password(token):
    data = request.get_json()
    new_password = data.get('password')

    if not new_password:
        return jsonify({"error": "Password is required"}), 400

    try:
        # Verify the token and get the email
        email = serializer.loads(token, salt="password-reset", max_age=1800)  # 30 min expiry
    except:
        return jsonify({"error": "Invalid or expired token"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Update the user's password
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()

    return jsonify({"message": "Password reset successful"}), 200



@auth_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Restrict allowed file types
    allowed_extensions = {"png", "jpg", "jpeg", "gif"}
    file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else None

    if not file_extension or file_extension not in allowed_extensions:
        return jsonify({"error": f"Invalid file type: {file_extension}. Allowed: png, jpg, jpeg, gif"}), 400

    try:
        upload_result = cloudinary.uploader.upload(file)
        return jsonify({"url": upload_result['url']}), 200
    except Exception as e:
        return jsonify({"error": f"File upload failed: {str(e)}"}), 500
