export interface Cloud extends Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
  cloud_description?: string;
  cloud_name: string;
  geo_latitude?: number;
  geo_longitude?: number;
  geo_region: string;
  distance?: number;
}

export interface NamedEntity extends Record<string, string> {
  shortName: string;
  name: string;
}

export type Provider = NamedEntity;

export type Region = NamedEntity;

export enum Filter {
  All = "all",
  Provider = "provider",
  Region = "region",
}

export enum SortBy {
  Description = "description",
  Distance = "distance",
}

export enum SortOrder {
  Ascending = "ascending",
  Descending = "descending",
}

export enum Theme {
  Light = "light",
  Dark = "dark",
}

export type CloudsEvents =
  | { type: "SET_SELECTED_REGION"; region: string }
  | { type: "SET_SELECTED_PROVIDER"; provider: string }
  | { type: "SET_SORT_BY"; sortBy: SortBy }
  | { type: "SET_SORT_ORDER"; sortOrder: SortOrder }
  | { type: "SET_THEME"; theme: Theme };

export interface CloudsContext {
  data: {
    clouds: Cloud[];
    providers: Provider[];
    regions: Region[];
  };
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectedRegion: string | "all";
  selectedProvider: string | "all";
  location: GeolocationPosition | null;
  theme: Theme;
}

export enum CloudsState {
  InitialLoading = "initialLoading",
  Loading = "loading",
  Positioning = "positioning",
  Ready = "ready",
  Failure = "failure",
}

export interface CloudsStateSchema {
  states: {
    [CloudsState.InitialLoading]: Record<string, unknown>;
    [CloudsState.Loading]: Record<string, unknown>;
    [CloudsState.Ready]: Record<string, unknown>;
    [CloudsState.Failure]: Record<string, unknown>;
  };
}
