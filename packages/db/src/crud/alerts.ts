import { Alert, AlertModel, db } from '../schema';
import { pb } from '../config';

export async function pruneOldAlerts({
  timespanMinutes = 60,
  alertedOnly = true,
  page = 1,
  perPage = 100,
}) {
  const date = new Date(Date.now() - timespanMinutes * 60 * 1000).toISOString();
  let filter = `created < '${date}'`;
  if (alertedOnly) {
    filter += ' && alerted_subscribers = true';
  }
  const oldAlerts = await pb.collection(db.collections.alerts).getList(page, perPage, { filter });
  for (const alert of oldAlerts.items) {
    await deleteAlert(alert.id);
  }
  return {
    deleted: oldAlerts.items.length,
    total: oldAlerts.totalItems,
  };
}

export async function deleteAlert(recordId: string) {
  return pb.collection(db.collections.alerts).delete(recordId);
}
export async function newAlert(alert: Alert) {
  return pb.collection(db.collections.alerts).create(alert);
}

export async function subscribeToNewCreatedAlerts(
  callback: (alert: AlertModel<{ expanded: true }>) => void,
) {
  return pb.collection(db.collections.alerts).subscribe<AlertModel<{ expanded: true }>>(
    '*',
    e => {
      if (e.action !== 'create') return;
      callback(e.record);
    },
    { expand: 'cities' },
  );
}

export async function setAlertedSubscribers(alertId: string) {
  return pb.collection(db.collections.alerts).update(alertId, { alerted_subscribers: true });
}
