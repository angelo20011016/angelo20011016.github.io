from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class UserModel:
    def __init__(self, db):
        self.collection = db['users']

    def create_user(self, email, password, nickname=None):
        # 檢查 email 是否已存在
        if self.collection.find_one({'email': email}):
            return None, 'Email 已被註冊'
        user = {
            'email': email,
            'password_hash': generate_password_hash(password),
            'nickname': nickname or '',
            'created_at': datetime.utcnow(),
            'last_login': None
        }
        result = self.collection.insert_one(user)
        user['_id'] = result.inserted_id
        return user, None

    def find_by_email(self, email):
        return self.collection.find_one({'email': email})

    def verify_password(self, email, password):
        user = self.find_by_email(email)
        if not user:
            return False
        return check_password_hash(user['password_hash'], password)

    def update_last_login(self, email):
        self.collection.update_one({'email': email}, {'$set': {'last_login': datetime.utcnow()}})

    def set_reset_token(self, email, token, expire_time):
        self.collection.update_one(
            {'email': email},
            {'$set': {'reset_token': token, 'reset_token_expire': expire_time}}
        )

    def get_user_by_reset_token(self, token):
        return self.collection.find_one({'reset_token': token})

    def clear_reset_token(self, email):
        self.collection.update_one(
            {'email': email},
            {'$unset': {'reset_token': '', 'reset_token_expire': ''}}
        )

    def update_password(self, email, new_password):
        self.collection.update_one(
            {'email': email},
            {'$set': {'password_hash': generate_password_hash(new_password)}}
        )
