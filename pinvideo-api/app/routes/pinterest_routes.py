import uuid
import time
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
from app.auth import get_current_user
from app.config import FRONTEND_URL
from app.database import get_db
from app.services.pinterest import get_auth_url, exchange_code, get_user_info, get_boards, get_valid_token

router = APIRouter(prefix="/api/pinterest", tags=["pinterest"])

# Store states temporarily (in production, use Redis or DB)
_oauth_states: dict = {}


@router.get("/auth")
async def pinterest_auth(user=Depends(get_current_user)):
    """Start Pinterest OAuth flow."""
    state = str(uuid.uuid4())
    _oauth_states[state] = user["id"]
    auth_url = get_auth_url(state)
    return {"auth_url": auth_url}


@router.get("/callback")
async def pinterest_callback(code: str, state: str):
    """Handle Pinterest OAuth callback."""
    user_id = _oauth_states.pop(state, None)
    if not user_id:
        return RedirectResponse(f"{FRONTEND_URL}/dashboard/settings?error=invalid_state")

    try:
        tokens = await exchange_code(code)
        access_token = tokens["access_token"]
        refresh_token = tokens.get("refresh_token", "")
        expires_in = tokens.get("expires_in", 3600)
        expires_at = time.time() + expires_in

        # Get Pinterest user info
        pinterest_user = await get_user_info(access_token)

        with get_db() as conn:
            conn.execute(
                """UPDATE users SET
                   pinterest_access_token = ?,
                   pinterest_refresh_token = ?,
                   pinterest_token_expires_at = ?,
                   pinterest_user_id = ?,
                   pinterest_username = ?
                   WHERE id = ?""",
                (
                    access_token, refresh_token, expires_at,
                    pinterest_user.get("username", ""),
                    pinterest_user.get("username", ""),
                    user_id,
                ),
            )

        return RedirectResponse(f"{FRONTEND_URL}/dashboard/settings?pinterest=connected")

    except Exception as e:
        return RedirectResponse(f"{FRONTEND_URL}/dashboard/settings?error={str(e)}")


@router.get("/status")
async def pinterest_status(user=Depends(get_current_user)):
    """Check Pinterest connection status."""
    return {
        "connected": user.get("pinterest_access_token") is not None,
        "username": user.get("pinterest_username"),
    }


@router.post("/disconnect")
async def pinterest_disconnect(user=Depends(get_current_user)):
    """Disconnect Pinterest account."""
    with get_db() as conn:
        conn.execute(
            """UPDATE users SET
               pinterest_access_token = NULL,
               pinterest_refresh_token = NULL,
               pinterest_token_expires_at = NULL,
               pinterest_user_id = NULL,
               pinterest_username = NULL
               WHERE id = ?""",
            (user["id"],),
        )
    return {"status": "disconnected"}


@router.get("/boards")
async def list_boards(user=Depends(get_current_user)):
    """List user's Pinterest boards."""
    if not user.get("pinterest_access_token"):
        raise HTTPException(status_code=400, detail="Pinterest not connected")

    try:
        token = await get_valid_token(user)
        boards = await get_boards(token)
        return {
            "boards": [
                {
                    "id": b["id"],
                    "name": b["name"],
                    "description": b.get("description", ""),
                    "pin_count": b.get("pin_count", 0),
                    "image_url": b.get("media", {}).get("image_cover_url", ""),
                }
                for b in boards
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
