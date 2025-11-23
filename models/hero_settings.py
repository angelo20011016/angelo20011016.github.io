from typing import Optional
from pydantic import BaseModel, Field
from models.objectid_model import PydanticObjectId
from bson import ObjectId

class HeroSettings(BaseModel):
    id: PydanticObjectId = Field(default_factory=PydanticObjectId, alias="_id")
    settings_id: str = Field("hero_settings", alias="settings_id") # Unique identifier for this settings document
    hero_background_image_url: Optional[str] = Field(None, description="URL for the hero section background image")
    hero_personal_photo_url: Optional[str] = Field(None, description="URL for the personal photo in the hero section")
    hero_main_title: str = Field(..., description="Main title in the hero section")
    hero_subtitle: str = Field(..., description="Subtitle in the hero section")
    hero_bio_content: str = Field(..., description="Biography content in the hero section, supports Markdown")
    hero_button_1_label: str = Field(..., description="Label for the first button in the hero section")
    hero_button_2_label: str = Field(..., description="Label for the second button in the hero section")

    model_config = {
        "populate_by_name": True,
        "arbitrary_types_allowed": True, # Allow custom types like ObjectId
        "json_schema_extra": {
            "example": {
                "settings_id": "hero_settings",
                "hero_background_image_url": "https://example.com/background.jpg",
                "hero_personal_photo_url": "https://example.com/photo.jpg",
                "hero_main_title": "Angelo",
                "hero_subtitle": "Creative Developer",
                "hero_bio_content": "This is a **sample** bio content with *Markdown* support.",
                "hero_button_1_label": "View Portfolio",
                "hero_button_2_label": "Contact Me"
            }
        },
        "json_encoders": {ObjectId: str} # Still sometimes needed for direct ObjectId serialization in some contexts
    }
