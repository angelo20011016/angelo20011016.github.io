from typing import Optional
from pydantic import BaseModel, Field
from models.objectid_model import PydanticObjectId
from bson import ObjectId

class SiteSettings(BaseModel):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    settings_id: str = Field("site_settings", alias="settings_id")
    
    # Contact Info
    contact_email: str = Field(..., description="Contact Email")
    contact_phone: str = Field(..., description="Contact Phone Number")
    contact_location: str = Field(..., description="Contact Location")
    
    # Social Links
    social_github: str = Field(..., description="GitHub Profile URL")
    social_instagram: str = Field(..., description="Instagram Profile URL")
    social_youtube: str = Field(..., description="YouTube Profile URL")

    # Section Titles (optional)
    portfolio_title: str = Field("Selected Work", description="Portfolio Section Title")
    portfolio_subtitle: str = Field("A collection of projects exploring the intersection of design, code, and interaction.", description="Portfolio Section Subtitle")
    blog_title: str = Field("Insights", description="Blog Section Title")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True,
        "json_encoders": {ObjectId: str}
    }
