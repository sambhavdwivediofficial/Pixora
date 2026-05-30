import { storeFile } from './indexeddb';

export const UPLOAD_KEY    = 'pixora_upload';
export const CONVERTED_KEY = 'pixora_converted';
export const ICO_ZIP_KEY   = 'pixora_ico_zip';

/**
 * Store the uploaded file in IndexedDB.
 * @param {File} file
 */
export async function storeUpload(file) {
  await storeFile(UPLOAD_KEY, file);
}

/**
 * Store the converted result in IndexedDB.
 * @param {Blob} blob
 */
export async function storeConverted(blob) {
  await storeFile(CONVERTED_KEY, blob);
}

/**
 * Store ICO ZIP in IndexedDB.
 * @param {Blob} blob
 */
export async function storeIcoZip(blob) {
  await storeFile(ICO_ZIP_KEY, blob);
}