from flask import current_app
from flask_pymongo import PyMongo
from datetime import datetime
from bson.objectid import ObjectId

mongo = PyMongo()

def init_db(app):
    """初始化資料庫連接"""
    mongo.init_app(app)

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