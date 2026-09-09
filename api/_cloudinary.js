import { createHash } from 'crypto';

export function cloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME
    && process.env.CLOUDINARY_API_KEY
    && process.env.CLOUDINARY_API_SECRET
  );
}

export function signCloudinaryParams(params) {
  const secret = process.env.CLOUDINARY_API_SECRET;
  const toSign = Object.keys(params)
    .filter((key) => params[key] != null && params[key] !== '')
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHash('sha1').update(`${toSign}${secret}`).digest('hex');
}

export function createSignedUpload({ folder }) {
  const timestamp = Math.round(Date.now() / 1000);
  const params = { folder, timestamp };
  return {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature: signCloudinaryParams(params)
  };
}
