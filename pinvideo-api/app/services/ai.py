import httpx
import base64
import json
from app.config import XAI_API_KEY, XAI_BASE_URL


async def generate_video_from_image(image_data: bytes, content_type: str) -> dict:
    """
    Generate an animated video from a static image using xAI Grok API.
    Returns task info for polling.
    """
    if not XAI_API_KEY:
        # Demo mode: return mock data
        return {
            "task_id": "demo-task-id",
            "status": "complete",
            "video_url": None,
        }

    b64_image = base64.b64encode(image_data).decode("utf-8")
    media_type = content_type or "image/jpeg"

    async with httpx.AsyncClient(timeout=120.0) as client:
        # Use xAI image generation / video generation endpoint
        response = await client.post(
            f"{XAI_BASE_URL}/images/generations",
            headers={
                "Authorization": f"Bearer {XAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "grok-2-image",
                "prompt": "Animate this image with subtle, natural motion. Create a smooth, cinematic animation suitable for a video pin on Pinterest.",
                "n": 1,
                "image": f"data:{media_type};base64,{b64_image}",
            },
        )

        if response.status_code == 200:
            result = response.json()
            return {
                "task_id": result.get("id", ""),
                "status": "complete",
                "data": result,
            }
        else:
            return {
                "task_id": "",
                "status": "error",
                "error": response.text,
            }


async def generate_pinterest_content(description: str, image_description: str = "") -> dict:
    """
    Generate Pinterest-optimized title, description, and tags using Grok.
    """
    if not XAI_API_KEY:
        # Demo mode: return generated content
        return {
            "title": f"Amazing {description[:50]}",
            "description": f"Discover {description}. This stunning visual will inspire your next project. #inspiration #trending #creative",
            "tags": ["inspiration", "trending", "creative", "viral", "pinterest"],
        }

    prompt = f"""You are a Pinterest marketing expert. Generate optimized Pinterest pin content based on this description:

Description: {description}
{f'Image context: {image_description}' if image_description else ''}

Generate the following in JSON format:
1. "title": A compelling, keyword-rich title (max 100 characters). Should be attention-grabbing and include relevant search terms.
2. "description": An engaging description (max 500 characters) that includes:
   - A hook in the first line
   - Relevant keywords naturally woven in
   - A call to action
   - 3-5 relevant hashtags at the end
3. "tags": An array of 5-10 relevant keyword tags for Pinterest SEO

Return ONLY valid JSON, no markdown formatting."""

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{XAI_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {XAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "grok-3-mini",
                "messages": [
                    {"role": "system", "content": "You are a Pinterest marketing expert. Always respond with valid JSON only."},
                    {"role": "user", "content": prompt},
                ],
                "temperature": 0.7,
            },
        )

        if response.status_code == 200:
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            # Clean up any markdown formatting
            content = content.strip()
            if content.startswith("```"):
                content = content.split("\n", 1)[1]
                if content.endswith("```"):
                    content = content[:-3]
                content = content.strip()
            try:
                parsed = json.loads(content)
                return {
                    "title": parsed.get("title", "")[:100],
                    "description": parsed.get("description", "")[:500],
                    "tags": parsed.get("tags", [])[:10],
                }
            except json.JSONDecodeError:
                return {
                    "title": description[:100],
                    "description": description[:500],
                    "tags": [],
                }
        else:
            return {
                "title": description[:100],
                "description": description[:500],
                "tags": [],
            }


async def describe_image(image_data: bytes, content_type: str) -> str:
    """Use Grok vision to describe an image for better content generation."""
    if not XAI_API_KEY:
        return "A visually appealing image"

    b64_image = base64.b64encode(image_data).decode("utf-8")
    media_type = content_type or "image/jpeg"

    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{XAI_BASE_URL}/chat/completions",
            headers={
                "Authorization": f"Bearer {XAI_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "grok-2-vision-1212",
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {"type": "text", "text": "Describe this image in detail for Pinterest marketing purposes. Focus on the subject, mood, colors, and what makes it visually appealing. Keep it under 200 words."},
                            {
                                "type": "image_url",
                                "image_url": {
                                    "url": f"data:{media_type};base64,{b64_image}",
                                },
                            },
                        ],
                    }
                ],
                "temperature": 0.5,
            },
        )

        if response.status_code == 200:
            result = response.json()
            return result["choices"][0]["message"]["content"]
        return "A visually appealing image"
