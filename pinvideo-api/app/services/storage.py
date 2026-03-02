import boto3
import uuid
import os
from app.config import R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL


def get_s3_client():
    """Get S3-compatible client for Cloudflare R2."""
    return boto3.client(
        "s3",
        endpoint_url=f"https://{R2_ACCOUNT_ID}.r2.cloudflarestorage.com",
        aws_access_key_id=R2_ACCESS_KEY_ID,
        aws_secret_access_key=R2_SECRET_ACCESS_KEY,
        region_name="auto",
    )


def upload_file(file_content: bytes, filename: str, content_type: str, folder: str = "uploads") -> str:
    """Upload a file to R2 and return the public URL."""
    ext = os.path.splitext(filename)[1]
    key = f"{folder}/{uuid.uuid4()}{ext}"

    if not R2_ACCESS_KEY_ID:
        # Demo mode: store locally
        local_path = f"/data/storage/{key}"
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        with open(local_path, "wb") as f:
            f.write(file_content)
        return f"/storage/{key}"

    client = get_s3_client()
    client.put_object(
        Bucket=R2_BUCKET_NAME,
        Key=key,
        Body=file_content,
        ContentType=content_type,
    )

    if R2_PUBLIC_URL:
        return f"{R2_PUBLIC_URL}/{key}"
    return f"https://{R2_BUCKET_NAME}.{R2_ACCOUNT_ID}.r2.cloudflarestorage.com/{key}"


def delete_file(url: str):
    """Delete a file from R2."""
    if not R2_ACCESS_KEY_ID:
        # Demo mode - handle both /storage/ and full BACKEND_URL prefixed paths
        storage_prefix = "/storage/"
        idx = url.find(storage_prefix)
        if idx != -1:
            local_path = f"/data{url[idx:]}"
            if os.path.exists(local_path):
                os.remove(local_path)
        return

    # Extract key from URL
    key = url.split("/", 3)[-1] if "/" in url else url
    client = get_s3_client()
    try:
        client.delete_object(Bucket=R2_BUCKET_NAME, Key=key)
    except Exception:
        pass


def get_presigned_url(key: str, expires_in: int = 3600) -> str:
    """Get a presigned URL for downloading."""
    if not R2_ACCESS_KEY_ID:
        return f"/storage/{key}"

    client = get_s3_client()
    return client.generate_presigned_url(
        "get_object",
        Params={"Bucket": R2_BUCKET_NAME, "Key": key},
        ExpiresIn=expires_in,
    )
