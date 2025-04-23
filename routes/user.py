from flask import Blueprint, request, jsonify, session
from services.db_service import mongo
from models.user import UserModel
from datetime import datetime, timedelta
import secrets
from services.mail_service import send_reset_email

user_bp = Blueprint('user', __name__)

@user_bp.route('/api/register', methods=['POST'])
def register():
    user_model = UserModel(mongo.db)
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    nickname = data.get('nickname', '')
    if not email or not password:
        return jsonify({'success': False, 'message': '請填寫 email 和密碼'}), 400
    user, err = user_model.create_user(email, password, nickname)
    if err:
        return jsonify({'success': False, 'message': err}), 400
    return jsonify({'success': True, 'message': '註冊成功', 'user_id': str(user['_id'])})

@user_bp.route('/api/login', methods=['POST'])
def login():
    user_model = UserModel(mongo.db)
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    if not email or not password:
        return jsonify({'success': False, 'message': '請填寫 email 和密碼'}), 400
    if not user_model.verify_password(email, password):
        return jsonify({'success': False, 'message': '帳號或密碼錯誤'}), 401
    user_model.update_last_login(email)
    session['user_email'] = email
    return jsonify({'success': True, 'message': '登入成功'})

@user_bp.route('/api/logout', methods=['POST'])
def logout():
    session.pop('user_email', None)
    return jsonify({'success': True, 'message': '已登出'})

@user_bp.route('/api/request_reset_password', methods=['POST'])
def request_reset_password():
    user_model = UserModel(mongo.db)
    data = request.json
    email = data.get('email', '').strip().lower()
    user = user_model.find_by_email(email)
    if not user:
        return jsonify({'success': False, 'message': '查無此帳號'}), 404
    # 產生 token 與過期時間
    token = secrets.token_urlsafe(32)
    expire_time = datetime.utcnow() + timedelta(hours=1)
    user_model.set_reset_token(email, token, expire_time)
    # 構建重設密碼連結
    reset_link = f"https://你的網域/reset_password?token={token}"
    try:
        send_reset_email(email, reset_link)
    except Exception as e:
        return jsonify({'success': False, 'message': f'寄信失敗: {str(e)}'}), 500
    return jsonify({'success': True, 'message': '重設密碼連結已寄出，請檢查您的信箱'})

@user_bp.route('/api/reset_password', methods=['POST'])
def reset_password():
    user_model = UserModel(mongo.db)
    data = request.json
    token = data.get('token', '')
    new_password = data.get('new_password', '')
    if not token or not new_password:
        return jsonify({'success': False, 'message': '缺少 token 或新密碼'}), 400
    user = user_model.get_user_by_reset_token(token)
    if not user:
        return jsonify({'success': False, 'message': '無效的 token'}), 400
    # 檢查 token 是否過期
    expire_time = user.get('reset_token_expire')
    if not expire_time or datetime.utcnow() > expire_time:
        return jsonify({'success': False, 'message': 'token 已過期'}), 400
    user_model.update_password(user['email'], new_password)
    user_model.clear_reset_token(user['email'])
    return jsonify({'success': True, 'message': '密碼已重設，請重新登入'})
