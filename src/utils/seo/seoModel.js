export const SEO_PAGE_TYPES = {
  STATIC_PAGE: 'static_page',
  BLOG: 'blog',
  SERVICE: 'service',
  CATEGORY: 'category',
  SUBCATEGORY: 'subcategory',
};

export const STATIC_PAGE_KEYS = [
  { label: 'صفحه اصلی', value: 'home' },
  { label: 'درباره ما', value: 'about' },
  { label: 'تماس با ما', value: 'contact' },
  { label: 'قوانین', value: 'terms' },
  { label: 'حریم خصوصی', value: 'privacy' },
  { label: 'بلاگ‌ها', value: 'blogs' },
  { label: 'ثبت خدمت', value: 'submit-business' },
  { label: 'لیست خدمات', value: 'listings' },
];

export const DEFAULT_SEO_ENTRY = {
  page_type: '',
  entity_id: '',

  meta_title: '',
  meta_description: '',
  slug: '',
  canonical_url: '',

  og_title: '',
  og_description: '',
  og_image: '',

  robots_index: true,
  robots_follow: true,

  focus_keyword: '',
  schema_type: '',
  custom_schema_json: null,
};