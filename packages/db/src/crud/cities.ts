import { citiesMap } from '../cities';
import { CityModel, db } from '../schema';
import { pb } from '../config';
import memoize from 'p-memoize';

export function isValidCityName(name: string) {
  return name in citiesMap;
}

const getCitesFullList = memoize(async () => {
  return await pb.collection(db.collections.cities).getFullList<CityModel>();
});

const getCitiesNameMapedToRecordId = memoize(async () => {
  const cities = await getCitesFullList();
  return cities.reduce(
    (acc, city) => {
      acc[city.name] = city.id;
      acc[city.name_en] = city.id;
      return acc;
    },
    {} as Record<string, string>,
  );
});

export const getCityRecordId = memoize(async (city: string) => {
  const cities = await getCitiesNameMapedToRecordId();
  return cities[city];
});

export const getCitiesRecordsIds = (cities: string[]) => {
  return Promise.all(cities.map(city => getCityRecordId(city)));
};
