from typing import Annotated, Any
from bson import ObjectId
from pydantic import BeforeValidator, Field, PlainSerializer # 確保導入 PlainSerializer

# Represents an ObjectId field in the database.
def validate_object_id(v: Any) -> ObjectId:
    if isinstance(v, ObjectId):
        return v
    if isinstance(v, str) and ObjectId.is_valid(v):
        return ObjectId(v)
    raise ValueError("Invalid ObjectId")

def serialize_object_id(v: ObjectId) -> str:
    """Converts ObjectId to str for JSON serialization."""
    return str(v)

# PydanticObjectId 包含驗證和序列化邏輯
PydanticObjectId = Annotated[
    ObjectId, 
    BeforeValidator(validate_object_id),
    PlainSerializer(serialize_object_id, return_type=str), # 關鍵: 確保序列化
    Field(json_schema_extra={"type": "string", "example": "60a724b00f7e4f00150974e6"})
]