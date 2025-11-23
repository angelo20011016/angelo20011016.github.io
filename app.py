from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import sys
from contextlib import asynccontextmanager # Import asynccontextmanager
from bson.objectid import ObjectId # Keep for ID handling

# Import database services
from services.db_service import get_database, connect_to_mongo

# --- Robust .env Loading ---
dotenv_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)
else:
    print("⚠️ WARNING: .env file not found at:", dotenv_path, file=sys.stderr)

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("--- Final Config Loaded in App ---")
    print(f"AZURE_KEY: {bool(os.getenv('AZURE_SPEECH_KEY'))}") # Check directly from env
    print("----------------------------------")

    # Use the database connection lifespan from db_service
    async with connect_to_mongo():
        yield
# FastAPI app instance
app = FastAPI(
    title="Angelo's Portfolio API",
    description="API for managing portfolio, blog, contact, and user data.",
    version="0.1.0",
    lifespan=lifespan, # Pass the lifespan context manager
)

# CORS Middleware for FastAPI
# Adjust origins as needed for your frontend deployment
origins = [
    "http://localhost",
    "http://localhost:3000",  # Next.js frontend local development URL
    
    # 【關鍵修正】: 根據錯誤訊息，加入您的前端的 IP 地址和端口
    "http://172.21.240.1:3000",
    
    # Add your production frontend URL here when deployed
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Import and Include FastAPI Routers ---
# We will create these FastAPI routers in the next steps
from routes.portfolio import router as portfolio_router
from routes.blog import router as blog_router
from routes.contact import router as contact_router
from routes.user import router as user_router # Assuming user routes will also be migrated
from routes.admin import router as admin_router

app.include_router(portfolio_router, prefix="/api")
app.include_router(blog_router, prefix="/api")
app.include_router(contact_router, prefix="/api")
app.include_router(user_router, prefix="/api") # Include user router
app.include_router(admin_router, prefix="/api") # Include admin router


if __name__ == '__main__':
    # Use Uvicorn to run the FastAPI app
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
