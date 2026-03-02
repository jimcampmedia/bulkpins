import os
from dotenv import load_dotenv

load_dotenv()

# JWT
SECRET_KEY = os.getenv("SECRET_KEY", "change-me-in-production-super-secret-key-12345")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# xAI / Grok
XAI_API_KEY = os.getenv("XAI_API_KEY", "")
XAI_BASE_URL = "https://api.x.ai/v1"

# Cloudflare R2
R2_ACCOUNT_ID = os.getenv("R2_ACCOUNT_ID", "")
R2_ACCESS_KEY_ID = os.getenv("R2_ACCESS_KEY_ID", "")
R2_SECRET_ACCESS_KEY = os.getenv("R2_SECRET_ACCESS_KEY", "")
R2_BUCKET_NAME = os.getenv("R2_BUCKET_NAME", "bulkpins")
R2_PUBLIC_URL = os.getenv("R2_PUBLIC_URL", "")

# Stripe
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_PRICE_STARTER = os.getenv("STRIPE_PRICE_STARTER", "")
STRIPE_PRICE_PRO = os.getenv("STRIPE_PRICE_PRO", "")
STRIPE_PRICE_BUSINESS = os.getenv("STRIPE_PRICE_BUSINESS", "")

# Pinterest
PINTEREST_APP_ID = os.getenv("PINTEREST_APP_ID", "")
PINTEREST_APP_SECRET = os.getenv("PINTEREST_APP_SECRET", "")
PINTEREST_REDIRECT_URI = os.getenv("PINTEREST_REDIRECT_URI", "")

# App
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("BACKEND_URL", "http://localhost:8000")

# Plan limits
PLAN_LIMITS = {
    "free": {"videos_per_month": 5, "price": 0},
    "starter": {"videos_per_month": 100, "price": 2500},  # $25 in cents
    "pro": {"videos_per_month": 250, "price": 5900},  # $59 in cents
    "business": {"videos_per_month": 1000, "price": 19900},  # $199 in cents
}
