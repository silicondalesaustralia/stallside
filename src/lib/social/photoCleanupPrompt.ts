/**
 * Server-side prompt for images.edit photo cleanup - enhancement only, not replacement.
 */

export function buildPhotoCleanupPrompt(): string {
  return [
    'Edit this photo in place.',
    'Keep the same subject, scene, camera angle, perspective, and composition.',
    'Do not replace, add, or remove objects - only improve image quality.',
    'Enhance lighting, clarity, and colour balance; reduce visual clutter and noise.',
    'Photorealistic result, no text, logos, or watermarks.',
  ].join(' ')
}
