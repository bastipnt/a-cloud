export const PDF_SLUG = "pdf" as const;
export const IMAGE_SLUG = "image" as const;
export const MARKDOWN_SLUG = "md" as const;
export const TEXT_SLUG = "text" as const;
export const DOWNLOAD_SLUG = "download" as const;

export const allowedRoutes = [PDF_SLUG, IMAGE_SLUG, MARKDOWN_SLUG, TEXT_SLUG];

export const getPDFPreviewUrl = (id: string) => `/${PDF_SLUG}/${id}`;
export const getImagePreviewUrl = (id: string) => `/${IMAGE_SLUG}/${id}`;
export const getMarkdownPreviewUrl = (id: string) => `/${MARKDOWN_SLUG}/${id}`;
export const getTextPreviewUrl = (id: string) => `/${TEXT_SLUG}/${id}`;
export const getDownloadUrl = (id: string) => `/${DOWNLOAD_SLUG}/${id}`;
