import { createMachine, assign, DoneInvokeEvent } from "xstate";
import * as R from "remeda";
import {
  capitalize,
  distanceInKmBetweenEarthCoordinates,
  getDefaultTheme,
  namedEntitiesFromClouds,
  sortAlphabetically,
} from "./utils/helpers";
import {
  Cloud,
  CloudsContext,
  CloudsEvents,
  SortBy,
  SortOrder,
  CloudsState,
} from "./utils/types";

export const initialContext = {
  data: {
    clouds: [],
    providers: [],
    regions: [],
  },
  sortBy: SortBy.Description,
  sortOrder: SortOrder.Ascending,
  selectedRegion: "all",
  selectedProvider: "all",
  location: null,
  theme: getDefaultTheme(),
};

const selectProviderShortName = (cloud: Cloud): string =>
  cloud.cloud_name.split("-")[0];

const selectProviderName = (cloud: Cloud): string =>
  cloud.cloud_description
    ? cloud.cloud_description.split("-")[1].split(":")[0].trim()
    : "Unknown";

const selectRegionShortName = (cloud: Cloud): string => cloud.geo_region;

const selectRegionName = (cloud: Cloud): string =>
  capitalize(selectRegionShortName(cloud));

const parseProviders = R.createPipe(
  namedEntitiesFromClouds(selectProviderShortName, selectProviderName),
  sortAlphabetically("name")
);

const parseRegions = R.createPipe(
  namedEntitiesFromClouds(selectRegionShortName, selectRegionName),
  sortAlphabetically("name")
);

const enrichWithDistance = (clouds: Cloud[], position: GeolocationPosition) =>
  R.map(clouds, (cloud) => {
    if (cloud.geo_latitude && cloud.geo_longitude) {
      cloud.distance = distanceInKmBetweenEarthCoordinates(
        position.coords.latitude,
        position.coords.longitude,
        cloud.geo_latitude,
        cloud.geo_longitude
      );
    }
    return cloud;
  });

export const cloudsMachine = createMachine<CloudsContext, CloudsEvents>({
  key: "clouds",
  context: initialContext,
  initial: CloudsState.Loading,
  states: {
    [CloudsState.Loading]: {
      invoke: {
        src: "fetchClouds",
        onDone: {
          target: CloudsState.Positioning,
          actions: assign<CloudsContext, DoneInvokeEvent<{ clouds: Cloud[] }>>(
            (context, event) => {
              const { clouds } = event.data;
              return {
                ...context,
                data: {
                  clouds,
                  providers: parseProviders(clouds),
                  regions: parseRegions(clouds),
                },
              };
            }
          ),
        },
        onError: {
          target: CloudsState.Failure,
        },
      },
    },
    [CloudsState.Positioning]: {
      invoke: {
        src: "getGeoLocation",
        onDone: {
          target: CloudsState.Ready,
          actions: assign<CloudsContext, DoneInvokeEvent<GeolocationPosition>>(
            (context, event) => {
              return {
                ...context,
                location: event.data,
                data: {
                  ...context.data,
                  clouds: enrichWithDistance(context.data.clouds, event.data),
                },
              };
            }
          ),
        },
        onError: {
          target: CloudsState.Ready,
        },
      },
    },
    [CloudsState.Ready]: {},
    [CloudsState.Failure]: {},
  },
  on: {
    SET_SELECTED_REGION: {
      actions: assign({
        selectedRegion: (_, event) => event.region,
      }),
    },
    SET_SELECTED_PROVIDER: {
      actions: assign({
        selectedProvider: (_, event) => event.provider,
      }),
    },
    SET_SORT_BY: {
      actions: assign({
        sortBy: (_, event) => event.sortBy,
      }),
    },
    SET_SORT_ORDER: {
      actions: assign({
        sortOrder: (_, event) => event.sortOrder,
      }),
    },
    SET_THEME: {
      actions: assign({
        theme: (_, event) => event.theme,
      }),
    },
  },
});
