import { citiesMap } from './cities';
import { type CityModel, db } from './schema';
import { pb, loginAsAdmin } from './config';

const cities = Object.values(citiesMap);

async function seedCities() {
  await loginAsAdmin();
  const existingCities = await pb.collection('cities').getFullList<CityModel>();
  const existingNames = existingCities.map(city => city.name_en);
  const needToSeed = cities.filter(city => !existingNames.includes(city.name_en));
  console.log('Need to seed: ', needToSeed.length);

  for (const city of needToSeed) {
    try {
      await pb.collection(db.collections.cities).create(city);
    } catch (e) {
      console.error('Error seeding city: ', city, e);
    }
  }
}
async function main() {
  await seedCities();
}
main();
