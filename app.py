from flask import Flask, render_template, redirect, request, jsonify, session
from flask_pymongo import PyMongo
from datetime import datetime
import pytz
import os
import re
from dotenv import load_dotenv
load_dotenv()  # 載入 .env 檔案





app = Flask(__name__)

# 優先使用MongoDB Atlas連接字串
mongodb_uri = os.getenv('MONGODB_URI')
if not mongodb_uri:
    # 如果找不到MONGODB_URI，嘗試其他環境變數
    mongodb_uri = os.getenv('MONGODB_URL_PROD')
if not mongodb_uri:
    # 最後使用本地連接
    mongodb_uri = os.getenv('MONGODB_URL_DEV', 'mongodb://localhost:27017/my_website')

# 確保URI包含數據庫名稱
if mongodb_uri and 'mongodb+srv' in mongodb_uri and '/my_website' not in mongodb_uri:
    if '?' in mongodb_uri:
        mongodb_uri = mongodb_uri.replace('?', '/my_website?')
    else:
        mongodb_uri = f"{mongodb_uri}/my_website"

print(f"嘗試連接到: {mongodb_uri[:30]}...")

# 設定MongoDB連接
app.config["MONGO_URI"] = mongodb_uri
mongo = PyMongo(app)
app.secret_key = os.getenv('SECRET_KEY', 'your_secret_key')

# 在現有的測試連接程式碼處添加更詳細的診斷
try:
    # 測試連接
    mongo.db.command('ping')
    
    # 獲取資料庫資訊
    db_stats = mongo.db.command('dbStats')
    
    print("=== MongoDB 連接狀態 ===")
    print(f"資料庫名稱: {mongo.db.name}")
    print(f"集合數量: {db_stats['collections']}")
    print(f"文檔總數: {db_stats['objects']}")
    print("=====================")
    
except Exception as e:
    print("=== MongoDB 連接失敗 ===")
    print(f"錯誤訊息: {str(e)}")
    print(f"當前 URI: {app.config['MONGO_URI'][:20]}...")  # 只顯示前20個字元，確保安全
    print("=====================")

    
# 保持原有的頁面路由
@app.route('/')
def home():
    return redirect('about.html')  # 這確保訪問根路徑時會重定向到 about.html

@app.route('/about.html')
def about():
    return render_template('about.html')

@app.route('/freeresource.html')
def freeresource():
    return render_template('freeresource.html')

@app.route('/new_took.html')
def new_took():
    return render_template('new_took.html')

@app.route('/portfolio.html')
def portfolio():
    return render_template('portfolio.html')

@app.route('/contactme.html')
def contactme():
    return render_template('contactme.html')

@app.route('/blog.html')
def blog():
    return render_template('blog.html')

@app.route('/service.html')
def service():
    return render_template('service.html')

# 新增 API 路由
@app.route('/api/feedback', methods=['POST'])
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

@app.route('/api/feedback', methods=['GET'])
def get_feedback():
    try:
        feedback_list = list(mongo.db.feedback.find().sort('createdAt', -1))
        for feedback in feedback_list:
            feedback['_id'] = str(feedback['_id'])
        return jsonify(feedback_list), 200
    except Exception as e:
        return jsonify({'message': '伺服器錯誤'}), 500

# 作品集 API - 獲取所有作品
@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    try:
        # 修復sort()語法，使用列表而非位置參數
        portfolios = list(mongo.db.portfolio.find().sort([('created_at', -1)]))
        
        # 轉換 ObjectId 和日期為字串
        for portfolio in portfolios:
            portfolio['_id'] = str(portfolio['_id'])
            if 'created_at' in portfolio and portfolio['created_at']:
                portfolio['created_at'] = portfolio['created_at'].isoformat()
                
        return jsonify(portfolios), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# 作品集 API - 新增作品
@app.route('/api/portfolio', methods=['POST'])
def create_portfolio():
    try:
        data = request.json
        
        # 驗證必要欄位
        required_fields = ['title', 'description']
        if not all(field in data for field in required_fields):
            missing = [field for field in required_fields if field not in data]
            return jsonify({'error': f'缺少必要欄位: {", ".join(missing)}'}), 400
        
        # 準備資料
        portfolio = {
            'title': data['title'],
            'description': data['description'],
            'content': data.get('content', ''),  # 新增: 富文本內容欄位
            'image_url': data.get('image_url', ''),
            'github_url': data.get('github_url', ''),
            'demo_url': data.get('demo_url', ''),
            'tags': data.get('tags', []),
            'created_at': datetime.now(pytz.utc)
        }
        
        # 儲存到資料庫
        result = mongo.db.portfolio.insert_one(portfolio)
        
        return jsonify({
            'message': '作品新增成功',
            'id': str(result.inserted_id)
        }), 201
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500


