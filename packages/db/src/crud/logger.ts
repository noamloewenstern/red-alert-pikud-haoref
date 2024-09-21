import { db } from '../schema';
import { pb } from '../config';

export async function log(level: string, text: string, timestamp?: string) {
  try {
    await pb
      .collection(db.collections.logs)
      .create({ text, level, timestamp }, { requestKey: null });
  } catch (e) {
    console.error(e);
  }
}
