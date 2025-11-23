# MichelAngelo 個人網站

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/Python-3.8+-green.svg)
![Flask](https://img.shields.io/badge/Flask-2.0+-orange.svg)

這是一個使用 Python Flask 和現代前端技術構建的個人作品集網站，旨在展示我的技術能力、作品集以及個人簡介，同時兼具部落格和聯絡功能。

## 🌟 專案亮點

- **響應式設計**：使用 TailwindCSS 實現全裝置自適應界面
- **作品集系統**：可以展示並管理不同類型的專案作品
- **後台管理**：具備安全的後台管理界面，便於內容更新與管理
- **互動元素**：技能樹、圖片輪播等動態元素提升用戶體驗
- **電子報訂閱**：訪問者可訂閱電子報獲取最新動態
- **聯絡表單**：提供訪客直接聯絡的渠道

## 📚 技術棧

### 前端
- **HTML5 / CSS3 / JavaScript**
- **TailwindCSS**：高效率的實用優先 CSS 框架
- **Bootstrap 5**：用於後台管理介面
- **TinyMCE**：富文本編輯器，用於作品內容編輯

### 後端
- **Python 3.8+**
- **Flask**：輕量級 Web 應用框架
- **MongoDB**：NoSQL 資料庫，存儲作品與聯絡信息
- **RESTful API**：提供資料交互接口

## 🚀 功能特點

### 公開頁面
1. **關於我**：個人介紹、技能展示和聯絡資訊
2. **作品集**：展示個人項目，包含詳情頁面
3. **部落格**：分享技術文章和經驗
4. **聯絡頁**：訪客可發送訊息給站長

### 後台管理
1. **儀表板**：概覽網站數據
2. **作品管理**：新增、編輯、刪除作品
3. **電子報訂閱管理**：查看訂閱者列表
4. **聯絡訊息管理**：查看和回覆訪客訊息

## 🛠️ 安裝與使用

### 環境要求
- Python 3.8+
- MongoDB

### 步驟
1. 複製專案
   ```bash
   git clone https://github.com/yourusername/my_website.git
   cd my_website
   ```

2. 安裝依賴
   ```bash
   pip install -r requirements.txt
   ```

3. 設定環境變數
   ```bash
   export FLASK_APP=app.py
   export MONGO_URI=your_mongodb_connection_string
   export SECRET_KEY=your_secret_key
   ```

4. 啟動應用
   ```bash
   flask run
   ```

5. 訪問網站
   瀏覽器開啟 `http://localhost:8000`

## 📈 未來計劃

- [ ] 實現多語言支持
- [ ] 添加暗黑模式
- [ ] 整合更多第三方平台 API
- [ ] 優化載入速度與效能
- [ ] 添加更多互動元素

## 📝 授權

本專案使用 [MIT 授權](LICENSE)。