# 電子報訂閱 API 端點
@app.route('/api/subscribe', methods=['POST'])
def subscribe_newsletter():
    """
    處理電子報訂閱請求。
    
    RESTful 設計原則：
    - 使用 POST 方法創建新資源（訂閱）
    - 返回適當的狀態碼：201（已創建）成功，400（錯誤請求）失敗
    - 返回描述性的 JSON 響應
    """
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


@app.route('/api/contactme', methods=['POST'])
def contact_form():
    """
    處理聯絡表單提交。
    
    RESTful 設計原則：
    - 使用 POST 方法創建新資源（聯絡訊息）
    - 返回適當的狀態碼：201（已創建）成功，400（錯誤請求）失敗
    - 返回描述性的 JSON 響應
    """
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


@app.route('/portfolio/<portfolio_id>')
def portfolio_detail(portfolio_id):
    try:
        from bson.objectid import ObjectId
        # 查詢特定ID的作品
        portfolio = mongo.db.portfolio.find_one({'_id': ObjectId(portfolio_id)})
        if portfolio:
            # 轉換ID格式
            portfolio['_id'] = str(portfolio['_id'])
            # 渲染模板並傳入資料
            return render_template('portfolio_detail.html', portfolio=portfolio)
        else:
            # 找不到作品時重定向
            return redirect('/portfolio.html')
    except Exception as e:
        print(f"Error: {str(e)}")
        return redirect('/portfolio.html')

# 在 update_portfolio 函數前添加這個路由

@app.route('/api/portfolio/<portfolio_id>', methods=['GET'])
def get_single_portfolio(portfolio_id):
    try:
        from bson.objectid import ObjectId
        
        # 查詢單個作品
        portfolio = mongo.db.portfolio.find_one({'_id': ObjectId(portfolio_id)})
        
        if not portfolio:
            return jsonify({'error': '找不到該作品'}), 404
            
        # 將 ObjectId 轉換為字符串
        portfolio['_id'] = str(portfolio['_id'])
        
        # 轉換日期為字符串
        if 'created_at' in portfolio:
            portfolio['created_at'] = portfolio['created_at'].isoformat()
        if 'updated_at' in portfolio:
            portfolio['updated_at'] = portfolio['updated_at'].isoformat()
            
        # 返回作品數據
        return jsonify(portfolio)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500




