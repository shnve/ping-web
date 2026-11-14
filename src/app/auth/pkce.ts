import * as CryptoJS from 'crypto-js';

/**
 * PISAC: PKCE (RFC 7636, método S256) para el inicio de sesión con Keycloak.
 *
 * El verificador es un valor aleatorio de 64 bytes que se guarda en el navegador antes de ir a Keycloak; el reto
 * (SHA-256 del verificador, en base64url) viaja en la URL de inicio de sesión. Al canjear el código, Keycloak exige
 * el verificador original: un código interceptado no sirve sin él.
 *
 * Se usa CryptoJS para el SHA-256 (síncrono y disponible también en HTTP sin TLS, donde crypto.subtle no existe).
 * Los bytes aleatorios vienen de crypto.getRandomValues, disponible en todos los contextos.
 */
export function createPkceVerifier(): string {
  const bytes = new Uint8Array(64);
  crypto.getRandomValues(bytes);
  return toBase64Url(CryptoJS.lib.WordArray.create(bytes as unknown as number[], bytes.length));
}

export function createPkceChallenge(verifier: string): string {
  return toBase64Url(CryptoJS.SHA256(verifier));
}

function toBase64Url(words: CryptoJS.lib.WordArray): string {
  return CryptoJS.enc.Base64.stringify(words)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
