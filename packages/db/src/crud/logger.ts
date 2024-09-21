import { db } from '../schema';
import { pb } from '../config';

export async function log(level: string, text: string, timestamp?: string) {
  await pb.collection(db.collections.logs).create({ text, level, timestamp });
}
