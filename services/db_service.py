import os
import sys
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Ensure .env is loaded (though app.py should also handle this)
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path=dotenv_path)

# Global client instance to be managed by the lifespan context
_mongo_client_instance: AsyncIOMotorClient = None
_db_instance = None # To hold the actual database object

@asynccontextmanager
async def connect_to_mongo():
    global _mongo_client_instance, _db_instance
    mongo_uri = os.getenv('MONGODB_URI')
    
    if not mongo_uri:
        print("\n🔴 FATAL ERROR: MONGODB_URI not set for database connection in db_service.", file=sys.stderr)
        sys.exit(1)
    
    print(f"DEBUG (db_service): Attempting to connect to MongoDB with URI: {mongo_uri[:20]}...")
    try:
        _mongo_client_instance = AsyncIOMotorClient(mongo_uri)
        _db_instance = _mongo_client_instance.get_database()
        print("✅ MongoDB (db_service) connected successfully!")
    except Exception as e:
        print(f"\n🔴 ERROR (db_service): Failed to connect to MongoDB: {e}", file=sys.stderr)
        sys.exit(1)
    
    yield # Connection is established and db_instance is set

    # On exit from the context manager
    if _mongo_client_instance:
        _mongo_client_instance.close()
        print("🔌 MongoDB (db_service) connection closed.")

async def get_database():
    """
    Dependency that provides a database connection for each request.
    It expects _db_instance to be set by the connect_to_mongo lifespan.
    """
    if _db_instance is not None:

        yield _db_instance
    else:
        raise RuntimeError("Database client not initialized. Ensure `connect_to_mongo` lifespan has run.")
