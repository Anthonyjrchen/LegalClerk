import os
from fastapi import HTTPException, status, Header, Depends
from jose import jwt

SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

def verify_jwt(token: str):
    print("Received JWT:", token)
    try:
        payload = jwt.decode(token, SUPABASE_JWT_SECRET, algorithms=["HS256"], options={"verify_aud": False})
        print("Decoded payload:", payload)
        return payload
    except Exception as e:
        print("JWT decode error:", e)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

async def get_current_user(authorization: str = Header(...)):
    token = authorization.replace("Bearer ", "")
    return verify_jwt(token)
