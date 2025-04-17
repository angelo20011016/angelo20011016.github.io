from flask import Blueprint, render_template, request, jsonify, redirect, session
from bson.objectid import ObjectId
from datetime import datetime
from services.db_service import mongo, format_document, format_documents

portfolio_bp = Blueprint('portfolio', __name__)

@portfolio_bp.route('/portfolio.html')
def portfolio_page():
    return render_template('portfolio.html')


@portfolio_bp.route('/api/portfolio/count', methods=['GET'])
def get_portfolio_count():
    """獲取作品總數"""
    try:
        count = mongo.db.portfolio.count_documents({})
        return jsonify({'count': count}), 200
    except Exception as e:
        print(f"獲取作品數量錯誤: {str(e)}")
        return jsonify({'error': '無法獲取作品數量'}), 500


@portfolio_bp.route('/portfolio/<portfolio_id>')
def portfolio_detail(portfolio_id):
    try:
        # 查詢特定ID的作品
        portfolio = mongo.db.portfolio.find_one({'_id': ObjectId(portfolio_id)})
        if portfolio:
            # 轉換ID格式
            portfolio = format_document(portfolio)
            # 渲染模板並傳入資料
            return render_template('portfolio_detail.html', portfolio=portfolio)
        else:
            # 找不到作品時重定向
            return redirect('/portfolio.html')
    except Exception as e:
        print(f"Error: {str(e)}")
        return redirect('/portfolio.html')

@portfolio_bp.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    try:
        # 修復sort()語法，使用列表而非位置參數
        portfolios = list(mongo.db.portfolio.find().sort([('created_at', -1)]))
        # 格式化文檔
        portfolios = format_documents(portfolios)
        return jsonify(portfolios), 200
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/api/portfolio/<portfolio_id>', methods=['GET'])
def get_single_portfolio(portfolio_id):
    try:
        portfolio = mongo.db.portfolio.find_one({'_id': ObjectId(portfolio_id)})
        
        if not portfolio:
            return jsonify({'error': '找不到該作品'}), 404
            
        # 格式化文檔
        portfolio = format_document(portfolio)
        
        # 為了兼容性，如果 detail_content 不存在但 content 存在，則添加 detail_content
        if 'content' in portfolio and portfolio['content'] and 'detail_content' not in portfolio:
            portfolio['detail_content'] = portfolio['content']
            
        return jsonify(portfolio), 200
    except Exception as e:
        # 檢查是否是因為 ObjectId 格式錯誤
        if "is not a valid ObjectId" in str(e):
             print(f"無效的作品 ID: {portfolio_id}")
             return jsonify({'error': '無效的作品 ID 格式'}), 400
        else:
            print(f"獲取單個作品錯誤: {str(e)}")
            return jsonify({'error': str(e)}), 500

@portfolio_bp.route('/api/portfolio', methods=['POST'])
def create_portfolio():
    # 檢查是否已登入
    if not session.get('admin_logged_in'):
        return jsonify({'success': False, 'message': '未授權'}), 401

    try:
        data = request.json
        
        # 驗證必要欄位
        required_fields = ['title', 'description']
        if not all(field in data for field in required_fields):
            missing = [field for field in required_fields if field not in data]
            return jsonify({'success': False, 'message': f'缺少必要欄位: {", ".join(missing)}'}), 400
        
        # 獲取詳細內容
        detail_content = data.get('detail_content', '')
        
        # 準備資料 - 同時設置兩個欄位
        portfolio = {
            'title': data['title'],
            'description': data.get('description', ''),
            'detail_content': detail_content,
            'content': detail_content,  # 確保content欄位同步設置
            'image_url': data.get('image_url', ''),
            'github_url': data.get('github_url', data.get('project_url', '')),
            'demo_url': data.get('demo_url', ''),
            'tags': data.get('tags', []),
            'created_at': datetime.now()
        }
        
        # 儲存到資料庫
        result = mongo.db.portfolio.insert_one(portfolio)
        
        # 返回成功的 JSON 響應
        return jsonify({
            'success': True,
            'message': '作品新增成功',
            'id': str(result.inserted_id)
        }), 201
        
    except Exception as e:
        print(f"創建作品錯誤: {str(e)}")
        return jsonify({'success': False, 'message': f'伺服器錯誤: {str(e)}'}), 500

@portfolio_bp.route('/api/portfolio/<portfolio_id>', methods=['PUT'])
def update_portfolio(portfolio_id):
    # 檢查是否已登入
    if not session.get('admin_logged_in'):
        return jsonify({'success': False, 'message': '未授權'}), 401

    try:
        data = request.json
        
        # 驗證作品是否存在
        existing = mongo.db.portfolio.find_one({'_id': ObjectId(portfolio_id)})
        if not existing:
            return jsonify({'success': False, 'message': '找不到該作品'}), 404
            
        # 更新資料
        update_data = {}
        allowed_fields = ['title', 'description', 'detail_content', 'image_url', 'github_url', 'demo_url', 'tags']
        for field in allowed_fields:
            if field in data:
                update_data[field] = data[field]
        
        # 為了兼容性，同時更新 content 欄位
        if 'detail_content' in data:
            update_data['content'] = data['detail_content']
                
        # 添加更新時間
        update_data['updated_at'] = datetime.now()
        
        # 更新資料庫
        mongo.db.portfolio.update_one(
            {'_id': ObjectId(portfolio_id)},
            {'$set': update_data}
        )
        
        return jsonify({'success': True, 'message': '作品更新成功'}), 200
    except Exception as e:
        print(f"更新作品錯誤: {str(e)}")
        return jsonify({'success': False, 'message': f'伺服器錯誤: {str(e)}'}), 500

@portfolio_bp.route('/api/portfolio/<portfolio_id>', methods=['DELETE'])
def delete_portfolio(portfolio_id):
    # 檢查是否已登入
    if not session.get('admin_logged_in'):
        return jsonify({'success': False, 'message': '未授權'}), 401

    try:
        result = mongo.db.portfolio.delete_one({'_id': ObjectId(portfolio_id)})
        
        if result.deleted_count > 0:
            return jsonify({'success': True, 'message': '作品刪除成功'}), 200
        else:
            return jsonify({'success': False, 'message': '找不到該作品'}), 404
    except Exception as e:
        print(f"刪除作品錯誤: {str(e)}")
        return jsonify({'success': False, 'message': f'伺服器錯誤: {str(e)}'}), 500