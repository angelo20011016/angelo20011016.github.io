from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from services.auth_service import get_current_admin_user
import aiofiles
import os
from uuid import uuid4

router = APIRouter()

# Define the directory where files will be saved
UPLOAD_DIR = "static/uploads"

@router.post("/upload", dependencies=[Depends(get_current_admin_user)])
async def upload_image(file: UploadFile = File(...)):
    """
    Handles image uploads from the admin panel.
    - Ensures the user is an authenticated admin.
    - Generates a unique filename to prevent overwrites.
    - Saves the file to the UPLOAD_DIR.
    - Returns the relative path to the saved file.
    """
    # Ensure the upload directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Generate a unique filename using UUID and keeping the original extension
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid4()}{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    try:
        # Asynchronously write the file to the server's disk
        async with aiofiles.open(file_path, 'wb') as out_file:
            content = await file.read()  # Read file content
            await out_file.write(content)  # Write content to file
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"There was an error uploading the file: {e}")

    # Return the relative path that the frontend can use
    relative_path = f"/{file_path.replace(os.path.sep, '/')}"
    return {"file_path": relative_path}
