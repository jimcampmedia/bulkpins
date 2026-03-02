from fastapi import APIRouter, Depends
from app.auth import (
    UserCreate, UserLogin, TokenResponse, UserResponse,
    register_user, login_user, create_access_token,
    get_current_user, user_row_to_response,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(data: UserCreate):
    user = register_user(data.email, data.password, data.name)
    token = create_access_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=user_row_to_response(user),
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin):
    user = login_user(data.email, data.password)
    token = create_access_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=user_row_to_response(user),
    )


@router.get("/me", response_model=UserResponse)
async def me(user=Depends(get_current_user)):
    return user_row_to_response(user)
