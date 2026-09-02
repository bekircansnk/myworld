import pytest
import httpx
from httpx import ASGITransport
from app.main import app

@pytest.mark.asyncio
async def test_ssrf_prevention():
    async with httpx.AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Test loopback IP
        response = await client.get("/api/link-preview?url=http://127.0.0.1")
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "127.0.0.1" # Failed/fallback title

        # Test private IP
        response2 = await client.get("/api/link-preview?url=http://192.168.1.1")
        assert response2.status_code == 200
        data2 = response2.json()
        assert data2["title"] == "192.168.1.1" # Failed/fallback title
