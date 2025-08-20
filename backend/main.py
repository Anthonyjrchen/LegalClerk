from fastapi import FastAPI, Depends, HTTPException, Request
from jose import jwt
import httpx
from .supabase import supabase
from backend.auth.dependency import get_current_user
from backend.MSIGraph.MicrosoftGraph import router as msgraph_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(msgraph_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for all origins (less secure)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/calendars")
async def list_calendars(user=Depends(get_current_user)):
    # Here you'll call Microsoft Graph API with stored OAuth token
    return {"message": f"Calendars for {user['sub']}"}

