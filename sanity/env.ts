export const sanityConfig = {
	projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "v8ae7gbm",
	dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
	apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-01",
	useCdn: process.env.NEXT_PUBLIC_SANITY_USE_CDN !== "false",
};

if (!sanityConfig.projectId) {
	console.warn("Sanity projectId is not set. Please add NEXT_PUBLIC_SANITY_PROJECT_ID to your .env.local file.");
}
