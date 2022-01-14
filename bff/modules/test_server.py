from modules.fetch import CLOUDS_ENDPOINT
from modules.server import app
import json
import pytest
import httpx


def get_test_data():
    with open(f"./modules/test_data/all.json") as f:
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
async def test_filter_by_provider(respx_mock):
    data = get_test_data()
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(200, json=data))

    _, response = await app.asgi_client.get("/clouds?provider=upcloud")
    assert response.status == 200
    for c in json.loads(response.body):
        assert c["cloud_name"].startswith("upcloud") == True


@pytest.mark.asyncio
async def test_filter_by_region(respx_mock):
    data = get_test_data()
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(200, json=data))

    _, response = await app.asgi_client.get("/clouds?region=north%20america")
    assert response.status == 200
    for c in json.loads(response.body):
        assert c["geo_region"] == "north america"


@pytest.mark.asyncio
async def test_filter_by_provider_and_region(respx_mock):
    data = get_test_data()
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(200, json=data))

    _, response = await app.asgi_client.get(
        "/clouds?provider=upcloud&region=north%20america"
    )
    assert response.status == 200
    for c in json.loads(response.body):
        assert c["cloud_name"].startswith("upcloud") == True
        assert c["geo_region"] == "north america"


@pytest.mark.asyncio
async def test_sort_by_description_ascending(respx_mock):
    data = get_test_data()
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(200, json=data))

    _, response = await app.asgi_client.get(
        "/clouds?provider=upcloud&region=north%20america"
    )
    assert response.status == 200
    clouds = json.loads(response.body)
    assert (
        clouds[0]["cloud_description"]
        == "United States, California - UpCloud: San Jose"
    )
    assert (
        clouds[1]["cloud_description"] == "United States, Illinois - UpCloud: Chicago"
    )
    assert (
        clouds[2]["cloud_description"] == "United States, New York - UpCloud: New York"
    )


@pytest.mark.asyncio
async def test_sort_by_description_descending(respx_mock):
    data = get_test_data()
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(200, json=data))

    _, response = await app.asgi_client.get(
        "/clouds?provider=upcloud&region=north%20america&sortOrder=descending"
    )
    assert response.status == 200
    clouds = json.loads(response.body)
    assert (
        clouds[2]["cloud_description"]
        == "United States, California - UpCloud: San Jose"
    )
    assert (
        clouds[1]["cloud_description"] == "United States, Illinois - UpCloud: Chicago"
    )
    assert (
        clouds[0]["cloud_description"] == "United States, New York - UpCloud: New York"
    )


@pytest.mark.asyncio
async def test_sort_by_distance_ascending(respx_mock):
    data = get_test_data()
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(200, json=data))

    _, response = await app.asgi_client.get(
        "/clouds?provider=upcloud&region=north%20america&sortOrder=ascending&sortBy=distance&latitude=60&longitude=49"
    )
    assert response.status == 200
    clouds = json.loads(response.body)
    assert clouds[0]["distance"] == pytest.approx(7667814.946116347)
    assert clouds[1]["distance"] == pytest.approx(8027835.244840147)
    assert clouds[2]["distance"] == pytest.approx(9164090.724355262)


@pytest.mark.asyncio
async def test_sort_by_distance_descending(respx_mock):
    data = get_test_data()
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(200, json=data))

    _, response = await app.asgi_client.get(
        "/clouds?provider=upcloud&region=north%20america&sortOrder=descending&sortBy=distance&latitude=60&longitude=49"
    )
    assert response.status == 200
    clouds = json.loads(response.body)
    assert clouds[2]["distance"] == pytest.approx(7667814.946116347)
    assert clouds[1]["distance"] == pytest.approx(8027835.244840147)
    assert clouds[0]["distance"] == pytest.approx(9164090.724355262)


@pytest.mark.asyncio
async def test_failure_backend_data_access(respx_mock):
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(400))

    _, response = await app.asgi_client.get("/clouds")
    assert response.status == 500


@pytest.mark.asyncio
async def test_failure_backend_data_format(respx_mock):
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(200, json=[]))

    _, response = await app.asgi_client.get("/clouds")
    assert response.status == 500


@pytest.mark.asyncio
async def test_failure_invalid_coordinates(respx_mock):
    data = get_test_data()
    respx_mock.get(CLOUDS_ENDPOINT).mock(return_value=httpx.Response(200, json=data))

    _, response = await app.asgi_client.get("/clouds?latitude=whatever&longitude=49")
    assert response.status == 400
