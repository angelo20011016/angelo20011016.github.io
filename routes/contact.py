from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, List, Any
from bson.objectid import ObjectId
from datetime import datetime
import pytz
from pydantic import BaseModel, Field, EmailStr, BeforeValidator
from typing_extensions import Annotated
from motor.motor_asyncio import AsyncIOMotorClient
import re # Keep re for email validation if not relying solely on Pydantic EmailStr (though EmailStr is usually enough)
from services.db_service import get_database # Corrected import for the dependency

router = APIRouter()

# Pydantic V2 compatible ObjectId handling
def validate_object_id(v: Any) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if isinstance(v, str) and ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError("Invalid ObjectId")

PydanticObjectId = Annotated[ObjectId, BeforeValidator(validate_object_id)]


# Pydantic model for Contact Form submission
class ContactFormRequest(BaseModel):
    name: str = Field(..., min_length=1, description="發送者的姓名")
    email: EmailStr = Field(..., description="發送者的電子郵件地址")
    message: str = Field(..., min_length=1, description="聯絡訊息內容")

# Pydantic model for Newsletter Subscription
class NewsletterSubscribeRequest(BaseModel):
    email: EmailStr = Field(..., description="訂閱者的電子郵件地址")
    source: Optional[str] = "about_page" # Default source

# Pydantic model for Contact Item in DB (for internal use/response)
class ContactItem(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    name: str
    email: EmailStr
    message: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(pytz.utc))
    read: bool = False
    replied: bool = False

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "name": "測試使用者",
                "email": "test@example.com",
                "message": "這是一條測試訊息。",
            }
        }

# Pydantic model for Newsletter Subscriber Item in DB (for internal use/response)
class SubscriberItem(BaseModel):
    id: Optional[PydanticObjectId] = Field(alias="_id", default=None)
    email: EmailStr
    subscribed_at: datetime = Field(default_factory=lambda: datetime.now(pytz.utc))
    active: bool = True
    source: str = "about_page"

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "email": "subscribe@example.com",
                "source": "footer",
            }
        }

@router.post("/contactme", response_model=dict, status_code=status.HTTP_201_CREATED)
async def contact_form(data: ContactFormRequest, db: AsyncIOMotorClient = Depends(get_database)):
    """處理聯絡表單提交"""
    try:
        contact_data = {
            'name': data.name,
            'email': data.email,
            'message': data.message,
            'created_at': datetime.now(pytz.utc),
            'read': False,
            'replied': False
        }
        
        result = await db.contacts.insert_one(contact_data)
        
        return {
            'success': True,
            'message': '您的訊息已送出！我會盡快回覆您。',
            'contact_id': str(result.inserted_id)
        }
            
    except Exception as e:
        print(f"聯絡表單處理錯誤: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail="伺服器處理請求時發生錯誤")

@router.post("/subscribe", response_model=dict, status_code=status.HTTP_201_CREATED)
async def subscribe_newsletter(data: NewsletterSubscribeRequest, db: AsyncIOMotorClient = Depends(get_database)):
    """處理電子報訂閱請求"""
    try:
        email = data.email
        
        # 檢查是否已訂閱
        existing_subscriber = await db.newsletter_subscribers.find_one({'email': email})
        
        if existing_subscriber:
            if not existing_subscriber.get('active', True): # If not active, reactivate
                await db.newsletter_subscribers.update_one(
                    {'email': email},
                    {'$set': {'active': True, 'subscribed_at': datetime.now(pytz.utc)}}
                )
                return {
                    'success': True,
                    'message': '您已重新訂閱我們的電子報！'
                }
            raise HTTPException(status_code=400, detail="此電子郵件已經訂閱了我們的電子報")
        
        # 創建新訂閱
        subscriber_data = {
            'email': email,
            'subscribed_at': datetime.now(pytz.utc),
            'active': True,
            'source': data.source
        }
        
        result = await db.newsletter_subscribers.insert_one(subscriber_data)
        
        return {
            'success': True,
            'message': '訂閱成功！感謝您的關注',
            'subscriber_id': str(result.inserted_id)
        }
            
    except HTTPException: # Re-raise FastAPI HTTP exceptions
        raise
    except Exception as e:
        print(f"訂閱處理錯誤: {e}", file=sys.stderr)
        raise HTTPException(status_code=500, detail="伺服器處理請求時發生錯誤")


# Admin routes (feedback, get_contacts, update contact status, get subscribers, etc.)
# are kept as stubs for now. They would require proper authentication dependencies.
# The original logic would need to be rewritten for FastAPI.

# @router.post("/feedback", ...)
# async def feedback(...):
#     pass

# @router.get("/feedback", ...)
# async def get_feedback(...):
#     pass

# @router.get('/api/contacts', ...)
# async def get_contacts(...):
#     pass