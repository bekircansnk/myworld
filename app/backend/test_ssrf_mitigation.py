import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from unittest.mock import patch

@pytest.mark.asyncio
async def test_ssrf_mitigation():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        # Test private IP
        response = await client.get("/api/link-preview", params={"url": "http://127.0.0.1"})
        assert response.status_code == 200
        assert response.json()["title"] == "127.0.0.1"
        assert response.json()["favicon"] == ""

        # Test localhost
        response = await client.get("/api/link-preview", params={"url": "http://localhost"})
        assert response.status_code == 200
        assert response.json()["title"] == "localhost"

        # Test cloud metadata
        response = await client.get("/api/link-preview", params={"url": "http://169.254.169.254"})
        assert response.status_code == 200
        assert response.json()["title"] == "169.254.169.254"
