import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel

from app.auth import get_current_user
from app.config import (
    STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_STARTER, STRIPE_PRICE_PRO, STRIPE_PRICE_BUSINESS,
    FRONTEND_URL, PLAN_LIMITS,
)
from app.database import get_db

router = APIRouter(prefix="/api/billing", tags=["billing"])

if STRIPE_SECRET_KEY:
    stripe.api_key = STRIPE_SECRET_KEY

PRICE_TO_PLAN = {}
if STRIPE_PRICE_STARTER:
    PRICE_TO_PLAN[STRIPE_PRICE_STARTER] = "starter"
if STRIPE_PRICE_PRO:
    PRICE_TO_PLAN[STRIPE_PRICE_PRO] = "pro"
if STRIPE_PRICE_BUSINESS:
    PRICE_TO_PLAN[STRIPE_PRICE_BUSINESS] = "business"

PLAN_TO_PRICE = {v: k for k, v in PRICE_TO_PLAN.items()}


class CheckoutRequest(BaseModel):
    plan: str  # starter, pro, business


@router.post("/create-checkout")
async def create_checkout(data: CheckoutRequest, user=Depends(get_current_user)):
    """Create a Stripe checkout session."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Billing not configured")

    if data.plan not in PLAN_TO_PRICE:
        raise HTTPException(status_code=400, detail="Invalid plan")

    price_id = PLAN_TO_PRICE[data.plan]

    # Create or get Stripe customer
    customer_id = user.get("stripe_customer_id")
    if not customer_id:
        customer = stripe.Customer.create(
            email=user["email"],
            metadata={"user_id": user["id"]},
        )
        customer_id = customer.id
        with get_db() as conn:
            conn.execute(
                "UPDATE users SET stripe_customer_id = ? WHERE id = ?",
                (customer_id, user["id"]),
            )

    session = stripe.checkout.Session.create(
        customer=customer_id,
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        mode="subscription",
        success_url=f"{FRONTEND_URL}/dashboard/settings?billing=success",
        cancel_url=f"{FRONTEND_URL}/dashboard/settings?billing=cancelled",
        metadata={"user_id": user["id"]},
    )

    return {"checkout_url": session.url}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhooks."""
    if not STRIPE_SECRET_KEY:
        return {"status": "ok"}

    payload = await request.body()
    sig_header = request.headers.get("stripe-signature", "")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET,
        )
    except (ValueError, stripe.error.SignatureVerificationError):
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        subscription_id = session.get("subscription")
        customer_id = session.get("customer")

        if subscription_id:
            sub = stripe.Subscription.retrieve(subscription_id)
            price_id = sub["items"]["data"][0]["price"]["id"]
            plan = PRICE_TO_PLAN.get(price_id, "free")

            with get_db() as conn:
                conn.execute(
                    """UPDATE users SET plan = ?, stripe_subscription_id = ?,
                       stripe_customer_id = ? WHERE stripe_customer_id = ?""",
                    (plan, subscription_id, customer_id, customer_id),
                )

    elif event["type"] == "customer.subscription.updated":
        sub = event["data"]["object"]
        subscription_id = sub["id"]
        price_id = sub["items"]["data"][0]["price"]["id"]
        plan = PRICE_TO_PLAN.get(price_id, "free")
        status = sub["status"]

        if status == "active":
            with get_db() as conn:
                conn.execute(
                    "UPDATE users SET plan = ? WHERE stripe_subscription_id = ?",
                    (plan, subscription_id),
                )

    elif event["type"] == "customer.subscription.deleted":
        sub = event["data"]["object"]
        subscription_id = sub["id"]

        with get_db() as conn:
            conn.execute(
                "UPDATE users SET plan = 'free', stripe_subscription_id = NULL WHERE stripe_subscription_id = ?",
                (subscription_id,),
            )

    return {"status": "ok"}


@router.get("/subscription")
async def get_subscription(user=Depends(get_current_user)):
    """Get current subscription info."""
    plan = user.get("plan", "free")
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])

    result = {
        "plan": plan,
        "videos_per_month": limits["videos_per_month"],
        "videos_used": user.get("videos_used_this_month", 0),
        "price": limits["price"],
    }

    if user.get("stripe_subscription_id") and STRIPE_SECRET_KEY:
        try:
            sub = stripe.Subscription.retrieve(user["stripe_subscription_id"])
            result["subscription_status"] = sub["status"]
            result["current_period_end"] = sub["current_period_end"]
        except Exception:
            pass

    return result


@router.post("/portal")
async def customer_portal(user=Depends(get_current_user)):
    """Create a Stripe customer portal session."""
    if not STRIPE_SECRET_KEY or not user.get("stripe_customer_id"):
        raise HTTPException(status_code=400, detail="No billing account found")

    session = stripe.billing_portal.Session.create(
        customer=user["stripe_customer_id"],
        return_url=f"{FRONTEND_URL}/dashboard/settings",
    )

    return {"portal_url": session.url}
