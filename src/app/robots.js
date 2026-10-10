const BASE_URL = 'https://mvhs.pro';

export const dynamic = 'force-static';

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
