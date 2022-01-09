from typing import List, Optional, Union
from typing_extensions import TypedDict
from sanic import Sanic
from sanic import response
from sanic.request import Request, RequestParameters
from sanic.response import HTTPResponse
from httpx import AsyncClient, Response
from aiocache import cached, Cache
from sanic.exceptions import SanicException
from pygeodesy import haversine
from sanic.log import logger

class Cloud(TypedDict):
    cloud_description: Optional[str]
    cloud_name: str
    geo_latitude: Optional[float]
    geo_longitude: Optional[float]
    geo_region: str
    distance: Optional[float]

app: Sanic = Sanic('bff')
client: AsyncClient = AsyncClient()

CLOUDS_CACHE_TTL_SECONDS = 30
CLOUDS_ENDPOINT = 'https://api.aiven.io/v1/clouds'

@cached(ttl=CLOUDS_CACHE_TTL_SECONDS, cache=Cache.MEMORY, key="clouds")
async def fetch_clouds_list() -> List[Cloud]:
    try:
        res: Response = await client.get(CLOUDS_ENDPOINT)
        if res.status_code is 200:
            json = res.json()
            if 'clouds' in json:
                logger.info(f'List of clouds from "{CLOUDS_ENDPOINT}" fetched and cached for {CLOUDS_CACHE_TTL_SECONDS} seconds')
                return json['clouds']
            else:
                logger.error(f'Unexpected {CLOUDS_ENDPOINT} response payload ')
                raise SanicException()
        else:
            logger.error(f'{CLOUDS_ENDPOINT} returned a non-200')
            raise SanicException()
    except:
        logger.error(f'Unable to fetch clouds from {CLOUDS_ENDPOINT}')
        raise SanicException()

def descriptionIncludes(cloud: Cloud, *strings) -> bool:
    return cloud['cloud_description'] is not None and all((lambda: s in cloud['cloud_description'])() for s in list(strings))

def filter_clouds(args: RequestParameters, clouds: List[Cloud]) -> List[Cloud]:
    provider_filter: Optional[str] = args.get('provider')
    region_filter: Optional[str] = args.get('region')

    if provider_filter is not None and region_filter is None:
        return list(filter(lambda c: descriptionIncludes(c, provider_filter), clouds))
    elif provider_filter is None and region_filter is not None:
        return list(filter(lambda c: descriptionIncludes(c, region_filter), clouds))
    elif provider_filter is not None and region_filter is not None:
        return list(filter(lambda c: descriptionIncludes(c, provider_filter, region_filter), clouds))
    else:
        return clouds

def enrich_cloud_with_distance(cloud: Cloud, latitude: float, longitude: float) -> Cloud:
    if 'geo_latitude' in cloud and 'geo_longitude' in cloud:
        try:
            copy = cloud.copy() # do not pollute cached dicts with distance
            copy['distance'] = haversine(lat1=latitude, lon1=longitude, lat2=cloud['geo_latitude'], lon2=cloud['geo_longitude'])
            return copy
        except:
            pass
    return cloud

def enrich_clouds_with_distance(args: RequestParameters, clouds: List[Cloud]) -> List[Cloud]:
    latitude = args.get('latitude')
    longitude = args.get('longitude')

    if latitude is not None and longitude is not None:
        try:
            latitude = float(args.get('latitude') or 'lat')
            longitude = float(args.get('longitude') or 'long')
            return list(map(lambda c: enrich_cloud_with_distance(c, latitude, longitude), clouds))
        except:
            logger.error(f'Unable to enrich data with distance. Given coordinates: lat={latitude}; long={longitude}')
            raise SanicException('Invalid coordinates given', status_code=400)
    return clouds

def sort_clouds(args: RequestParameters, clouds: List[Cloud]) -> List[Cloud]:
    sort_by = args.get('sortBy') or 'description'
    sort_order = args.get('sortOrder') or 'ascending'

    if sort_by == 'distance':
        return sorted(clouds, key=lambda c: c['distance'] if 'distance' in c else '', reverse=sort_order == 'descending') # type: ignore
    else:
        return sorted(clouds, key=lambda c: c['cloud_description'] or '', reverse=sort_order == 'descending')

@app.get("/clouds")
async def get_clouds(request: Request) -> HTTPResponse:
    print(request.url)
    clouds = await fetch_clouds_list()
    filtered_clouds = filter_clouds(request.args, clouds)
    enriched_clouds = enrich_clouds_with_distance(request.args, filtered_clouds)
    sorted_clouds = sort_clouds(request.args, enriched_clouds)
    return response.json(sorted_clouds)