from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Optional
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from bson import ObjectId # Import ObjectId for explicit conversion

from models.objectid_model import PydanticObjectId # This is the Annotated type
from services.db_service import get_database # Add this missing import
from services.auth_service import get_current_admin_user # Add this missing import

router = APIRouter()

# --- Pydantic Models for Skill ---
# Model for incoming data (e.g., POST, PUT) - no 'id' expected from client
class SkillIn(BaseModel):
    icon: str # e.g., "faCode", "faServer". The frontend will map this to an icon.
    main: str # e.g., "前端開發"
    subSkills: List[str] = []

    class Config:
        json_schema_extra = {
            "example": {
                "icon": "faCode",
                "main": "前端開發",
                "subSkills": ["HTML/CSS", "JavaScript", "React", "TailwindCSS"],
            }
        }

# Model for outgoing data (e.g., GET, POST response) - 'id' is guaranteed
class SkillOut(BaseModel):
    id: PydanticObjectId = Field(alias="_id") # Use PydanticObjectId for output, guarantees ID
    icon: str
    main: str
    subSkills: List[str] = []

    class Config:
        populate_by_name = True # Allows populating from alias (e.g., _id)
        arbitrary_types_allowed = True # Allows PydanticObjectId
        json_schema_extra = {
            "example": {
                "id": "60a724b00f7e4f00150974e6", # Explicit example with ID
                "icon": "faCode",
                "main": "前端開發",
                "subSkills": ["HTML/CSS", "JavaScript", "React", "TailwindCSS"],
            }
        }

# --- API Endpoints for Skills ---

@router.get("/skills", response_model=List[SkillOut], response_model_by_alias=False, tags=["Skills"]) # Use SkillOut for response
async def get_all_skills(db: AsyncIOMotorClient = Depends(get_database)):
    """
    Fetch all skills from the database.
    """
    skills_list = await db.skills.find().to_list(100)
    # The response_model=List[SkillOut] will handle the conversion from _id to id
    return skills_list

@router.post("/skills", response_model=SkillOut, response_model_by_alias=False, status_code=status.HTTP_201_CREATED, tags=["Skills"]) # Use SkillOut for response
async def create_skill(skill_in: SkillIn, db: AsyncIOMotorClient = Depends(get_database), admin_user: dict = Depends(get_current_admin_user)):
    """
    Create a new skill. (Admin Only)
    """
    skill_dict = skill_in.model_dump() # Use model_dump() without alias for insertion
    
    result = await db.skills.insert_one(skill_dict)
    
    # Retrieve the created document to ensure _id is present for SkillOut
    created_skill_doc = await db.skills.find_one({"_id": result.inserted_id})
    return created_skill_doc # FastAPI will convert this document to SkillOut

@router.put("/skills/{skill_id}", response_model=SkillOut, response_model_by_alias=False, tags=["Skills"]) # Use SkillOut for response
async def update_skill(skill_id: str, skill_update: SkillIn, db: AsyncIOMotorClient = Depends(get_database), admin_user: dict = Depends(get_current_admin_user)):
    """
    Update an existing skill by its ID. (Admin Only)
    """
    update_data = skill_update.model_dump(exclude_unset=True) # Exclude unset fields from the update

    result = await db.skills.update_one(
        {"_id": ObjectId(skill_id)}, # Correct: Use ObjectId for path parameter conversion
        {"$set": update_data}
    )

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail=f"Skill with ID {skill_id} not found")
    
    updated_skill_doc = await db.skills.find_one({"_id": ObjectId(skill_id)}) # Correct: Use ObjectId here
    return updated_skill_doc # FastAPI will convert this document to SkillOut

@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Skills"])
async def delete_skill(skill_id: str, db: AsyncIOMotorClient = Depends(get_database), admin_user: dict = Depends(get_current_admin_user)):
    """
    Delete a skill by its ID. (Admin Only)
    """
    result = await db.skills.delete_one({"_id": ObjectId(skill_id)}) # Correct: Use ObjectId here

    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail=f"Skill with ID {skill_id} not found")

    return
