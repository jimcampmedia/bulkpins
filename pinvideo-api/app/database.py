import sqlite3
import os
from contextlib import contextmanager

DB_PATH = os.getenv("DATABASE_PATH", "/data/app.db")

def get_db_path():
    """Get database path, creating directory if needed."""
    db_dir = os.path.dirname(DB_PATH)
    if db_dir and not os.path.exists(db_dir):
        os.makedirs(db_dir, exist_ok=True)
    return DB_PATH

def get_connection():
    """Get a database connection."""
    conn = sqlite3.connect(get_db_path())
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn

@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Initialize database tables."""
    with get_db() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                plan TEXT DEFAULT 'free',
                stripe_customer_id TEXT,
                stripe_subscription_id TEXT,
                pinterest_access_token TEXT,
                pinterest_refresh_token TEXT,
                pinterest_token_expires_at REAL,
                pinterest_user_id TEXT,
                pinterest_username TEXT,
                videos_used_this_month INTEGER DEFAULT 0,
                billing_period_start TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS videos (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                title TEXT,
                description TEXT,
                tags TEXT,
                original_image_url TEXT,
                video_url TEXT,
                thumbnail_url TEXT,
                source_url TEXT,
                status TEXT DEFAULT 'pending',
                generation_task_id TEXT,
                duration_seconds REAL,
                file_size_bytes INTEGER,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS scheduled_pins (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                video_id TEXT NOT NULL,
                board_id TEXT NOT NULL,
                board_name TEXT,
                title TEXT,
                description TEXT,
                link TEXT,
                scheduled_at TEXT NOT NULL,
                status TEXT DEFAULT 'scheduled',
                pinterest_pin_id TEXT,
                error_message TEXT,
                published_at TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (video_id) REFERENCES videos(id) ON DELETE CASCADE
            );

            CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
            CREATE INDEX IF NOT EXISTS idx_scheduled_pins_user_id ON scheduled_pins(user_id);
            CREATE INDEX IF NOT EXISTS idx_scheduled_pins_status ON scheduled_pins(status);
            CREATE INDEX IF NOT EXISTS idx_scheduled_pins_scheduled_at ON scheduled_pins(scheduled_at);
        """)
