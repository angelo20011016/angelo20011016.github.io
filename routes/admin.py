from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from services.auth_service import create_access_token, get_current_admin_user, ACCESS_TOKEN_EXPIRE_MINUTES
from models.user import UserModel
from services.db_service import get_database

router = APIRouter()

@router.post("/admin/token", summary="Admin Login")
async def login_for_access_token(db = Depends(get_database), form_data: OAuth2PasswordRequestForm = Depends()):
    """
    Provides a JWT token for authenticated admin users.
    Login with email as username.
    """
    user_model = UserModel(db)
    # The 'username' from the form is the email
    is_valid = await user_model.verify_password(email=form_data.username, password=form_data.password)

    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    await user_model.update_last_login(form_data.username)

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )

    return {"access_token": access_token, "token_type": "bearer"}


@router.get("/admin/me", summary="Get Current Admin User")
async def read_users_me(current_user: dict = Depends(get_current_admin_user)):
    """
    Returns the current authenticated admin user's information.
    A test endpoint to verify authentication.
    """
    # Note: It's better to return a Pydantic model of the user to avoid leaking sensitive data
    return {"email": current_user.get("email"), "nickname": current_user.get("nickname")}

