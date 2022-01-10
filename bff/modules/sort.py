from typing import List, Optional

from modules.cloud import Cloud

def sort_clouds(sort_by: Optional[str] = 'description', sort_order: Optional[str] = 'ascending', clouds: List[Cloud] = []) -> List[Cloud]:
    if sort_by == 'distance':
        return sorted(clouds, key=lambda c: c['distance'] if 'distance' in c else '', reverse=sort_order == 'descending') # type: ignore
    else:
        return sorted(clouds, key=lambda c: c['cloud_description'] or '', reverse=sort_order == 'descending')
