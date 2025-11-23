from fastapi import APIRouter, Depends, HTTPException, status
from models.hero_settings import HeroSettings
from services.static_content_service import StaticContentService, get_static_content_service
from services.auth_service import get_current_admin_user # For admin authentication

router = APIRouter()

@router.get("/settings/hero", response_model=HeroSettings, summary="Get Hero Section Settings")
async def get_hero_section_settings(
    static_content_service: StaticContentService = Depends(get_static_content_service)
):
    """
    Retrieves the current settings for the Hero section.
    If settings do not exist, default settings will be created and returned.
    """
    settings = await static_content_service.get_hero_settings()
    if not settings:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Hero settings not found and could not be created."
        )
    return settings

@router.put("/settings/hero", response_model=HeroSettings, summary="Update Hero Section Settings")
async def update_hero_section_settings(
    hero_settings: HeroSettings,
    static_content_service: StaticContentService = Depends(get_static_content_service),
    current_admin_user: dict = Depends(get_current_admin_user) # Secure this endpoint for admin
):
    """
    Updates the settings for the Hero section. Requires administrator privileges.
    """
    # Ensure only one settings document exists for hero_settings by enforcing its settings_id
    if hero_settings.settings_id != "hero_settings":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid settings_id. Only 'hero_settings' is allowed for this endpoint."
        )
    
    updated_settings = await static_content_service.update_hero_settings(hero_settings)
    if not updated_settings:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update Hero settings."
        )
    return updated_settings
