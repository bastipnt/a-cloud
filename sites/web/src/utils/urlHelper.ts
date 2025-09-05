export const PDF_SLUG = "pdf" as const;
export const IMAGE_SLUG = "image" as const;
export const MARKDOWN_SLUG = "md" as const;

export const allowedRoutes = [PDF_SLUG, IMAGE_SLUG, MARKDOWN_SLUG];

export const getPDFPreviewUrl = (id: string) => `/${PDF_SLUG}/${id}`;
export const getImagePreviewUrl = (id: string) => `/${IMAGE_SLUG}/${id}`;
export const getMarkdownPreviewUrl = (id: string) => `/${MARKDOWN_SLUG}/${id}`;
