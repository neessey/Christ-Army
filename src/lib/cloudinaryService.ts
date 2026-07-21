// Upload d'image vers Cloudinary depuis le navigateur (upload "unsigned",
// même principe que sur DjassaClub / Deep Digital).
//
// Pré-requis dans le Cloudinary Console :
// Settings > Upload > Upload presets > Add upload preset
//   - Signing Mode: Unsigned
//   - Notez le nom du preset et votre "Cloud name" (visible en haut du dashboard)
//
// Puis renseignez ces deux valeurs dans votre .env :
//   VITE_CLOUDINARY_CLOUD_NAME=votre_cloud_name
//   VITE_CLOUDINARY_UPLOAD_PRESET=votre_upload_preset

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

export class CloudinaryConfigError extends Error {}

/**
 * Téléverse un fichier image sur Cloudinary et retourne son URL sécurisée
 * (`secure_url`), à stocker directement comme `coverImage` / `imageUrl`.
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

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => null);
    throw new Error(errBody?.error?.message || 'Échec du téléversement de l\'image sur Cloudinary.');
  }

  const data = await res.json();
  return data.secure_url as string;
}
