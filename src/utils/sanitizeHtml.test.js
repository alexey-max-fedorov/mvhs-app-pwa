import { expect, describe, it } from 'vitest';
import { sanitizeHtml } from './sanitizeHtml';

describe('sanitizeHtml', () => {
  it('returns empty string for null', () => {
    expect(sanitizeHtml(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(sanitizeHtml(undefined)).toBe('');
  });

  it('strips script tags and their content', () => {
    const result = sanitizeHtml('<p>Hello</p><script>alert("xss")</script>');
    expect(result).not.toContain('<script');
    expect(result).not.toContain('alert');
    expect(result).toContain('Hello');
  });

  it('strips on* event handlers', () => {
    const result = sanitizeHtml('<a href="#" onclick="alert(1)">Link</a>');
    expect(result).not.toContain('onclick');
    expect(result).toContain('Link');
  });

  it('strips javascript: hrefs', () => {
    const result = sanitizeHtml('<a href="javascript:void(0)">Click</a>');
    expect(result).not.toContain('javascript:');
  });

  it('preserves safe paragraph and bold tags', () => {
    const html = '<p dir="ltr"><b>Period 1</b> 8:30 - 9:13</p>';
    const result = sanitizeHtml(html);
    expect(result).toContain('<p');
    expect(result).toContain('<b>');
    expect(result).toContain('Period 1');
  });

  it('preserves safe https links', () => {
    const html = '<a href="https://example.com">Link</a>';
    const result = sanitizeHtml(html);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('Link');
  });

  it('strips on* event handlers with unquoted values', () => {
    const result = sanitizeHtml('<img src=x onerror=alert(1)>');
    expect(result).not.toContain('onerror');
  });

  it('strips javascript: hrefs with no surrounding quotes', () => {
    const result = sanitizeHtml('<a href=javascript:alert(1)>Click</a>');
    expect(result).not.toContain('javascript:');
  });

  it('strips mixed-case script tags', () => {
    const result = sanitizeHtml('<sCrIpT>alert(1)</sCrIpT>');
    expect(result).not.toContain('alert');
  });
});
