from flask import Flask, render_template, redirect, request, jsonify
from flask_pymongo import PyMongo
from datetime import datetime
import pytz
import os
from dotenv import load_dotenv
load_dotenv()  # 載入 .env 檔案

app = Flask(__name__)
# MongoDB 設定 (本地)
app.config["MONGO_URI"] = os.getenv("MONGODB_URI", "mongodb://localhost:27017/my_website")
mongo = PyMongo(app)

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

@app.route('/porfolio.html')
def porfolio():
    return render_template('porfolio.html')

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
        portfolios = list(mongo.db.portfolio.find().sort('created_at', -1))
        
        # 轉換 ObjectId 和日期為字串
        for portfolio in portfolios:
            portfolio['_id'] = str(portfolio['_id'])
            if 'created_at' in portfolio:
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





if __name__ == '__main__':
    try:
        # 改為 0.0.0.0 以允許外部連接
        app.run(host='0.0.0.0', port=5001, debug=True)
    except Exception as e:
        print(f"Error starting server: {e}")
