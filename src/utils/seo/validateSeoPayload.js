export function validateSeoPayload(payload) {
  const errors = {};

  if (!payload.page_type) {
    errors.page_type = 'نوع صفحه الزامی است.';
  }

  if (!payload.entity_id) {
    errors.entity_id = 'شناسه صفحه الزامی است.';
  }

  if (payload.meta_title && payload.meta_title.length > 70) {
    errors.meta_title = 'Meta Title بهتر است بیشتر از 70 کاراکتر نباشد.';
  }

  if (payload.meta_description && payload.meta_description.length > 160) {
    errors.meta_description = 'Meta Description بهتر است بیشتر از 160 کاراکتر نباشد.';
  }

  if (payload.canonical_url && !/^https?:\/\//i.test(payload.canonical_url)) {
    errors.canonical_url = 'Canonical URL باید با http:// یا https:// شروع شود.';
  }

  if (payload.og_image && !/^https?:\/\//i.test(payload.og_image)) {
    errors.og_image = 'OG Image باید یک URL معتبر باشد.';
  }

  if (payload.custom_schema_json && typeof payload.custom_schema_json !== 'object') {
    errors.custom_schema_json = 'Custom Schema باید JSON معتبر باشد.';
  }

  return errors;
}