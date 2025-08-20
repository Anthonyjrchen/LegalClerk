from fastapi import FastAPI, Depends, HTTPException
from jose import jwt
import httpx

app = FastAPI()

# Verify Supabase JWT
async def get_current_user(token: str):
    try:
        payload = jwt.decode(token, "SUPABASE_JWT_SECRET", algorithms=["HS256"])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/calendars")
async def list_calendars(user=Depends(get_current_user)):
    # Here you'll call Microsoft Graph API with stored OAuth token
    return {"message": f"Calendars for {user['sub']}"}
