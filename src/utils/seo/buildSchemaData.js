export function buildSchemaData({ seoEntry, fallback }) {
  if (seoEntry?.custom_schema_json) {
    return seoEntry.custom_schema_json;
  }

  switch (seoEntry?.schema_type || fallback?.schemaType) {
    case 'Article':
      return fallback?.articleSchema || null;

    case 'LocalBusiness':
      return fallback?.localBusinessSchema || null;

    case 'CollectionPage':
      return fallback?.collectionPageSchema || null;

    case 'WebPage':
      return fallback?.webPageSchema || null;

    default:
      return null;
  }
}