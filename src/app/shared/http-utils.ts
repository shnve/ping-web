import { HttpResponseBase } from '@angular/common/http';

export function getFilenameFromResponse(response: HttpResponseBase, defaultFilename = 'filename'): string {
  return response.headers
  .get('content-disposition')
  .split(';')
  .map(h => h.trim())
  .filter(h => h.startsWith('filename='))
  .reduce(h => h.length === 1 ? h[0] : defaultFilename)
  .replace('filename=', '');
}