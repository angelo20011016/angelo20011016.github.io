from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional, Any
from bson.objectid import ObjectId
from datetime import datetime
import pytz
from pydantic import BaseModel, Field, BeforeValidator, PlainSerializer
from typing_extensions import Annotated
from motor.motor_asyncio import AsyncIOMotorClient
import sys

# 【關鍵修正】: 從 services.db_service 導入 get_database，而不是 app
# 這樣就打破了 app -> routes.blog -> app 的循環
from services.db_service import get_database 



router = APIRouter()

# Pydantic V2 compatible ObjectId handling
# Represents an ObjectId field in the database.
def validate_object_id(v: Any) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if isinstance(v, str) and ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError("Invalid ObjectId")

def serialize_object_id(v: ObjectId) -> str:
    """Converts ObjectId to str for JSON serialization."""
    return str(v)

# PydanticObjectId 添加了 PlainSerializer 來處理 ObjectId -> str 的 JSON 輸出
PydanticObjectId = Annotated[
    ObjectId, 
    BeforeValidator(validate_object_id),
    PlainSerializer(serialize_object_id, return_type=str), # 確保序列化為字串
    Field(json_schema_extra={"type": "string", "example": "60a724b00f7e4f00150974e6"})
]

# Pydantic model for Blog Post item
class BlogPostItem(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    title: str
    subtitle: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    tags: List[str] = []
    is_published: bool = False
    created_at: datetime = Field(default_factory=lambda: datetime.now(pytz.utc))
    published_at: Optional[datetime] = None # Datetime object
    updated_at: Optional[datetime] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "title": "我的部落格文章",
                "subtitle": "這是文章的副標題",
                "content": "<p>這是文章的詳細內容，支援HTML。</p>",
                "cover_image": "http://example.com/blog_cover.jpg",
                "tags": ["Python", "FastAPI", "MongoDB"],
                "is_published": True,
            }
        }


@router.get("/blog", response_model=List[BlogPostItem])
async def get_all_blog_posts(
    # 修正 2: 使用 get_database
    db: AsyncIOMotorClient = Depends(get_database),
    published_only: bool = Query(True, alias="publishedOnly") # Align with frontend naming
):
    try:
        query = {}
        if published_only:
            query['is_published'] = True
        
        posts = await db.blog_posts.find(query).sort("published_at", -1).to_list(1000)
        
        return posts
    except Exception as e:
        print(f"Error fetching blog posts list: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail="無法獲取文章列表")

@router.get("/blog/{post_id}", response_model=BlogPostItem)
async def get_blog_post_by_id(post_id: str, db: AsyncIOMotorClient = Depends(get_database)):
    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="無效的文章 ID 格式")
        
        post = await db.blog_posts.find_one({"_id": ObjectId(post_id)})
        
        if not post:
            raise HTTPException(status_code=404, detail="找不到該文章")
        
        if not post.get('is_published', False): # For public API, only return published posts
             raise HTTPException(status_code=404, detail="找不到該文章或未發布")
        
        return post
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching single blog post: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail="無法獲取文章詳情")

# Admin routes (POST, PUT, DELETE) are kept as stubs for now.
# They would require proper authentication dependencies.
@router.post("/blog", response_model=BlogPostItem, status_code=status.HTTP_201_CREATED)
async def create_blog_post(item: BlogPostItem, db: AsyncIOMotorClient = Depends(get_database)):
    # Placeholder for admin authentication
    # if not await is_admin_logged_in(session_id):
    #     raise HTTPException(status_code=401, detail="未授權")

    if item.id:
        raise HTTPException(status_code=400, detail="Do not provide _id for new item creation")

    if item.is_published and not item.published_at:
        item.published_at = datetime.now(pytz.utc)

    try:
        # 使用 Pydantic V2 的 model_dump
        post_dict = item.model_dump(by_alias=True, exclude_unset=True) 
        if "_id" in post_dict and post_dict["_id"] is None:
            del post_dict["_id"]

        result = await db.blog_posts.insert_one(post_dict)
        
        created_item = await db.blog_posts.find_one({"_id": result.inserted_id})
        return created_item
    except Exception as e:
        print(f"Error creating blog post: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"伺服器錯誤: {e}")

@router.put("/blog/{post_id}", response_model=BlogPostItem)
async def update_blog_post(post_id: str, item: BlogPostItem, db: AsyncIOMotorClient = Depends(get_database)):
    # Placeholder for admin authentication
    # if not await is_admin_logged_in(session_id):
    #     raise HTTPException(status_code=401, detail="未授權")

    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="無效的文章 ID 格式")
        
        # 使用 Pydantic V2 的 model_dump
        update_data = item.model_dump(by_alias=True, exclude_unset=True)
        update_data.pop("id", None)
        update_data.pop("_id", None)
        update_data.pop("created_at", None) # Do not update created_at
        update_data["updated_at"] = datetime.now(pytz.utc) # Set updated_at

        result = await db.blog_posts.update_one(
            {"_id": ObjectId(post_id)},
            {"$set": update_data}
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="找不到該文章")
        
        updated_item = await db.blog_posts.find_one({"_id": ObjectId(post_id)})
        return updated_item
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating blog post: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"伺服器錯誤: {e}")

@router.delete("/blog/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_blog_post(post_id: str, db: AsyncIOMotorClient = Depends(get_database)):
    # Placeholder for admin authentication
    # if not await is_admin_logged_in(session_id):
    #     raise HTTPException(status_code=401, detail="未授權")

    try:
        if not ObjectId.is_valid(post_id):
            raise HTTPException(status_code=400, detail="無效的文章 ID 格式")
        
        result = await db.blog_posts.delete_one({"_id": ObjectId(post_id)})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="找不到該文章")
        
        return # 204 No Content for successful deletion
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error deleting blog post: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail=f"伺服器錯誤: {e}")

@router.get("/blog/count", response_model=dict)
async def get_blog_post_count(
    db: AsyncIOMotorClient = Depends(get_database),
    published_only: bool = Query(True, alias="publishedOnly")
):
    try:
        query = {}
        if published_only:
            query['is_published'] = True
        count = await db.blog_posts.count_documents(query)
        return {'count': count}
    except Exception as e:
        print(f"Error fetching blog post count: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail="無法獲取文章數量")