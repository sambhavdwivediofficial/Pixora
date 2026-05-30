import { idbClearAll } from '@/services/indexeddb';

export async function clearPixoraDB() {
  await idbClearAll();
}