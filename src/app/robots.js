const BASE_URL = 'https://mvhs.pro';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/barcode',
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
