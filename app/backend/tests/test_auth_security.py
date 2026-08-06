import pytest
from httpx import AsyncClient
from app.main import app

@pytest.mark.asyncio
async def test_legacy_reset_password_endpoint_is_removed():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/auth/reset-password", json={"username": "testuser", "new_password": "newpassword"})
        assert response.status_code == 404
