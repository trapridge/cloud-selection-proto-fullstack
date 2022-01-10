from typing import List, Optional

from modules.cloud import Cloud


def providerMatches(cloud: Cloud, provider: str) -> bool:
    return cloud["cloud_name"].startswith(provider)


def regionMatches(cloud: Cloud, region: str) -> bool:
    return cloud["geo_region"] == region


def filter_clouds(
    provider_filter: Optional[str], region_filter: Optional[str], clouds: List[Cloud]
) -> List[Cloud]:
    filtered = clouds
    if provider_filter is not None:
        filtered = list(filter(lambda c: providerMatches(c, provider_filter), filtered))
    if region_filter is not None:
        filtered = list(filter(lambda c: regionMatches(c, region_filter), filtered))
    return filtered
