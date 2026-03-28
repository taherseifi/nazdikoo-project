import { Helmet } from 'react-helmet-async';

export default function Seo({
  title,
  description,
  image,
  url,
  robots = 'index,follow',
  ogTitle,
  ogDescription,
  type = 'website',
}) {
  const siteName = 'Nazdikoo';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;

  return (
    <Helmet>
      <title>{fullTitle}</title>

      <meta name="description" content={description || ''} />
      <meta name="robots" content={robots} />

      <meta property="og:site_name" content={siteName} />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={ogTitle || fullTitle} />
      <meta property="og:description" content={ogDescription || description || ''} />
      {image ? <meta property="og:image" content={image} /> : null}
      {url ? <meta property="og:url" content={url} /> : null}

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || fullTitle} />
      <meta name="twitter:description" content={ogDescription || description || ''} />
      {image ? <meta name="twitter:image" content={image} /> : null}

      {url ? <link rel="canonical" href={url} /> : null}
    </Helmet>
  );
}