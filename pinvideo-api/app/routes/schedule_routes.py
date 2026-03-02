import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/schedule", tags=["schedule"])


class ScheduleCreate(BaseModel):
    video_id: str
    board_id: str
    board_name: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    scheduled_at: Optional[str] = None  # ISO datetime, or auto-schedule


class ScheduleUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    link: Optional[str] = None
    scheduled_at: Optional[str] = None
    board_id: Optional[str] = None
    board_name: Optional[str] = None


def schedule_row_to_dict(row) -> dict:
    return {
        "id": row["id"],
        "user_id": row["user_id"],
        "video_id": row["video_id"],
        "board_id": row["board_id"],
        "board_name": row["board_name"],
        "title": row["title"],
        "description": row["description"],
        "link": row["link"],
        "scheduled_at": row["scheduled_at"],
        "status": row["status"],
        "pinterest_pin_id": row["pinterest_pin_id"],
        "error_message": row["error_message"],
        "published_at": row["published_at"],
        "created_at": row["created_at"],
    }


def get_optimal_schedule_time(user_id: str) -> str:
    """Calculate the next optimal Pinterest posting time."""
    # Pinterest best posting times: 2pm-4pm, 8pm-11pm
    # Best days: Saturday, Friday, Tuesday
    now = datetime.now(timezone.utc)

    # Get existing scheduled posts to avoid conflicts
    with get_db() as conn:
        existing = conn.execute(
            """SELECT scheduled_at FROM scheduled_pins
               WHERE user_id = ? AND status = 'scheduled'
               ORDER BY scheduled_at DESC LIMIT 1""",
            (user_id,),
        ).fetchone()

    if existing:
        last_scheduled = datetime.fromisoformat(existing["scheduled_at"])
        # Schedule 4 hours after last scheduled post
        next_time = last_scheduled + timedelta(hours=4)
        if next_time < now:
            next_time = now + timedelta(hours=2)
    else:
        # Schedule 2 hours from now
        next_time = now + timedelta(hours=2)

    # Adjust to optimal hours (14:00, 16:00, 20:00, or 21:00 UTC)
    optimal_hours = [14, 16, 20, 21]
    hour = next_time.hour
    next_optimal = None
    for h in optimal_hours:
        if h > hour:
            next_optimal = next_time.replace(hour=h, minute=0, second=0)
            break
    if not next_optimal:
        # Move to next day
        next_time = next_time + timedelta(days=1)
        next_optimal = next_time.replace(hour=optimal_hours[0], minute=0, second=0)

    return next_optimal.isoformat()


@router.post("")
async def create_schedule(data: ScheduleCreate, user=Depends(get_current_user)):
    """Schedule a video for Pinterest posting."""
    # Verify video exists and belongs to user
    with get_db() as conn:
        video = conn.execute(
            "SELECT * FROM videos WHERE id = ? AND user_id = ?",
            (data.video_id, user["id"]),
        ).fetchone()

        if not video:
            raise HTTPException(status_code=404, detail="Video not found")

        # Use provided time or auto-schedule
        scheduled_at = data.scheduled_at or get_optimal_schedule_time(user["id"])

        # Use video metadata if not provided
        title = data.title or video["title"]
        description = data.description or video["description"]
        link = data.link or video["source_url"] or ""

        schedule_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()

        conn.execute(
            """INSERT INTO scheduled_pins
               (id, user_id, video_id, board_id, board_name, title, description, link,
                scheduled_at, status, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                schedule_id, user["id"], data.video_id, data.board_id,
                data.board_name, title, description, link,
                scheduled_at, "scheduled", now, now,
            ),
        )

        row = conn.execute("SELECT * FROM scheduled_pins WHERE id = ?", (schedule_id,)).fetchone()

    return schedule_row_to_dict(row)


@router.get("")
async def list_schedules(user=Depends(get_current_user)):
    """List all scheduled posts."""
    with get_db() as conn:
        rows = conn.execute(
            """SELECT sp.*, v.video_url, v.thumbnail_url, v.original_image_url
               FROM scheduled_pins sp
               LEFT JOIN videos v ON sp.video_id = v.id
               WHERE sp.user_id = ?
               ORDER BY sp.scheduled_at ASC""",
            (user["id"],),
        ).fetchall()

    result = []
    for row in rows:
        item = schedule_row_to_dict(row)
        item["video_url"] = row["video_url"]
        item["thumbnail_url"] = row["thumbnail_url"] or row["original_image_url"]
        result.append(item)

    return result


@router.put("/{schedule_id}")
async def update_schedule(schedule_id: str, data: ScheduleUpdate, user=Depends(get_current_user)):
    """Update a scheduled post."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM scheduled_pins WHERE id = ? AND user_id = ?",
            (schedule_id, user["id"]),
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Scheduled post not found")

        if row["status"] != "scheduled":
            raise HTTPException(status_code=400, detail="Can only update scheduled posts")

        updates = {}
        if data.title is not None:
            updates["title"] = data.title
        if data.description is not None:
            updates["description"] = data.description
        if data.link is not None:
            updates["link"] = data.link
        if data.scheduled_at is not None:
            updates["scheduled_at"] = data.scheduled_at
        if data.board_id is not None:
            updates["board_id"] = data.board_id
        if data.board_name is not None:
            updates["board_name"] = data.board_name

        if updates:
            set_clause = ", ".join(f"{k} = ?" for k in updates)
            values = list(updates.values()) + [datetime.now(timezone.utc).isoformat(), schedule_id, user["id"]]
            conn.execute(
                f"UPDATE scheduled_pins SET {set_clause}, updated_at = ? WHERE id = ? AND user_id = ?",
                values,
            )

        row = conn.execute("SELECT * FROM scheduled_pins WHERE id = ?", (schedule_id,)).fetchone()

    return schedule_row_to_dict(row)


@router.delete("/{schedule_id}")
async def delete_schedule(schedule_id: str, user=Depends(get_current_user)):
    """Cancel a scheduled post."""
    with get_db() as conn:
        row = conn.execute(
            "SELECT * FROM scheduled_pins WHERE id = ? AND user_id = ?",
            (schedule_id, user["id"]),
        ).fetchone()

        if not row:
            raise HTTPException(status_code=404, detail="Scheduled post not found")

        conn.execute("DELETE FROM scheduled_pins WHERE id = ?", (schedule_id,))

    return {"status": "deleted"}
