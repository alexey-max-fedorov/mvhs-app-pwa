export function sanitizeHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
    .replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"');
}
