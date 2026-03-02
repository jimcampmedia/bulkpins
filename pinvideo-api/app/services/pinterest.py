import httpx
import time
from typing import Optional
from app.config import PINTEREST_APP_ID, PINTEREST_APP_SECRET, PINTEREST_REDIRECT_URI

PINTEREST_API_BASE = "https://api.pinterest.com/v5"
PINTEREST_OAUTH_BASE = "https://api.pinterest.com/oauth"


def get_auth_url(state: str) -> str:
    """Generate Pinterest OAuth URL."""
    scopes = "boards:read,boards:write,pins:read,pins:write"
    return (
        f"https://www.pinterest.com/oauth/"
        f"?client_id={PINTEREST_APP_ID}"
        f"&redirect_uri={PINTEREST_REDIRECT_URI}"
        f"&response_type=code"
        f"&scope={scopes}"
        f"&state={state}"
    )


async def exchange_code(code: str) -> dict:
    """Exchange authorization code for access token."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{PINTEREST_OAUTH_BASE}/token",
            data={
                "grant_type": "authorization_code",
                "code": code,
                "redirect_uri": PINTEREST_REDIRECT_URI,
            },
            auth=(PINTEREST_APP_ID, PINTEREST_APP_SECRET),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Pinterest OAuth failed: {response.text}")


async def refresh_token(refresh_token_str: str) -> dict:
    """Refresh Pinterest access token."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            f"{PINTEREST_OAUTH_BASE}/token",
            data={
                "grant_type": "refresh_token",
                "refresh_token": refresh_token_str,
            },
            auth=(PINTEREST_APP_ID, PINTEREST_APP_SECRET),
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Pinterest token refresh failed: {response.text}")


async def get_valid_token(user: dict) -> str:
    """Get a valid Pinterest access token, refreshing if necessary."""
    token = user.get("pinterest_access_token")
    expires_at = user.get("pinterest_token_expires_at", 0)

    if not token:
        raise Exception("Pinterest not connected")

    if expires_at and time.time() > expires_at - 300:
        # Token is about to expire, refresh it
        refresh_tok = user.get("pinterest_refresh_token")
        if refresh_tok:
            from app.database import get_db
            new_tokens = await refresh_token(refresh_tok)
            new_access = new_tokens["access_token"]
            new_refresh = new_tokens.get("refresh_token", refresh_tok)
            new_expires = time.time() + new_tokens.get("expires_in", 3600)

            with get_db() as conn:
                conn.execute(
                    """UPDATE users SET pinterest_access_token=?, pinterest_refresh_token=?,
                       pinterest_token_expires_at=? WHERE id=?""",
                    (new_access, new_refresh, new_expires, user["id"]),
                )
            return new_access

    return token


async def get_user_info(access_token: str) -> dict:
    """Get Pinterest user info."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            f"{PINTEREST_API_BASE}/user_account",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if response.status_code == 200:
            return response.json()
        raise Exception(f"Failed to get Pinterest user info: {response.text}")


async def get_boards(access_token: str) -> list:
    """Get user's Pinterest boards."""
    boards = []
    bookmark: Optional[str] = None

    async with httpx.AsyncClient(timeout=30.0) as client:
        while True:
            params = {"page_size": 25}
            if bookmark:
                params["bookmark"] = bookmark

            response = await client.get(
                f"{PINTEREST_API_BASE}/boards",
                headers={"Authorization": f"Bearer {access_token}"},
                params=params,
            )

            if response.status_code != 200:
                break

            data = response.json()
            boards.extend(data.get("items", []))
            bookmark = data.get("bookmark")
            if not bookmark:
                break

    return boards


async def create_video_pin(
    access_token: str,
    board_id: str,
    title: str,
    description: str,
    link: str,
    video_url: str,
    thumbnail_url: Optional[str] = None,
) -> dict:
    """Create a video pin on Pinterest."""
    pin_data = {
        "board_id": board_id,
        "title": title,
        "description": description,
        "link": link,
        "media_source": {
            "source_type": "video_id",
            "cover_image_url": thumbnail_url or video_url,
            "media_id": "",  # This would need the uploaded media ID
        },
    }

    # For now, use URL-based media source
    pin_data["media_source"] = {
        "source_type": "url",
        "url": video_url,
    }

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{PINTEREST_API_BASE}/pins",
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            json=pin_data,
        )

        if response.status_code in (200, 201):
            return response.json()
        raise Exception(f"Failed to create pin: {response.text}")
