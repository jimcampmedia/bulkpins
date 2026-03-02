import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel

from app.auth import get_current_user
from app.config import PLAN_LIMITS, BACKEND_URL
from app.database import get_db
from app.services.ai import generate_pinterest_content, describe_image
from app.services.storage import upload_file, delete_file

router = APIRouter(prefix="/api/videos", tags=["videos"])


class VideoResponse(BaseModel):
    id: str
    title: Optional[str]
    description: Optional[str]
    tags: Optional[str]
    original_image_url: Optional[str]
    video_url: Optional[str]
    thumbnail_url: Optional[str]
    source_url: Optional[str]
    status: str
    created_at: str


class VideoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None
    source_url: Optional[str] = None


def video_row_to_response(row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "description": row["description"],
        "tags": row["tags"],
        "original_image_url": row["original_image_url"],
        "video_url": row["video_url"],
        "thumbnail_url": row["thumbnail_url"],
        "source_url": row["source_url"],
        "status": row["status"],
        "created_at": row["created_at"],
    }


@router.post("/generate")
async def generate_video(
    image: UploadFile = File(...),
    description: str = Form(""),
    source_url: str = Form(""),
    user=Depends(get_current_user),
):
    """Upload an image, generate AI content, and create a video."""
    # Check usage limits
    plan = user.get("plan", "free")
    limit = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])["videos_per_month"]
    used = user.get("videos_used_this_month", 0)

    if used >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Monthly limit reached ({limit} videos). Please upgrade your plan.",
        )

    # Read image data
    image_data = await image.read()
    content_type = image.content_type or "image/jpeg"

    # Upload original image to storage
    image_url = upload_file(image_data, image.filename or "image.jpg", content_type, "images")

    # If stored locally, make it accessible via the API
    if image_url.startswith("/storage/"):
        image_url = f"{BACKEND_URL}{image_url}"

    # Use AI to describe image and generate Pinterest content
    image_desc = await describe_image(image_data, content_type)
    content = await generate_pinterest_content(
        description or "A visually stunning image",
        image_desc,
    )

    # Create video record
    video_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    # For demo: video is the same as image (in production, Grok Imagine creates actual video)
    # The video generation would be async in production
    video_url = image_url  # Placeholder - would be actual generated video

    tags_str = ",".join(content.get("tags", []))

    with get_db() as conn:
        conn.execute(
            """INSERT INTO videos (id, user_id, title, description, tags, original_image_url,
               video_url, thumbnail_url, source_url, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                video_id, user["id"], content["title"], content["description"],
                tags_str, image_url, video_url, image_url,
                source_url, "ready", now, now,
            ),
        )

        # Increment usage
        conn.execute(
            "UPDATE users SET videos_used_this_month = videos_used_this_month + 1 WHERE id = ?",
            (user["id"],),
        )

        row = conn.execute("SELECT * FROM videos WHERE id = ?", (video_id,)).fetchone()

    return video_row_to_response(row)


@router.get("")
async def list_videos(user=Depends(get_current_user)):
    """List all videos for the current user."""
    with get_db() as conn:
        rows = conn.execute(
            "SELECT * FROM videos WHERE user_id = ? ORDER BY created_at DESC",
            (user["id"],),
        ).fetchall()
    return [video_row_to_response(row) for row in rows]


@router.get("/{video_id}")
async def get_video(video_id: str, user=Depends(get_current_user)):
    """Get a specific video."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM videos WHERE id = ? AND user_id = ?",
            (video_id, user["id"]),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Video not found")
    return video_row_to_response(row)


@router.put("/{video_id}")
async def update_video(video_id: str, data: VideoUpdate, user=Depends(get_current_user)):
    """Update video metadata."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM videos WHERE id = ? AND user_id = ?",
            (video_id, user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Video not found")

        updates = {}
        if data.title is not None:
            updates["title"] = data.title
        if data.description is not None:
            updates["description"] = data.description
        if data.tags is not None:
            updates["tags"] = data.tags
        if data.source_url is not None:
            updates["source_url"] = data.source_url

        if updates:
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), video_id, user["id"]]
            conn.execute(
                f"UPDATE videos SET {set_clause}, updated_at = ? WHERE id = ? AND user_id = ?",
                values,
            )

        row = conn.execute("SELECT * FROM videos WHERE id = ?", (video_id,)).fetchone()

    return video_row_to_response(row)


@router.delete("/{video_id}")
async def delete_video(video_id: str, user=Depends(get_current_user)):
    """Delete a video."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM videos WHERE id = ? AND user_id = ?",
            (video_id, user["id"]),
        ).fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Video not found")

        # Delete from storage
        if row["video_url"]:
            delete_file(row["video_url"])
        if row["original_image_url"]:
            delete_file(row["original_image_url"])

        # Delete scheduled pins
        conn.execute("DELETE FROM scheduled_pins WHERE video_id = ?", (video_id,))
        conn.execute("DELETE FROM videos WHERE id = ?", (video_id,))

    return {"status": "deleted"}
