import * as R from "remeda";
import { LIST_AVAILABLES_ENDPOINT } from "./constants";
import { Cloud, CloudsContext, NamedEntity, SortOrder, Theme } from "./types";

export const sortAlphabetically = <T extends Record<string, unknown>>(
  byProp: string,
  order: SortOrder = SortOrder.Ascending
): ((items: T[]) => T[]) =>
  R.sort((a: T, b: T) =>
    ((order === SortOrder.Ascending ? a : b)[byProp] as string).localeCompare(
      (order === SortOrder.Ascending ? b : a)[byProp] as string,
      navigator.language
    )
  );

export const sortCloudsBydistance = <T extends Cloud>(
  order: SortOrder = SortOrder.Ascending
): ((items: T[]) => T[]) =>
  R.sort((a: T, b: T) =>
    order === SortOrder.Ascending
      ? (a.distance || 0) - (b.distance || 0)
      : (b.distance || 0) - (a.distance || 0)
  );

export const capitalize = (str: string): string =>
  str
    .split(" ")
    .map(
      (token) =>
        token.charAt(0).toLocaleUpperCase(navigator.language) + token.slice(1)
    )
    .join(" ");

export const namedEntitiesFromClouds = (
  selectShortName: (cloud: Cloud) => string,
  selectName: (cloud: Cloud) => string
): ((clouds: Cloud[]) => NamedEntity[]) =>
  R.reduce((namedEntities, cloud: Cloud) => {
    const shortName = selectShortName(cloud);
    const name = selectName(cloud);
    if (
      namedEntities.some((namedEntity) => namedEntity.shortName === shortName)
    ) {
      return namedEntities;
    }
    return [...namedEntities, { shortName, name }];
  }, [] as NamedEntity[]);

export const getGeoLocation = (): Promise<GeolocationPosition> => {
  return new Promise((resolve, reject) => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        resolve as unknown as PositionCallback,
        reject as PositionErrorCallback,
        { enableHighAccuracy: false }
      );
    } else {
      reject();
    }
  });
};

// adapted from https://usefulangle.com/post/318/javascript-check-dark-mode-activated
export const getDefaultTheme = (): Theme => {
  return "matchMedia" in window &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? Theme.Dark
    : Theme.Light;
};

export const fetchClouds = async (
  ctx: CloudsContext
): Promise<{ clouds: Cloud[] }> => {
  const { location, selectedProvider, selectedRegion, sortBy, sortOrder } = ctx;
  const params = new URLSearchParams();
  if (!!location) {
    params.set("latitude", location.coords.latitude.toString());
    params.set("longitude", location.coords.longitude.toString());
  }
  if (selectedRegion !== "all") {
    params.set("region", selectedRegion);
  }
  if (selectedProvider !== "all") {
    params.set("provider", selectedProvider);
  }
  params.set("sortBy", sortBy);
  params.set("sortOrder", sortOrder);
  return await (
    await fetch(`${LIST_AVAILABLES_ENDPOINT}?${params.toString()}`)
  ).json();
};
