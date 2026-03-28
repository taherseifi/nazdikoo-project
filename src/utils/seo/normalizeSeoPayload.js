function emptyToNull(value) {
  if (value === undefined || value === null) return null;
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function normalizeSeoPayload(payload) {
  return {
    page_type: payload.page_type,
    entity_id: String(payload.entity_id),

    meta_title: emptyToNull(payload.meta_title),
    meta_description: emptyToNull(payload.meta_description),
    slug: emptyToNull(payload.slug),
    canonical_url: emptyToNull(payload.canonical_url),

    og_title: emptyToNull(payload.og_title),
    og_description: emptyToNull(payload.og_description),
    og_image: emptyToNull(payload.og_image),

    robots_index: Boolean(payload.robots_index),
    robots_follow: Boolean(payload.robots_follow),

    focus_keyword: emptyToNull(payload.focus_keyword),
    schema_type: emptyToNull(payload.schema_type),

    custom_schema_json:
      payload.custom_schema_json && typeof payload.custom_schema_json === 'object'
        ? payload.custom_schema_json
        : null,
  };
}