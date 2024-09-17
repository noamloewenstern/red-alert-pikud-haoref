import { crud } from '@red-alert/db';
import { Subscriber, Alert } from '@red-alert/db/schema';

export async function registerNotifier(
  cb: (sub: Subscriber, alert: Alert<{ expanded: true }>) => void,
) {
  crud.alerts.subscribeToNewCreatedAlerts(async alert => {
    console.debug('New alert:', alert);
    const citiesIds = alert.cities;
    const subscribed = await crud.subscribers.getAllSubscribedToCities(citiesIds);
    await Promise.all(subscribed.map(sub => Promise.resolve(cb(sub, alert))));
    await crud.alerts.setAlertedSubscribers(alert.id);
  });
}
