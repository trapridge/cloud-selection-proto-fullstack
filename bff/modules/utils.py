from typing import List, Optional
from sanic.exceptions import SanicException
from pygeodesy import haversine
from sanic.log import logger

from modules.cloud import Cloud


def enrich_cloud_with_distance(
    cloud: Cloud, latitude: float, longitude: float
) -> Cloud:
    if "geo_latitude" in cloud and "geo_longitude" in cloud:
        try:
            copy = cloud.copy()  # do not pollute cached dicts with distance
            copy["distance"] = haversine(
                lat1=latitude,
                lon1=longitude,
                lat2=cloud["geo_latitude"],
                lon2=cloud["geo_longitude"],
            )
            return copy
        except:
            pass
    return cloud


def enrich_clouds_with_distance(
    latitude: Optional[str], longitude: Optional[str], clouds: List[Cloud]
) -> List[Cloud]:
    if latitude is not None and longitude is not None:
        try:
            lat = float(latitude)
            long = float(longitude)
            return list(map(lambda c: enrich_cloud_with_distance(c, lat, long), clouds))
        except:
            logger.error(
                f"Unable to enrich data with distance. Given coordinates: lat={latitude}; long={longitude}"
            )
            raise SanicException("Invalid coordinates given", status_code=400)
    return clouds
