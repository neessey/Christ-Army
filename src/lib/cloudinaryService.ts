const env = (import.meta as ImportMeta & {
  env?: Record<string, string | undefined>;
}).env;

const CLOUD_NAME = env?.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = env?.VITE_CLOUDINARY_UPLOAD_PRESET;

export class CloudinaryConfigError extends Error {}

/**
 * Téléverse un fichier (image, vidéo ou audio) sur Cloudinary et retourne son URL sécurisée (`secure_url`).
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new CloudinaryConfigError(
      'Cloudinary n\'est pas configuré (VITE_CLOUDINARY_CLOUD_NAME / VITE_CLOUDINARY_UPLOAD_PRESET manquants).'
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  // Utilisation de /auto/upload pour gérer dynamiquement images, vidéos et audios
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.error?.message || 'Échec du téléversement du fichier sur Cloudinary.');
  }

  const data = await res.json();
  return data.secure_url as string;
}