from typing import Optional
from typing_extensions import TypedDict

class Cloud(TypedDict):
    cloud_description: Optional[str]
    cloud_name: str
    geo_latitude: Optional[float]
    geo_longitude: Optional[float]
    geo_region: str
    distance: Optional[float]
