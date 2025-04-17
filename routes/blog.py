from flask import Blueprint, render_template, request, jsonify, redirect, session
from bson.objectid import ObjectId
from datetime import datetime
import pytz
from services.db_service import mongo, format_document, format_documents

blog_bp = Blueprint('blog', __name__)

@blog_bp.route('/blog.html')
def blog_page():
    return render_template('blog.html')

@blog_bp.route('/blog/<post_id>')
def blog_post(post_id):
    try:
        post = mongo.db.blog_posts.find_one({'_id': ObjectId(post_id)})
        if post and post.get('is_published', False):
            # 格式化日期
            if 'published_at' in post:
                post['published_at'] = post['published_at'].strftime("%Y-%m-%d")
                
            return render_template('blog_post.html', post=post)
        else:
            return redirect('/blog.html')
    except Exception as e:
        print(f"Error: {str(e)}")
        return redirect('/blog.html')

@blog_bp.route('/api/blog', methods=['GET'])
def get_blog_posts():
    try:
        # 只獲取已發佈的文章，按發佈日期倒序排列
        posts = list(mongo.db.blog_posts.find({"is_published": True}).sort("published_at", -1))
        # 格式化文檔
        posts = format_documents(posts)
            
        return jsonify(posts)
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": "獲取文章失敗"}), 500

@blog_bp.route('/api/blog/<post_id>', methods=['GET'])
def get_blog_post(post_id):
    try:
        post = mongo.db.blog_posts.find_one({'_id': ObjectId(post_id)})
        
        if not post:
            return jsonify({"success": False, "message": "找不到該文章"}), 404
        
        # 格式化文檔
        post = format_document(post)
        
        return jsonify(post)
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"success": False, "message": "獲取文章失敗"}), 500

@blog_bp.route('/api/blog', methods=['POST'])
def create_blog_post():
    # 確認是否已登入後台
    if not session.get('admin_logged_in'):
        return jsonify({"success": False, "message": "未授權"}), 401
    
    try:
        data = request.json
        
        # 驗證必要欄位
        required_fields = ['title', 'content']
        if not all(field in data for field in required_fields):
            return jsonify({"success": False, "message": "缺少必要欄位"}), 400
        
        # 準備文章資料
        post = {
            'title': data['title'],
            'subtitle': data.get('subtitle', ''),
            'content': data['content'],
            'cover_image': data.get('cover_image', ''),
            'tags': data.get('tags', []),
            'is_published': data.get('is_published', False),
            'created_at': datetime.now(pytz.utc)
        }
        
        # 如果設為已發佈，添加發佈日期
        if post['is_published']:
            post['published_at'] = datetime.now(pytz.utc)
        
        # 儲存到資料庫
        result = mongo.db.blog_posts.insert_one(post)
        
        return jsonify({
            "success": True, 
            "message": "文章創建成功", 
            "post_id": str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"創建文章錯誤: {str(e)}")
        return jsonify({"success": False, "message": "文章創建失敗"}), 500

@blog_bp.route('/api/blog/<post_id>', methods=['PUT'])
def update_blog_post(post_id):
    # 確認是否已登入後台
    if not session.get('admin_logged_in'):
        return jsonify({"success": False, "message": "未授權"}), 401
    
    try:
        data = request.json
        
        # 查詢文章是否存在
        existing = mongo.db.blog_posts.find_one({'_id': ObjectId(post_id)})
        if not existing:
            return jsonify({"success": False, "message": "找不到該文章"}), 404
        
        # 準備更新資料
        update_data = {}
        allowed_fields = ['title', 'subtitle', 'content', 'cover_image', 'tags']
        
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        # 處理發布狀態變更
        if 'is_published' in data:
            update_data['is_published'] = data['is_published']
            
            # 若從未發佈變為已發佈，設置發佈日期
            if data['is_published'] and not existing.get('is_published'):
                update_data['published_at'] = datetime.now(pytz.utc)
        
        # 添加更新時間
        update_data['updated_at'] = datetime.now(pytz.utc)
        
        # 更新資料庫
        mongo.db.blog_posts.update_one(
            {'_id': ObjectId(post_id)},
            {'$set': update_data}
        )
        
        return jsonify({"success": True, "message": "文章更新成功"})
        
    except Exception as e:
        print(f"更新文章錯誤: {str(e)}")
        return jsonify({"success": False, "message": "文章更新失敗"}), 500

@blog_bp.route('/api/blog/<post_id>', methods=['DELETE'])
def delete_blog_post(post_id):
    # 確認是否已登入後台
    if not session.get('admin_logged_in'):
        return jsonify({"success": False, "message": "未授權"}), 401
    
    try:
        result = mongo.db.blog_posts.delete_one({'_id': ObjectId(post_id)})
        
        if result.deleted_count > 0:
            return jsonify({"success": True, "message": "文章刪除成功"})
        else:
            return jsonify({"success": False, "message": "找不到該文章"}), 404
    except Exception as e:
        print(f"刪除文章錯誤: {str(e)}")
        return jsonify({"success": False, "message": "文章刪除失敗"}), 500