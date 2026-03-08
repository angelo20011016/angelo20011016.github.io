from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId

from models.objectid_model import PydanticObjectId
from services.db_service import get_database
from services.auth_service import get_current_admin_user

router = APIRouter()

# --- Models ---

class HobbyIn(BaseModel):
    name: str # e.g., "跑步"
    icon: str # FontAwesome class or name, e.g., "faRunning"
    description: Optional[str] = None # e.g., "每週三次 5K，享受腦內啡"

    class Config:
        json_schema_extra = {
            "example": {
                "name": "跑步",
                "icon": "faRunning",
                "description": "維持心肺功能與意志力"
            }
        }

class HobbyOut(BaseModel):
    id: PydanticObjectId = Field(alias="_id")
    name: str
    icon: str
    description: Optional[str] = None

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_schema_extra = {
            "example": {
                "id": "60a7...",
                "name": "跑步",
                "icon": "faRunning",
                "description": "維持心肺功能與意志力"
            }
        }

# --- Endpoints ---

@router.get("/hobbies", response_model=List[HobbyOut], response_model_by_alias=False, tags=["Hobbies"])
async def get_hobbies(db: AsyncIOMotorClient = Depends(get_database)):
    """Fetch all hobbies."""
    hobbies = await db.hobbies.find().to_list(100)
    return hobbies

@router.post("/hobbies", response_model=HobbyOut, response_model_by_alias=False, status_code=status.HTTP_201_CREATED, tags=["Hobbies"])
async def create_hobby(hobby: HobbyIn, db: AsyncIOMotorClient = Depends(get_database), admin_user: dict = Depends(get_current_admin_user)):
    """Create a new hobby (Admin only)."""
    hobby_dict = hobby.model_dump()
    result = await db.hobbies.insert_one(hobby_dict)
    created_hobby = await db.hobbies.find_one({"_id": result.inserted_id})
    return created_hobby

@router.put("/hobbies/{hobby_id}", response_model=HobbyOut, response_model_by_alias=False, tags=["Hobbies"])
async def update_hobby(hobby_id: str, hobby_update: HobbyIn, db: AsyncIOMotorClient = Depends(get_database), admin_user: dict = Depends(get_current_admin_user)):
    """Update a hobby (Admin only)."""
    if not ObjectId.is_valid(hobby_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
    
    update_data = hobby_update.model_dump(exclude_unset=True)
    
    result = await db.hobbies.update_one(
        {"_id": ObjectId(hobby_id)},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Hobby not found")
        
    updated_hobby = await db.hobbies.find_one({"_id": ObjectId(hobby_id)})
    return updated_hobby

@router.delete("/hobbies/{hobby_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Hobbies"])
async def delete_hobby(hobby_id: str, db: AsyncIOMotorClient = Depends(get_database), admin_user: dict = Depends(get_current_admin_user)):
    """Delete a hobby (Admin only)."""
    if not ObjectId.is_valid(hobby_id):
        raise HTTPException(status_code=400, detail="Invalid ID")
        
    result = await db.hobbies.delete_one({"_id": ObjectId(hobby_id)})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Hobby not found")
