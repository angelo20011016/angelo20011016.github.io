import os
import asyncio
from getpass import getpass
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import sys

# Add project root to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


# Load environment variables from .env file
load_dotenv()

# Assuming your project structure, let's import the necessary components
# This might need adjustment based on how you run the script
from models.user import UserModel

# --- Database Connection ---
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("MONGO_URI environment variable not set.")

async def create_admin_user():
    """
    An asynchronous script to create an admin user in the database.
    """
    client = None  # Initialize client to None
    try:
        # --- Connect to the database ---
        print("Connecting to the database...")
        client = AsyncIOMotorClient(MONGO_URI)
        # In Motor, you select the database directly from the client
        db_name = client.get_database().name
        db = client[db_name]
        print(f"Connected to database: {db_name}")

        user_model = UserModel(db)

        # --- Get user input ---
        print("\nPlease enter the details for the new admin user.")
        email = input("Email: ").strip()
        password = getpass("Password: ")
        password_confirm = getpass("Confirm Password: ")
        nickname = input("Nickname (optional, press enter to skip): ").strip()

        if not email or not password:
            print("\n❌ Error: Email and password cannot be empty.")
            return

        if password != password_confirm:
            print("\n❌ Error: Passwords do not match.")
            return

        # --- Create user ---
        print(f"\nCreating user for email: {email}...")
        user, error = user_model.create_user(
            email=email,
            password=password,
            nickname=nickname or email.split('@')[0]
        )

        if error:
            print(f"❌ Error creating user: {error}")
        else:
            print(f"✅ Successfully created admin user with ID: {user['_id']}")
            print("You can now log in using the /api/admin/token endpoint.")

    except Exception as e:
        print(f"\nAn unexpected error occurred: {e}")
    finally:
        if client:
            client.close()
            print("\nDatabase connection closed.")


if __name__ == "__main__":
    # In Python 3.7+
    asyncio.run(create_admin_user())
