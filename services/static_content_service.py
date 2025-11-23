from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from models.hero_settings import HeroSettings
from bson import ObjectId
from fastapi import Depends
from services.db_service import get_database


class StaticContentService:
    def __init__(self, database: AsyncIOMotorClient):
        self.collection: AsyncIOMotorCollection = database["settings"] # Using 'settings' collection

    async def get_hero_settings(self) -> HeroSettings:
        # Try to find the hero settings document
        settings_doc = await self.collection.find_one({"settings_id": "hero_settings"})
        if settings_doc:
            return HeroSettings.parse_obj(settings_doc)
        else:
            # If not found, create a default one
            default_settings = HeroSettings(
                hero_background_image_url="https://images.unsplash.com/photo-1531297484001-80022131f5a1",
                hero_personal_photo_url="https://img8.uploadhouse.com/fileuploads/31936/31936778eb4b70130f3289122781a71f94414143.jpg",
                hero_main_title="Angelo",
                hero_subtitle="Creative Developer",
                hero_bio_content="大學時期的我，在課餘時間擔任過吉他社團老師、咖啡師、以及軟體新創業務。除了喜歡把雜亂的知識收斂成系統後與他人分享，更在實習過程中收穫了很好的簡報/提案/思考能力。而拜於學校重視數據驅動的趨勢，我也培養了不錯的數理能力，也從中發現了用程式解決現實問題的樂趣，因此點燃了我對技術的熱情。除了本科的數理統計/統計分析，更跨系修習了許多程式相關的課程，以展現學習積極/以及學習能力，詳情可以參考[我的成績單](https://drive.google.com/file/d/1rKGg4z_ZxPkvfL82YNfv-tEenXQ0Zn7b/view?usp=share_link)，也在畢業前與畢業後分別並參與了ccClub/職訓局這兩個非常扎實的coding bootcamp.\n\n積極求職的現在，深知轉職軟體工程是一條艱辛、需要持續學習的路程，我積極探索各種技術領域，持續打造能夠真正解決問題的作品集。",
                hero_button_1_label="查看作品集",
                hero_button_2_label="與我聯繫"
            )
            inserted_id = await self.collection.insert_one(default_settings.dict(by_alias=True))
            default_settings.id = inserted_id.inserted_id
            return default_settings

    async def update_hero_settings(self, settings: HeroSettings) -> HeroSettings:
        # Update the existing hero settings document
        # We use 'settings_id' as the unique identifier for the update
        updated_doc = await self.collection.find_one_and_update(
            {"settings_id": "hero_settings"},
            {"$set": settings.dict(by_alias=True, exclude={"id"})}, # Exclude 'id' from update payload
            return_document=True, # Return the updated document
            upsert=True # Create the document if it doesn't exist
        )
        if updated_doc:
            return HeroSettings.parse_obj(updated_doc)
        return None # Should ideally not happen if get_hero_settings creates it


# Dependency to get the StaticContentService
async def get_static_content_service(database: AsyncIOMotorClient = Depends(get_database)) -> StaticContentService:
    return StaticContentService(database)
