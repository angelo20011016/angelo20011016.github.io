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

# 測試資料庫連接
try:
    mongo.db.command('ping')
    print("MongoDB 連接成功！")
except Exception as e:
    print("MongoDB 連接失敗:", str(e))

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

if __name__ == '__main__':
    try:
        # 改為 0.0.0.0 以允許外部連接
        app.run(host='0.0.0.0', port=5001, debug=True)
    except Exception as e:
        print(f"Error starting server: {e}")
