from passlib.context import CryptContext
from datetime import datetime

# Setup password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class UserModel:
    def __init__(self, db):
        self.collection = db['users']

    async def create_user(self, email, password, nickname=None):
        # 檢查 email 是否已存在
        if await self.collection.find_one({'email': email}):
            return None, 'Email 已被註冊'
        user = {
            'email': email,
            'password_hash': pwd_context.hash(password),
            'nickname': nickname or '',
            'created_at': datetime.utcnow(),
            'last_login': None
        }
        result = await self.collection.insert_one(user)
        user['_id'] = result.inserted_id
        return user, None

    async def find_by_email(self, email):
        return await self.collection.find_one({'email': email})

    async def verify_password(self, email, password):
        user = await self.find_by_email(email)
        if not user:
            return False
        return pwd_context.verify(password, user['password_hash'])

    async def update_last_login(self, email):
        await self.collection.update_one({'email': email}, {'$set': {'last_login': datetime.utcnow()}})

    async def set_reset_token(self, email, token, expire_time):
        await self.collection.update_one(
            {'email': email},
            {'$set': {'reset_token': token, 'reset_token_expire': expire_time}}
        )

    async def get_user_by_reset_token(self, token):
        return await self.collection.find_one({'reset_token': token})

    async def clear_reset_token(self, email):
        await self.collection.update_one(
            {'email': email},
            {'$unset': {'reset_token': '', 'reset_token_expire': ''}}
        )

    async def update_password(self, email, new_password):
        await self.collection.update_one(
            {'email': email},
            {'$set': {'password_hash': pwd_context.hash(new_password)}}
        )
