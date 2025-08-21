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


async def refresh_token_if_expired(user_id: str, access_token: str, refresh_token: str, expires_at: str) -> str:
    """
    Helper function to check if token is expired and refresh it if needed.
    Returns the valid access token (either existing or refreshed).
    Raises HTTPException if token refresh fails.
    """
    if expires_at:
        expires_datetime = datetime.datetime.fromisoformat(expires_at.replace('Z', '+00:00'))
        if expires_datetime <= datetime.datetime.now(datetime.timezone.utc):
            print("Access token expired, attempting to refresh...")
            if refresh_token:
                # Try to refresh the token
                refresh_payload = {
                    "client_id": CLIENT_ID,
                    "client_secret": CLIENT_SECRET,
                    "refresh_token": refresh_token,
                    "grant_type": "refresh_token",
                }
                async with httpx.AsyncClient() as client:
                    refresh_response = await client.post("https://login.microsoftonline.com/common/oauth2/v2.0/token", data=refresh_payload)
                    if refresh_response.status_code == 200:
                        new_tokens = refresh_response.json()
                        new_access_token = new_tokens["access_token"]
                        new_refresh_token = new_tokens.get("refresh_token", refresh_token)
                        new_expires_in = new_tokens.get("expires_in")
                        new_expires_at = (datetime.datetime.utcnow() + datetime.timedelta(seconds=new_expires_in)).isoformat() if new_expires_in else None
                        
                        # Update token in database
                        update_data = {
                            "access_token": new_access_token,
                            "refresh_token": new_refresh_token,
                            "expires_at": new_expires_at
                        }
                        supabase.table("ms_tokens").update(update_data).eq("user_id", user_id).execute()
                        print("Token refreshed successfully")
                        return new_access_token
                    else:
                        print("Failed to refresh token, deleting expired token")
                        supabase.table("ms_tokens").delete().eq("user_id", user_id).execute()
                        raise HTTPException(status_code=401, detail="Microsoft token expired and refresh failed. Please reconnect your Microsoft account.")
            else:
                print("No refresh token available, deleting expired token")
                supabase.table("ms_tokens").delete().eq("user_id", user_id).execute()
                raise HTTPException(status_code=401, detail="Microsoft token expired and no refresh token available. Please reconnect your Microsoft account.")
    
    return access_token


@router.post("/api/msgraph/create-event")
async def msgraph_create_event(request: Request, user=Depends(get_current_user)):
    try:
        data = await request.json()
    except Exception as e:
        print("Error parsing JSON:", e)
        raise HTTPException(status_code=400, detail="Invalid JSON")
    print("Received data:", data)
    user_id = user["sub"]
    
    # Get calendar_id from request data or query params
    calendar_id = data.get("calendar_id")
    
    # Fetch access token from Supabase
    token_result = supabase.table("ms_tokens").select("access_token, refresh_token, expires_at").eq("user_id", user_id).execute()
    if not token_result.data or len(token_result.data) == 0:
        raise HTTPException(status_code=401, detail="Microsoft account not connected")
    
    token_data = token_result.data[0]
    access_token = token_data["access_token"]
    refresh_token = token_data["refresh_token"]
    expires_at = token_data["expires_at"]
    
    # Use helper function to check and refresh token if needed
    access_token = await refresh_token_if_expired(user_id, access_token, refresh_token, expires_at)
    
    print("Microsoft access token (first 50 chars):", access_token[:50] if access_token else "None")
    # Prepare event payload from request data
    event_payload = data.get("event")
    print("Event payload:", event_payload)
    if not event_payload:
        raise HTTPException(status_code=400, detail="Missing event payload")
    
    # Determine the API endpoint based on whether a specific calendar is selected
    if calendar_id:
        api_url = f"https://graph.microsoft.com/v1.0/me/calendars/{calendar_id}/events"
        print(f"Creating event in specific calendar: {calendar_id}")
    else:
        api_url = "https://graph.microsoft.com/v1.0/me/events"
        print("Creating event in default calendar")
    
    # Call Microsoft Graph API to create event
    async with httpx.AsyncClient() as client:
        response = await client.post(
            api_url,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json"
            },
            json=event_payload
        )
        print(f"Microsoft Graph response status: {response.status_code}")
        print(f"Microsoft Graph response text: {response.text}")
        if response.status_code >= 400:
            return {"error": response.text, "status": response.status_code}
        return response.json()

