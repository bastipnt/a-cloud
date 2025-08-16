export const PDF_SLUG = "pdf" as const;
export const IMAGE_SLUG = "image" as const;

export const getPDFPreviewUrl = (id: string) => `/${PDF_SLUG}/${id}`;
export const getImagePreviewUrl = (id: string) => `/${IMAGE_SLUG}/${id}`;
