import cities from './cities.data';
import memoize from 'p-memoize';

export const getAllHebNames = memoize(async () => Object.values(cities).map(city => city.name));
export const getAllEngNames = memoize(async () => Object.values(cities).map(city => city.name_en));
export const citiesMap = cities;
