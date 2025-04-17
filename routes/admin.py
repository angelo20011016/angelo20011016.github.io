from flask import Blueprint, render_template, request, session, redirect, jsonify
import os
from bson.objectid import ObjectId
from datetime import datetime
from services.db_service import mongo, format_documents

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        # 檢查憑證
        if username == os.getenv('ADMIN_USER') and password == os.getenv('ADMIN_PASSWORD'):
            session['admin_logged_in'] = True
            return redirect('/admin')
        else:
            return render_template('admin_login.html', error='用戶名或密碼錯誤')
            
    return render_template('admin_login.html')

@admin_bp.route('/admin')
def admin_page():
    if not session.get('admin_logged_in'):
        return redirect('/admin/login')
    return render_template('admin.html')

@admin_bp.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect('/admin/login')

@admin_bp.route('/api/recent-activities', methods=['GET'])
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