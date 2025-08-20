import os
import httpx
from fastapi import APIRouter, Request, Depends, HTTPException
from backend.auth.dependency import get_current_user
from ..supabase import supabase
import datetime

router = APIRouter()

CLIENT_ID = os.getenv("MS_CLIENT_ID")
CLIENT_SECRET = os.getenv("MS_CLIENT_SECRET")
REDIRECT_URI = "http://localhost:5173/callback"


@router.post("/api/msgraph/create-event")
async def msgraph_create_event(request: Request, user=Depends(get_current_user)):
    data = await request.json()
    user_id = user["sub"]
    # Fetch access token from Supabase
    token_result = supabase.table("ms_tokens").select("access_token").eq("user_id", user_id).execute()
    if not token_result.data or len(token_result.data) == 0:
        raise HTTPException(status_code=401, detail="Microsoft account not connected")
    access_token = token_result.data[0]["access_token"]
    # Prepare event payload from request data
    event_payload = data.get("event")
    if not event_payload:
        raise HTTPException(status_code=400, detail="Missing event payload")
    # Call Microsoft Graph API to create event
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://graph.microsoft.com/v1.0/me/events",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=event_payload
        )
        if response.status_code >= 400:
            return {"error": response.text, "status": response.status_code}
        return response.json()

@router.post("/api/msgraph/status")
async def msgraph_status(request: Request, user=Depends(get_current_user)):
    data = await request.json()
    user_id = data.get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user_id")
    # Validate user_id is a UUID
    import uuid
    try:
        uuid.UUID(str(user_id))
    except ValueError:
        raise HTTPException(status_code=400, detail="user_id is not a valid UUID")
    # Query ms_tokens for this user
    result = supabase.table("ms_tokens").select("user_id").eq("user_id", user_id).execute()
    connected = bool(result.data and len(result.data) > 0)
    return {"connected": connected}

@router.post("/api/msgraph/token")
async def msgraph_token(request: Request, user=Depends(get_current_user)):
    data = await request.json()
    code = data.get("code")
    token_url = "https://login.microsoftonline.com/common/oauth2/v2.0/token"
    payload = {
        "client_id": CLIENT_ID,
        "client_secret": CLIENT_SECRET,
        "code": code,
        "redirect_uri": REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(token_url, data=payload)
        tokens = response.json()

    # Store tokens for the authenticated user
    expires_in = tokens.get("expires_in")
    expires_at = (datetime.datetime.utcnow() + datetime.timedelta(seconds=expires_in)).isoformat() if expires_in else None

    if user and "access_token" in tokens:
        print(supabase.table("ms_tokens").select("*").execute())
        print("User object:", user)
        upsert_data = {
            "user_id": user["sub"],
            "access_token": tokens["access_token"],
            "refresh_token": tokens.get("refresh_token"),
            "expires_at": expires_at
        }
        print("Upsert data:", upsert_data)
        # Validate user_id is a UUID
        import uuid
        try:
            uuid.UUID(str(upsert_data["user_id"]))
        except ValueError:
            print("ERROR: user_id is not a valid UUID:", upsert_data["user_id"])
            raise HTTPException(status_code=400, detail="user_id is not a valid UUID")
        supabase.table("ms_tokens").upsert(upsert_data).execute()
    return tokens
