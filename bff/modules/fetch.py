from typing import List
from httpx import AsyncClient, Response
from aiocache import cached, Cache
from sanic.exceptions import SanicException
from sanic.log import logger

from modules.cloud import Cloud

CLOUDS_CACHE_TTL_SECONDS = 60 * 60
CLOUDS_ENDPOINT = 'https://api.aiven.io/v1/clouds'

client: AsyncClient = AsyncClient()

@cached(ttl=CLOUDS_CACHE_TTL_SECONDS, cache=Cache.MEMORY, key="clouds")
async def fetch_clouds_list() -> List[Cloud]:
    try:
        res: Response = await client.get(CLOUDS_ENDPOINT)
        if res.status_code is 200:
            json = res.json()
            if 'clouds' in json:
                logger.info(
                    f'List of clouds from "{CLOUDS_ENDPOINT}" fetched and cached for {CLOUDS_CACHE_TTL_SECONDS} seconds')
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
