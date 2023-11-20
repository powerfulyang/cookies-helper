import type { Cookies } from 'webextension-polyfill';

export const convertSameSite = (sameSite: Cookies.SameSiteStatus) => {
  switch (sameSite) {
    case 'lax':
      return 'lax';
    case 'strict':
      return 'strict';
    case 'no_restriction':
      return 'none';
    default:
      return undefined;
  }
};

export function convertCookiesToNetscapeFormat(cookies: Cookies.Cookie[]) {
  const str = cookies
    .map((cookie) => {
      const parts = [
        cookie.domain || 'none', // Domain
        'TRUE', // Flag (Hardcoded as TRUE for simplicity)
        cookie.path || '/', // Path
        cookie.secure ? 'TRUE' : 'FALSE', // Secure
        cookie.expirationDate?.toFixed(0) || '0', // Expiration
        cookie.name, // Name
        cookie.value, // Value
      ];
      return parts.join('\t');
    })
    .join('\n');

  // Add # Netscape HTTP Cookie File comment to the top
  return `# Netscape HTTP Cookie File\n${str}`;
}
