from flask import Blueprint, render_template, request, jsonify, session
from datetime import datetime
import pytz
import re
from bson.objectid import ObjectId
from services.db_service import mongo, format_document, format_documents

contact_bp = Blueprint('contact', __name__)

@contact_bp.route('/contactme.html')
def contactme_page():
    return render_template('contactme.html')

@contact_bp.route('/api/contactme', methods=['POST'])
def contact_form():
    """處理聯絡表單提交"""
    try:
        # 從請求中獲取 JSON 數據
        data = request.get_json()
        
        # 基本驗證
        if not data:
            return jsonify({
                'success': False,
                'message': '請提供有效的資料',
                'error': 'missing_data'
            }), 400
            
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        message = data.get('message', '').strip()
        
        # 驗證必填欄位
        if not name or not email or not message:
            return jsonify({
                'success': False,
                'message': '請填寫所有必填欄位',
                'error': 'missing_fields'
            }), 400
            
        # 驗證電子郵件格式
        email_pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_pattern, email):
            return jsonify({
                'success': False,
                'message': '請提供有效的電子郵件格式',
                'error': 'invalid_email'
            }), 400
            
        # 創建聯絡記錄
        contact = {
            'name': name,
            'email': email,
            'message': message,
            'created_at': datetime.now(pytz.utc),
            'read': False,
            'replied': False
        }
        
        # 保存到資料庫
        result = mongo.db.contacts.insert_one(contact)
        
        if result.inserted_id:
            # 201 Created - 成功創建新資源
            return jsonify({
                'success': True,
                'message': '您的訊息已送出！我會盡快回覆您。',
                'contact_id': str(result.inserted_id)
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': '訊息送出失敗，請稍後再試',
                'error': 'insertion_failed'
            }), 500
            
    except Exception as e:
        print(f"聯絡表單處理錯誤: {str(e)}")
        return jsonify({
            'success': False,
            'message': '伺服器處理請求時發生錯誤',
            'error': 'server_error'
        }), 500

@contact_bp.route('/api/feedback', methods=['POST'])
def feedback():
    try:
        data = request.json
        feedback = {
            'name': data['name'],
            'email': data['email'],
            'feedback': data['feedback'],
            'createdAt': datetime.now(pytz.utc)
        }
        mongo.db.feedback.insert_one(feedback)
        return jsonify({'message': '反饋已保存'}), 201
    except Exception as e:
        return jsonify({'message': '伺服器錯誤'}), 500

@contact_bp.route('/api/feedback', methods=['GET'])
def get_feedback():
    try:
        feedback_list = list(mongo.db.feedback.find().sort('createdAt', -1))
        # 格式化文檔
        feedback_list = format_documents(feedback_list)
        return jsonify(feedback_list), 200
    except Exception as e:
        return jsonify({'message': '伺服器錯誤'}), 500

@contact_bp.route('/api/subscribe', methods=['POST'])
def subscribe_newsletter():
    """處理電子報訂閱請求"""
    try:
        # 從請求中獲取 JSON 數據
        data = request.get_json()
        
        # 如果沒有提供 JSON 或沒有 email 字段
        if not data or 'email' not in data:
            return jsonify({
                'success': False,
                'message': '請提供有效的電子郵件',
                'error': 'missing_email'
            }), 400  # 400 Bad Request
        
        email = data['email'].lower().strip()
        
        # 驗證電子郵件格式
        email_pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
        if not re.match(email_pattern, email):
            return jsonify({
                'success': False,
                'message': '請提供有效的電子郵件格式',
                'error': 'invalid_email'
            }), 400
            
        # 檢查是否已訂閱
        existing_subscriber = mongo.db.newsletter_subscribers.find_one({'email': email})
        if existing_subscriber:
            # 如果已訂閱但被標記為非活躍，則重新激活
            if existing_subscriber.get('active') == False:
                mongo.db.newsletter_subscribers.update_one(
                    {'email': email},
                    {'$set': {'active': True, 'subscribed_at': datetime.now(pytz.utc)}}
                )
                return jsonify({
                    'success': True,
                    'message': '您已重新訂閱我們的電子報！'
                }), 200
            
            return jsonify({
                'success': False,
                'message': '此電子郵件已經訂閱了我們的電子報',
                'error': 'already_subscribed'
            }), 400
        
        # 創建新訂閱
        subscriber = {
            'email': email,
            'subscribed_at': datetime.now(pytz.utc),
            'active': True,
            'source': data.get('source', 'about_page')  # 默認值為 'about_page'
        }
        
        # 保存到資料庫
        result = mongo.db.newsletter_subscribers.insert_one(subscriber)
        
        if result.inserted_id:
            # 201 Created - 成功創建新資源
            return jsonify({
                'success': True,
                'message': '訂閱成功！感謝您的關注',
                'subscriber_id': str(result.inserted_id)
            }), 201
        else:
            return jsonify({
                'success': False,
                'message': '訂閱失敗，請稍後再試',
                'error': 'insertion_failed'
            }), 500  # 500 Internal Server Error
            
    except Exception as e:
        print(f"訂閱處理錯誤: {str(e)}")
        return jsonify({
            'success': False,
            'message': '伺服器處理請求時發生錯誤',
            'error': 'server_error'
        }), 500  # 500 Internal Server Error

