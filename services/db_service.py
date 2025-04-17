from flask import current_app
from flask_pymongo import PyMongo
from datetime import datetime
from bson.objectid import ObjectId

# 初始化全域 MongoDB 連接
mongo = PyMongo()

def init_db(app):
    """初始化資料庫連接"""
    mongo.init_app(app)
    
    # 測試連接並輸出診斷訊息
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
        
    return mongo

def format_document(doc):
    """格式化文檔，處理ObjectId和日期"""
    if not doc:
        return None
        
    # 複製文檔以避免修改原始數據
    formatted = dict(doc)
    
    # 轉換 ObjectId
    if '_id' in formatted:
        formatted['_id'] = str(formatted['_id'])
        
    # 轉換日期欄位
    date_fields = ['created_at', 'updated_at', 'published_at', 'subscribed_at']
    for field in date_fields:
        if field in formatted and formatted[field]:
            if isinstance(formatted[field], datetime):
                formatted[field] = formatted[field].isoformat()
                
    return formatted
    
def format_documents(docs):
    """格式化多個文檔"""
    return [format_document(doc) for doc in docs]