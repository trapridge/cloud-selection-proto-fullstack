from typing import Optional
from sanic import Sanic, app
from sanic import response
from sanic.request import Request
from sanic.response import HTTPResponse
from sanic.log import logger

from modules.filter import filter_clouds
from modules.sort import sort_clouds
from modules.utils import enrich_clouds_with_distance
from modules.fetch import fetch_clouds_list

app = Sanic("bff")


@app.get("/clouds")
async def get_clouds(request: Request) -> HTTPResponse:
    logger.debug(request.url)

    clouds = await fetch_clouds_list()

    filtered_clouds = filter_clouds(
        provider_filter=request.args.get("provider"),
        region_filter=request.args.get("region"),
        clouds=clouds,
    )
    enriched_clouds = enrich_clouds_with_distance(
        latitude=request.args.get("latitude"),
        longitude=request.args.get("longitude"),
        clouds=filtered_clouds,
    )
    sorted_clouds = sort_clouds(
        sort_by=request.args.get("sortBy"),
        sort_order=request.args.get("sortOrder"),
        clouds=enriched_clouds,
    )

    return response.json(sorted_clouds)