# 管理員專用 API
@contact_bp.route('/api/contacts', methods=['GET'])
def get_contacts():
    """獲取所有聯絡訊息，僅管理員可訪問"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        # 獲取聯絡訊息並排序
        contacts = list(mongo.db.contacts.find().sort('created_at', -1))
        
        # 處理 ObjectId 和日期
        contacts = format_documents(contacts)
        for contact in contacts:
            if 'created_at' in contact:
                contact['created_at'] = datetime.fromisoformat(contact['created_at']).strftime('%Y-%m-%d %H:%M')
        
        return jsonify(contacts)
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': '獲取聯絡訊息失敗'}), 500

@contact_bp.route('/api/contacts/<contact_id>/read', methods=['PUT'])
def mark_contact_read(contact_id):
    """標記訊息為已讀"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        result = mongo.db.contacts.update_one(
            {'_id': ObjectId(contact_id)},
            {'$set': {'read': True}}
        )
        
        if result.modified_count:
            return jsonify({'success': True})
        else:
            return jsonify({'error': '未找到指定訊息'}), 404
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': '更新失敗'}), 500

@contact_bp.route('/api/contacts/<contact_id>/replied', methods=['PUT'])
def mark_contact_replied(contact_id):
    """標記訊息為已回覆"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        result = mongo.db.contacts.update_one(
            {'_id': ObjectId(contact_id)},
            {'$set': {'replied': True}}
        )
        
        if result.modified_count:
            return jsonify({'success': True})
        else:
            return jsonify({'error': '未找到指定訊息'}), 404
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': '更新失敗'}), 500

@contact_bp.route('/api/contacts/unread/count', methods=['GET'])
def get_unread_count():
    """獲取未讀訊息數量"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        count = mongo.db.contacts.count_documents({'read': False})
        return jsonify({'count': count})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': '獲取未讀訊息數量失敗'}), 500

@contact_bp.route('/api/newsletter/subscribers', methods=['GET'])
def get_subscribers():
    """獲取所有電子報訂閱者"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        # 獲取所有訂閱者並排序
        subscribers = list(mongo.db.newsletter_subscribers.find().sort('subscribed_at', -1))
        
        # 處理 ObjectId 和日期
        subscribers = format_documents(subscribers)
        for subscriber in subscribers:
            if 'subscribed_at' in subscriber:
                subscriber['subscribed_at'] = datetime.fromisoformat(subscriber['subscribed_at']).strftime('%Y-%m-%d %H:%M')
        
        return jsonify(subscribers)
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': '獲取訂閱者列表失敗'}), 500

@contact_bp.route('/api/newsletter/subscribers/count', methods=['GET'])
def get_subscriber_count():
    """獲取訂閱者數量"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        count = mongo.db.newsletter_subscribers.count_documents({'active': True})
        return jsonify({'count': count})
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': '獲取訂閱者數量失敗'}), 500

@contact_bp.route('/api/newsletter/subscribers/<subscriber_id>/resubscribe', methods=['PUT'])
def resubscribe_subscriber(subscriber_id):
    """重新啟用訂閱"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        result = mongo.db.newsletter_subscribers.update_one(
            {'_id': ObjectId(subscriber_id)},
            {'$set': {'active': True}}
        )
        
        if result.modified_count:
            return jsonify({'success': True})
        else:
            return jsonify({'error': '未找到指定訂閱者'}), 404
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': '更新失敗'}), 500

@contact_bp.route('/api/newsletter/subscribers/<subscriber_id>/unsubscribe', methods=['PUT'])
def unsubscribe_subscriber(subscriber_id):
    """取消訂閱"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        result = mongo.db.newsletter_subscribers.update_one(
            {'_id': ObjectId(subscriber_id)},
            {'$set': {'active': False}}
        )
        
        if result.modified_count:
            return jsonify({'success': True})
        else:
            return jsonify({'error': '未找到指定訂閱者'}), 404
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': '更新失敗'}), 500