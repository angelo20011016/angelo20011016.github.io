from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional, Any
from bson.objectid import ObjectId
from datetime import datetime
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
import sys

from models.objectid_model import PydanticObjectId # Import PydanticObjectId
from services.db_service import get_database # Import the actual dependency generator
from services.auth_service import get_current_admin_user # Import the auth dependency

#     from app import get_database
#     return await get_database()

router = APIRouter()

class PortfolioItem(BaseModel):
    # 使用 PydanticObjectId 來處理 ObjectId <-> str 轉換
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    title: str
    description: str
    content: Optional[str] = None # Assuming rich HTML content
    image_url: Optional[str] = None
    github_url: Optional[str] = None
    demo_url: Optional[str] = None
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True # Replaces allow_population_by_field_name
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "title": "我的作品名稱",
                "description": "這是我的作品簡短描述",
                "content": "<p>這是作品的詳細內容，支援HTML</p>",
                "image_url": "http://example.com/image.jpg",
                "github_url": "http://github.com/my-project",
                "demo_url": "http://demo.my-project.com",
                "tags": ["Python", "FastAPI", "MongoDB"],
            }
        }
        # Pydantic V2's dumps/loads handles ObjectId -> str conversion automatically with Annotated type


@router.get("/portfolio", response_model=List[PortfolioItem])
async def get_all_portfolio(db: AsyncIOMotorClient = Depends(get_database)):
    try:
        # Pydantic V2's response_model會自動處理ObjectId到str的轉換
        portfolios = await db.portfolio.find().sort("created_at", -1).to_list(1000)
        
        return portfolios
    except Exception as e:
        print(f"Error fetching portfolio list: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail="無法獲取作品列表")

@router.get("/portfolio/{portfolio_id}", response_model=PortfolioItem)
async def get_portfolio_by_id(portfolio_id: str, db: AsyncIOMotorClient = Depends(get_database)):
    try:
        if not ObjectId.is_valid(portfolio_id):
            raise HTTPException(status_code=400, detail="無效的作品 ID 格式")
        
        # Pydantic V2's response_model會自動處理ObjectId到str的轉換
        portfolio = await db.portfolio.find_one({"_id": ObjectId(portfolio_id)})
        
        if not portfolio:
            raise HTTPException(status_code=404, detail="找不到該作品")
        
        return portfolio
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching single portfolio item: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail="無法獲取作品詳情")

# Admin routes (POST, PUT, DELETE) are now protected.
@router.post("/portfolio", response_model=PortfolioItem, status_code=status.HTTP_201_CREATED)
async def create_portfolio(item: PortfolioItem, db: AsyncIOMotorClient = Depends(get_database), admin_user: dict = Depends(get_current_admin_user)):
    # item.created_at is already set by default_factory
    if item.id:
        # PydanticObjectId should handle the conversion to ObjectId if provided
        raise HTTPException(status_code=400, detail="Do not provide _id for new item creation")

    try:
        # Convert Pydantic model to dictionary for MongoDB insertion
        # by_alias=True ensures 'id' is converted back to '_id'
        portfolio_dict = item.model_dump(by_alias=True, exclude_unset=True) 
        
        # remove the id field if it's default None
        # 使用 Pydantic V2 的 model_dump 方法
        if "_id" in portfolio_dict and portfolio_dict["_id"] is None:
            del portfolio_dict["_id"]

        result = await db.portfolio.insert_one(portfolio_dict)
        
        # Return the created item with the generated ID
        created_item = await db.portfolio.find_one({"_id": result.inserted_id})
        return created_item
    except Exception as e:
        print(f"Error creating portfolio item: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"伺服器錯誤: {e}")

@router.put("/portfolio/{portfolio_id}", response_model=PortfolioItem)
async def update_portfolio(portfolio_id: str, item: PortfolioItem, db: AsyncIOMotorClient = Depends(get_database), admin_user: dict = Depends(get_current_admin_user)):
    try:
        if not ObjectId.is_valid(portfolio_id):
            raise HTTPException(status_code=400, detail="無效的作品 ID 格式")

        # 使用 Pydantic V2 的 model_dump 方法
        update_data = item.model_dump(by_alias=True, exclude_unset=True)
        
        # Don't allow changing ID or created_at via PUT
        update_data.pop("id", None)
        update_data.pop("_id", None) # Ensure _id is not updated
        update_data.pop("created_at", None)
        update_data["updated_at"] = datetime.now() # Set updated_at

        result = await db.portfolio.update_one(
            {"_id": ObjectId(portfolio_id)},
            {"$set": update_data}
        )

        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="找不到該作品")
        
        # Return the updated item
        updated_item = await db.portfolio.find_one({"_id": ObjectId(portfolio_id)})
        return updated_item
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating portfolio item: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"伺服器錯誤: {e}")

@router.delete("/portfolio/{portfolio_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_portfolio(portfolio_id: str, db: AsyncIOMotorClient = Depends(get_database), admin_user: dict = Depends(get_current_admin_user)):
    try:
        if not ObjectId.is_valid(portfolio_id):
            raise HTTPException(status_code=400, detail="無效的作品 ID 格式")

        result = await db.portfolio.delete_one({"_id": ObjectId(portfolio_id)})

        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="找不到該作品")
        
        return # 204 No Content for successful deletion
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting portfolio item: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"伺服器錯誤: {e}")