import { getCanonicalUrl } from './getCanonicalUrl';

export function buildSeoPayload({ seoEntry, fallback, path }) {
  const title = seoEntry?.meta_title || fallback.title || '';
  const description = seoEntry?.meta_description || fallback.description || '';
  const ogTitle = seoEntry?.og_title || title;
  const ogDescription = seoEntry?.og_description || description;
  const image = seoEntry?.og_image || fallback.image || '';
  const url = seoEntry?.canonical_url || getCanonicalUrl(path);

  const robots = `${seoEntry?.robots_index === false ? 'noindex' : 'index'},${
    seoEntry?.robots_follow === false ? 'nofollow' : 'follow'
  }`;

  return {
    title,
    description,
    ogTitle,
    ogDescription,
    image,
    url,
    robots,
    schemaType: seoEntry?.schema_type || fallback.schemaType || '',
    customSchemaJson: seoEntry?.custom_schema_json || null,
    focusKeyword: seoEntry?.focus_keyword || '',
  };
}