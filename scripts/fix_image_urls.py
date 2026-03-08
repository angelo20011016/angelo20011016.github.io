import os
import sys
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# --- 設定項目 ---
# 你可以修改這個變數來指向不同的預設圖片
NEW_IMAGE_URL = "/static/images/portfolio/placeholder.svg"

async def fix_portfolio_images():
    """
    這個腳本會連接到你的 MongoDB 資料庫，
    並將 'portfolio' 集合中所有項目的 'image_url'
    更新為一個統一的、由後端伺服器提供的靜態路徑。
    """
    # --- 1. 載入環境變數 ---
    # 我們需要 .env 檔案中的 MONGODB_URI
    dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path=dotenv_path)
        print("✅ .env 檔案載入成功。")
    else:
        print("⚠️ 警告: 找不到 .env 檔案，將依賴環境中已設定的 MONGODB_URI。", file=sys.stderr)

    mongo_uri = os.getenv('MONGODB_URI')
    if not mongo_uri:
        print("\n🔴 錯誤: 找不到 'MONGODB_URI' 環境變數。請確保你的 .env 檔案已設定。", file=sys.stderr)
        sys.exit(1)

    # --- 2. 連接到資料庫 ---
    client = None  # 初始化 client 變數
    try:
        print(f"🔄 正在連接到 MongoDB...")
        client = AsyncIOMotorClient(mongo_uri)
        # The database name is part of the MONGODB_URI, get_database() will get it
        db = client.get_database()
        portfolio_collection = db.portfolio
        print(f"✅ 成功連接到資料庫 '{db.name}'。")
        
        # --- 3. 執行更新 ---
        print("\n🔄 開始更新 'portfolio' 集合中的 'image_url'...")
        
        # 找出所有項目
        cursor = portfolio_collection.find({}, {"_id": 1, "title": 1})
        items_to_update = await cursor.to_list(length=None)
        
        if not items_to_update:
            print("🟡 在 'portfolio' 集合中沒有找到任何項目。\n")
            return

        print(f"🔍 找到了 {len(items_to_update)} 個項目需要更新。")

        # 更新所有找到的項目
        result = await portfolio_collection.update_many(
            {},
            {"set": {"image_url": NEW_IMAGE_URL}}
        )

        # --- 4. 顯示結果 ---
        print("\n--- 更新結果 ---")
        print(f"✅ 成功匹配 {result.matched_count} 個項目。\n")
        print(f"✅ 成功修改 {result.modified_count} 個項目。\n")
        print(f"新的圖片路徑為: '{NEW_IMAGE_URL}'")

        print("\n💡 如何客製化：")
        print("   如果你想為特定專案設定不同圖片，你可以：")
        print("   1. 將圖片上傳到 'static/images/portfolio/' 資料夾。\n")
        print("   2. 手動修改這個腳本，使用 `update_one` 方法來更新單一項目。例如：")
        print("      `await portfolio_collection.update_one({'title': '我的專案A'}, {'$set': {'image_url': '/static/images/portfolio/project-a.png'}})`")
        print("   3. 或者，直接在你的管理後台修改該項目的 'image_url' 欄位。")

    except Exception as e:
        print(f"\n🔴 執行過程中發生錯誤: {e}", file=sys.stderr)
    finally:
        if client:
            client.close()
            print("\n🔌 資料庫連接已關閉。\n")

if __name__ == "__main__":
    # 執行異步函數
    asyncio.run(fix_portfolio_images())