@router.post("/api/msgraph/calendars")
async def msgraph_get_calendars(request: Request, user=Depends(get_current_user)):
    try:
        data = await request.json()
    except Exception as e:
        print("Error parsing JSON:", e)
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    user_id = user["sub"]
    # Fetch access token from Supabase (reuse the same token logic as create-event)
    token_result = supabase.table("ms_tokens").select("access_token, refresh_token, expires_at").eq("user_id", user_id).execute()
    if not token_result.data or len(token_result.data) == 0:
        raise HTTPException(status_code=401, detail="Microsoft account not connected")
    
    token_data = token_result.data[0]
    access_token = token_data["access_token"]
    refresh_token = token_data["refresh_token"]
    expires_at = token_data["expires_at"]
    
    # Use helper function to check and refresh token if needed
    access_token = await refresh_token_if_expired(user_id, access_token, refresh_token, expires_at)
    
    all_calendars = []
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient() as client:
        # 1. Get all calendars from /me/calendars (includes personal + shared calendars)
        personal_calendar_ids = set()
        shared_calendar_ids = set()
        
        try:
            response = await client.get("https://graph.microsoft.com/v1.0/me/calendars?$select=id,name,owner,isDefaultCalendar,canEdit,canShare,canViewPrivateItems", headers=headers)
            if response.status_code == 200:
                all_user_calendars = response.json().get("value", [])
                
                # Get current user's email to identify personal vs shared calendars
                user_response = await client.get("https://graph.microsoft.com/v1.0/me?$select=mail,userPrincipalName", headers=headers)
                current_user_email = None
                if user_response.status_code == 200:
                    user_data = user_response.json()
                    current_user_email = user_data.get("mail") or user_data.get("userPrincipalName")
                    print(f"Current user email from Graph API: {current_user_email}")
                else:
                    print(f"Failed to get user info: {user_response.status_code} - {user_response.text}")
                    # Fallback: Use email from Supabase JWT if Graph API fails
                    if user and user.get("email"):
                        current_user_email = user.get("email")
                        print(f"Using fallback email from Supabase JWT: {current_user_email}")
                    else:
                        print("No fallback email available - will treat all calendars as shared")
                
                for cal in all_user_calendars:
                    calendar_owner = cal.get("owner")
                    
                    # Handle calendars without owner information
                    if calendar_owner is None:
                        calendar_name = cal.get("name", "")
                        
                        # If the calendar name looks like an email address, treat it as shared
                        if "@" in calendar_name and "." in calendar_name:
                            cal["type"] = "shared"
                            cal["groupName"] = f"Shared calendar"
                            shared_calendar_ids.add(cal["id"])
                            print(f"✗ Shared calendar (no owner info, email-like name): {calendar_name}")
                        else:
                            # Otherwise treat as personal (likely user's own calendar without proper owner info)
                            cal["type"] = "personal"
                            personal_calendar_ids.add(cal["id"])
                            print(f"✓ Personal calendar (no owner info, non-email name): {calendar_name}")
                        continue
                        
                    calendar_owner_email = calendar_owner.get("address", "")
                    
                    # Check if this calendar is owned by the current user
                    if current_user_email and calendar_owner_email.lower() == current_user_email.lower():
                        cal["type"] = "personal"
                        personal_calendar_ids.add(cal["id"])
                        print(f"✓ Personal calendar: {cal.get('name')} - Owner: {calendar_owner_email}")
                    else:
                        cal["type"] = "shared"
                        owner_name = calendar_owner.get("name", "Unknown")
                        cal["groupName"] = f"Shared by {owner_name}"
                        shared_calendar_ids.add(cal["id"])
                        print(f"✗ Shared calendar: {cal.get('name')} - Owner: {calendar_owner_email}")
                        if not current_user_email:
                            print(f"  Reason: current_user_email is None")
                    
                all_calendars.extend(all_user_calendars)
            else:
                print(f"Failed to get calendars: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error fetching calendars: {e}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
        
        # 2. Get calendar groups (additional shared calendars not in /me/calendars)
        try:
            response = await client.get("https://graph.microsoft.com/v1.0/me/calendarGroups", headers=headers)
            if response.status_code == 200:
                calendar_groups = response.json().get("value", [])
                for group in calendar_groups:
                    # Skip "My calendars" group since we already processed those
                    if group.get("name", "").lower() in ["my calendars", "my calendar", "meine kalender"]:
                        print(f"Skipping '{group.get('name')}' group - already processed")
                        continue
                    
                    # Get calendars in each group
                    group_response = await client.get(f"https://graph.microsoft.com/v1.0/me/calendarGroups/{group['id']}/calendars?$select=id,name,owner,isDefaultCalendar,canEdit,canShare,canViewPrivateItems", headers=headers)
                    if group_response.status_code == 200:
                        group_calendars = group_response.json().get("value", [])
                        for cal in group_calendars:
                            # Only add if not already processed from /me/calendars
                            if cal["id"] not in personal_calendar_ids and cal["id"] not in shared_calendar_ids:
                                cal["type"] = "shared"
                                cal["groupName"] = group.get("name", "Unknown Group")
                                all_calendars.append(cal)
                                print(f"Additional shared calendar from group: {cal.get('name')} - Group: {group.get('name')}")
                            else:
                                print(f"Skipping duplicate calendar '{cal.get('name')}' - already processed")
            else:
                print(f"Failed to get calendar groups: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error fetching calendar groups: {e}")
        
        # 3. Get Office 365 group calendars (if user is member) - Optional, may not work for personal accounts
        existing_calendar_ids = {cal["id"] for cal in all_calendars}  # Track all existing calendar IDs
        try:
            response = await client.get("https://graph.microsoft.com/v1.0/me/memberOf?$filter=groupTypes/any(c:c eq 'Unified')", headers=headers)
            if response.status_code == 200:
                groups = response.json().get("value", [])
                print(f"Found {len(groups)} Office 365 groups")
                for group in groups:
                    # Get calendar for each Office 365 group
                    group_cal_response = await client.get(f"https://graph.microsoft.com/v1.0/groups/{group['id']}/calendar?$select=id,name,owner,isDefaultCalendar", headers=headers)
                    if group_cal_response.status_code == 200:
                        group_calendar = group_cal_response.json()
                        # Only add if not already in existing calendars
                        if group_calendar["id"] not in existing_calendar_ids:
                            group_calendar["type"] = "group"
                            group_calendar["groupName"] = group.get("displayName", "Unknown Group")
                            all_calendars.append(group_calendar)
                            print(f"Office 365 group calendar: {group_calendar.get('name')} - Group: {group.get('displayName')}")
                        else:
                            print(f"Skipping duplicate group calendar '{group_calendar.get('name')}' - already exists")
                    else:
                        print(f"Failed to get calendar for group '{group.get('displayName')}': {group_cal_response.status_code}")
            elif response.status_code == 404:
                print("Office 365 groups not available - likely a personal Microsoft account or insufficient permissions")
            elif response.status_code == 403:
                print("Access denied to Office 365 groups - insufficient permissions")
            else:
                print(f"Failed to get group memberships: {response.status_code} - {response.text}")
        except Exception as e:
            print(f"Error fetching group calendars (non-critical): {e}")
    
    print(f"Total calendars found: {len(all_calendars)}")
    return {"calendars": all_calendars}

@router.post("/api/msgraph/calendar-events")
async def msgraph_get_calendar_events(request: Request, user=Depends(get_current_user)):
    try:
        data = await request.json()
    except Exception as e:
        print("Error parsing JSON:", e)
        raise HTTPException(status_code=400, detail="Invalid JSON")
    
    calendar_id = data.get("calendar_id")
    if not calendar_id:
        raise HTTPException(status_code=400, detail="Missing calendar_id")
    
    user_id = user["sub"]
    # Fetch access token from Supabase
    token_result = supabase.table("ms_tokens").select("access_token, refresh_token, expires_at").eq("user_id", user_id).execute()
    if not token_result.data or len(token_result.data) == 0:
        raise HTTPException(status_code=401, detail="Microsoft account not connected")
    
    token_data = token_result.data[0]
    access_token = token_data["access_token"]
    refresh_token = token_data["refresh_token"]
    expires_at = token_data["expires_at"]
    
    # Use helper function to check and refresh token if needed
    access_token = await refresh_token_if_expired(user_id, access_token, refresh_token, expires_at)
    
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }
    
    # Get current date and 30 days from now for filtering upcoming events
    from datetime import datetime, timedelta
    start_time = datetime.now().isoformat() + "Z"
    end_time = (datetime.now() + timedelta(days=30)).isoformat() + "Z"
    
    try:
        async with httpx.AsyncClient() as client:
            # Fetch events for the specific calendar with date filter
            url = f"https://graph.microsoft.com/v1.0/me/calendars/{calendar_id}/events"
            params = {
                "$filter": f"start/dateTime ge '{start_time}' and start/dateTime le '{end_time}'",
                "$orderby": "start/dateTime",
                "$top": 50,
                "$select": "id,subject,start,end,location,organizer,isAllDay,bodyPreview,webLink,categories"
            }
            
            response = await client.get(url, headers=headers, params=params)
            
            if response.status_code == 200:
                events_data = response.json()
                events = events_data.get("value", [])
                
                # Process events to add helpful formatting
                for event in events:
                    # Add formatted date strings
                    if event.get("start"):
                        start_dt = datetime.fromisoformat(event["start"]["dateTime"].replace("Z", "+00:00"))
                        event["formattedStartDate"] = start_dt.strftime("%B %d, %Y")
                        event["formattedStartTime"] = start_dt.strftime("%I:%M %p") if not event.get("isAllDay") else "All day"
                    
                    if event.get("end"):
                        end_dt = datetime.fromisoformat(event["end"]["dateTime"].replace("Z", "+00:00"))
                        event["formattedEndTime"] = end_dt.strftime("%I:%M %p") if not event.get("isAllDay") else "All day"
                
                return {"events": events, "total": len(events)}
            else:
                print(f"Failed to get calendar events: {response.status_code} - {response.text}")
                raise HTTPException(status_code=response.status_code, detail=f"Failed to fetch events: {response.text}")
                
    except Exception as e:
        print(f"Error fetching calendar events: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching events: {str(e)}")

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

@router.post("/api/msgraph/disconnect")
async def msgraph_disconnect(request: Request, user=Depends(get_current_user)):
    """
    Disconnect Microsoft account by deleting the stored tokens.
    This will force the user to re-authenticate and consent to new permissions.
    """
    user_id = user["sub"]
    
    # Delete the stored Microsoft tokens
    result = supabase.table("ms_tokens").delete().eq("user_id", user_id).execute()
    
    return {"success": True, "message": "Microsoft account disconnected successfully"}

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