# 作品集 API - 更新作品
@app.route('/api/portfolio/<portfolio_id>', methods=['PUT'])
def update_portfolio(portfolio_id):
    try:
        from bson.objectid import ObjectId
        data = request.json
        
        # 驗證作品是否存在
        existing = mongo.db.portfolio.find_one({'_id': ObjectId(portfolio_id)})
        if not existing:
            return jsonify({'error': '找不到該作品'}), 404
            
        # 更新資料
        update_data = {}
        allowed_fields = ['title', 'description','content', 'image_url', 'github_url', 'demo_url', 'tags']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
                
        # 添加更新時間
        update_data['updated_at'] = datetime.now(pytz.utc)
        
        # 更新資料庫
        mongo.db.portfolio.update_one(
            {'_id': ObjectId(portfolio_id)},
            {'$set': update_data}
        )
        
        return jsonify({'message': '作品更新成功'}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

# 作品集 API - 刪除作品
@app.route('/api/portfolio/<portfolio_id>', methods=['DELETE'])
def delete_portfolio(portfolio_id):
    try:
        from bson.objectid import ObjectId
        
        # 驗證作品是否存在
        existing = mongo.db.portfolio.find_one({'_id': ObjectId(portfolio_id)})
        if not existing:
            return jsonify({'error': '找不到該作品'}), 404
        
        # 從資料庫刪除
        mongo.db.portfolio.delete_one({'_id': ObjectId(portfolio_id)})
        
        return jsonify({'message': '作品刪除成功'}), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500



# 後台登入頁面
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # 檢查憑證 (暫時使用簡單方式，未來應改為更安全的方式)
        if username == os.getenv('ADMIN_USER') and password == os.getenv('ADMIN_PASSWORD'):
            session['admin_logged_in'] = True
            return redirect('/admin')
        else:
            return render_template('admin_login.html', error='用戶名或密碼錯誤')
            
    return render_template('admin_login.html')

# 保護後台路由
@app.route('/admin')
def admin_page():
    if not session.get('admin_logged_in'):
        return redirect('/admin/login')
    return render_template('admin.html')


# 後台管理 API - 獲取所有聯絡訊息
@app.route('/api/contacts', methods=['GET'])
def get_contacts():
    """獲取所有聯絡訊息，僅管理員可訪問"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        # 獲取聯絡訊息並排序
        contacts = list(mongo.db.contacts.find().sort('created_at', -1))
        
        # 處理 ObjectId 和日期
        for contact in contacts:
            contact['_id'] = str(contact['_id'])
            if 'created_at' in contact:
                contact['created_at'] = contact['created_at'].strftime('%Y-%m-%d %H:%M')
        
        return jsonify(contacts)
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': '獲取聯絡訊息失敗'}), 500

# 標記訊息為已讀
@app.route('/api/contacts/<contact_id>/read', methods=['PUT'])
def mark_contact_read(contact_id):
    """標記訊息為已讀"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        from bson.objectid import ObjectId
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

# 標記訊息為已回覆
@app.route('/api/contacts/<contact_id>/replied', methods=['PUT'])
def mark_contact_replied(contact_id):
    """標記訊息為已回覆"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        from bson.objectid import ObjectId
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

# 獲取未讀訊息數量
@app.route('/api/contacts/unread/count', methods=['GET'])
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
    

@app.route('/api/newsletter/subscribers', methods=['GET'])
def get_subscribers():
    """獲取所有電子報訂閱者"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        # 獲取所有訂閱者並排序
        subscribers = list(mongo.db.newsletter_subscribers.find().sort('subscribed_at', -1))
        
        # 處理 ObjectId 和日期
        for subscriber in subscribers:
            subscriber['_id'] = str(subscriber['_id'])
            if 'subscribed_at' in subscriber:
                subscriber['subscribed_at'] = subscriber['subscribed_at'].strftime('%Y-%m-%d %H:%M')
        
        return jsonify(subscribers)
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': '獲取訂閱者列表失敗'}), 500


# 電子報訂閱者 API - 獲取訂閱者數量
@app.route('/api/newsletter/subscribers/count', methods=['GET'])
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

# 電子報訂閱者 API - 重新訂閱
@app.route('/api/newsletter/subscribers/<subscriber_id>/resubscribe', methods=['PUT'])
def resubscribe_subscriber(subscriber_id):
    """重新啟用訂閱"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        from bson.objectid import ObjectId
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

# 電子報訂閱者 API - 取消訂閱
@app.route('/api/newsletter/subscribers/<subscriber_id>/unsubscribe', methods=['PUT'])
def unsubscribe_subscriber(subscriber_id):
    """取消訂閱"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 401
        
    try:
        from bson.objectid import ObjectId
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

# 最近活動 API
@app.route('/api/recent-activities', methods=['GET'])
def get_recent_activities():
    """獲取最近活動"""
    if not session.get('admin_logged_in'):
        return jsonify({'error': '未授權訪問'}), 403
        
    try:
        # 創建一個活動列表
        activities = []
        
        # 獲取最近的作品
        portfolios = list(mongo.db.portfolio.find().sort([('created_at', -1)]).limit(3))
        for portfolio in portfolios:
            activities.append({
                'icon': 'fa-folder-open',
                'message': f"新增作品: {portfolio.get('title', '未命名')}",
                'time': portfolio.get('created_at').strftime('%Y-%m-%d') if portfolio.get('created_at') else '未知'
            })
        
        # 獲取最近的訂閱者
        subscribers = list(mongo.db.newsletter_subscribers.find().sort([('subscribed_at', -1)]).limit(3))
        for subscriber in subscribers:
            activities.append({
                'icon': 'fa-envelope',
                'message': f"新訂閱者: {subscriber.get('email', '未知')}",
                'time': subscriber.get('subscribed_at').strftime('%Y-%m-%d') if subscriber.get('subscribed_at') else '未知'
            })
        
        # 獲取最近的聯絡訊息
        contacts = list(mongo.db.contacts.find().sort([('created_at', -1)]).limit(3))
        for contact in contacts:
            activities.append({
                'icon': 'fa-comment',
                'message': f"收到訊息: 來自 {contact.get('name', '未知')}",
                'time': contact.get('created_at').strftime('%Y-%m-%d') if contact.get('created_at') else '未知'
            })
        
        # 按時間排序
        activities = sorted(activities, key=lambda x: x.get('time', ''), reverse=True)
        
        return jsonify(activities[:5])  # 只返回最近5條
        
    except Exception as e:
        print(f"獲取最近活動失敗: {str(e)}")
        return jsonify([]), 500

@app.route('/api/diagnostics/db')
def db_diagnostics():
    """診斷端點，檢查數據庫連接"""
    try:
        # 基本連接資訊
        result = {
            'status': 'connected',
            'db_name': mongo.db.name,
            'collections': [],
            'portfolio_count': 0
        }
        
        # 獲取集合列表
        try:
            collections = mongo.db.list_collection_names()
            result['collections'] = collections
            
            # 如果有portfolio集合，查詢文檔數量
            if 'portfolio' in collections:
                result['portfolio_count'] = mongo.db.portfolio.count_documents({})
                
                # 獲取一個樣本文檔
                sample = mongo.db.portfolio.find_one()
                if sample:
                    result['sample_id'] = str(sample['_id'])
                    result['sample_title'] = sample.get('title', '無標題')
        except Exception as e:
            result['collections_error'] = str(e)
            
        return jsonify(result)
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e),
            'uri_prefix': mongodb_uri[:15] + '...' if mongodb_uri else 'None'
        })



if __name__ == '__main__':
    try:
        # 改為 0.0.0.0 以允許外部連接
        app.run(host='0.0.0.0', port=5001, debug=True)
    except Exception as e:
        print(f"Error starting server: {e}")
