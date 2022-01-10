import { createMachine, assign, DoneInvokeEvent } from "xstate";
import * as R from "remeda";
import {
  capitalize,
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

export const cloudsMachine = createMachine<CloudsContext, CloudsEvents>({
  key: "clouds",
  context: initialContext,
  initial: CloudsState.Positioning,
  states: {
    [CloudsState.InitialLoading]: {
      invoke: {
        src: "fetchClouds",
        onDone: {
          target: CloudsState.Ready,
          actions: assign<CloudsContext, DoneInvokeEvent<Cloud[]>>(
            (context, event) => {
              const { data } = event;
              return {
                ...context,
                data: {
                  clouds: data,
                  providers: parseProviders(data),
                  regions: parseRegions(data),
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
    [CloudsState.Loading]: {
      invoke: {
        src: "fetchClouds",
        onDone: {
          target: CloudsState.Ready,
          actions: assign<CloudsContext, DoneInvokeEvent<Cloud[]>>(
            (context, event) => {
              const { data } = event;
              return {
                ...context,
                data: {
                  ...context.data,
                  clouds: data,
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
          target: CloudsState.InitialLoading,
          actions: assign<CloudsContext, DoneInvokeEvent<GeolocationPosition>>(
            (context, event) => {
              return {
                ...context,
                location: event.data,
              };
            }
          ),
        },
        onError: {
          target: CloudsState.InitialLoading,
        },
      },
    },
    [CloudsState.Ready]: {},
    [CloudsState.Failure]: {},
  },
  on: {
    SET_SELECTED_REGION: {
      target: CloudsState.Loading,
      actions: assign({
        selectedRegion: (_, event) => event.region,
      }),
    },
    SET_SELECTED_PROVIDER: {
      target: CloudsState.Loading,
      actions: assign({
        selectedProvider: (_, event) => event.provider,
      }),
    },
    SET_SORT_BY: {
      target: CloudsState.Loading,
      actions: assign({
        sortBy: (_, event) => event.sortBy,
      }),
    },
    SET_SORT_ORDER: {
      target: CloudsState.Loading,
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
