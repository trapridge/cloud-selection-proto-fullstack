from modules.fetch import CLOUDS_ENDPOINT
from modules.server import app
import json
import pytest
import httpx


def get_test_data():
    with open("./modules/test_data.json") as f:
        data = json.load(f)
    return data


@pytest.mark.asyncio
async def test_get_all(respx_mock):
    data = get_test_data()
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(200, json=data))

    _, response = await app.asgi_client.get("/clouds")
    assert response.status == 200
    assert json.loads(response.body) == data["clouds"]


@pytest.mark.asyncio
async def test_backend_failure(respx_mock):
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(400))

    _, response = await app.asgi_client.get("/clouds")
    assert response.status == 500
