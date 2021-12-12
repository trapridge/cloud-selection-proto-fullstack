import * as R from "remeda";
import { LIST_AVAILABLES_ENDPOINT } from "./constants";
import { Cloud, NamedEntity, SortOrder, Theme } from "./types";

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
      ? a.distance - b.distance
      : b.distance - a.distance
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
        reject as PositionErrorCallback
      );
    } else {
      reject();
    }
  });
};

// adapted from https://stackoverflow.com/a/365853
export const distanceInKmBetweenEarthCoordinates = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

// adapted from https://usefulangle.com/post/318/javascript-check-dark-mode-activated
export const getDefaultTheme = (): Theme => {
  return "matchMedia" in window &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
    ? Theme.Dark
    : Theme.Light;
};

export const fetchClouds = async (): Promise<{ clouds: Cloud[] }> =>
  await (await fetch(LIST_AVAILABLES_ENDPOINT)).json();
